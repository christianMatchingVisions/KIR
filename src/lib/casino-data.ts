/**
 * Casino review DATA LAYER for Kasinot ilman rekisteröitymistä
 * (kasinotilmanrekisteroitymista.com).
 *
 * The scraped WordPress casino pages live as fragments at
 *   src/fragments/casino__<slug>/{body.html, meta.json}
 * and their canonical URL is /casino/<slug>/ (from meta.json.path).
 *
 * The REST dump (data/rest/casino.json) is USELESS for these: the casino
 * post type renders its body via ACF, so the REST `content.rendered` is empty.
 * The body.html fragment is therefore the ONLY source of prose + structured
 * facts. This module turns each fragment into a typed CasinoReview so the new
 * (Phase 4) light-theme review template can render without ever touching HTML.
 *
 * Design / reliability notes (from a recon of ~25 fragments spanning the range):
 *   - The scraped review markup is four "review-card" boxes inside the first
 *     <section> after the hero:
 *       col-lg-4  -> logo (inside the /go/<x>/ link), bonus headline, "Kierrätys"
 *       col-lg-8  -> "Arvostelu" card: a <ul> of facts
 *                    (Kasino/Casino, Lisenssi/Licence, Käynnistetty/Year Launched,
 *                     Minimitalletus/Min deposit, Maksutavat/Payment methods,
 *                     Tuki e-mail/Tukisähköposti/Email support, Live-chat,
 *                     Tukipuhelin)
 *       col-lg-6  -> "Bonukset" card: <ol>/<ul>/<p> of bonus lines
 *       col-lg-6  -> "Arviot: X/5" card: <ul> of sub-ratings; the X is the
 *                    overall score (empty -> "Arviot: /5")
 *   - The main prose is the <div class="wp-content-area"> block. Many casinos
 *     have an EMPTY content area (stub/closed) and/or empty cards.
 *   - "Suljettu" (closed) is signalled in the <h1>; such pages may still carry
 *     full prose (e.g. 1clickwin) or be empty.
 *   - Labels are messy: colon may sit inside or outside </strong>, <li> may
 *     carry inline styles, and some casinos use English labels. Sub-rating
 *     values may sit AFTER </strong> ("...: </strong>4,5") or INSIDE it
 *     ("...: 4,5</strong>"), and use Finnish comma decimals (4,5).
 *   - SPARSE (often absent): minDeposit, support (phone/livechat/email).
 *   - NEVER present: pros/cons, per-payment ratings. We do NOT invent them.
 *
 * ShortPixel SPAI handling: logos/images are lazy-load placeholders
 *   src="data:image/svg+xml;base64,..." where the SVG embeds the real URL in a
 * URL-encoded data-u attribute. We decode that to a root-relative /wp-content
 * URL — exactly like ArticleLayout.astro's decodeSpai(), reused here.
 *
 * Pure node:fs + regex. No new dependencies (no cheerio/jsdom).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadEngineReviews, type EngineReview } from "./engine-casino-loader";

export type { EngineReview } from "./engine-casino-loader";

/**
 * Repo-root absolute path to the scraped fragments directory.
 *
 * Resolve from `process.cwd()` (the Astro project root in both `astro dev` and
 * `astro build`) rather than `import.meta.url`. Vite bundles this module into
 * `dist/pages/*.astro.mjs` for the SSG render pass, so `import.meta.url` points
 * at `dist/pages/` at build time — a `../fragments` hop from there resolves to
 * the non-existent `dist/fragments`, silently yielding zero casinos. Anchoring
 * on the project root keeps `src/fragments` reachable regardless of where the
 * bundled module ends up. A `src/fragments` resolved from `import.meta.url`
 * (dev / unbundled) is kept as a fallback for robustness.
 */
function resolveFragmentsDir(): string {
  const fromCwd = join(process.cwd(), "src", "fragments");
  if (existsSync(fromCwd)) return fromCwd;
  const fromModule = join(dirname(fileURLToPath(import.meta.url)), "..", "fragments");
  return fromModule;
}
const FRAGMENTS_DIR = resolveFragmentsDir();

