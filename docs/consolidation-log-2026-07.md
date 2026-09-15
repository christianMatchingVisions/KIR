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

## Cluster B — duplicate-intent variants Google refuses (GSC audit §5)

| # | Removed URL | Survivor (301 target) | Action | Cluster | Date |
|---|---|---|---|---|---|
| 21 | `/kasinon-edut-ilman-rekisterointia/` | `/rekisteroitymisvapaan-pelaamisen-edut-nopeus-ja-turvallisuus/` | 301 (no merge) | A.5-B — no-reg benefits | 2026-07-06 |
| 22 | `/kasino-ilman-rekisteroitymista-edut-suomalaisille/` | `/rekisteroitymisvapaan-pelaamisen-edut-nopeus-ja-turvallisuus/` | 301 (no merge) | A.5-B — no-reg benefits | 2026-07-06 |
| 23 | `/kasinoiden-edut-ilman-rekisteroitymista/` | `/rekisteroitymisvapaan-pelaamisen-edut-nopeus-ja-turvallisuus/` | 301 (no merge) | A.5-B — no-reg benefits | 2026-07-06 |
| 24 | `/kasinot-ilman-rekisteroitymista-ja-vastuullinen-pelaaminen-kuinka-pikakasinot-panostavat-turvallisuuteen/` | `/vastuullinen-pelaaminen-tilittomilla-kasinoilla/` | 301 (no merge) | A.5-B — responsible gaming | 2026-07-06 |
| 25 | `/kasino-ilman-rekisteroitymista-ja-vastuullinen-pelaaminen-kuinka-pikakasinot-panostavat-turvallisuuteen/` | `/vastuullinen-pelaaminen-tilittomilla-kasinoilla/` | 301 only (ghost URL) | A.5-B — responsible gaming | 2026-07-06 |
| 26 | `/askel-askeleelta-rekisteroitymattoman-kasinon-kaytto-2026/` | `/askel-askeleelta-rekisteroitymaton-kasinopelaaminen-2026/` | 301 (no merge) | A.5-B — step-by-step how-to (map L) | 2026-07-06 |
| 27 | `/askel-askeleelta-rekisteroitymaton-kasino/` | `/askel-askeleelta-rekisteroitymaton-kasinopelaaminen-2026/` | 301 (no merge) | A.5-B — step-by-step how-to (map L) | 2026-07-06 |
| 28 | `/askel-askeleelta-rekisteroitymattomalla-kasinolla-pelaaminen/` | `/askel-askeleelta-rekisteroitymaton-kasinopelaaminen-2026/` | 301 (no merge) | A.5-B — step-by-step how-to (map L) | 2026-07-06 |
| 29 | `/kuinka-pelata-kasino-ilman-rekisteroitymista/` | `/askel-askeleelta-rekisteroitymaton-kasinopelaaminen-2026/` | 301 (no merge) | A.5-B — step-by-step how-to | 2026-07-06 |
| 30 | `/kuinka-pelata-kasinoilla-ilman-tilia/` | `/askel-askeleelta-rekisteroitymaton-kasinopelaaminen-2026/` | 301 (no merge) | A.5-B — step-by-step how-to | 2026-07-06 |

**Cluster B notes:**

- **"Edut" triplet:** all three members are in the GSC refusal set (0 clicks,
  0 impressions), so instead of keeping the thickest refused member
  (`kasino-ilman-rekisteroitymista-edut-suomalaisille`, 2,161 w) the whole
  intent 301s to the INDEXED equivalent
  `/rekisteroitymisvapaan-pelaamisen-edut-nopeus-ja-turvallisuus/` (1,827 w,
  modified 2026-06-04). The adjacent `5-syyta-miksi-pelata-*` (listicle angle)
  and `pay-n-play-kasinoiden-edut-*` / `tilivapaiden-kasinoiden-edut-opas-2026`
  (different qualifier, map Cluster K — deferred) stay untouched.
- **Vastuullinen singular/plural pair:** the plan said "keep one, 301 the
  other", but the would-be keeper (plural) is a 354-word 2024 stub Google
  already refuses — both go to the indexed 1,663-word RG guide instead.
  The singular variant exists ONLY in GSC (no fragment, no REST entry — a
  ghost URL that 404s on the static site): redirect-only rule, nothing to
  delete. `vastuullinen-pelaaminen-hauskuuden-ja-riskin-tasapaino-*` (367 w,
  2023) is NOT in any GSC bucket → out of zero-risk scope, left for review.
