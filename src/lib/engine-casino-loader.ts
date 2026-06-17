/**
 * Build-time loader for the Matching Visions Content Engine STRUCTURED casino
 * reviews feed (GET {CE_API_URL}/reviews).
 *
 * Sibling of content-engine-loader.ts (the daily article feed). Where that file
 * is an Astro content-collection `Loader` for the /uutiset/ article stream, this
 * file pulls the engine's structured per-casino review DATA so the existing
 * scraped /casino/<slug>/ pages can be enriched in place. It mirrors the same
 * conventions:
 *   - site-scoped Bearer key (CE_API_KEY); the feed only ever contains THIS
 *     site's deliverable, compliance-passed reviews,
 *   - cursor pagination over { data, next_cursor, has_more } pages,
 *   - graceful no-op when CE_API_URL / CE_API_KEY are not set OR the endpoint
 *     404s / errors / returns nothing — it then yields an EMPTY Map and NEVER
 *     throws, so the build succeeds and the casino pages render exactly as today
 *     (pure-scraped).
 *
 * SHARED CONTRACT (defined identically engine-side at GET /v1/reviews):
 *   CasinoReviewData = {
 *     casino_slug, name, rating_overall, sub_ratings[], pros[], cons[],
 *     bonus_text, license, founded_year, min_deposit, payout_time,
 *     game_count, mobile, payment_methods[], support, summary_html, updated_at
 *   }
 * The `casino_slug` MUST equal the KIR /casino/<slug>/ slug so the merge in
 * casino-data.ts keys cleanly onto the scraped fragments.
 *
 * COMPLIANCE: the optional `summary_html` prose is NOT hardened here — the
 * casino route (casino/[slug].astro) runs ensureSponsored + neutralizeFirstHand
 * over any rendered engine prose, exactly as it does for the scraped prose.
 * This loader is a pure data fetch; rendering-time guards stay in the route.
 */

/* ------------------------------------------------------------------ *
 * SHARED CONTRACT — the GET /v1/reviews payload (one entry).
 * Field names are snake_case to match the engine JSON verbatim. The KIR
 * EngineReview type re-exports this so casino-data.ts can merge per-field.
 * ------------------------------------------------------------------ */

export type EngineSubRating = {
  label: string;
  value: number;
};

export type EnginePaymentMethod = {
  name: string;
  payout_time?: string | null;
  min?: string | null;
  rating?: number | null;
};

export type EngineSupport = {
  email?: string;
  phone?: string;
  live_chat?: boolean;
  hours?: string;
};

/**
 * CasinoReviewData — the delivered review payload (one casino). Identical to the
 * shape the engine serves at GET /v1/reviews and to the KIR-side EngineReview.
 */
export type EngineReview = {
  /** Must equal the KIR /casino/<slug>/ slug. */
  casino_slug: string;
  name: string;
  /** 0–5, or null. */
  rating_overall: number | null;
  sub_ratings: EngineSubRating[];
  pros: string[];
  cons: string[];
  bonus_text: string | null;
  license: string | null;
  founded_year: string | null;
  min_deposit: string | null;
  /** e.g. "0-15 min". */
  payout_time: string | null;
  /** e.g. "Yli 3 000 peliä". */
  game_count: string | null;
  /** e.g. "Täysin optimoitu mobiiliin". */
  mobile: string | null;
  payment_methods: EnginePaymentMethod[];
  support: EngineSupport | null;
  /** Optional extra prose; hardened at render time by the casino route. */
  summary_html: string | null;
  updated_at: string;
};

interface ReviewsFeedPage {
  data: unknown[];
  next_cursor: string | null;
  has_more: boolean;
}

/* ------------------------------------------------------------------ *
 * Defensive coercion — never trust the wire shape; tolerate partials.
 * A malformed entry is skipped (not thrown) so one bad row can't blank
 * the whole enrichment.
 * ------------------------------------------------------------------ */

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length > 0);
}

function asSubRatings(v: unknown): EngineSubRating[] {
  if (!Array.isArray(v)) return [];
  const out: EngineSubRating[] = [];
  for (const r of v) {
    if (!r || typeof r !== "object") continue;
    const rec = r as Record<string, unknown>;
    const label = asString(rec.label);
    const value = asNumber(rec.value);
    if (label && value != null) out.push({ label, value });
  }
  return out;
}

function asPaymentMethods(v: unknown): EnginePaymentMethod[] {
  if (!Array.isArray(v)) return [];
  const out: EnginePaymentMethod[] = [];
  for (const m of v) {
    if (!m || typeof m !== "object") continue;
    const rec = m as Record<string, unknown>;
    const name = asString(rec.name);
    if (!name) continue;
    out.push({
      name,
      payout_time: asString(rec.payout_time),
      min: asString(rec.min),
      rating: asNumber(rec.rating),
    });
  }
  return out;
}