const SITE_URL = "https://kasinotilmanrekisteroitymista.com";

/* ------------------------------------------------------------------ *
 * Public types
 * ------------------------------------------------------------------ */

export type SubRating = {
  /** Human label, e.g. "Bonukset", "Luotettavuus & turvallisuus". */
  label: string;
  /** Numeric value on a 0–5 scale (Finnish "4,5" normalised to 4.5). */
  value: number;
};

export type CasinoSupport = {
  email?: string;
  phone?: string;
  liveChat?: boolean;
  /** Support hours (engine-only, e.g. "24/7"). */
  hours?: string;
};

/**
 * Rich per-payment-method detail (engine-only). The scraped fragments only ever
 * carry method NAMES (paymentMethods: string[]); when the engine supplies
 * structured payment data it lands here so PaymentMethods.astro can show payout
 * time / min / rating per method. Optional + additive — null/absent → name-only.
 */
export type PaymentDetail = {
  name: string;
  payoutTime?: string | null;
  min?: string | null;
  rating?: number | null;
};

export type CasinoReview = {
  /** Fragment slug, e.g. "21red-kasino" (the part after casino__). */
  slug: string;
  /** Display name from the <h1>, with the " – Suljettu" suffix stripped. */
  name: string;
  /** Canonical site path from meta.json, e.g. "/casino/21red-kasino/". */
  url: string;
  /** The /go/<x>/ affiliate target slug (the "<x>"), or null. */
  ctaSlug: string | null;
  /** Decoded, root-relative /wp-content logo URL, or null. */
  logoUrl: string | null;
  /** Overall score from the "Arviot: X/5" heading, or null when blank. */
  ratingOverall: number | null;
  /** Per-criterion ratings from the "Arviot" card. [] when absent. */
  subRatings: SubRating[];
  /** Bonus headline from the logo card (e.g. "100 % jopa 200 €"), or null. */
  bonusText: string | null;
  /** Licence string (e.g. "Malta Gaming Authority"), or null. */
  license: string | null;
  /** Payment methods, split from the "Maksutavat" field. [] when absent. */
  paymentMethods: string[];
  /** Founded year as a string (e.g. "2023"), or null. */
  foundedYear: string | null;
  /** Minimum deposit text (e.g. "10 €"), or null (SPARSE). */
  minDeposit: string | null;
  /** Support channels (SPARSE). null when nothing detected. */
  support: CasinoSupport | null;
  /** Main review prose (cleaned, SPAI-decoded, self-links rooted), or null. */
  reviewHtml: string | null;
  /** Bonuses card inner HTML (cleaned), or null. */
  bonusesHtml: string | null;
  /** True when the casino is closed ("Suljettu") or has no real review. */
  showNoReview: boolean;

  /* ---- Engine-enrichment fields (ADDITIVE, optional) -------------------- *
   * Populated by initEngineReviews() (build-time fetch of GET /reviews) and
   * merged per the FILL-GAPS + OVERRIDE policy. Absent/undefined for every
   * casino when the engine serves no data → components fall back to scraped
   * behaviour and the page renders exactly as today. */

  /** Positive points from the engine review. [] / undefined when none. */
  pros?: string[];
  /** Negative points from the engine review. [] / undefined when none. */
  cons?: string[];
  /** Average payout time, e.g. "0-15 min" (engine-only). */
  payoutTime?: string | null;
  /** Game count text, e.g. "Yli 3 000 peliä" (engine-only). */
  gameCount?: string | null;
  /** Mobile experience text, e.g. "Täysin optimoitu mobiiliin" (engine-only). */
  mobile?: string | null;
  /** Rich per-method payment detail (engine-only). Names still in paymentMethods. */
  paymentDetails?: PaymentDetail[];
  /** Optional extra engine prose (hardened at render time by the route). */
  summaryHtml?: string | null;
  /** True when ANY field on this review was filled/overridden by engine data. */
  fromEngine?: boolean;
};

