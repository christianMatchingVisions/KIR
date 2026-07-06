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

---

# Batch A.5 — GSC "crawled – currently not indexed" refusal sets (2026-07-06)

Evidence: `reports/gsc-indexation-audit-2026-07.md` §4–§5 (GSC Page indexing
report, last update 2026-06-30). Google crawled and **declined to index** every
retired URL below, so consolidation carries zero traffic risk by definition.
Re-validated 2026-07-06 against Ahrefs GSC (project 1943203,
2026-04-01→2026-07-03): **0 clicks on every retire candidate**; the only one
with any impressions is `turvallinen-ja-varma-…` (18 impressions, 0 clicks,
avg pos 58 on "luotettavat nettikasinot") — noise, not a ranking to preserve,
and its 301 target is exactly the money hub that SHOULD own that query.
Same mechanism as batch A (fragment deleted + both slash-variant 301s in
`data/static-redirects.json` → `vercel.json`; build-time link correction +
listing/regeneration exclusion). Same rollback procedure.

Survivor-choice method: no safety/edut/how-to page on the site earns GSC
impressions (indexed or not), so "strongest indexed page" was decided by
intent match + comprehensiveness + freshness among pages that ARE indexed
(i.e. absent from every GSC not-indexed bucket). Retired URLs were mapped to
sub-intent-precise survivors rather than one catch-all, to keep 301 relevance
(and thus equity transfer) high:

- **Choose/verify a safe casino** → `/nain-valitset-turvallisen-nettikasinon-nopeasti-vuonna-2026/`
  (2,010 w, 2026-05-13, indexed; checklist/selection intent).
- **"Luotettavat nettikasinot"** → `/nettikasinot-luotettavat-kasinot/` (money
  hub; the retiree's only GSC impressions were on exactly this query).
- **Safety requirements** → `/tilittomien-kasinoiden-turvallisuusvaatimukset/`
  (1,930 w, 2026-05-15, indexed; exact "turvallisuusvaatimukset" head term).
- **Safety at no-account/pika casinos** → `/turvallisuus-kasinot-ilman-tilia/`
  (1,867 w, indexed; clean head-term slug for the niche safety intent).
- **Responsible gaming / RG tools** → `/vastuullinen-pelaaminen-tilittomilla-kasinoilla/`
  (1,663 w, 2026-03-23, indexed).
- **Benefits of no-registration play** → `/rekisteroitymisvapaan-pelaamisen-edut-nopeus-ja-turvallisuus/`
  (1,827 w, modified 2026-06-04, indexed) — all three "edut" triplet members
  are refused by Google, so the indexed equivalent wins over the (thicker but
  unindexed) `kasino-ilman-rekisteroitymista-edut-suomalaisille`.
- **Step-by-step / how-to-play** → `/askel-askeleelta-rekisteroitymaton-kasinopelaaminen-2026/`
  — every member of this set (map Cluster L + the two `kuinka-pelata-*`
  variants) is refused, so per the batch rule the most comprehensive member
  (1,766 w, the map's own Cluster-L KEEP) survives. NOTE: this survivor is
  itself currently unindexed; consolidating 6 URLs → 1 is the recovery play.
  Monitor — if it is still unindexed after Part A validation, fold it into an
  indexed how-works guide (map Cluster J outcome).

## Cluster A — "turvallinen/turvallisuus" refusal set (GSC audit §4)

| # | Removed URL | Survivor (301 target) | Action | Cluster | Date |
|---|---|---|---|---|---|
| 10 | `/7-kohdan-turvallisen-kasinon-tarkistuslista/` | `/nain-valitset-turvallisen-nettikasinon-nopeasti-vuonna-2026/` | 301 (no merge) | A.5-A — safe-casino choice | 2026-07-06 |
| 11 | `/opas-turvallisen-kasinon-valintaan/` | `/nain-valitset-turvallisen-nettikasinon-nopeasti-vuonna-2026/` | 301 (no merge) | A.5-A — safe-casino choice | 2026-07-06 |
| 12 | `/turvallinen-ja-varma-kuinka-tunnistaa-luotettavat-suomalaiset-nettikasinot/` | `/nettikasinot-luotettavat-kasinot/` | 301 (no merge) | A.5-A — luotettavat hub | 2026-07-06 |
| 13 | `/turvallisuusvaatimukset-nettikasinoilla-2026/` | `/tilittomien-kasinoiden-turvallisuusvaatimukset/` | 301 (no merge) | A.5-A — safety requirements | 2026-07-06 |
| 14 | `/turvallisuusvaatimukset-suomalaisilla-nettikasinoilla/` | `/tilittomien-kasinoiden-turvallisuusvaatimukset/` | 301 (no merge) | A.5-A — safety requirements | 2026-07-06 |
| 15 | `/turvallinen-kasinopelaaminen-ilman-rekisteroitymista-2026/` | `/turvallisuus-kasinot-ilman-tilia/` | 301 (no merge) | A.5-A — no-account safety | 2026-07-06 |
| 16 | `/turvallinen-rekisteroitymisvapaa-kasino-2026-opas/` | `/turvallisuus-kasinot-ilman-tilia/` | 301 (no merge) | A.5-A — no-account safety | 2026-07-06 |
| 17 | `/turvallisuus-kasinolla-ilman-tilia-opas-suomalaisille/` | `/turvallisuus-kasinot-ilman-tilia/` | 301 (no merge) | A.5-A — no-account safety | 2026-07-06 |
| 18 | `/turvallisuus-pikakasinoilla-2026-90-pelaajista-luottaa-nopeuteen/` | `/turvallisuus-kasinot-ilman-tilia/` | 301 (no merge) | A.5-A — no-account safety | 2026-07-06 |
| 19 | `/turvallisuus-pikakasinoilla-selitettyna/` | `/turvallisuus-kasinot-ilman-tilia/` | 301 (no merge) | A.5-A — no-account safety | 2026-07-06 |
| 20 | `/turvallinen-pelaaminen-vertailu-kasinot-tarjoaa-vastuullisuuden/` | `/vastuullinen-pelaaminen-tilittomilla-kasinoilla/` | 301 (no merge) | A.5-A — responsible gaming | 2026-07-06 |

**Skipped (Cluster A):** `turvalliset-maksutavat-nettikasinoilla-kattava-opas`
— the GSC audit lists it only as "related"; its intent is payment-method
safety (payments cluster), not safe-casino guidance, so no unambiguous
survivor exists in this batch. Left untouched pending a payments-cluster
review. `turvallisen-kasinopelaamisen-vinkit`, `vinkit-turvalliseen-*`,
`vinkkeja-turvalliseen-*`, `nain-pelaat-turvallisesti-*`,
`opas-turvalliseen-kasinopelaamiseen-*`, `turvallisuuden-tarkistuslista-*`,
`turvallinen-peliprosessi-*`, `tunnista-turvalliset-kasinot-*`,
`valitse-turvallinen-tillitton-*`, `turvallisen-tilittoman-kasinon-valinta-*`,
`turvallisen-pikakasinon-tarkistuslista-*`, `top-turvalliset-pikakasinot-4`:
NOT in any GSC not-indexed bucket (treated as indexed) — out of scope for this
zero-risk batch, even though the safety tail remains dense. Candidates for a
data-gated batch B review.

<!-- Batches appended below as they are executed. -->