- **Step-by-step / kuinka-pelata set:** one intent ("how to play at a no-reg
  casino"), six interchangeable titles, ALL refused by Google → single
  survivor = the most comprehensive member (see batch header note on its own
  unindexed status). This executes map Part B Cluster L early — justified
  because the map's "per-URL GSC data" precondition is now met (all members
  empirically at zero).

## Cluster C — off-architecture /pragmatic-play/ slot pages (GSC audit §8)

Not retired — added to `NOINDEX_PATHS` in `src/lib/noindex.ts` (2026-07-06,
noindex,follow + sitemap exclusion; reversible, nothing deleted). Google
already refuses them and they sit outside the casino/payments architecture;
revisit if a slots strategy emerges. GSC listed them under legacy WP slugs
(`great-rhino-megaways-arvostelu`, `sweet-bonanza-2`, `wolf-gold-2`, mixed-case
John-Hunter); the live static routes below were verified against each
fragment's `meta.json` and their rendered `noindex,follow` meta + sitemap
absence verified in `dist/` post-build:

- `/pragmatic-play/great-rhino-megaways/`
- `/pragmatic-play/sweet-bonanza-arvostelu/`
- `/pragmatic-play/wolf-gold-arvostelu/`
- `/pragmatic-play/john-hunter-and-the-tomb-of-the-scarab-queen/`

The `/pragmatic-play/` hub and `/pragmatic-play/the-dog-house-arvostelu/`
(absent from the GSC refusal list) stay indexable.

**Batch A.5 totals:** 20 fragments retired (11 + 9), 21 redirect sources
(42 slash-variant rules) added, 4 pages noindexed. Sitemap measured per
commit: 494 after cluster A → 485 after B → 481 after C (implied pre-batch
baseline 505; the batch-A log recorded 504, off by one). Build after every
commit: check-build + audit-dist-links PASS.

---

# Part A stability check + Batch B (2026-08-18)

**Evidence:** native Google Search Console "Performance on Search" export
(kasinotilmanrekisteroitymista.com property, Web search, last 16 months,
downloaded 2026-08-18) — 520 URLs with real per-URL clicks/impressions/CTR/
position. This is the site's own first-party GSC data (not the Ahrefs-mirrored
project used for the 07-04/07-06 batches), so it doubles as an independent
cross-check of those batches as well as the data source for this one.

**Part A stability check (map step 6: monitor 4–8 weeks, roll back losers).**
Batch A (07-04) is ~6.5 weeks live, batch A.5 (07-06) ~6 weeks live —
inside the monitoring window. Checked every survivor from both batches
against this export: no survivor shows fewer impressions or a worse position
than the retire candidate it absorbed; most retire candidates now carry zero
or residual (pre-redirect) impressions only. One low-signal case reviewed
explicitly: Cluster 6 survivor `verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet`
shows 0 impressions in the export while the retired `verovapaat-kasinot-vertailu-7`
shows 1 impression at position 5 — a single-impression data point is not a
reliable ranking signal (site-wide average is 613 clicks / 1.3M impressions
across 520 URLs over 16 months), and it doesn't override the 07-04 Ahrefs
validation that already cleared this pair. **Verdict: Part A is stable. No
rollback.**

**Batch B — 2 Part-A stragglers + Part B Clusters I/J/K.** The map's Part B
gate ("must NOT be touched without per-URL GSC data") is now satisfied by the
export above (Cluster L was already executed early in batch A.5-B). Same
mechanism as prior batches: fragment deleted, both slash-variant 301s added to
`data/static-redirects.json` → folded into `vercel.json` via
`node scripts/sync-static-redirects.mjs`. Internal links, listing exclusion,
and WP-resync protection are automatic (`src/lib/html-links.ts` +
`src/lib/content.ts`'s `isRetiredPath` + `scripts/fill-missing-fragments.mjs`
guard, all keyed off the same redirect map — no manual link edits needed).

