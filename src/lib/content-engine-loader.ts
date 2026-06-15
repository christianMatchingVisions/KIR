/**
 * Astro content-collection loader for the Matching Visions Content Engine.
 * Ported from the sibling OCL project (originally from the engine repo's
 * examples/astro-content-loader.ts), adapted for KIR
 * (kasinotilmanrekisteroitymista.com — Finnish, articles under /uutiset/).
 *
 * Pulls the site-scoped article feed at build time. The API key is restricted
 * server-side, so the feed only ever contains this site's deliverable,
 * compliance-passed articles. When CE_API_URL / CE_API_KEY are not set the
 * loader is a no-op so local builds work without credentials.
 *
 * NOTE (penalty recovery): this site is recovering from a Google algorithmic
 * demotion — publishing cadence is deliberately conservative (2-3 articles
 * per week). Cadence is controlled engine-side (--per-week), not here.
 *
 * Compliance (hardened at load time): the engine's compliance gate already
 * delivers passing copy, but this site is in Google-penalty recovery and the
 * rules are strict, so we make the daily AI content compliant BY CONSTRUCTION
 * before it ever reaches the content store / render:
 *   1. scrubFirstHandClaims — soften any first-person / testing language
 *      ("testasin/kokeilin/oikealla pelaajatilillä" …) to passive phrasing.
 *   2. ensureSponsored     — force rel="sponsored nofollow" on every affiliate
 *      link (internal /go/<slug>/ AND any external/operator absolute link).
 * Both are idempotent attribute/text-level passes (shared with the catch-all
 * and casino routes), so re-running them on already-clean copy is a no-op.
 */
import type { Loader } from "astro/loaders";
import { scrubFirstHandClaims, ensureSponsored } from "./content";

interface EngineArticle {
  id: string;
  status: string;
  title: string | null;
  slug: string | null;
  language: string;
  renderings: { html: string; markdown: string };
  meta: { title: string | null; description: string | null };
  media: { kind: string; url: string | null; alt_text?: string | null }[];
  published_at: string | null;
  updated_at: string;
}

interface FeedPage {
  data: EngineArticle[];
  next_cursor: string | null;
  has_more: boolean;
}

export function contentEngineLoader(opts: {
  apiUrl: string | undefined;
  apiKey: string | undefined;
}): Loader {
  return {
    name: "content-engine",
    load: async ({ store, meta, logger }) => {
      if (!opts.apiUrl || !opts.apiKey) {
        logger.warn(
          "CE_API_URL / CE_API_KEY not set — skipping Content Engine sync. " +
            "The site builds fine, /uutiset/ just has no engine articles."
        );
        return;
      }

      // Incremental sync: only fetch what changed since the last build.
      const since: string | undefined = meta.get("lastSync");
      let cursor: string | null = null;
      let count = 0;

      do {
        const url = new URL(`${opts.apiUrl.replace(/\/$/, "")}/articles`);
        url.searchParams.set("status", "delivered");
        url.searchParams.set("include", "body");
        if (since) url.searchParams.set("since", since);
        if (cursor) url.searchParams.set("cursor", cursor);

        const res = await fetch(url, {
          headers: { authorization: `Bearer ${opts.apiKey}` },
        });
        if (!res.ok) throw new Error(`Content Engine feed failed: ${res.status}`);
        const page = (await res.json()) as FeedPage;

        for (const article of page.data) {
          // Compliance hardening — make the delivered HTML compliant by
          // construction before it enters the store: soften any first-hand
          // testing claims, then force sponsored+nofollow on every affiliate
          // link. Idempotent, so already-clean copy passes through unchanged.
          const compliantHtml = ensureSponsored(
            scrubFirstHandClaims(article.renderings.html ?? ""),
          );

          store.set({
            id: article.slug ?? article.id,
            data: {
              title: article.meta.title ?? article.title ?? "",
              description: article.meta.description ?? "",
              language: article.language,
              publishedAt: article.published_at,
              updatedAt: article.updated_at ?? null,
              heroImage:
                article.media.find((m) => m.kind === "image")?.url ?? null,
              heroImageAlt:
                article.media.find((m) => m.kind === "image")?.alt_text ?? null,
            },
            rendered: { html: compliantHtml },
          });
          count++;
        }
        cursor = page.has_more ? page.next_cursor : null;
      } while (cursor);

      meta.set("lastSync", new Date().toISOString());
      logger.info(`Content Engine sync done (${count} article(s) updated).`);
    },
  };
}
