/**
 * Toplist data loader (Phase 1 — data layer).
 *
 * Loads the captured affiliate toplist JSON that the legacy WordPress site
 * produced via the "rlaaf" toplist plugin. Each toplist *config* (e.g.
 * `search-service-casino`, `search-two-casino-trustly`) is a directory under
 * `public/rlaaf-data/<config>/` containing paginated dumps:
 *
 *   public/rlaaf-data/<config>/page-1.json
 *   public/rlaaf-data/<config>/page-2.json
 *   ...
 *
 * Each page file has the shape:
 *   { pagination: { page, max_pages, posts_per_page },
 *     results: [ { post_title, post_name, permalink, meta: {...}, ... } ] }
 *
 * This module reads those files with node:fs at build time and maps each raw
 * "casino" item into a clean, presentation-ready {@link ToplistCasino}. New
 * Astro components consume `getToplist()` — they never touch the raw JSON.
 *
 * No new npm dependencies: plain node:fs + string ops only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isRetiredPath } from "./static-redirects";
import { MANUALLY_CLOSED_SLUGS } from "./closed-casinos";
import { isDeadAffiliate } from "./dead-affiliates";
import { getAllCasinos } from "./casino-data";
import { licenseInfo } from "./license-tier";

/**
 * Root of the captured toplist dumps: `public/rlaaf-data`.
 *
 * Anchor on `process.cwd()` (the Astro project root in both dev and build).
 * Vite bundles this module into `dist/pages/*.mjs` for the SSG render pass, so
 * an `import.meta.url`-relative hop would resolve to a non-existent path under
 * `dist/` and silently yield zero rows. Fall back to the module-relative path
 * for unbundled/dev use.
 */
function resolveRlaafDir(): string {
  const fromCwd = path.join(process.cwd(), "public", "rlaaf-data");
  if (fs.existsSync(fromCwd)) return fromCwd;
  return path.join(fileURLToPath(new URL("../../public", import.meta.url)), "rlaaf-data");
}
const RLAAF_DIR = resolveRlaafDir();

/** The live site origin — stripped from absolute asset/link URLs so the new
 *  build serves everything root-relative from its own domain. */
const SITE_ORIGIN = "https://kasinotilmanrekisteroitymista.com";

/**
 * A single casino row in a toplist, cleaned for presentation.
 *
 * Field provenance (raw rlaaf item → ToplistCasino):
 *   post_title                        → name
 *   post_name                         → slug
 *   meta.card_image.url (+ .alt)      → logoUrl (+ logoAlt; ShortPixel-decoded)
 *   meta.cta                          → ctaSlug   (the /go/<slug>/ affiliate link, root-relative)
 *   meta.rating                       → rating    (parsed number | null)
 *   meta.casino_bonus_description     → bonusText
 *   meta.no_deposit                   → noDeposit
 *   meta.wagering_value               → wagering
 *   meta.license_type                 → license
 *   meta.show_banner_text/last_…_text → bannerText (best-effort; null when hidden/absent)
 */
export interface ToplistCasino {
  /** Display name, e.g. "SuperOnni". */
  name: string;
  /** URL slug / post_name, e.g. "superonni". */
  slug: string;
  /** Root-relative logo URL (ShortPixel CDN prefix decoded away), or null. */
  logoUrl: string | null;
  /** Logo alt text from the card image, or null. */
  logoAlt: string | null;
  /** The affiliate CTA target — root-relative /go/<slug>/ link, or null. */
  ctaSlug: string | null;
  /** Numeric rating (e.g. 4.7) or null when the source left it blank. */
  rating: number | null;
  /** Bonus description, e.g. "kasinot ilman rekisteröitymistä". */
  bonusText: string;
  /** No-deposit / cashback blurb, e.g. "20 % päivittäinen cashback". */
  noDeposit: string;
  /** Wagering requirement value, e.g. "1" or "35x". */
  wagering: string;
  /** Licensing authority, e.g. "Curaçao eGaming". */
  license: string;
  /** Optional banner ribbon text, or null when the source hides/omits it. */
  bannerText?: string | null;
}