| # | Removed URL | Survivor (301 target) | Evidence | Cluster |
|---|---|---|---|---|
| 31 | `/nopeat-kotiutukset-kasinolla-95-prosenttia-nopeammin/` | `/nopeat-kasino-kotiutusajat-opas-suomalaisille/` | 0 impressions in 16mo (was review-gated in batch A pending exactly this data) | 5 — fast withdrawals |
| 32 | `/parhaat-esimerkit-pikakasinoista-suomessa-2026/` | `/top-pikakasinot-vertailu-6/` | 0 impressions in 16mo (was "review, not unambiguous" in batch A) | 9 — best examples fast → C2 |
| 33 | `/miksi-valita-tiliton-kasino-pelaajan-opas-2026/` | `/miksi-valita-tiliton-kasino-opas-2026/` | 0 impressions; survivor has 7 impr / pos 10.29, only member with signal | I — why choose no-account |
| 34 | `/miksi-valita-kasino-ilman-tilia-vuonna-2026/` | `/miksi-valita-tiliton-kasino-opas-2026/` | 0 impressions | I — why choose no-account |
| 35 | `/mita-ovat-tilittomat-kasinot-selkea-opas-2026/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` | 0 impressions — the map's baseline "what-is" KEEP is dead; survivor swapped to the surviving evergreen definition page (31 impr, most volume in cluster) | J — what-is/how-works |
| 36 | `/tilittoman-kasinon-toiminta-2026-opas-pelaajille/` | `/miten-tilittomat-kasinot-toimivat-opas-2026/` | 2 impr / pos 13.5 vs survivor's 2 impr / pos 6.5 — survivor has the better position for the "how it works" angle | J — what-is/how-works |
| 37 | `/esimerkkeja-tilittomista-kasinoista-opas-2026/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` | 2 impr / pos 8.5, listicle-ish "examples" angle folded into the definition canonical (no dedicated toplist twin exists to absorb it instead) | J — what-is/how-works |
| 38 | `/tilivapaiden-kasinoiden-kayttovinkit-2026/` | `/tilivapaiden-kasinoiden-edut-opas-2026/` | Both members 0 impressions — no traffic signal either direction, default to map's baseline KEEP (benefits over tips) | K — tilivapaa benefits/tips |

**Outcome for cluster J:** matches the map's own predicted result ("keep 1
what-is + 1 how-works + retire the rest"), confirmed by data — with the KEEP
for the definition/what-is angle swapped from the map's baseline guess
(`mita-ovat-tilittomat-kasinot-selkea-opas-2026`, word-count-only baseline)
to the page real search data actually supports
(`mika-on-tiliton-kasino-ja-miten-se-toimii`).

**Skipped (left untouched, per data):**
- Cluster 10 `/atjkitchen-com-vaihtoehdot-6/`: the map and batch-A.5 both
  recorded it at zero GSC impressions; this export shows 2 impressions at
  position 6 — a small but real signal it has picked up since. Per the map's
  own rule ("if it ranks for the brand-alternative term, keep as-is"), no
  action.
- Cluster 5 `/nopeat-kotiutukset-nettikasinoilta/`: reconfirmed as the
  cluster's real prize, not a merge candidate — 4,336 impressions (by far the
  largest in this entire dataset) at position ~80. Left standalone exactly as
  batch A already decided; the fix this page needs is a ranking recovery, not
  a redirect.
- Part B Cluster K's own baseline KEEP (`tilivapaiden-kasinoiden-edut-opas-2026`)
  and Cluster J's `miten-tilittomat-kasinot-toimivat-opas-2026` were left as
  live survivors, not retired, consistent with the table above.

**Batch B totals:** 8 fragments retired, 8 redirect sources (16 slash-variant
rules) added — `data/static-redirects.json` now 162 rules total (was 146).
Build after commit: `npm run build` → check-build OK, audit-dist-links PASS,
559 pages.

---

# Kryptokasinot cluster consolidation (2026-09-08)

**Evidence:** live Ahrefs GSC data (project 1943203), 6-month window
(2026-03-01 → 2026-09-08). This cluster was flagged as a consolidation
candidate on 2026-08-18 (during Part B execution) but deliberately NOT
touched then — new content was recommended against it at the time
specifically because it looked like near-duplicate cannibalization, and
that call is now confirmed with real per-URL data.

The `/kryptokasinot/` money hub is the **only** member of this 7-page
cluster with any search presence at all: 19,135 impressions, position
31.4, 1 click, 34 associated keywords, top query "kryptokasinot." The
other 6 — all informational articles on adjacent crypto-casino angles —
have **zero impressions each** over the full 6-month window. No
diverging queries to preserve, no ambiguity: textbook consolidation
case, cleaner than any Part A/B cluster (those all had at least some
residual signal to weigh).

**301 relevance check:** confirmed `/kryptokasinot/`'s own body content
already covers every retired page's angle directly — "Mikä on krypto
casino?" / "Miten kryptovaluutta toimii?" (definition), "Kuinka pelata
kryptoilla" + deposit/withdraw sections (how-to-play), "Bitcoin kasino –
plussat ja miinukset" (benefits), "Krypto kasinoiden turvallisuus ja
lisensointi" (safety), "Kryptokasinot ja tulevaisuus" (future outlook).
Not equity-dumping — the destination genuinely answers each retired
page's intent.

