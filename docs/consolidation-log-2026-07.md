# Doorway consolidation — execution ledger (2026-07)

Executes Part A of `docs/doorway-consolidation-map.md` (numbered "Top N"
listicle doorways). Every retired URL is removed from the build (fragment
deleted) **and** 301-redirected to its cluster survivor via
`data/static-redirects.json` → `vercel.json` (both trailing-slash variants,
matching the existing convention). In-prose internal links to retired URLs are
link-corrected at build time (`src/lib/html-links.ts` reads the same redirect
map), and retired posts are excluded from listings/related-links pools
(`getPosts()` filter) and from WP-sync regeneration
(`scripts/fill-missing-fragments.mjs` guard).

**Traffic validation (map hard rule) — done 2026-07-04:** Ahrefs GSC
(project 1943203, 2026-04-01→2026-07-03) shows 0 clicks and ≤9 impressions on
every retire candidate; no retire candidate outranks its survivor; Ahrefs live
backlinks show **no** external referring domains to any retired URL (incl. the
flagged `…-vuonna-2021` legacy URL). Baseline KEEPs from the map stand
unchanged.

Rollback: this is penalty recovery — if a survivor loses rankings post-301,
restore the fragment from git, remove the redirect pair from
`data/static-redirects.json`, re-run `node scripts/sync-static-redirects.mjs`.

| # | Removed URL | Survivor (301 target) | Action | Cluster | Date |
|---|---|---|---|---|---|
| 1 | `/suosituimmat-kasinot-ilman-rekisteroitymista-5/` | `/parhaat-kasinot-ilman-rekisteroitymista-5/` | 301 (no merge) | 1 — best no-reg listicles | 2026-07-04 |
| 2 | `/parhaat-kasinot-ilman-rekisteroitymista-vuonna-2021/` | `/parhaat-kasinot-ilman-rekisteroitymista-5/` | 301 (no merge) | 1 — best no-reg listicles | 2026-07-04 |
| 3 | `/top-pikakasinot-suomi-5/` | `/top-pikakasinot-vertailu-6/` | 301 (no merge) | 2 — top pikakasinot | 2026-07-04 |
| 4 | `/top-pikakasinot-suomi-7/` | `/top-pikakasinot-vertailu-6/` | 301 (no merge) | 2 — top pikakasinot | 2026-07-04 |
| 5 | `/nopeat-kotiutukset-kasinot-vertailu-6/` | `/nopeat-kasino-kotiutusajat-opas-suomalaisille/` | 301 (no merge) | 5 — fast withdrawals | 2026-07-04 |
| 6 | `/nopeat-kasinot-kotiutusajat-vertailu-4/` | `/nopeat-kasino-kotiutusajat-opas-suomalaisille/` | 301 (no merge) | 5 — fast withdrawals | 2026-07-04 |
| 7 | `/verovapaat-kasinot-vertailu-7/` | `/verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet/` | 301 (no merge) | 6 — tax-free comparison | 2026-07-04 |
| 8 | `/top-mobiilikasinot-ilman-tilia-5/` | `/parhaat-mobiilikasinot-2026-vertailu-ja-valintaopas/` | 301 (no merge) | 7 — mobile casinos | 2026-07-04 |
| 9 | `/parhaat-pay-n-play-kasinot-2026-5/` | `/parhaat-esimerkit-pay-n-play-kasinoista/` | 301 (no merge) | 8 — Pay N Play | 2026-07-04 |

## Skipped (per map: review-only / confirm-with-data / defer)

- Cluster 1–2/5–8 "review" members: `/nopeat-kotiutukset-kasinolla-95-prosenttia-nopeammin/` (likely-301 but review-gated), `/nopeat-kotiutukset-nettikasinoilta/` (how-to intent, holds the cluster's only impressions), `/parhaat-verovapaat-pay-n-play-kasinot-suomalaisille/` (distinct tax-free+PnP long-tail, 3 impressions).
- Cluster 3 (`/top-pikakasinot-bonuksilla-6/`) and Cluster 4 (`/top-turvalliset-pikakasinot-4/`): single-member clusters, map says keep/monitor.
- Cluster 9 (`/parhaat-esimerkit-pikakasinoista-suomessa-2026/`): "review → likely 301 into Cluster 2" — not an unambiguous action.
- Cluster 10 (`/atjkitchen-com-vaihtoehdot-6/`): orphan-intent, map says no action without data (page still earns zero GSC impressions — candidate for a future batch).
- **All of Part B (Clusters I–L, ~14 URLs):** the map's own instruction — "Defer Part B consolidation until Part A is validated stable" / "must NOT be touched without per-URL GSC data".

<!-- Batches appended below as they are executed. -->