/** Raw rlaaf `card_image` ACF object (only the fields we read). */
interface RawCardImage {
  url?: string | null;
  alt?: string | null;
}

/** Raw rlaaf item `meta` block (only the fields we read). */
interface RawMeta {
  cta?: string | null;
  rating?: string | number | null;
  license_type?: string | null;
  casino_bonus_description?: string | null;
  no_deposit?: string | null;
  wagering_value?: string | null;
  card_image?: RawCardImage | string | null;
  show_banner_text?: boolean | string | null;
  banner_text?: string | null;
  last_updated_text?: string | null;
}

/** Raw rlaaf result item (only the fields we read). */
interface RawItem {
  post_title?: string | null;
  post_name?: string | null;
  permalink?: string | null;
  meta?: RawMeta | null;
}

/** Raw page-N.json envelope. */
interface RawPage {
  pagination?: {
    page?: string | number;
    max_pages?: number;
    posts_per_page?: string | number;
  };
  results?: RawItem[];
}

/**
 * Decode a ShortPixel adaptive-image URL down to a root-relative site path.
 *
 * Toplist logos arrive as ShortPixel CDN URLs of the form:
 *   https://cdn.shortpixel.ai/spai/<params>/<origin>/wp-content/uploads/...
 * The real asset lives at `/wp-content/uploads/...` on our own origin, so we
 * strip the CDN + params + origin prefix. Plain self-origin URLs and
 * already-relative paths are normalised to root-relative too. Anything else
 * (e.g. a foreign absolute URL) is returned unchanged.
 */
function decodeLogoUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1) ShortPixel CDN: `https://cdn.shortpixel.ai/spai/<params>/<origin>/...`.
  // Only strip down to a root-relative path when the origin segment is OUR
  // host — blindly discarding a FOREIGN origin (e.g. a network-hosted logo)
  // produced a root-relative path pointing at a file this site doesn't have.
  const spaiMatch = trimmed.match(
    /^https?:\/\/cdn\.shortpixel\.ai\/spai\/[^/]+\/([^/]+)(\/.*)$/i,
  );
  if (spaiMatch) {
    const [, origin, rest] = spaiMatch;
    const selfHost = SITE_ORIGIN.replace(/^https?:\/\//, "").toLowerCase();
    const o = origin.toLowerCase();
    if (o === selfHost || o === `www.${selfHost}`) {
      return rest;
    }
    // Foreign origin proxied via ShortPixel — keep the real absolute URL.
    return `https://${origin}${rest}`;
  }

  // 2) Plain self-origin absolute URL → root-relative.
  if (trimmed.startsWith(SITE_ORIGIN)) {
    const rel = trimmed.slice(SITE_ORIGIN.length);
    return rel.startsWith("/") ? rel : `/${rel}`;
  }

  // 3) Already root-relative, or some other (foreign) absolute URL — leave it.
  return trimmed;
}

