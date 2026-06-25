/**
 * related.ts — internal-link architecture helpers (penalty-recovery finding:
 * 8 orphans + 372 single-incoming-link pages).
 *
 * The single biggest lever for a DR-48 site stuck on page 4–7 is NOT new prose
 * (a quality risk on a penalised domain) — it is TRUST signals + a denser
 * internal-link graph so PageRank/crawl-priority flows from hubs to the thin
 * money/review/article pages that already have impressions. This module is the
 * shared, dependency-free brain behind two additive UI modules:
 *
 *   - <RelatedLinks>      "Aiheeseen liittyvät" — contextual related casino
 *                          reviews + related guides at the bottom of article and
 *                          review bodies.
 *   - <EditorialByline>   author/reviewer byline → /toimitus/ (E-E-A-T).
 *
 * Everything here is PURE + deterministic (build-time, no I/O of its own — the
 * caller passes in the already-loaded posts/casinos). Finnish anchor text,
 * contextual matching by shared keyword tokens. No data is invented: every link
 * points at a real existing URL (a real post slug or a real /casino/<slug>/).
 */

import type { Post } from "./content";
import type { CasinoReview } from "./casino-data";

/** A resolved internal link with Finnish anchor text. */
export interface RelatedLink {
  label: string;
  href: string;
}

/* -------------------------------------------------------------------------- *
 * Topic vocabulary                                                            *
 * -------------------------------------------------------------------------- *
 * Finnish stop-words + generic filler removed before token overlap so the
 * relatedness is driven by meaningful topic words (maksutavat, bonus, lisenssi,
 * trustly, …) rather than "opas", "2026", "ja". Keeps matches on-topic. */
const STOPWORDS = new Set([
  "ja", "tai", "se", "on", "ei", "että", "mikä", "mitä", "miten", "miksi",
  "kuin", "kun", "the", "of", "for", "opas", "oppaat", "vinkit", "vinkkeja",
  "vinkkejä", "pelaajille", "pelaajan", "2024", "2025", "2026", "2027",
  "vertailu", "valintaopas", "kaikki", "paras", "parhaat", "näin", "nain",
  "sekä", "seka", "esimerkkejä", "esimerkkeja", "toimii", "rooli", "edut",
]);

/** Lowercase, strip tags/punctuation, split to meaningful (3+ char) tokens. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/[^a-zåäö0-9\s-]/gi, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

/** Overlap score between two token bags (count of shared distinct tokens). */
function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n;
}

/* -------------------------------------------------------------------------- *
 * Topic → money/hub page map (curated, real existing URLs only).             *
 * -------------------------------------------------------------------------- *
 * When an article/review mentions a topic we can confidently link it to the
 * canonical money/category page for that topic. Every href below is a real,
 * indexed route. Anchor text is the page's natural Finnish label. The keys are
 * lowercase substrings matched against the source title + (optional) body. */
interface TopicLink extends RelatedLink {
  /** Lowercase trigger substrings — any match adds this contextual link. */
  triggers: string[];
}

const TOPIC_LINKS: TopicLink[] = [
  { label: "Pikakasinot", href: "/pikakasinot/", triggers: ["pikakasino", "pikakasinot"] },
  { label: "Trustly-kasinot", href: "/trustly-kasinot/", triggers: ["trustly"] },
  { label: "Zimpler-pikakasinot", href: "/zimpler-pikakasinot/", triggers: ["zimpler"] },
  { label: "Brite-kasinot", href: "/brite-kasinot/", triggers: ["brite"] },
  { label: "Euteller-kasinot", href: "/euteller-kasinot/", triggers: ["euteller"] },
  { label: "Apple Pay -kasinot", href: "/apple-pay-casinot/", triggers: ["apple pay", "applepay"] },
  { label: "Kryptokasinot", href: "/kryptokasinot/", triggers: ["krypto", "bitcoin", "kripto"] },
  { label: "MGA-kasinot", href: "/mga-kasinot/", triggers: ["mga", "malta gaming"] },
  { label: "Curacao-kasinot", href: "/curacao-kasinot/", triggers: ["curacao", "curaçao"] },
  { label: "Kasinobonukset", href: "/kasinobonukset/", triggers: ["bonus", "bonukset", "bonusehdot", "kierrätys", "kierratys"] },
  { label: "Cashback-kasinot", href: "/cashback-kasinot/", triggers: ["cashback"] },
  { label: "Uudet kasinot", href: "/uudet-kasinot/", triggers: ["uudet kasinot", "uusi kasino"] },
  { label: "Nettikasino ilman rekisteröitymistä", href: "/nettikasino-ilman-rekisteroitymista/", triggers: ["rekisteröitymis", "rekisteroitymis", "tiliton", "tilitön", "tilivapa"] },
  { label: "Luotettavat nettikasinot", href: "/nettikasinot-luotettavat-kasinot/", triggers: ["luotettav", "turvallinen", "turvallisuus", "lisenssi"] },
  { label: "Maksutavat kasinoilla", href: "/pikakasinot/", triggers: ["maksutavat", "maksutapa", "kotiutus", "talletus"] },
];