/* ------------------------------------------------------------------ *
 * Engine enrichment (ADDITIVE, build-time) — FILL GAPS + OVERRIDE
 * ------------------------------------------------------------------ *
 *
 * The scraped fragments are the BASE. When the Content Engine serves structured
 * review data (GET {CE_API_URL}/reviews), it FILLS GAPS and OVERRIDES per-field:
 * for any field the engine provides, the engine value wins; otherwise the
 * scraped value is kept; otherwise null. pros/cons come from the engine when
 * present (the scrape never has them).
 *
 * The engine fetch is async, but getCasino()/getAllCasinos() are synchronous
 * (called from Astro `getStaticPaths` + frontmatter). To keep them sync we load
 * the engine Map ONCE into module state via the awaited `initEngineReviews()`
 * (the route/page calls it before rendering). Until init runs — or when the
 * engine serves nothing — the Map is empty and every casino is returned
 * pure-scraped, byte-identical to today. init is idempotent + best-effort:
 * a failed/empty fetch leaves the empty Map in place (never throws). */

let engineReviews: Map<string, EngineReview> = new Map();
let engineInitPromise: Promise<void> | null = null;

/**
 * Load the engine reviews Map into module state (once). Awaited by the casino
 * route before it renders so the synchronous getCasino()/getAllCasinos() can
 * merge engine data. Safe to call repeatedly — the underlying fetch runs once.
 * Always resolves (loadEngineReviews never throws); on any failure the Map
 * stays empty and the build proceeds pure-scraped.
 *
 * The route passes CE_API_URL / CE_API_KEY explicitly (read from
 * `import.meta.env` in the .astro module, exactly like content.config.ts wires
 * the articles loader) so the credentials are reliably populated at build time.
 * When omitted the loader falls back to its own `import.meta.env` read.
 */
export async function initEngineReviews(opts?: {
  apiUrl?: string | undefined;
  apiKey?: string | undefined;
}): Promise<void> {
  if (!engineInitPromise) {
    engineInitPromise = loadEngineReviews(opts)
      .then((map) => {
        engineReviews = map;
      })
      .catch(() => {
        engineReviews = new Map();
      });
  }
  return engineInitPromise;
}

/** Test/advanced seam: inject a pre-built engine Map (skips the network). */
export function setEngineReviews(map: Map<string, EngineReview>): void {
  engineReviews = map;
  engineInitPromise = Promise.resolve();
}

