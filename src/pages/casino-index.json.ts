/**
 * Build-time search index endpoint → emits `/casino-index.json`.
 *
 * This is a static Astro endpoint (no `getStaticPaths`, `output: "static"`),
 * so it is evaluated once at build and written as a plain JSON file into the
 * output dir. The SearchBox component lazy-fetches it on first focus to power
 * an instant, backend-free casino search on every page.
 *
 * Shape: a compact array of `{ n, u }` (name, url) — short keys keep the file
 * small (305 casinos ≈ 25 KB, well under the ~50 KB budget). Sourced from the
 * casino review fragments (the canonical /casino/<slug>/ pages) and enriched
 * with toplist names whose slug maps to a real review page; deduped by url.
 *
 * `Content-Type` is set so a `preview`/dev server serves it correctly; the
 * static build just writes the bytes.
 */
import type { APIRoute } from "astro";
import { getAllCasinos } from "../lib/casino-data";
import { getToplist, listToplistConfigs } from "../lib/toplist";

/** One entry in the client search index. Short keys to minimise payload. */
interface IndexEntry {
  /** Casino display name (search target + label). */
  n: string;
  /** Canonical review URL, e.g. "/casino/superonni/". */
  u: string;
}

export const GET: APIRoute = () => {
  // Map url → entry so we dedupe by canonical review URL.
  const byUrl = new Map<string, IndexEntry>();

  // 1) Primary source: every casino review fragment (the real /casino/ pages).
  for (const c of getAllCasinos()) {
    const name = c.name?.trim();
    if (!name) continue;
    // Closed/empty stubs still have a live URL — keep them searchable so users
    // who type the name land on the (clearly-marked) page rather than nowhere.
    const url = c.url || `/casino/${c.slug}/`;
    if (!byUrl.has(url)) byUrl.set(url, { n: name, u: url });
  }

  // Set of known review slugs so toplist enrichment only points at real pages.
  const knownSlugs = new Set<string>();
  for (const entry of byUrl.values()) {
    const m = entry.u.match(/^\/casino\/([^/]+)\//);
    if (m) knownSlugs.add(m[1]);
  }

  // 2) Enrich with toplist names. Toplist rows carry their own marketing names
  //    (sometimes a cleaner/spelled-out variant) but only map to a usable
  //    target when their slug matches a real review page. We never invent URLs.
  for (const config of listToplistConfigs()) {
    for (const row of getToplist(config)) {
      const slug = row.slug?.trim();
      const name = row.name?.trim();
      if (!slug || !name || !knownSlugs.has(slug)) continue;
      const url = `/casino/${slug}/`;
      const existing = byUrl.get(url);
      // The review fragment name wins as the canonical label; only fill a gap.
      if (!existing) byUrl.set(url, { n: name, u: url });
    }
  }

  const index = Array.from(byUrl.values()).sort((a, b) =>
    a.n.localeCompare(b.n, "fi"),
  );

  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