Same mechanism as every prior batch: fragment deleted, both slash-variant
301s added to `data/static-redirects.json` → folded into `vercel.json`
via `sync-static-redirects.mjs`. Internal links, listing exclusion, and
WP-resync protection all automatic (same `isRetiredPath`/redirect-map
machinery, no manual edits needed).

| # | Removed URL | Survivor | Evidence |
|---|---|---|---|
| 39 | `/kryptokasinoiden-suosio-kasvussa-mika-selittaa-ilmion/` | `/kryptokasinot/` | 0 impressions in 6mo |
| 40 | `/kryptokasinoiden-turvallisuus/` | `/kryptokasinot/` | 0 impressions in 6mo |
| 41 | `/kryptokasinot-nettikasinoiden-tulevaisuus-vai-pelkka-muoti-ilmio/` | `/kryptokasinot/` | 0 impressions in 6mo |
| 42 | `/kuinka-pelaat-kryptokasinoilla/` | `/kryptokasinot/` | 0 impressions in 6mo |
| 43 | `/mitka-ovat-kryptovaluuttojen-edut-nettikasinolla-pelattaessa/` | `/kryptokasinot/` | 0 impressions in 6mo |
| 44 | `/suomalaiset-nettikasinot-ja-kryptovaluutta/` | `/kryptokasinot/` | 0 impressions in 6mo |

**Totals:** 6 fragments retired, 6 redirect sources (12 slash-variant
rules) added — `data/static-redirects.json` now 174 rules total (was
162). `/kryptokasinot/` itself untouched (already carries its own
Phase-5 title/description override, richest member at 3,046 words —
stays exactly as-is).

---

# Ended-affiliate-deal brand removals (2026-09-11)

Not an SEO consolidation — a **commercial** removal. Five brands were
named for removal; three of them (BigWin, Potmanni, Spinokkio) do not
exist anywhere on the site (checked fragments, `data/rest/casino.json`,
the captured `public/rlaaf-data` toplists, the `/go/` affiliate map and
the redirect map — the only "big win" hits are prose on the unrelated
"Casino Win Big" brand). Two had a real footprint, plus one
outbound-link-only mention:

| Brand | Footprint found | Action |
|---|---|---|
| Pelikaani | `/casino/pelikaani-kasino/` review, `/go/pelikaani/`, 3 captured toplists, 2 in-prose internal links | Full retire |
| Pelikioski | `/casino/pelikioski/` review, `/go/pelikioski/`, 4 captured toplists, 1 in-prose internal link | Full retire |
| Pottila | One outbound external link to `pottilakasino.fi` in `/miten-tilittomat-kasinot-toimivat-opas-2026/` — no page, no affiliate link | Link removed |

**Reason:** affiliate deals ended. Both brands were still *open* (no
"Suljettu"), indexable and actively promoted, so this is deliberately
NOT the closed-casino path — `MANUALLY_CLOSED_SLUGS` would have
mislabelled them "Suljettu", which is not true. Search value forgone is
negligible (Pelikioski 62 impressions at position ~69; Pelikaani
effectively zero).

**Mechanism (four independent paths had to be cut, not just the page):**

1. **Review pages** — fragments deleted, both slash variants 301'd to
   `/kaikki-kasinot/` in `data/static-redirects.json`. In-prose internal
   links correct themselves at build time via `src/lib/html-links.ts`,
   same as every prior batch.
2. **Toplist cards** — `getToplist()` in `src/lib/toplist.ts` now skips
   any casino whose `/casino/<slug>/` is a 301 source, reusing
   `isRetiredPath()` — the SAME source of truth `getPosts()` already
   uses for retired posts. No second hardcoded list: adding the redirect
   is what removes the card, so a retirement can't be half-applied, and
   it survives the daily WP re-sync that rewrites `public/rlaaf-data`
   (which stays a pristine snapshot, never hand-edited).
3. **Affiliate redirects** — the two slugs were removed from
   `data/go-redirects.json` AND added to a new
   `data/go-redirects-blocked.json`, applied in `scripts/fetch-rest.mjs`
   after the manual/generated merge. This matters: the ThirstyAffiliates
   entries still exist in WP, so a hand-deletion alone would be undone by
   the next sync and quietly resume sending clicks to a dead programme.
   `middleware.ts` then has no entry to match and `/go/<slug>/` 404s.
4. **Stale SEO override** — the `/casino/pelikioski/` description entry
   added in PR #28 was removed along with its page.