/** First non-empty string among the candidates, else null. */
function firstNonEmpty(...vals: (string | null | undefined)[]): string | null {
  for (const v of vals) {
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return null;
}

/**
 * Merge an engine review over a scraped CasinoReview, per FILL-GAPS + OVERRIDE.
 * Engine value wins when present; otherwise the scraped value; otherwise null.
 * Returns a NEW object; the scraped review is never mutated. When `engine` is
 * null/undefined the scraped review is returned unchanged (pure-scraped).
 */
function mergeEngine(
  scraped: CasinoReview,
  engine: EngineReview | undefined,
): CasinoReview {
  if (!engine) return scraped;

  // Sub-ratings: prefer the engine's set when it has any, else scraped.
  const subRatings =
    engine.sub_ratings.length > 0
      ? engine.sub_ratings.map((s) => ({ label: s.label, value: s.value }))
      : scraped.subRatings;

  // Payment method NAMES: engine names win when present, else scraped names.
  const engineNames = engine.payment_methods
    .map((p) => p.name)
    .filter((n) => n.trim().length > 0);
  const paymentMethods =
    engineNames.length > 0 ? engineNames : scraped.paymentMethods;

  // Rich per-method detail is engine-only (undefined when the engine has none).
  const paymentDetails =
    engine.payment_methods.length > 0
      ? engine.payment_methods.map((p) => ({
          name: p.name,
          payoutTime: p.payout_time ?? null,
          min: p.min ?? null,
          rating: p.rating ?? null,
        }))
      : undefined;

  // Support: engine wins as a whole object when it carries anything, else
  // scraped. (Engine support is structured; scraped is sparse.)
  const support: CasinoSupport | null = engine.support
    ? {
        ...(engine.support.email ? { email: engine.support.email } : {}),
        ...(engine.support.phone ? { phone: engine.support.phone } : {}),
        ...(typeof engine.support.live_chat === "boolean"
          ? { liveChat: engine.support.live_chat }
          : {}),
        ...(engine.support.hours ? { hours: engine.support.hours } : {}),
      }
    : scraped.support;

  return {
    ...scraped,
    name: firstNonEmpty(engine.name, scraped.name) ?? scraped.name,
    ratingOverall: engine.rating_overall ?? scraped.ratingOverall,
    subRatings,
    bonusText: firstNonEmpty(engine.bonus_text, scraped.bonusText),
    license: firstNonEmpty(engine.license, scraped.license),
    paymentMethods,
    foundedYear: firstNonEmpty(engine.founded_year, scraped.foundedYear),
    minDeposit: firstNonEmpty(engine.min_deposit, scraped.minDeposit),
    support,
    // Engine-only enrichment fields.
    pros: engine.pros.length > 0 ? engine.pros : undefined,
    cons: engine.cons.length > 0 ? engine.cons : undefined,
    payoutTime: engine.payout_time ?? null,
    gameCount: engine.game_count ?? null,
    mobile: engine.mobile ?? null,
    paymentDetails,
    summaryHtml: engine.summary_html ?? null,
    fromEngine: true,
  };
}

/* ------------------------------------------------------------------ *
 * Low-level helpers
 * ------------------------------------------------------------------ */

/** Decode HTML entities that appear in the scraped Finnish copy. */
function decodeEntities(s: string): string {
  return s
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#215;/g, "×")
    .replace(/&#8230;/g, "…")
    .replace(/&#8364;/g, "€")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Strip ALL tags and collapse whitespace — for label/value text. */
function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Decode ShortPixel SPAI base64 SVG placeholders to the real image URL.
 * Mirrors ArticleLayout.astro decodeSpai(): the real URL lives URL-encoded in a
 * data-u attribute inside the base64 SVG. Returns a {src, full <img>} rewrite
 * for HTML, and is also reused to extract a single logo URL.
 */
function decodeSpaiImgs(html: string): string {
  return html.replace(
    /<img\b[^>]*src="data:image\/svg\+xml;base64,([^"]+)"[^>]*>/g,
    (tag, b64: string) => {
      const real = realUrlFromSpaiBase64(b64);
      if (!real) return tag;
      return tag
        .replace(/src="data:[^"]*"/, `src="${real}"`)
        .replace(/\s+data-spai="[^"]*"/g, "");
    },
  );
}

/** Decode a single SPAI base64 SVG payload to a root-relative real URL. */
function realUrlFromSpaiBase64(b64: string): string | null {
  try {
    const svg = Buffer.from(b64, "base64").toString("utf8");
    const dataU = svg.match(/data-u="([^"]+)"/)?.[1];
    if (!dataU) return null;
    let real = decodeURIComponent(dataU);
    // Drop the ShortPixel CDN prefix if present, then root-relative the origin.
    real = real.replace(
      /^https?:\/\/cdn\.shortpixel\.ai\/spai\/[^/]+\//,
      "https://",
    );
    real = real.replace(SITE_URL, "");
    real = real.replace(/^https?:\/\/kasinotilmanrekisteroitymista\.com/, "");
    return real;
  } catch {
    return null;
  }
}

/** Extract the first SPAI logo URL from a chunk of HTML, decoded. */
function firstLogoUrl(html: string): string | null {
  const m = html.match(/src="data:image\/svg\+xml;base64,([^"]+)"/);
  if (!m) {
    // Already a plain <img> (rare); take its src.
    const plain = html.match(/<img\b[^>]*\bsrc="([^"]+)"/);
    if (plain && !plain[1].startsWith("data:")) {
      return plain[1].replace(SITE_URL, "");
    }
    return null;
  }
  return realUrlFromSpaiBase64(m[1]);
}