function asSupport(v: unknown): EngineSupport | null {
  if (!v || typeof v !== "object") return null;
  const rec = v as Record<string, unknown>;
  const support: EngineSupport = {};
  const email = asString(rec.email);
  if (email) support.email = email;
  const phone = asString(rec.phone);
  if (phone) support.phone = phone;
  if (typeof rec.live_chat === "boolean") support.live_chat = rec.live_chat;
  const hours = asString(rec.hours);
  if (hours) support.hours = hours;
  return Object.keys(support).length ? support : null;
}

/** Coerce one wire entry into an EngineReview, or null when unusable. */
function coerceReview(raw: unknown): EngineReview | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const casino_slug = asString(rec.casino_slug);
  if (!casino_slug) return null; // no key → cannot merge; drop it.
  return {
    casino_slug,
    name: asString(rec.name) ?? casino_slug,
    rating_overall: asNumber(rec.rating_overall),
    sub_ratings: asSubRatings(rec.sub_ratings),
    pros: asStringArray(rec.pros),
    cons: asStringArray(rec.cons),
    bonus_text: asString(rec.bonus_text),
    license: asString(rec.license),
    founded_year: asString(rec.founded_year),
    min_deposit: asString(rec.min_deposit),
    payout_time: asString(rec.payout_time),
    game_count: asString(rec.game_count),
    mobile: asString(rec.mobile),
    payment_methods: asPaymentMethods(rec.payment_methods),
    support: asSupport(rec.support),
    summary_html: asString(rec.summary_html),
    updated_at: asString(rec.updated_at) ?? new Date(0).toISOString(),
  };
}

/* ------------------------------------------------------------------ *
 * Public loader
 * ------------------------------------------------------------------ */

/**
 * Fetch the engine reviews feed at build time and return a
 * Map<casino_slug, EngineReview>, paging through `has_more`/`next_cursor`.
 *
 * GRACEFUL BY DESIGN: any of missing env / network error / non-OK status
 * (incl. 404 when the endpoint isn't live yet) / empty body / malformed JSON
 * results in an EMPTY Map and NEVER throws. Callers (casino-data.ts) then fall
 * back to pure-scraped data, so pages render exactly as today.
 *
 * @param opts.apiUrl  CE_API_URL (the engine API base including /v1)
 * @param opts.apiKey  CE_API_KEY (site-scoped key with reviews:read)
 * @param opts.fetchImpl  injectable fetch (testing); defaults to global fetch
 */
export async function loadEngineReviews(opts?: {
  apiUrl?: string | undefined;
  apiKey?: string | undefined;
  fetchImpl?: typeof fetch;
}): Promise<Map<string, EngineReview>> {
  // import.meta.env is provided by Astro/Vite; guard so a non-Vite runtime
  // (plain Node test harness) can't crash on an undefined env object.
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const apiUrl = opts?.apiUrl ?? env?.CE_API_URL;
  const apiKey = opts?.apiKey ?? env?.CE_API_KEY;
  const doFetch = opts?.fetchImpl ?? (typeof fetch !== "undefined" ? fetch : undefined);

  const map = new Map<string, EngineReview>();

  // No credentials or no fetch available → graceful empty (pure-scraped build).
  if (!apiUrl || !apiKey || !doFetch) return map;

  const base = apiUrl.replace(/\/$/, "");
  let cursor: string | null = null;
  // Hard cap on pages so a misbehaving feed can never spin the build forever.
  let guard = 0;
  const MAX_PAGES = 200;

  try {
    do {
      const url = new URL(`${base}/reviews`);
      url.searchParams.set("status", "delivered");
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await doFetch(url.toString(), {
        headers: { authorization: `Bearer ${apiKey}` },
      });

      // 404 (endpoint not live yet) / 401 / 5xx → stop, keep what we have.
      // Early on the engine may not serve /reviews at all; that must no-op.
      if (!res || !res.ok) break;

      const page = (await res.json()) as ReviewsFeedPage | null;
      if (!page || !Array.isArray(page.data)) break;

      for (const raw of page.data) {
        const review = coerceReview(raw);
        if (review) map.set(review.casino_slug, review);
      }

      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor && ++guard < MAX_PAGES);
  } catch {
    // Network failure / bad JSON / unexpected shape → return whatever we have
    // (often nothing). The build must NEVER fail because the engine is down.
    return map;
  }

  return map;
}
