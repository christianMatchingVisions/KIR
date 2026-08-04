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
 * Casinos confirmed closed but not yet reflected in the captured toplist data
 * (the daily WP re-sync hasn't caught up, or the source never marked them).
 * Appending the site's own " - Suljettu" convention here makes every existing
 * isOpen() filter (homepage, related-casino sidebars) drop them automatically
 * — no per-page changes needed. Keyed by post_name (toplist slug).
 *
 *   simplecasino — confirmed closed 2026-07-22; no live affiliate destination.
 */
const MANUALLY_CLOSED_SLUGS: ReadonlySet<string> = new Set(["simplecasino"]);

/**
 * Editorial overall ratings not (yet) present in the captured toplist scrape.
 * Applied only when the scraped `rating` field is empty, so a real captured
 * value always wins. Mirrors the same number set on each casino's own Arviot
 * card in its review fragment — keep both in sync when updating either.
 */
const MANUAL_RATING_OVERRIDES: ReadonlyMap<string, number> = new Map([
  ["urho-casino", 4.0],
  ["hupislots", 3.5],
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
    ctaSlug: toRootRelative(meta.cta),
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
      out.push(mapItem(item));
      if (limit != null && out.length >= limit) return out;
    }
  }
  return out;
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
