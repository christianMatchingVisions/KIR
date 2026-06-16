/**
 * Editorial content loader (Phase 1 — data layer).
 *
 * Loads the WordPress REST dumps captured under `data/rest/` and exposes them
 * as clean, typed loaders for the new component layer:
 *
 *   data/rest/posts.json    → getPosts() / getPost(slug)
 *   data/rest/pages.json    → getPages() / getPage(slug)
 *   data/rest/ht-faq.json   → getFaqs()
 *
 * All HTML is taken verbatim from `*.rendered`, then self-origin absolute URLs
 * are rewritten to root-relative so the new build serves everything from its
 * own domain. No attributes are stripped (affiliate rel="sponsored nofollow"
 * etc. are preserved).
 *
 * Also exports a best-effort slug → toplist-config map (and a resolver) so the
 * "money"/category pages can pick the right captured toplist.
 *
 * No new npm dependencies: plain node:fs + string ops only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Where the captured WordPress REST dumps live: `data/rest`.
 *
 * Anchor on `process.cwd()` (the Astro project root in both dev and build).
 * Vite bundles this module into `dist/pages/*.mjs` for the SSG render pass, so
 * an `import.meta.url`-relative hop would resolve to a non-existent path under
 * `dist/` and silently yield zero rows. Fall back to the module-relative path
 * for unbundled/dev use.
 */
function resolveRestDir(): string {
  const fromCwd = path.join(process.cwd(), "data", "rest");
  if (fs.existsSync(fromCwd)) return fromCwd;
  return path.join(fileURLToPath(new URL("../../data", import.meta.url)), "rest");
}
const REST_DIR = resolveRestDir();

/** Live site origin — rewritten to root-relative in stored HTML. */
const SITE_ORIGIN = "https://kasinotilmanrekisteroitymista.com";

/* -------------------------------------------------------------------------- */
/* Public types                                                               */
/* -------------------------------------------------------------------------- */

export interface Post {
  id: number;
  slug: string;
  title: string;
  /** ISO publish date (WP `date`). */
  date: string;
  /** ISO last-modified date (WP `modified`). */
  modified: string;
  /** Body HTML (content.rendered), self-origin URLs rewritten root-relative. */
  contentHtml: string;
  /** Excerpt HTML (excerpt.rendered), self-origin URLs rewritten. */
  excerptHtml: string;
  /** Category term ids. */
  categories: number[];
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  date: string;
  modified: string;
  contentHtml: string;
  excerptHtml: string;
  /** Parent page id (0 = top level). */
  parent: number;
  /** WP menu_order for sorting nav/children. */
  menuOrder: number;
}

export interface Faq {
  id: number;
  /** The post slug (e.g. "new-faq-question-22") — keys the /ht-faq/<slug>/ page. */
  slug: string;
  /** The question (title.rendered). */
  question: string;
  /** The answer body HTML (content.rendered), self-origin URLs rewritten. */
  answerHtml: string;
  /** Sort order within its group (_ht_faq_order, numeric). */
  order: number;
  /** FAQ group term ids (ht-faq-group). */
  group: number[];
}

/* -------------------------------------------------------------------------- */
/* Raw REST shapes (only the fields we read)                                  */
/* -------------------------------------------------------------------------- */

interface Rendered {
  rendered?: string;
}

interface RawPost {
  id?: number;
  slug?: string;
  date?: string;
  modified?: string;
  title?: Rendered;
  content?: Rendered;
  excerpt?: Rendered;
  categories?: number[];
}

interface RawPage extends RawPost {
  parent?: number;
  menu_order?: number;
}