/**
 * Slice the inner HTML of a single "review-card" given the heading text that
 * card starts with (e.g. "Arvostelu", "Bonukset", "Arviot"). We locate the
 * <p class="h4 ...">HEADING and return everything from after that heading's
 * </p> up to the closing </div> of the card. Returns "" when not found.
 */
function cardBodyByHeading(html: string, headingStartsWith: string): string {
  // Match the h4 paragraph whose text begins with the heading.
  const headingRe = new RegExp(
    `<p[^>]*class="[^"]*\\bh4\\b[^"]*"[^>]*>\\s*${escapeRe(
      headingStartsWith,
    )}[^<]*</p>`,
    "i",
  );
  const m = headingRe.exec(html);
  if (!m) return "";
  const start = m.index + m[0].length;
  // The card content sits inside the same review-card <div>. Find the matching
  // closing </div> by counting nesting from the heading position.
  return sliceToMatchingDivClose(html, start);
}

/**
 * From `start`, return text up to the </div> that closes the *card* div.
 * The card div opened before the heading; the heading itself is not a div, so
 * we walk forward counting <div ...> / </div> and stop when depth goes below 0.
 */
function sliceToMatchingDivClose(html: string, start: number): string {
  let depth = 0;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = start;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[0].startsWith("</")) {
      if (depth === 0) return html.slice(start, m.index);
      depth--;
    } else {
      depth++;
    }
  }
  return html.slice(start);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Read a labelled value out of an "Arvostelu"-style <ul>. Tolerant of:
 *   <li><strong>Label:</strong> value</li>
 *   <li><strong>Label: </strong>value</li>
 *   <li><strong>Label</strong>: value</li>
 *   <li style="..."><strong>Label : </strong> value</li>
 * `labels` is a list of accepted label spellings (FI + EN aliases).
 */
function fieldFromList(cardHtml: string, labels: string[]): string | null {
  const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = liRe.exec(cardHtml)) !== null) {
    const li = m[1];
    const strong = li.match(/<strong>([\s\S]*?)<\/strong>([\s\S]*)/i);
    if (!strong) continue;
    const labelText = stripTags(strong[1]).replace(/[:\s]+$/, "");
    let rest = strong[2];
    for (const label of labels) {
      if (labelText.toLowerCase() === label.toLowerCase()) {
        // Value may also live inside <strong> ("Label: value"): if rest is
        // empty/colon-only, fall back to text after the label inside strong.
        const inStrong = stripTags(strong[1]);
        let value = stripTags(rest).replace(/^[:：\s]+/, "");
        if (!value) {
          const after = inStrong.slice(label.length).replace(/^[:：\s]+/, "");
          value = after.trim();
        }
        return value || null;
      }
    }
  }
  return null;
}