/**
 * Curated contextual money/hub links for a source title (+ optional body).
 * De-duplicated by href, capped. Used to connect thin guides to their topic
 * money pages (raises incoming links to the money pages that have impressions).
 */
export function topicLinksFor(
  title: string,
  body = "",
  limit = 3,
  excludeHref?: string,
): RelatedLink[] {
  const hay = `${title} ${body}`.toLowerCase().replace(/<[^>]*>/g, " ");
  const seen = new Set<string>();
  const out: RelatedLink[] = [];
  for (const t of TOPIC_LINKS) {
    if (out.length >= limit) break;
    if (t.href === excludeHref) continue;
    if (seen.has(t.href)) continue;
    if (t.triggers.some((trig) => hay.includes(trig))) {
      seen.add(t.href);
      out.push({ label: t.label, href: t.href });
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- *
 * Related guides (post ↔ post) by shared topic tokens.                       *
 * -------------------------------------------------------------------------- */

/**
 * Up to `limit` guides most related to `current` by shared title tokens.
 * Falls back to newest other guides when nothing overlaps, so the module is
 * never empty on a corpus this size. Excludes the current slug. Links point at
 * each post's own canonical URL (/<slug>/).
 */
export function relatedGuides(
  current: { slug: string; title: string },
  all: Post[],
  limit = 4,
): RelatedLink[] {
  const curTokens = new Set(tokenize(current.title));
  const scored = all
    .filter((p) => p.slug !== current.slug && p.title.trim().length > 0)
    .map((p) => ({
      post: p,
      score: overlap(curTokens, new Set(tokenize(p.title))),
    }))
    .sort((a, b) =>
      b.score - a.score || (b.post.date || "").localeCompare(a.post.date || ""),
    );

  const picked = scored.filter((s) => s.score > 0).slice(0, limit);
  // Top up with newest others if too few overlapped.
  if (picked.length < limit) {
    for (const s of scored) {
      if (picked.length >= limit) break;
      if (!picked.includes(s)) picked.push(s);
    }
  }
  return picked.slice(0, limit).map(({ post }) => ({
    label: decodeTitle(post.title),
    href: `/${post.slug}/`,
  }));
}

/* -------------------------------------------------------------------------- *
 * Related casino reviews (review ↔ review) by shared facts.                  *
 * -------------------------------------------------------------------------- */

/**
 * Up to `limit` casino reviews related to `current` by shared licence /
 * payment-method tokens, then by name-token overlap, newest-style fallback last.
 * Open casinos only (closed ones are excluded so we never front a dead review).
 * Links point at each review's canonical /casino/<slug>/.
 */
export function relatedReviews(
  current: CasinoReview,
  all: CasinoReview[],
  limit = 4,
): RelatedLink[] {
  const isOpen = (c: CasinoReview) => !c.showNoReview;
  const curFacts = new Set<string>([
    ...tokenize(current.license ?? ""),
    ...current.paymentMethods.flatMap((m) => tokenize(m)),
  ]);

  const scored = all
    .filter((c) => c.slug !== current.slug && isOpen(c) && c.name.trim().length > 0)
    .map((c) => {
      const facts = new Set<string>([
        ...tokenize(c.license ?? ""),
        ...c.paymentMethods.flatMap((m) => tokenize(m)),
      ]);
      return { casino: c, score: overlap(curFacts, facts) };
    })
    .sort((a, b) => b.score - a.score || a.casino.name.localeCompare(b.casino.name, "fi"));

  const picked = scored.filter((s) => s.score > 0).slice(0, limit);
  if (picked.length < limit) {
    for (const s of scored) {
      if (picked.length >= limit) break;
      if (!picked.includes(s)) picked.push(s);
    }
  }
  return picked.slice(0, limit).map(({ casino }) => ({
    label: casino.name,
    href: casino.url,
  }));
}

/* -------------------------------------------------------------------------- *
 * E-E-A-T: article author JSON-LD (links the page to #editorial-team).       *
 * -------------------------------------------------------------------------- */

const SITE_URL = "https://kasinotilmanrekisteroitymista.com";
const PUBLISHER_ID = `${SITE_URL}/#organization`;
const EDITORIAL_ID = `${SITE_URL}/#editorial-team`;

/**
 * One additive Article JSON-LD block whose `author` + `reviewedBy` reference the
 * EXISTING editorial Organization (`#editorial-team`, "KIR-toimitus") — never a
 * fabricated Person. Emitted in the BODY for article/guide pages whose preserved
 * <head> does not already declare an author (most blog guides). The publisher is
 * the site Organization (`#organization`). dateModified/datePublished are passed
 * through verbatim when available. Returns "" when there is no title.
 *
 * Keep this CONFLICT-FREE: it defines the two Organizations by @id (same ids the
 * casino-schema E-E-A-T block uses) so Google merges them into one entity graph.
 */
export function articleAuthorJsonLd(opts: {
  title: string;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
}): string {
  const { title, url } = opts;
  if (!title || !title.trim()) return "";
  const absUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: stripTags(title).slice(0, 110),
    url: absUrl,
    inLanguage: "fi",
    author: {
      "@type": "Organization",
      "@id": EDITORIAL_ID,
      name: "KIR-toimitus",
      url: `${SITE_URL}/toimitus/`,
    },
    reviewedBy: { "@id": EDITORIAL_ID },
    publisher: {
      "@type": "Organization",
      "@id": PUBLISHER_ID,
      name: "Kasinot ilman rekisteröitymistä",
      url: `${SITE_URL}/`,
    },
    isPartOf: { "@id": PUBLISHER_ID },
  };
  if (opts.datePublished) node.datePublished = opts.datePublished;
  if (opts.dateModified) node.dateModified = opts.dateModified;
  return `<script type="application/ld+json">${JSON.stringify(node)}</script>`;
}

/* -------------------------------------------------------------------------- *
 * BreadcrumbList JSON-LD (mirrors the visible Murupolku).                     *
 * -------------------------------------------------------------------------- */

/** A single breadcrumb step. An empty/omitted href ⇒ the current (last) crumb. */
export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Build a BreadcrumbList JSON-LD <script> string from the SAME crumb trail the
 * page renders visually (so the structured data never diverges from what the
 * user sees — a Google requirement). This brings the article/money/review
 * routes to parity with the engine routes (/oppaat/, /uutiset/) and the
 * /toimitus/ page, which already emit BreadcrumbList.
 *
 * - Each crumb's `item` is an ABSOLUTE URL (relative hrefs are prefixed with the
 *   site origin); the LAST crumb (the current page) gets `item` only when a
 *   `currentUrl`/href is available, matching Google's guidance that the final
 *   item may carry the page's own URL.
 * - Returns "" when fewer than 2 crumbs exist (a single "Etusivu" is not a
 *   meaningful trail), so callers can spread the result unconditionally.
 *
 * @param crumbs      ordered trail (first = Etusivu, last = current page).
 * @param currentUrl  absolute/relative URL of the current page for the last item.
 */
export function breadcrumbJsonLd(
  crumbs: Crumb[],
  currentUrl?: string | null,
): string {
  const clean = (crumbs ?? []).filter((c) => c && c.label && c.label.trim());
  if (clean.length < 2) return "";

  const abs = (u: string): string =>
    u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;

  const itemListElement = clean.map((c, i) => {
    const isLast = i === clean.length - 1;
    const href = c.href && c.href.trim() ? c.href : isLast ? currentUrl ?? "" : "";
    const node: Record<string, unknown> = {
      "@type": "ListItem",
      position: i + 1,
      name: stripTags(c.label).trim(),
    };
    if (href) node.item = abs(href);
    return node;
  });

  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
}

/* -------------------------------------------------------------------------- *
 * Small text helpers                                                         *
 * -------------------------------------------------------------------------- */

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

/** Decode the handful of HTML entities WP titles carry, for plain-text anchors. */
function decodeTitle(s: string): string {
  return s
    .replace(/&#8217;|&#039;|&#39;/g, "’")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export { EDITORIAL_ID, PUBLISHER_ID };
