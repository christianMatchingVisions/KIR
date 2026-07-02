/**
 * FAQPage JSON-LD extraction for Content-Engine articles (KIR).
 *
 * WHY: AI answer engines (Google AI Overviews, ChatGPT-search, Perplexity) and
 * Google rich results lift FAQ Q&A directly. Our engine articles already render
 * question headings + answers as plain HTML in the body; this helper derives a
 * FAQPage block FROM THAT RENDERED HTML so the structured data can never diverge
 * from what the user sees (a hard Google requirement — schema/visible mismatch
 * risks a manual action, doubly dangerous on a penalty-recovering domain).
 *
 * SAFE BY CONSTRUCTION:
 *  - Both the question text and the answer text are taken verbatim from the
 *    on-page body, so acceptedAnswer.text always matches visible content.
 *  - We only treat a heading as a question when its text ends with "?", and we
 *    require >= 2 such Q&A pairs, so non-FAQ articles emit nothing (null).
 *  - No new dependencies (regex over the body string at build time only).
 */

/** Decode the small set of HTML entities that appear in engine prose. */
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&ouml;/g, "ö")
    .replace(/&auml;/g, "ä")
    .replace(/&aring;/g, "å");
}

/** Strip tags → collapsed plain text. */
function toText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

interface Heading {
  level: number;
  textHtml: string;
  /** index in source just after this heading's closing tag */
  contentStart: number;
  /** index in source of this heading's opening tag */
  tagStart: number;
}

/**
 * Build a FAQPage JSON-LD <script> string from an article's rendered body HTML,
 * or null if fewer than two question/answer pairs are found.
 *
 * A "question" is any <h2>/<h3>/<h4> whose visible text ends with "?". Its
 * answer is the body text between that heading and the next heading (any level).
 */
export function buildFaqLd(bodyHtml: string): string | null {
  if (!bodyHtml) return null;

  const headingRe = /<(h[2-4])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const headings: Heading[] = [];
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(bodyHtml)) !== null) {
    headings.push({
      level: Number(m[1][1]),
      textHtml: m[2],
      tagStart: m.index,
      contentStart: m.index + m[0].length,
    });
  }
  if (headings.length === 0) return null;

  const items: { q: string; a: string }[] = [];
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const q = toText(h.textHtml);
    if (!q.endsWith("?")) continue;
    const next = headings[i + 1];
    const answerHtml = bodyHtml.slice(
      h.contentStart,
      next ? next.tagStart : bodyHtml.length,
    );
    let a = toText(answerHtml);
    if (a.length < 15) continue; // no real answer → skip
    if (a.length > 1200) a = a.slice(0, 1200).replace(/\s+\S*$/, "") + "…";
    items.push({ q, a });
  }

  if (items.length < 2) return null;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  // <-escape: JSON.stringify leaves "<" intact, so a literal "</script>"
  // inside any value would close the JSON-LD block early (HTML injection).
  return `<script type="application/ld+json">${JSON.stringify(faqLd).replace(/</g, "\\u003c")}</script>`;
}