/** Normalise a Finnish/English numeric rating string ("4,5" / "4.5") -> 4.5. */
function parseNumber(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = raw.replace(",", ".").match(/\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

/* ------------------------------------------------------------------ *
 * Section extraction
 * ------------------------------------------------------------------ */

/** Parse the four review-cards block out of the casino body. */
function getReviewSection(body: string): string {
  // The cards live in the first <section class="container-fluid"> AFTER the
  // hero (which is the only one carrying class kir-hero). Slice from the first
  // "review-card" up to the wp-content-area section to keep it tight.
  const cardStart = body.indexOf("review-card");
  if (cardStart === -1) return "";
  const contentStart = body.indexOf("wp-content-area");
  return body.slice(cardStart, contentStart === -1 ? undefined : contentStart);
}

/** Extract & clean the wp-content-area prose. Returns null when empty. */
function getReviewProse(body: string): string | null {
  const m = body.match(
    /<div class="wp-content-area">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="col-lg-4">/i,
  );
  let inner: string | null = null;
  if (m) {
    inner = m[1];
  } else {
    // Fallback: from wp-content-area to the next </aside> sibling boundary.
    const alt = body.match(/<div class="wp-content-area">([\s\S]*?)<\/div>/i);
    inner = alt ? alt[1] : null;
  }
  if (inner == null) return null;
  return cleanProse(inner);
}

/** Shared prose cleaner: decode SPAI imgs, root-relative self links, trim. */
function cleanProse(inner: string): string | null {
  let html = decodeSpaiImgs(inner);
  // Rewrite absolute self-origin URLs to root-relative (keep affiliate /go/).
  html = html.replace(
    /(href|src)="https?:\/\/(?:www\.)?kasinotilmanrekisteroitymista\.com/gi,
    '$1="',
  );
  // Drop empty paragraphs / stray &nbsp; paragraphs.
  html = html
    .replace(/<p>\s*(?:&nbsp;| |\s)*<\/p>/gi, "")
    .replace(/\s+$/g, "")
    .trim();
  return html.length ? html : null;
}

/* ------------------------------------------------------------------ *
 * Per-field parsers
 * ------------------------------------------------------------------ */

function parseName(body: string): string {
  const h1 = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  let name = h1 ? stripTags(h1[1]) : "";
  // Strip the closed suffix "– Suljettu" / "- Suljettu".
  name = name.replace(/\s*[–-]\s*Suljettu\s*$/i, "").trim();
  return name;
}

function parseCtaSlug(reviewSection: string): string | null {
  const m = reviewSection.match(/href="\/go\/([^/"]+)\/?"/i);
  return m ? m[1] : null;
}

function parseLogoUrl(reviewSection: string): string | null {
  // The logo is the first review-img inside the col-lg-4 card's /go/ anchor.
  const cardMatch = reviewSection.match(
    /<a href="\/go\/[^"]*"[^>]*>([\s\S]*?)<\/a>/i,
  );
  const scope = cardMatch ? cardMatch[1] : reviewSection;
  return firstLogoUrl(scope) ?? firstLogoUrl(reviewSection);
}

function parseBonusText(reviewSection: string): string | null {
  // Bonus headline: <p class="text-center mt-3 h5"><strong>...</strong></p>
  const m = reviewSection.match(
    /<p[^>]*class="[^"]*\bh5\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
  );
  if (!m) return null;
  const text = stripTags(m[1]);
  // "kasinot ilman rekisteröitymistä" / "Rekisteröintiä ei tarvita" are
  // boilerplate placeholders, not a bonus — treat as no headline.
  if (!text) return null;
  const lower = text.toLowerCase();
  if (
    lower === "kasinot ilman rekisteröitymistä" ||
    lower === "rekisteröintiä ei tarvita"
  ) {
    return null;
  }
  return text;
}

const LICENSE_LABELS = ["Lisenssi", "Licence", "License"];
const FOUNDED_LABELS = ["Käynnistetty", "Year Launched", "Perustettu", "Founded"];
const MINDEP_LABELS = ["Minimitalletus", "Min deposit", "Minimum deposit"];
const PAYMENT_LABELS = ["Maksutavat", "Payment methods", "Maksutapa"];
const EMAIL_LABELS = [
  "Tuki e-mail",
  "Tukisähköposti",
  "Sähköposti",
  "Email support",
  "Email",
  "Tuki sähköposti",
];
const PHONE_LABELS = ["Tukipuhelin", "Puhelin", "Phone", "Phone support"];
const LIVECHAT_LABELS = ["Live-chat", "Livechat", "Live chat", "Chat"];