/** Strip the self-origin from a link so CTAs stay on our domain (root-relative). */
function toRootRelative(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  let rel = trimmed;
  if (rel.startsWith(SITE_ORIGIN)) {
    rel = rel.slice(SITE_ORIGIN.length);
    if (!rel.startsWith("/")) rel = `/${rel}`;
  }
  // The vercel.json /go/ redirect rules are case-sensitive routes, but the
  // captured cta values occasionally carry a differently-cased slug (e.g.
  // "/go/Wunderwins/" vs the registered "/go/wunderwins/") — a silent 404 on
  // click. /go/ slugs are always lowercase by convention, so normalize here
  // rather than special-casing individual casinos.
  if (/^\/go\//i.test(rel)) rel = rel.toLowerCase();
  return rel;
}


/**
 * Editorial overall ratings not (yet) present in the captured toplist scrape.
 * Applied only when the scraped `rating` field is empty, so a real captured
 * value always wins. Mirrors the same number set on each casino's own Arviot
 * card in its review fragment — keep both in sync when updating either.
 */
const MANUAL_RATING_OVERRIDES: ReadonlyMap<string, number> = new Map([
  ["urho-casino", 4.0],
  ["hupislots", 3.5],
  ["tikkari-casino", 3.8],
  ["kumobet-ccasino", 4.0],
  ["spinnair", 4.2],
  ["superonni", 3.0],
  ["quickz-casino", 3.7],
]);

/** Parse the rlaaf `rating` field (a string like "4.7" or "") into a number. */
function parseRating(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const s = String(raw).trim().replace(",", ".");
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Coerce the various truthy encodings rlaaf uses ("1"/true/"true"). */
function isTruthy(v: boolean | string | null | undefined): boolean {
  if (v === true) return true;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes";
  }
  return false;
}

function str(v: string | null | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Numeric sort of `page-N.json` file names so pages concatenate in order
 * (page-1, page-2, …, page-10, page-11) rather than lexicographically.
 */
function sortPageFiles(files: string[]): string[] {
  return files
    .filter((f) => /^page-\d+\.json$/i.test(f))
    .sort((a, b) => {
      const na = Number.parseInt(a.match(/\d+/)![0], 10);
      const nb = Number.parseInt(b.match(/\d+/)![0], 10);
      return na - nb;
    });
}

/** Map one raw rlaaf result item into a clean {@link ToplistCasino}. */
function mapItem(item: RawItem): ToplistCasino {
  const meta: RawMeta = item.meta ?? {};
  const card: RawCardImage =
    meta.card_image && typeof meta.card_image === "object"
      ? meta.card_image
      : {};

  // Banner text: there is no dedicated `banner_text` in the captured data, so
  // fall back to `last_updated_text`. Only surface it when show_banner_text is on.
  const bannerSource = str(meta.banner_text) || str(meta.last_updated_text);
  const bannerText =
    isTruthy(meta.show_banner_text) && bannerSource ? bannerSource : null;

  const slug = str(item.post_name);
  let name = str(item.post_title);
  if (MANUALLY_CLOSED_SLUGS.has(slug) && !/\bsuljettu\b/i.test(name)) {
    name = `${name} - Suljettu`;
  }

  return {
    name,
    slug,
    logoUrl: decodeLogoUrl(typeof card === "object" ? card.url : undefined),
    logoAlt: str(typeof card === "object" ? card.alt : "") || null,
    // A dead affiliate destination (dead-affiliates.ts) yields no CTA, so the
    // card renders the same inert button as a casino with no link at all —
    // better than sending the reader to a DNS error.
    ctaSlug: isDeadAffiliate(toRootRelative(meta.cta)) ? null : toRootRelative(meta.cta),
    rating: parseRating(meta.rating) ?? MANUAL_RATING_OVERRIDES.get(slug) ?? null,
    bonusText: str(meta.casino_bonus_description),
    noDeposit: str(meta.no_deposit),
    wagering: str(meta.wagering_value),
    license: str(meta.license_type),
    bannerText,
  };
}

/**
 * Load a captured toplist by config name.
 *
 * Reads every `page-N.json` under `public/rlaaf-data/<config>/` in numeric
 * order, concatenates their `results`, and maps each into a {@link ToplistCasino}.
 * Tolerant of missing files/fields: an unknown config yields `[]`.
 *
 * @param config Toplist config dir name, e.g. `"search-service-casino"`.
 * @param limit  Optional cap on the number of casinos returned.
 */
export function getToplist(config: string, limit?: number): ToplistCasino[] {
  if (!config) return [];
  if (config.startsWith("virtual-")) return getVirtualToplist(config, limit);
  const dir = path.join(RLAAF_DIR, config);
  let files: string[];
  try {
    files = sortPageFiles(fs.readdirSync(dir));
  } catch {
    return []; // config dir does not exist
  }

  const out: ToplistCasino[] = [];
  for (const file of files) {
    let page: RawPage;
    try {
      page = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as RawPage;
    } catch {
      continue; // skip unreadable/corrupt page file
    }
    for (const item of page.results ?? []) {
      // Drop casinos whose review URL is a 301 source in
      // data/static-redirects.json (retired brands — ended affiliate deals,
      // consolidations). Reuses the SAME retired-path source of truth as
      // getPosts() in content.ts rather than a second hardcoded list, so a
      // retirement can never be half-applied: adding the redirect removes the
      // card from every captured toplist automatically, and it survives the
      // daily WP re-sync that rewrites public/rlaaf-data. The captured dumps
      // themselves stay a pristine WP snapshot (never hand-edited).
      const slug = str(item.post_name);
      if (slug && isRetiredPath(`/casino/${slug}/`)) continue;
      out.push(mapItem(item));
      if (limit != null && out.length >= limit) return out;
    }
  }
  return augmentFromReviews(config, out, limit);
}

/* -------------------------------------------------------------------------- *
 * Payment-method augmentation.                                                *
 *                                                                             *
 * Some captured toplist configs are far thinner than the payment method they  *
 * represent. /brite-kasinot/ shipped 8 cards from an 11-row dump while the    *
 * Trustly and Zimpler dumps carry 53 and 59 — yet 27 casino REVIEWS on this   *
 * site list Brite under "Maksutavat". The hub therefore looked sparse next to *
 * its siblings for a 2,100-searches-a-month term.                             *
 *                                                                             *
 * So: after the captured rows, append casinos whose own review states this    *
 * payment method. Nothing is invented — every added row is built from that    *
 * casino's parsed review (name, logo, rating, bonus text, licence, CTA), and  *
 * closed/stub casinos and retired brands are skipped by the same rules as     *
 * everywhere else. Captured rows keep their order and always come first.      *
 * -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- *
 * VIRTUAL toplists.                                                           *
 *                                                                             *
 * Some money pages describe a PROPERTY of a casino rather than a captured WP  *
 * toplist. "Verovapaat kasinot" (4,200 searches/month) is the clearest case:  *
 * a Finnish player's winnings are tax-free when the operator is licensed in   *
 * the EEA, and the licence of every captured casino is already known          *
 * (meta.license_type, classified in license-tier.ts). There is no captured    *
 * dump for it, so the list is derived instead of scraped — same data, same    *
 * card shape, just selected by licence.                                       *
 *                                                                             *
 * Rows come from every captured config (deduped by slug), minus closed/stub    *
 * casinos and retired brands. Best-rated first.                               *
 * -------------------------------------------------------------------------- */

/** Virtual config name → predicate over the mapped row. */
const VIRTUAL_TOPLISTS: Readonly<Record<string, (c: ToplistCasino) => boolean>> = {
  // EEA licence ⇒ winnings tax-free for Finnish players (see license-tier.ts).
  "virtual-eea-licensed": (c) => licenseInfo(c.license).tier === "eea",
  // Wagering requirement 0 ⇒ "kierrätysvapaa" bonus. Only an explicit zero
  // counts; a blank value means the scrape had no figure, not that it is free.
  "virtual-no-wagering": (c) => /^0x?$/i.test((c.wagering ?? "").trim()),
};

function getVirtualToplist(config: string, limit?: number): ToplistCasino[] {
  const predicate = VIRTUAL_TOPLISTS[config];
  if (!predicate) return [];

  const bySlug = new Map<string, ToplistCasino>();
  for (const dirName of listToplistConfigs()) {
    for (const row of getToplist(dirName)) {
      if (!row.slug || bySlug.has(row.slug)) continue;
      if (/\bsuljettu\b/i.test(row.name ?? "")) continue;
      if (isRetiredPath(`/casino/${row.slug}/`)) continue;
      if (!predicate(row)) continue;
      bySlug.set(row.slug, row);
    }
  }
  const rows = [...bySlug.values()].sort(
    (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || a.name.localeCompare(b.name),
  );
  return limit != null ? rows.slice(0, limit) : rows;
}

/** Toplist config → the payment method its casinos must state in their review. */
const PAYMENT_AUGMENTED_CONFIGS: Readonly<Record<string, RegExp>> = {
  "search-two-brite": /\bbrite\b/i,
};

function augmentFromReviews(
  config: string,
  captured: ToplistCasino[],
  limit?: number,
): ToplistCasino[] {
  const method = PAYMENT_AUGMENTED_CONFIGS[config];
  if (!method) return captured;
  if (limit != null && captured.length >= limit) return captured;

  const seen = new Set(captured.map((c) => c.slug).filter(Boolean));
  const extra: ToplistCasino[] = [];
  for (const review of getAllCasinos()) {
    if (!review.slug || seen.has(review.slug)) continue;
    if (review.showNoReview) continue; // closed or empty stub
    if (isRetiredPath(`/casino/${review.slug}/`)) continue;
    if (!(review.paymentMethods ?? []).some((p) => method.test(p))) continue;
    extra.push({
      name: review.name,
      slug: review.slug,
      logoUrl: review.logoUrl,
      logoAlt: null, // review data has no separate alt; the card falls back to "<name> logo"
      // casino-data already nulls a dead affiliate destination.
      ctaSlug: review.ctaSlug ? `/go/${review.ctaSlug}/` : null,
      rating: review.ratingOverall,
      bonusText: review.bonusText ?? "",
      noDeposit: "",
      wagering: "",
      license: review.license ?? "",
      bannerText: null,
    });
  }
  // Best-rated first, unrated last — the captured rows keep their own order.
  extra.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || a.name.localeCompare(b.name));
  const merged = [...captured, ...extra];
  return limit != null ? merged.slice(0, limit) : merged;
}

/**
 * Casinos added directly (not yet captured by the WP toplist scrape/sync —
 * they're new brands, not in any public/rlaaf-data/<config> dump). Each has
 * a live /go/ affiliate redirect (see vercel.json) and a real logo (supplied
 * directly, saved to public/wp-content/uploads/); still no bonus/rating data
 * — the card/row components degrade gracefully for those (no bonus line, no
 * rating row). Added 2026-07-28, logos added 2026-08-05.
 */
export const MANUAL_CASINOS: readonly ToplistCasino[] = [
  {
    // Added 2026-10-21 at the owner's request. Source: Betbay's own welcome
    // package page, its 29-point bonus terms and the site footer.
    //
    // SAME PLATFORM AS LUNALOOTS. The two brands publish byte-identical bonus
    // terms (same three tiers, same Big Bass Splash free spins, same 35x, same
    // 29 numbered points) — they are the same white-label. The licences are
    // NOT the same, and that is the whole point: Betbay is MGA-licensed, so
    // license-tier.ts marks the winnings tax-free, while Lunaloots' Anjouan
    // licence makes them taxable in Finland. Identical offer, better licence.
    name: "Betbay Casino",
    slug: "betbay",
    logoUrl: null, // TODO: set to "/wp-content/uploads/betbay-logo.png" once the owner supplies the logo; card renders the monogram fallback until then
    logoAlt: "Betbay Casino logo",
    ctaSlug: "/go/betbay/",
    rating: 4.5,
    bonusText: "225 % jopa 1 500 € + 500 IK (1.–3. talletus)",
    noDeposit: "",
    wagering: "35x",
    license: "MGA (Malta) – MGA/B2C/233/2013",
    bannerText: null,
  },
  {
    // Added 2026-10-21 at the owner's request. Licence and cashback tiers come
    // from Kirpee's own cashback-campaign page and site footer, supplied by the
    // owner. MGA (Malta) is an EEA licence, so license-tier.ts marks the
    // winnings tax-free — the strongest selling point of the four brands added
    // in this batch. No welcome bonus was supplied, so the card leads with the
    // daily cashback instead and `bonusText` says exactly that; `wagering` is
    // the x10 that applies to the cashback credit, since there is no deposit
    // bonus to quote. Payment methods were omitted: the supplied list was
    // garbled (bank names mangled in transit) and a payment logo we cannot
    // read is not a fact we can print.
    name: "Kirpee Casino",
    slug: "kirpee",
    logoUrl: null, // TODO: set to "/wp-content/uploads/kirpee-logo.png" once the owner supplies the logo; card renders the monogram fallback until then
    logoAlt: "Kirpee Casino logo",
    ctaSlug: "/go/kirpee/",
    rating: 4.5,
    bonusText: "Päivittäinen cashback jopa 20 % nettohäviöistä",
    noDeposit: "",
    wagering: "10x",
    license: "MGA (Malta) – MGA/B2C/203/2011",
    bannerText: null,
  },
  {
    // Added 2026-10-21 at the owner's request. Source: Tuhti's own cashback
    // page + footer, supplied by the owner.
    //
    // LICENCE — DELIBERATELY CURAÇAO-ONLY. The footer names two companies:
    // Trivico BV (Curaçao, GCB-licensed, the gaming licence) and Fundsflare
    // Limited (Cyprus), a wholly owned payments subsidiary. Cyprus is NOT the
    // gaming regulator here. Writing it into this field would be actively
    // harmful: "cyprus" is an EEA marker in license-tier.ts, so the card would
    // flip to "Voitot verovapaita" and tell a Finnish reader their winnings
    // are tax-free when the gaming licence is Curaçao and they are not.
    name: "Tuhti Casino",
    slug: "tuhti",
    logoUrl: null, // TODO: set to "/wp-content/uploads/tuhti-logo.png" once the owner supplies the logo; card renders the monogram fallback until then
    logoAlt: "Tuhti Casino logo",
    ctaSlug: "/go/tuhti/",
    rating: 4.5,
    bonusText: "20 x 1 € ilmaiskierrosta (Sugar Rush 1000)",
    noDeposit: "",
    wagering: "10x",
    license: "Curaçao (GCB)",
    bannerText: null,
  },
  {
    // Added 2026-10-21 at the owner's request. Source: Aurakasino's own
    // welcome-offer page and bonus terms, supplied by the owner.
    //
    // BONUS FIGURE: the marketing page advertises 100 % up to 500 €, while the
    // binding bonus terms (§1.1) say 100 % up to 200 €. The card quotes the
    // match only, with no cap, because the two published figures disagree and
    // the review explains the conflict rather than picking a side. Resolve it
    // with the affiliate manager and the cap can go in here.
    //
    // LICENCE EMPTY: no regulator is named anywhere in the supplied pages, so
    // there is nothing to print. The card shows no licence badge, which is the
    // correct outcome — license-tier.ts returns "unknown" and stays silent
    // rather than guessing a tax treatment.
    name: "Aurakasino",
    slug: "aurakasino",
    logoUrl: null, // TODO: set to "/wp-content/uploads/aurakasino-logo.png" once the owner supplies the logo; card renders the monogram fallback until then
    logoAlt: "Aurakasino logo",
    ctaSlug: "/go/aurakasino/",
    rating: 4.5,
    bonusText: "100 % ensitalletusbonus",
    noDeposit: "",
    wagering: "30x",
    license: "",
    bannerText: null,
  },
  {
    // Added 2026-10-21 at the owner's request; bonus terms supplied the same
    // day, so the card and the review in manual-reviews.ts are both filled in.
    //
    // BONUS TEXT: the package is three separate deposit bonuses (100 % / 75 % /
    // 50 %) whose caps add up to 1 500 €, which the operator markets as "225 %".
    // The card says "1.–3. talletus" so the reader is not told a single deposit
    // earns 225 %; the review does the arithmetic in full.
    //
    // LICENCE — ANJOUAN ONLY, DELIBERATELY. The footer names three entities:
    // Green Champions Leader SRL (Costa Rica) as operator, the Government of
    // Anjouan as the LICENSOR (ALSI-202502014-FI1), and Widoma Trading Co.
    // Limited (Cyprus) as the PAYMENT PROCESSOR. Only Anjouan is the gaming
    // regulator. Cyprus must stay out of this field: it is an EEA marker in
    // license-tier.ts, so including it would flip the badge to "Voitot
    // verovapaita" and tell a Finnish reader their winnings are tax-free when
    // the licence is Anjouan and they are not.
    name: "Lunaloots Casino",
    slug: "lunaloots",
    logoUrl: null, // TODO: set to "/wp-content/uploads/lunaloots-logo.png" once the owner supplies the logo; card renders the monogram fallback until then
    logoAlt: "Lunaloots Casino logo",
    ctaSlug: "/go/lunaloots/",
    rating: 4.5,
    bonusText: "225 % jopa 1 500 € + 500 IK (1.–3. talletus)",
    noDeposit: "",
    wagering: "35x",
    license: "Anjouan (ALSI-202502014-FI1)",
    bannerText: null,
  },
  {
    // Added 2026-10-12 at the owner's request, fronted at rank 1 on the
    // homepage. Bonus, wagering and licence filled in 2026-10-20 from the
    // operator's own published "Bounty Welcome Bonus" terms, supplied by the
    // owner — the same source as the hand-written review in manual-reviews.ts.
    // The maximum bonus is capped in bitcoin, not euros, so the card quotes the
    // match and the cap as the terms state them. Costa Rica does not issue
    // gambling licences, so the licence field says exactly what it is; that
    // makes license-tier.ts flag it non-EEA (winnings taxable in Finland),
    // which is the point. The 4.5 rating was set by the owner on 2026-10-20 —
    // an editorial score, on the same basis as the scraped reviews' scores.
    name: "Betpanda",
    slug: "betpanda",
    logoUrl: "/wp-content/uploads/betpanda-logo.png",
    logoAlt: "Betpanda logo",
    ctaSlug: "/go/betpanda/",
    rating: 4.5,
    bonusText: "100 % ensitalletuksesta, jopa 1 BTC",
    noDeposit: "",
    wagering: "40x",
    license: "Costa Rica (ei ETA-pelilisenssiä)",
    bannerText: null,
  },
  {
    name: "Titaani",
    slug: "titaani",
    logoUrl: "/wp-content/uploads/titaani-casino-logo.png",
    logoAlt: "Titaani logo",
    ctaSlug: "/go/titaani/",
    rating: 4.5,
    bonusText: "20 x 1 € superkierrosta ensitalletuksella",
    noDeposit: "",
    wagering: "",
    license: "Curacao",
    bannerText: null,
  },
  {
    name: "Pelifantti",
    slug: "pelifantti",
    logoUrl: "/wp-content/uploads/pelifantti-kasino-logo.png",
    logoAlt: "Pelifantti logo",
    ctaSlug: "/go/pelifantti/",
    rating: 4.3,
    bonusText: "Jopa 15 % päivittäistä palautusta",
    noDeposit: "",
    wagering: "",
    license: "Anjouan",
    bannerText: null,
  },
  {
    name: "Andromedasino",
    slug: "andromedasino",
    logoUrl: "/wp-content/uploads/andromedasino-logo.png",
    logoAlt: "Andromedasino logo",
    ctaSlug: "/go/andromedasino/",
    rating: null,
    bonusText: "",
    noDeposit: "",
    wagering: "",
    license: "",
    bannerText: null,
  },
];

/** List all available toplist config directory names (sorted). */
export function listToplistConfigs(): string[] {
  try {
    return fs
      .readdirSync(RLAAF_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}