interface RawFaq {
  id?: number;
  slug?: string;
  title?: Rendered;
  content?: Rendered;
  "ht-faq-group"?: number[];
  _ht_faq_order?: string | number;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Read + parse a REST dump. Returns [] if missing/corrupt. */
function readJson<T>(name: string): T[] {
  try {
    const raw = fs.readFileSync(path.join(REST_DIR, `${name}.json`), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/**
 * Rewrite self-origin absolute URLs in stored HTML to root-relative.
 * Handles `https://`, protocol-relative `//`, and escaped `https:\/\/` forms.
 * Foreign URLs (affiliate redirects on other domains) are left untouched.
 * No attributes are removed.
 */
function rewriteSelfOrigin(html: string | undefined): string {
  if (!html) return "";
  const host = SITE_ORIGIN.replace(/^https?:\/\//, ""); // kasinotilman...com
  return html
    // escaped JSON-style: https:\/\/host  ->  \/
    .replace(new RegExp(`https?:\\\\/\\\\/${escapeRe(host)}`, "gi"), "\\/")
    // normal absolute: https://host  ->  (root-relative)
    .replace(new RegExp(`https?://${escapeRe(host)}`, "gi"), "")
    // protocol-relative: //host  ->  (root-relative)
    .replace(new RegExp(`(?<=["'(\\s])//${escapeRe(host)}`, "gi"), "");
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * COMPLIANCE: soften first-hand / first-person testing claims in editorial
 * prose to passive, third-party-tested phrasing.
 *
 * The penalty-recovery brief forbids first-hand/testing claims
 * ("testasin/testasimme/kokeilin/oikealla pelaajatilillä/we tested",
 * "omakohtainen/kokemukseni …"). Only PASSIVE third-party-tested-games prose
 * ("pelit on testattu …") may remain — so bare "testattu" is left untouched.
 *
 * This operates on the stored REST HTML at load time, so every consumer
 * (catch-all article/money pages, hubs, news) renders the compliant copy.
 * It is text-level only: tags, attributes, links and the preserved <title>/
 * JSON-LD head (handled elsewhere, verbatim) are not affected. Idempotent.
 */
export function scrubFirstHandClaims(html: string): string {
  if (!html) return "";
  return (
    html
      // "Testasin Oracle of Goldia …" → "Oracle of Goldia on arvioitu …"
      // "Testasin peliä …"            → "Peliä on arvioitu …"
      .replace(
        /\bTestasin\s+([A-ZÅÄÖ][^\s.,;:]*(?:\s+[a-zäöå][^\s.,;:]*)?)\b/g,
        (_m, obj) => `${obj} on arvioitu`,
      )
      .replace(/\bTestasin\b/g, "Arvioinnissa")
      // First-person plural test verbs → passive.
      .replace(/\bTestasimme\b/g, "Arvioinnissa")
      .replace(/\bTestimme\b/g, "Arvioinnissa")
      .replace(/\bKokeilin\b/g, "Arvioinnissa")
      .replace(/\bKokeilimme\b/g, "Arvioinnissa")
      .replace(/\bkokeilin\b/g, "arvioinnissa")
      .replace(/\bkokeilimme\b/g, "arvioinnissa")
      // "Kokemukseni tilivapaista kasinoista" (heading) → neutral.
      .replace(/\bKokemukseni\b/g, "Havaintoja")
      .replace(/\bkokemukseni\b/g, "havaintoja")
      // "omakohtainen näkemyksemme" → "riippumaton näkemys"
      .replace(/\bomakohtainen näkemyksemme\b/gi, "riippumaton näkemys")
      // "Omakohtaisiin testeihin perustuva" → "Riippumattomiin arvioihin perustuva"
      .replace(/\bOmakohtaisiin testeihin perustuva\b/g, "Riippumattomiin arvioihin perustuva")
      .replace(/\bomakohtaisiin testeihin perustuva\b/g, "riippumattomiin arvioihin perustuva")
      // any remaining "omakohtai…" stem → "riippumat(on/tomiin)…" neutralisation
      .replace(/\bOmakohtai(nen|set|sia|siin|sten|sesti)?\b/g, "Riippumaton")
      .replace(/\bomakohtai(nen|set|sia|siin|sten|sesti)?\b/g, "riippumaton")
      // "pelasin itse …" → "pelitestauksessa …"
      .replace(/\bpelasin itse\b/gi, "pelitestauksessa")
      // explicit real-money-account testing claim
      .replace(/\boikealla pelaajatilill[äa]\b/gi, "arviointiprosessissa")
      // English variants (defensive)
      .replace(/\bwe tested\b/gi, "independent testing covered")
      .replace(/\bI tested\b/g, "Testing covered")
  );
}

/**
 * COMPLIANCE: force rel="sponsored nofollow" on every affiliate link in HTML.
 *
 * This site is in penalty recovery and the rule is strict: EVERY affiliate
 * link must be rel="sponsored nofollow". Two link shapes are covered:
 *   1. internal redirect links  href="/go/<slug>/"  (the canonical affiliate
 *      out-link shape across the whole site), and
 *   2. external absolute affiliate links the engine may emit directly
 *      (href="https://…" / protocol-relative "//…") that are NOT this site's
 *      own origin — daily AI content can link straight to an operator.
 *
 * Behaviour per matched <a>:
 *   - no rel attribute → add rel="sponsored nofollow"
 *   - existing rel     → merge in sponsored + nofollow (dedup, order-stable)
 * Same-origin and root-relative non-/go/ links (internal navigation) are left
 * untouched. Idempotent, attribute-level, HTML-safe. Shared by the catch-all
 * route, the casino route, and the Content-Engine loader so daily content is
 * compliant by construction.
 */
const SELF_ORIGIN_HOST = SITE_ORIGIN.replace(/^https?:\/\//, "");

function mergeSponsoredRel(attrs: string): string {
  const relMatch = attrs.match(/\brel="([^"]*)"/i);
  if (!relMatch) {
    return `<a${attrs} rel="sponsored nofollow">`;
  }
  const tokens = new Set(
    relMatch[1].split(/\s+/).filter(Boolean).map((t) => t.toLowerCase()),
  );
  tokens.add("sponsored");
  tokens.add("nofollow");
  const merged = [...tokens].join(" ");
  const newAttrs = attrs.replace(/\brel="[^"]*"/i, `rel="${merged}"`);
  return `<a${newAttrs}>`;
}

/** Extract the href value from an <a>'s attribute string, or null. */
function hrefOf(attrs: string): string | null {
  const m = attrs.match(/\bhref="([^"]*)"/i);
  return m ? m[1] : null;
}

/**
 * Authoritative / non-affiliate external domains that must KEEP their normal
 * (followed) outbound link. Editorial citations to regulators, legislation and
 * responsible-gambling bodies are positive E-E-A-T trust signals — nofollowing
 * them would hurt the penalty recovery — so they are exempt from the affiliate
 * sponsored+nofollow rule. Matched on the registrable suffix (host endsWith).
 */
const AUTHORITY_HOST_SUFFIXES: readonly string[] = [
  // Regulators & player-protection bodies
  "mga.org.mt", "spelinspektionen.se", "gamblingcommission.gov.uk",
  "peluuri.fi", "thl.fi", "avi.fi", "veikkaus.fi",
  // EU / government / legislation
  "europa.eu", "eur-lex.europa.eu", "finlex.fi", ".gov", ".gov.uk",
  // Reference / standards
  "wikipedia.org", "who.int", "begambleaware.org",
];

/** Host (lowercased) for an absolute/protocol-relative href, or null. */
function externalHost(href: string): string | null {
  const m = href.match(/^(?:https?:)?\/\/([^/]+)/i);
  if (!m) return null; // root-relative or non-URL → internal
  const host = m[1].toLowerCase();
  return host === SELF_ORIGIN_HOST.toLowerCase() ? null : host;
}

/** True when the host is a known authoritative/non-affiliate domain. */
function isAuthorityHost(host: string): boolean {
  return AUTHORITY_HOST_SUFFIXES.some(
    (s) => host === s || host.endsWith("." + s) || host.endsWith(s),
  );
}

/**
 * COMPLIANCE entry point. Forces rel="sponsored nofollow" on:
 *   - EVERY internal affiliate redirect link  href="/go/<slug>/"  (always), and
 *   - external absolute affiliate links (operator domains the engine may link
 *     directly) — EXCEPT authoritative/regulator domains (allow-listed above),
 *     which keep their normal followed link as a trust signal.
 * Same-origin and root-relative non-/go/ links (internal navigation) are left
 * untouched. See AUTHORITY_HOST_SUFFIXES for the editorial-citation exemption.
 */
export function ensureSponsored(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<a\b([^>]*)>/gi, (whole, attrs: string) => {
    const href = hrefOf(attrs);
    if (!href) return whole;
    if (/^\/go\//i.test(href)) return mergeSponsoredRel(attrs);
    const host = externalHost(href);
    if (host && !isAuthorityHost(host)) return mergeSponsoredRel(attrs);
    return whole;
  });
}

/**
 * PERFORMANCE (Core Web Vitals) for embedded prose images.
 *
 * The preserved/scraped WordPress prose carries large editorial JPEGs (often
 * 1900px+ wide) deep INSIDE the article body — always well below the fold (they
 * sit after the hero, quick-facts, rating, payment and intro sections). The
 * legacy markup left two anti-patterns on them:
 *   1. `fetchpriority="high"` on the first prose image — this tells the browser
 *      to fetch a deep, non-LCP image at top priority, starving the genuine
 *      above-the-fold LCP candidate and inflating initial transfer.
 *   2. NO `loading` attribute — so the image is eagerly fetched on first load
 *      even though it is far below the fold.
 *
 * This pass, applied to PROSE HTML only (never to the page-template hero <img>,
 * which lives outside .kir-prose), makes these images well-behaved:
 *   - strips `fetchpriority="high"` (and the rare `fetchpriority=high`)
 *   - adds `loading="lazy"` when the <img> has no `loading` attribute
 *   - adds `decoding="async"` when the <img> has no `decoding` attribute
 *
 * It is deliberately CONSERVATIVE and idempotent: width/height/alt/src and every
 * other attribute are left byte-for-byte intact, an existing `loading="eager"`
 * is respected (never downgraded), and re-running the pass is a no-op. It does
 * NOT touch the LCP image of any page — those are emitted by the page templates
 * (e.g. the /uutiset/ engine hero) outside the prose string.
 */
/**
 * Decode ShortPixel (SPAI) lazy-load placeholders to their real <img src>.
 * These render as <img src="data:image/svg+xml;base64,…" data-spai="1">, with
 * the real URL URL-encoded in a data-u attribute INSIDE the base64 SVG (here a
 * supabase blog-image host). Undecoded they show as blank 1x1 placeholder boxes
 * in article/FAQ prose. We pull data-u, decode it and set it as the src,
 * dropping the placeholder + data-spai. Self-origin URLs become root-relative;
 * foreign hosts (supabase) stay absolute. Any host works.
 */
function decodeSpaiImages(html: string): string {
  if (!html) return "";
  return html.replace(
    /<img\b[^>]*\bsrc="data:image\/svg\+xml;base64,([^"]+)"[^>]*>/gi,
    (tag, b64) => {
      let real: string | null = null;
      try {
        const svg = Buffer.from(b64, "base64").toString("utf8");
        const m = svg.match(/data-u="([^"]+)"/);
        if (m) real = decodeURIComponent(m[1]);
      } catch {
        /* fall through */
      }
      if (!real) return tag; // undecodable placeholder — leave untouched
      real = real.replace(/^https?:\/\/kasinotilmanrekisteroitymista\.com/i, "");
      return tag
        .replace(/\bsrc="data:[^"]*"/, `src="${real}"`)
        .replace(/\s+data-spai="[^"]*"/gi, "");
    },
  );
}

export function optimizeProseImages(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<img\b([^>]*?)\s*(\/?)>/gi, (_whole, rawAttrs: string, selfClose: string) => {
    let attrs = rawAttrs;
    // 1. Drop fetchpriority="high" (quoted or bare) — never the LCP image here.
    attrs = attrs.replace(/\s+fetchpriority\s*=\s*(?:"high"|'high'|high)/gi, "");
    // 2. Lazy-load when no loading attribute is present (respect existing values).
    if (!/\bloading\s*=/i.test(attrs)) {
      attrs = `${attrs} loading="lazy"`;
    }
    // 3. Async decode when no decoding attribute is present.
    if (!/\bdecoding\s*=/i.test(attrs)) {
      attrs = `${attrs} decoding="async"`;
    }
    // Normalise stray double-spaces left by the strip; keep a single space lead.
    attrs = attrs.replace(/\s{2,}/g, " ").replace(/^\s*/, " ").replace(/\s*$/, "");
    return `<img${attrs}${selfClose ? " /" : ""}>`;
  });
}

function str(v: string | undefined): string {
  return typeof v === "string" ? v : "";
}

function num(v: string | number | undefined, fallback = 0): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  if (typeof v === "string") {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/* -------------------------------------------------------------------------- */
/* Posts                                                                      */
/* -------------------------------------------------------------------------- */

function mapPost(p: RawPost): Post {
  return {
    id: num(p.id),
    slug: str(p.slug),
    title: str(p.title?.rendered),
    date: str(p.date),
    modified: str(p.modified),
    contentHtml: scrubFirstHandClaims(decodeSpaiImages(rewriteSelfOrigin(p.content?.rendered))),
    excerptHtml: scrubFirstHandClaims(rewriteSelfOrigin(p.excerpt?.rendered)),
    categories: Array.isArray(p.categories) ? p.categories : [],
  };
}

/** All blog posts, newest first (by publish date). */
export function getPosts(): Post[] {
  return readJson<RawPost>("posts")
    .map(mapPost)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** A single post by slug, or null. */
export function getPost(slug: string): Post | null {
  if (!slug) return null;
  const raw = readJson<RawPost>("posts").find((p) => p.slug === slug);
  return raw ? mapPost(raw) : null;
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

function mapPage(p: RawPage): Page {
  return {
    id: num(p.id),
    slug: str(p.slug),
    title: str(p.title?.rendered),
    date: str(p.date),
    modified: str(p.modified),
    contentHtml: scrubFirstHandClaims(decodeSpaiImages(rewriteSelfOrigin(p.content?.rendered))),
    excerptHtml: scrubFirstHandClaims(rewriteSelfOrigin(p.excerpt?.rendered)),
    parent: num(p.parent),
    menuOrder: num(p.menu_order),
  };
}

/** All pages, sorted by menu_order then title. */
export function getPages(): Page[] {
  return readJson<RawPage>("pages")
    .map(mapPage)
    .sort(
      (a, b) =>
        a.menuOrder - b.menuOrder || a.title.localeCompare(b.title, "fi"),
    );
}

/** A single page by slug, or null. */
export function getPage(slug: string): Page | null {
  if (!slug) return null;
  const raw = readJson<RawPage>("pages").find((p) => p.slug === slug);
  return raw ? mapPage(raw) : null;
}

/* -------------------------------------------------------------------------- */
/* FAQs                                                                       */
/* -------------------------------------------------------------------------- */

function mapFaq(f: RawFaq): Faq {
  return {
    id: num(f.id),
    slug: str(f.slug),
    question: str(f.title?.rendered),
    answerHtml: scrubFirstHandClaims(decodeSpaiImages(rewriteSelfOrigin(f.content?.rendered))),
    order: num(f._ht_faq_order),
    group: Array.isArray(f["ht-faq-group"]) ? f["ht-faq-group"] : [],
  };
}

/** All FAQs sorted by their _ht_faq_order. */
export function getFaqs(): Faq[] {
  return readJson<RawFaq>("ht-faq")
    .map(mapFaq)
    .sort((a, b) => a.order - b.order);
}

/** A single FAQ by its post slug (e.g. "new-faq-question-22"), or null. */
export function getFaq(slug: string): Faq | null {
  if (!slug) return null;
  const raw = readJson<RawFaq>("ht-faq").find((f) => f.slug === slug);
  return raw ? mapFaq(raw) : null;
}

/* -------------------------------------------------------------------------- */
/* slug → toplist-config mapping                                              */
/* -------------------------------------------------------------------------- */

/**
 * Best-effort map from a money/category page slug to the captured toplist
 * config that should power its ranking table. Derived from the recon of
 * `public/rlaaf-data/`. Pages not listed fall back to `search-service-casino`
 * (the full "all casinos" list) via {@link getToplistConfigForSlug}.
 */
export const SLUG_TO_TOPLIST_CONFIG: Readonly<Record<string, string>> = {
  "trustly-kasinot": "search-two-casino-trustly",
  "zimpler-pikakasinot": "search-two-casino-zimpler",
  "mga-kasinot": "search-two-mga",
  "curacao-kasinot": "search-two-curacao",
  "kryptokasinot": "search-two-krypto",
  "cashback-kasinot": "search-service-cashback",
  "apple-pay-casinot": "search-two-casino-apple-pay",
  "brite-kasinot": "search-two-brite",
  "euteller-kasinot": "search-two-casino-euteller",
  "uudet-kasinot": "search-two-casino-2025",
  "suomen-parhaat-nettikasinot": "search-two-casino-selected",
  "kaikki-kasinot": "search-service-casino",
};

/** Default toplist config when a slug has no explicit mapping. */
export const DEFAULT_TOPLIST_CONFIG = "search-service-casino";

/** Resolve a page slug to its toplist config, falling back to the full list. */
export function getToplistConfigForSlug(slug: string): string {
  return SLUG_TO_TOPLIST_CONFIG[slug] ?? DEFAULT_TOPLIST_CONFIG;
}