function parsePaymentMethods(arvosteluCard: string): string[] {
  const raw = fieldFromList(arvosteluCard, PAYMENT_LABELS);
  if (!raw) return [];
  return raw
    // Drop trailing "ja monia muita!" / "ja muita!" tails.
    .replace(/\s+ja\s+(monia\s+)?muita!?\.?$/i, "")
    .split(/\s*,\s*|\s+ja\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.toLowerCase() !== "muut");
}

function parseSupport(arvosteluCard: string): CasinoSupport | null {
  const support: CasinoSupport = {};

  const emailRaw = fieldFromList(arvosteluCard, EMAIL_LABELS);
  if (emailRaw) {
    const email = emailRaw.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (email) support.email = email[0];
    // Some pages put "Live chat and email" in the email field.
    if (/live\s*chat/i.test(emailRaw)) support.liveChat = true;
  }

  const phoneRaw = fieldFromList(arvosteluCard, PHONE_LABELS);
  if (phoneRaw) {
    const lower = phoneRaw.toLowerCase();
    const phoneNum = phoneRaw.match(/\+?[\d][\d\s().-]{5,}/);
    if (phoneNum) {
      support.phone = phoneNum[0].trim();
    } else if (/(kyllä|yes)/i.test(lower)) {
      // Field is a yes/no flag, not an actual number — record availability.
      support.phone = "Kyllä";
    }
    // "N/A" / "Ei" => no phone; leave unset.
  }

  const liveRaw = fieldFromList(arvosteluCard, LIVECHAT_LABELS);
  if (liveRaw) {
    if (/(kyllä|yes|24\/7|available|saatavilla)/i.test(liveRaw)) {
      support.liveChat = true;
    } else if (/(ei|no|n\/a)/i.test(liveRaw)) {
      support.liveChat = false;
    }
  }

  return Object.keys(support).length ? support : null;
}

function parseOverallRating(reviewSection: string): number | null {
  // Heading text "Arviot: 4.2/5" or "Arviot: /5" (blank).
  const m = reviewSection.match(/Arviot:\s*([\d.,]*)\s*\/\s*5/i);
  if (!m) return null;
  return parseNumber(m[1]);
}

