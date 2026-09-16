/**
 * Hand-written articles that live in this repo (src/pages/<slug>/index.astro)
 * instead of arriving through the WordPress sync or the Content Engine feed.
 *
 * ONE metadata record per article, shared by the page itself (title, meta
 * description, dates) and by the /oppaat/ hub card, so the two can never
 * drift and the page is never an orphan without an inbound link.
 */
export interface ManualArticle {
  slug: string;
  /** <title> + H1. */
  title: string;
  /** Meta description / og:description (≤ ~155 chars). */
  description: string;
  /** Short hub-card excerpt. */
  excerpt: string;
  /** ISO publish date. */
  date: string;
  /** ISO last-modified date. */
  modified: string;
}

export const MANUAL_ARTICLES: readonly ManualArticle[] = [
  {
    slug: "vatica-voice-of-lost-souls-arvostelu",
    title: "Vatica – Voice of Lost Souls arvostelu: RTP ja bonukset",
    description:
      "Vatica – Voice of Lost Souls on Good Times Studiosin cluster pays -kolikkopeli: 96,27 % RTP, 10 000x maksimivoitto, kirotut merkit ja kaksi bonuspeliä.",
    excerpt:
      "Good Times Studiosin klusteripeli, jossa kirotut merkit ja Vatican ote muuttavat aiemmat voittoruudut samaksi symboliksi. RTP, bonuspelit ja bonusostot.",
    date: "2026-09-16",
    modified: "2026-09-16",
  },
];

export function getManualArticle(slug: string): ManualArticle {
  const a = MANUAL_ARTICLES.find((x) => x.slug === slug);
  if (!a) throw new Error(`[manual-articles] unknown slug "${slug}"`);
  return a;
}
