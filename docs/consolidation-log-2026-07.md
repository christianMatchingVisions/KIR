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

<!-- Batches appended below as they are executed. -->