function parseSubRatings(arviotCard: string): SubRating[] {
  const out: SubRating[] = [];
  const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = liRe.exec(arviotCard)) !== null) {
    const li = m[1];
    const strong = li.match(/<strong>([\s\S]*?)<\/strong>([\s\S]*)/i);
    let label: string;
    let valueText: string;
    if (strong) {
      const strongText = stripTags(strong[1]);
      const afterStrong = stripTags(strong[2]);
      if (afterStrong && /\d/.test(afterStrong)) {
        // value AFTER strong: "<strong>Label: </strong>4,5"
        label = strongText.replace(/[:：\s]+$/, "");
        valueText = afterStrong;
      } else {
        // value INSIDE strong: "<strong>Label: 4,5</strong>"
        const split = strongText.match(/^(.*?[^\d.,])[\s:：]+([\d.,]+)\s*$/);
        if (split) {
          label = split[1].replace(/[:：\s]+$/, "");
          valueText = split[2];
        } else {
          label = strongText.replace(/[:：\s]+$/, "");
          valueText = afterStrong;
        }
      }
    } else {
      // No <strong>: "Label: 4,5"
      const plain = stripTags(li).match(/^(.*?)[\s:：]+([\d.,]+)\s*$/);
      if (!plain) continue;
      label = plain[1].replace(/[:：\s]+$/, "");
      valueText = plain[2];
    }
    const value = parseNumber(valueText);
    if (label && value != null) out.push({ label, value });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/** All casino fragment slugs (the "<slug>" of casino__<slug>), sorted.
 *
 * Requires a body.html: some casino__<slug> dirs are intentionally meta-only
 * (e.g. yoyo-casino, jackie-jackpot — published in the WP DB but 301'd to home
 * on the live front-end, so they have no faithful content to render). Without
 * the body.html guard they would emit a content-less "not found" page at a URL
 * the live site redirects away — an indexable soft-404. They are handled by a
 * 301 redirect in vercel.json instead. */
export function listCasinoSlugs(): string[] {
  if (!existsSync(FRAGMENTS_DIR)) return [];
  return readdirSync(FRAGMENTS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith("casino__"))
    .filter((e) => existsSync(join(FRAGMENTS_DIR, e.name, "body.html")))
    .map((e) => e.name.slice("casino__".length))
    .sort();
}

/** Parse a single casino fragment on demand. Returns null if it doesn't exist. */
export function getCasino(slug: string): CasinoReview | null {
  const dir = join(FRAGMENTS_DIR, `casino__${slug}`);
  const bodyPath = join(dir, "body.html");
  const metaPath = join(dir, "meta.json");
  if (!existsSync(bodyPath)) return null;

  const body = readFileSync(bodyPath, "utf8");

  let url = `/casino/${slug}/`;
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, "utf8")) as {
        path?: string;
      };
      if (meta.path) url = meta.path;
    } catch {
      /* keep default url */
    }
  }

  const reviewSection = getReviewSection(body);
  const arvosteluCard = cardBodyByHeading(reviewSection, "Arvostelu");
  const arviotCard = cardBodyByHeading(reviewSection, "Arviot");
  const bonuksetCard = cardBodyByHeading(reviewSection, "Bonukset");

  const name = parseName(body);
  const closedByTitle = /Suljettu/i.test(
    body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "",
  );

  const reviewHtml = getReviewProse(body);
  const bonusesHtml = cleanProse(bonuksetCard);
  const subRatings = parseSubRatings(arviotCard);
  const ratingOverall = parseOverallRating(reviewSection);

  // Engine review keyed by the SAME slug as the fragment. When present its
  // pros/cons + overall rating can resurrect a sparse stub into a real review,
  // so factor it into the showNoReview decision below (an engine-enriched
  // casino is never treated as an empty stub unless it is also Suljettu).
  const engine = engineReviews.get(slug);
  const engineHasReview =
    engine != null &&
    (engine.pros.length > 0 ||
      engine.cons.length > 0 ||
      engine.sub_ratings.length > 0 ||
      engine.rating_overall != null ||
      (engine.summary_html != null && engine.summary_html.trim().length > 0));

  // "No review" when closed, OR when there is no prose AND no sub-ratings AND
  // no overall score (i.e. an empty stub page) AND the engine has nothing.
  const showNoReview =
    closedByTitle ||
    (reviewHtml == null &&
      subRatings.length === 0 &&
      ratingOverall == null &&
      !engineHasReview);

  const scraped: CasinoReview = {
    slug,
    name,
    url,
    ctaSlug: parseCtaSlug(reviewSection),
    logoUrl: parseLogoUrl(reviewSection),
    ratingOverall,
    subRatings,
    bonusText: parseBonusText(reviewSection),
    license: fieldFromList(arvosteluCard, LICENSE_LABELS),
    paymentMethods: parsePaymentMethods(arvosteluCard),
    foundedYear: (() => {
      const raw = fieldFromList(arvosteluCard, FOUNDED_LABELS);
      const yr = raw?.match(/\b(19|20)\d{2}\b/)?.[0];
      return yr ?? (raw ? raw.trim() || null : null);
    })(),
    minDeposit: fieldFromList(arvosteluCard, MINDEP_LABELS),
    support: parseSupport(arvosteluCard),
    reviewHtml,
    bonusesHtml,
    showNoReview,
  };

  // FILL GAPS + OVERRIDE: engine data wins per-field when present; otherwise
  // the scraped base is returned unchanged (pure-scraped fallback).
  return mergeEngine(scraped, engine);
}

/** Parse every casino fragment. Skips any that fail to parse. */
export function getAllCasinos(): CasinoReview[] {
  const out: CasinoReview[] = [];
  for (const slug of listCasinoSlugs()) {
    const c = getCasino(slug);
    if (c) out.push(c);
  }
  return out;
}