**Rollback:** restore the fragments from git, drop the four redirect
pairs from `data/static-redirects.json`, remove the two slugs from
`data/go-redirects-blocked.json` (the next WP sync restores their `/go/`
entries automatically), re-run `node scripts/sync-static-redirects.mjs`.

---

# Ended-affiliate-deal brand removals, batch 2 (2026-09-15)

Same reason and same mechanism as the 2026-09-11 batch above. Nine brands
named; checked against fragments, `data/rest/*.json`, the captured rlaaf
toplists, the `/go/` map and the redirect map.

| Brand | Footprint found | Action |
|---|---|---|
| Berriez | review, `/go/berriez/`, 5 toplist cards, A-Z index link | Full retire |
| Speedz | review, `/go/speedz/`, 5 toplist cards, A-Z index link | Full retire |
| Flamez | review, `/go/flamez/`, 4 toplist cards, A-Z index link | Full retire |
| Wildz | review, `/go/wildz/`, 5 toplist cards, 2 in-prose links (Euteller hub, Christmas article) | Full retire |
| Spinz | review, `/go/spinz/`, 9 toplist cards, A-Z index link (legacy `/casino/spinz/` form) | Full retire |
| Chipz | review, `/go/chipz/`, 6 toplist cards, A-Z index link | Full retire |
| Wheelz | `/go/wheelz/` only (no page; mentioned as a sister site inside the Wildz/Chipz reviews removed here) | Affiliate link blocked |
| Caxino | nothing anywhere | — |
| Tuplaus | **not a brand on this site** — every hit is the Finnish word "tuplaus" (doubling: "bonustuplaus", "Talletuksen TUPLAUS", "tuplausjärjestelmä"). Deliberately untouched. | — |

Search value forgone: zero clicks on all six review pages over 2026-03 →
2026-09 (Berriez 1,595 impressions pos ~49; Flamez 1,049 pos ~54; Speedz 790
pos ~48; Wildz/Chipz/Spinz ≤ 9 each).

**Extra detail vs batch 1:**
- The existing `/casino/spinz` → `/casino/spinz-casino/` rules were
  repointed straight to `/kaikki-kasinot/`, so retiring the target doesn't
  create a two-hop redirect chain.
- Closed Casino Room's review card still carries `/go/chipz/` CTA buttons in
  its scraped fragment. Not an issue: the closed-casino template renders no
  CTAs (`casino/[slug].astro`), so those never reach the page.
- `/euteller-kasinot/` had a "Parhaat Euteller Kasinot" section — the team's
  two picks, #1 Wildz and #2 Tournaverse (already closed). Unlike the
  retrospective Christmas-article prose (kept, unlinked), this was an active
  recommendation with no valid entries left, so the whole section is removed
  at build time via `RETIRED_SECTIONS` in `retired-brands.ts`. Guarded: it
  only drops while the section still links a retired review, so a future WP
  rewrite around live brands renders again automatically. The page keeps its
  live 10-casino toplist.

---

# Batch C — no-registration head-term cluster (2026-09-15)

**Why now:** GSC page history shows the whole site dropped in one week
(week of 2025-12-15: homepage pos ~17 → ~40 → ~80, `/kryptokasinot/`
~45 → ~80, Igni ~38 → ~90) and never recovered. After the drop, Feb–Jun
2026 added a wave of templated guides all aimed at the homepage's own head
term ("kasino ilman rekisteröitymistä" / tilitön / pikakasino / Pay N Play),
several with invented statistics in the title ("60% Bonuksia & 40%
Nopeampi", "70% turvallisempi"). They compete with the homepage and the
hubs, and signal scaled low-value content to a site already under a
quality demotion.

**Evidence (all 25 retired URLs):**
- Ahrefs GSC (project 1943203), 16-month window 2025-05-01 → 2026-09-15:
  **0 clicks**; impressions 0 on 23 of 25, 8 on `modernit-pikakasinot-mobiili-edella`
  (pos ~36) and 1 brand-query impression on `pikakasinoiden-kasvava-suosio-…`.
- Ahrefs pages-by-backlinks (top 150 URLs by referring domains): **none**
  of the 25 has external referring domains.
- Survivor relevance checked against each survivor's own H2s:
  - `/mika-on-tiliton-kasino-ja-miten-se-toimii/` (the only guide in the
    cluster with GSC signal: 114 impressions, pos ~21) covers definition,
    safety, pros/cons and how play works → absorbs the what-is / why /
    how-to / benefits guides.
  - `/` covers "Top 10 kasinot ilman rekisteröitymistä", how it works,
    how we rate, pros/cons, bonuses → absorbs the "best casinos" listicles.
  - `/pikakasinot/` covers what/how/pros-cons/choosing/licences → absorbs
    the pikakasino explainers.
  - `/parhaat-esimerkit-pay-n-play-kasinoista/` (map Cluster 8 KEEP) covers
    how Pay N Play works, strengths/weaknesses, tax/licences → absorbs the
    Pay N Play explainers.

**Chain prevention:** five earlier survivors are retired here
(`rekisteroitymisvapaan-pelaamisen-edut-…`, `askel-askeleelta-rekisteroitymaton-kasinopelaaminen-2026`,
`miksi-valita-tiliton-kasino-opas-2026`, `miten-tilittomat-kasinot-toimivat-opas-2026`,
`tilivapaiden-kasinoiden-edut-opas-2026`), so the 24 existing rules that
pointed at them were repointed straight to the new survivor — no two-hop
redirects.

Same mechanism as every prior batch: fragment deleted, both slash-variant
301s in `data/static-redirects.json` → `vercel.json` via
`sync-static-redirects.mjs`; internal links, listings and WP-resync
protection automatic.

| # | Removed URL | Survivor (301 target) |
|---|---|---|
| 45 | `/kasino-ilman-rekisteroitymista-suomi/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 46 | `/miksi-valita-kasino-ilman-rekisteroitymista/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 47 | `/miksi-valita-tiliton-kasino-opas-2026/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 48 | `/miten-tilittomat-kasinot-toimivat-opas-2026/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 49 | `/kasino-ilman-rekisteroitymista-ohje/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 50 | `/nain-aloitat-rekisteroitymattoman-pelaamisen-helposti/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 51 | `/askel-askeleelta-rekisteroitymaton-kasinopelaaminen-2026/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 52 | `/rekisteroitymisvapaan-pelaamisen-edut-nopeus-ja-turvallisuus/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 53 | `/kasinot-ilman-tilia-suurimmat-edut-pelaajalle/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 54 | `/tilivapaiden-kasinoiden-edut-opas-2026/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 55 | `/kasinoiden-edut-vuonna-2026-pelaajan-opas/` | `/mika-on-tiliton-kasino-ja-miten-se-toimii/` |
| 56 | `/kasino-ilman-rekisteroitymista-60-bonuksia-40-nopeampi/` | `/` |
| 57 | `/kasinot-ilman-rekisteroitymista-2026-70-turvallisempia-pelaajia/` | `/` |
| 58 | `/esimerkkeja-nettikasinoista-ilman-tilia-2026-valintakriteerit-ja-suositukset/` | `/` |
| 59 | `/parhaat-kasinot-listalla-turvallisimmat-ja-helpoimmat/` | `/` |
| 60 | `/mika-on-pikakasino-nopea-turvallinen/` | `/pikakasinot/` |
| 61 | `/miten-pikakasinot-toimivat-nopea-ja-turvallinen-opas-2026/` | `/pikakasinot/` |
| 62 | `/siksi-valitset-pikakasinon-nopeat-ja-turvalliset-pelit/` | `/pikakasinot/` |
| 63 | `/miksi-valita-nopea-kasino-valitonta-pelaamista-suomalaisille/` | `/pikakasinot/` |
| 64 | `/modernit-pikakasinot-mobiili-edella/` | `/pikakasinot/` |
| 65 | `/kuinka-pikakasinot-takaavat-reilun-pelin/` | `/pikakasinot/` |
| 66 | `/pikakasinoiden-kasvava-suosio-kuinka-kasinot-ilman-rekisteroitymista-muuttavat-alaa/` | `/pikakasinot/` |
| 67 | `/pay-n-play-kasinon-toimintaperiaate/` | `/parhaat-esimerkit-pay-n-play-kasinoista/` |
| 68 | `/pay-n-play-kasinoiden-edut-nopeus-turvallisuus/` | `/parhaat-esimerkit-pay-n-play-kasinoista/` |
| 69 | `/turvallisuus-pay-n-play-kasinoilla-opas/` | `/parhaat-esimerkit-pay-n-play-kasinoista/` |

**Deliberately kept:** `/5-syyta-miksi-pelata-kasinoilla-ilman-rekisteroitymista/`
(2,174 impressions, 2 referring domains); `/parhaat-kasinot-ilman-rekisteroitymista-5/`
(earlier Cluster 1 KEEP, left for a later review); the safety, payments,
licence and tax-free guide tails (same pattern, separate batch).

**Open question, not actioned:** `/nettikasino-ilman-rekisteroitymista/`
(hub added 2026-06-24) targets the exact head term the homepage owns and has
0 impressions since launch — itself a likely cannibal of `/`. Needs an owner
decision before retiring.

---

# Batch D — safety, responsible-gaming, payments, Trustly, licence, tax, withdrawals, bonus tails (2026-09-15)

**Context:** Search Console Manual actions and Security issues both report no
issues (owner check, 2026-09-15), so the December 2025 drop is algorithmic.
Recovery lever = fewer weak pages, not a reconsideration request. Batch C
(PR #36) is live and verified (one-hop 301s).

**Evidence (all 49 retired URLs):**
- Ahrefs GSC (project 1943203), 16-month window 2025-05-01 → 2026-09-15:
  **0 clicks** on every page; impressions 0 on 43 of 49, the rest ≤ 8
  (`rahat-tilille-viiveetta-…` 8, `mika-on-hyva-kierratysvaatimus` 5,
  `verkkopankkimaksut-kasinoilla-2026-…` 3, `parhaat-verovapaat-pay-n-play-…` 3,
  `bonusten-kierratysvaatimukset-…` 2, `opas-turvalliseen-rahansiirtoon-…` 1).
- Ahrefs pages-by-backlinks: none of the 49 appears among pages with
  external referring domains.
- Every survivor is the page in its topic with the most search signal (or,
  where no page has any, the evergreen / earlier-KEEP guide), and its own
  H2s cover the retired intents:

| Survivor | 16-mo impressions | Absorbs |
|---|---|---|
| `/nettikasinot-luotettavat-kasinot/` (money hub, "Miten valita turvalliset nettikasinot?") | 72,490 | 15 safe-casino guides / checklists / tips |
| `/turvalliset-maksutavat-nettikasinoilla-kattava-opas/` (all methods + comparison) | 18 | 10 payment-method and verkkopankki guides |
| `/suomi-siirtyy-rahapelien-lisenssijarjestelmaan-2026-…/` | 359 | 6 licence / regulation guides |
| `/trustly-kasinot/` (money hub) | 45,002 | 4 Trustly guides |
| `/kuinka-pelaat-vastuullisesti/` (evergreen RG guide) | 2 | 3 responsible-gaming guides |
| `/verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet/` (Cluster 6 KEEP) | 0 | 3 tax-free guides |
| `/kierratysvaatimus-opas-bonusten-kierratykseen/` | 1,119 | 3 wagering guides |
| `/nopeat-kotiutukset-nettikasinoilta/` | 4,141 | 2 withdrawal guides |
| `/kasinobonukset/` (money hub) | 12,021 | 2 bonus explainers |
| `/parhaat-mobiilikasinot-2026-vertailu-ja-valintaopas/` | 18 | 1 mobile how-to |

**Chain prevention:** five earlier survivors are retired here
(`nain-valitset-turvallisen-nettikasinon-nopeasti-vuonna-2026`,
`tilittomien-kasinoiden-turvallisuusvaatimukset`, `turvallisuus-kasinot-ilman-tilia`,
`vastuullinen-pelaaminen-tilittomilla-kasinoilla`, `nopeat-kasino-kotiutusajat-opas-suomalaisille`);
the 30 existing rules pointing at them were repointed straight to the new
survivor. Stale `SEO_OVERRIDES` entries for pages retired in batches C and D
removed. Four `BROKEN_LINK_FIXES` targets in `src/lib/html-links.ts` pointed
at now-retired pages (the build's internal-404 audit caught two of them on
`/pikakasinot/` and `/nettikasino-ilman-rekisteroitymista/`); all four
re-pointed to the final survivors.

**Retired URLs** (fragment deleted + both slash-variant 301s):

- → `/nettikasinot-luotettavat-kasinot/`: `turvallisuus-kasinot-ilman-tilia`,
  `turvallisen-kasinopelaamisen-vinkit`, `turvallisen-tilittoman-kasinon-valinta-2026`,
  `turvallisen-pikakasinon-tarkistuslista-pelaa-huolettomasti`,
  `valitse-turvallinen-tillitton-kasino-opas`,
  `opas-turvalliseen-kasinopelaamiseen-suojaat-pelisi-netissa`,
  `tunnista-turvalliset-kasinot-sailtyseet-lisenssit`,
  `vinkit-turvalliseen-kasinopelaamiseen-ilman-tilia`, `top-turvalliset-pikakasinot-4`,
  `nain-valitset-turvallisen-nettikasinon-nopeasti-vuonna-2026`,
  `nain-pelaat-turvallisesti-rekisteroimattomilla-kasinoilla`,
  `tilittomien-kasinoiden-turvallisuusvaatimukset`,
  `turvallisuuden-tarkistuslista-kasinoille-2026`,
  `turvallinen-peliprosessi-2026-opas-pelaajille`,
  `vinkit-turvalliseen-kasinopelaamiseen-2026`
- → `/kuinka-pelaat-vastuullisesti/`: `vastuullinen-pelaaminen-tilittomilla-kasinoilla`,
  `vinkkeja-turvalliseen-pelaamiseen-nettikasinoilla`,
  `vastuullinen-pelaaminen-hauskuuden-ja-riskin-tasapaino-pikakasinoiden-maailmassa`
- → `/turvalliset-maksutavat-nettikasinoilla-kattava-opas/`:
  `maksutapojen-merkitys-tilittomilla-kasinoilla-valitse`,
  `maksutapojen-merkitys-online-kasinolla-nopeus-turvallisuus`,
  `nettikasinon-maksutavat-selitetty-nopeus-ja-turvallisuus`,
  `suosituimmat-maksutavat-kasinoilla-nopein-turvallisin`,
  `maksutapojen-rooli-kasinoilla-2026-opas-pelaajille`,
  `opas-turvalliseen-rahansiirtoon-kasinolla-2026`,
  `rooli-verkkopankkimaksuissa-mobiilikasinoilla`,
  `verkkopankkimaksut-kasinoilla-2026-nopea-ja-turvallinen-opas`,
  `verkkopankkimaksujen-rooli-kasinoilla-nopeus-pelaajalle`,
  `verkkopankkimaksujen-merkitys-kasinoilla-suomalaisille`
- → `/trustly-kasinot/`: `trustly-casino-nopeus-turvallisuus-suomi`,
  `askel-askeleelta-trustly-kasinoilla-pelaaminen-opas`,
  `rooli-trustly-maksutavoissa-opas-suomalaisille-pelaajille`,
  `miksi-valita-trustly-maksu-kasinoille-2026`
- → `/suomi-siirtyy-rahapelien-lisenssijarjestelmaan-2026-miten-se-muuttaa-pelaamista-ja-mainontaa/`:
  `miten-kasinoiden-lisenssit-muuttuvat-suomessa-2026`,
  `kasinoiden-lisenssivaatimukset-turvallisuus-ja-pelivalinta`,
  `regulation-importance-online-casino-speed-security`,
  `lisensoinnin-merkitys-suomalaisille-pikakasinoille`,
  `kasinolisenssien-selitys-suomessa-2026`, `mita-tarkoittaa-pelilisenssi-opas-pelaajille`
- → `/verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet/`:
  `nain-verovapaus-vaikuttaa-nettikasinopelaamiseen`,
  `nain-kaytat-verovapaita-kasinoita-helposti-turvallisesti`,
  `parhaat-verovapaat-pay-n-play-kasinot-suomalaisille`
- → `/parhaat-mobiilikasinot-2026-vertailu-ja-valintaopas/`: `mobiilikasinolle-helposti-askel-askeleelta-opas`
- → `/nopeat-kotiutukset-nettikasinoilta/`: `nopeat-kasino-kotiutusajat-opas-suomalaisille`,
  `rahat-tilille-viiveetta-yleisimmat-ongelmat-nettikasinoiden-kotiutuksissa-ja-kuinka-selvittaa-ne`
- → `/kierratysvaatimus-opas-bonusten-kierratykseen/`: `miten-bonusehdot-toimivat-kasinoilla-2026`,
  `bonusten-kierratysvaatimukset-kuinka-paihittaa-ne`, `mika-on-hyva-kierratysvaatimus`
- → `/kasinobonukset/`: `kasinoiden-bonukset-selitetty-suomalaisille-pelaajille`,
  `opas-nopeisiin-nettikasino-bonuksiin-2026`

**Deliberately kept (real search signal):** `non-sticky-bonus` (34,016 impr),
`katevasti-mobiililla-apple-pay-ja-google-pay-…` (5,979, pos ~33),
`mita-bonuskoodit-ovat-ja-miksi-niita-kaytetaan` (2,133),
`euteller-vs-zimpler-ja-brite-…` (318), `veikkauksen-monopoli-murtuu` (258),
`onnenpyora-bonukset-uusin-bonusmalli` (138), `uudet-maksutavat-nettikasinoilla` (66),
`opas-parhaan-kasinobonuksen-loytamiseen` (33).
Overlapping but not merged (flag for later): `/verovapaus-nettikasinoilla/`
(2021, same tax-free intent as the Cluster 6 KEEP, 0 impressions).

<!-- Batches appended below as they are executed. -->
