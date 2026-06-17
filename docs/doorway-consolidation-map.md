# Doorway / Near-Duplicate Money-Page Consolidation Map

**Finding:** H6 — numbered/dated near-duplicate "Top N" money + listicle pages targeting the same search intent.
**Status:** ANALYSIS ONLY. This document changes no rendering, adds no redirects, deletes nothing. It is a plan for **post-cutover** execution via equity-preserving **301 redirects** once Google Search Console (GSC) / Ahrefs traffic data is available on the live domain.
**Author:** Doorway-Analyst.
**Source data:** `data/rest/posts.json` (223 posts), `data/rest/pages.json` (35 pages), and `src/fragments/*/meta.json`. Word counts are body-text approximations (HTML stripped) from each fragment/post `content.rendered`. Dates are `date` (publish) / `modified`.

---

## Scope & method

1. **Enumerated** every slug carrying a numeric "Top N" suffix (`-4`, `-5`, `-6`, `-7`), a year suffix/infix (`-vuonna-2021`, `-2024`, `-2025`, `-2026`), or a "Top N … 2026" title pattern.
2. **Separated** two populations:
   - **A. Numbered "Top N" listicle doorways** — slugs ending `-<small N>` whose title is literally "Top N <intent> 2026 / Parhaat … N vaihtoehtoa". These are the genuine doorway risk: multiple URLs ranking the same head term with the only difference being how many casinos are listed (Top 4 vs 5 vs 6 vs 7). **These are the consolidation targets.**
   - **B. Dated evergreen guides** — `*-2026` informational guides (how-it-works / why-choose / safety-checklist). These are mostly *engine* articles, individually distinct in angle, and are **NOT** mass-consolidation candidates; only true same-intent twins inside this set are flagged (see Clusters I–L).
3. **Clustered** by search intent and recommended a single canonical **KEEP** URL per cluster, with the others **301 → KEEP**.

**KEEP heuristic (in priority order):** (a) the non-numbered / evergreen slug if one exists; (b) otherwise the richest + most recently modified numbered variant; (c) the slug whose title most cleanly matches the head keyword. Where the choice is genuinely ambiguous the cluster is marked **CONFIRM WITH TRAFFIC DATA**.

> **Hard rule for execution:** Do **NOT** 301 the page that actually holds the rankings. Final KEEP selection at consolidation time **must** be re-validated against GSC clicks/impressions + Ahrefs organic keywords per URL. If a "retire" candidate below outranks the proposed KEEP on the live domain, flip the direction of the 301. No mass-delete — every retired URL becomes a 301 to preserve link equity. Redirects are added in the existing `/go/`-style redirect map / Vercel config, never by deleting fragments.

---

## PART A — Numbered "Top N" listicle doorways (consolidation targets)

### Cluster 1 — Best casinos without registration (head term: *kasino ilman rekisteröitymistä / parhaat*)

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `parhaat-kasinot-ilman-rekisteroitymista-5` | Parhaat kasinot ilman rekisteröitymistä 2026 – 5 vaihtoehtoa | 1930 | 2026-03-09 | 2026-03-09 | **KEEP (candidate)** |
| `suosituimmat-kasinot-ilman-rekisteroitymista-5` | Top 5 Suosituimmat kasinot ilman rekisteröitymistä 2026 | 1126 | 2026-02-07 | 2026-02-09 | 301 → keep |
| `parhaat-kasinot-ilman-rekisteroitymista-vuonna-2021` | Parhaat kasinot ilman rekisteröitymistä vuonna 2021 | 743 | 2022-01-12 | 2024-07-15 | 301 → keep (stale 2021) |

**Rationale:** All three rank the same "best/most-popular casinos without registration" intent. The 2021 dated page is stale and thin → retire. `suosituimmat-…-5` is a thinner near-synonym of `parhaat-…-5`. Keep the richest current page. **CONFIRM WITH TRAFFIC DATA** — the `parhaat-…-vuonna-2021` URL is old and may still hold legacy backlinks/rankings; if so, 301 the newer pages *into* the 2021 URL instead, or keep both only if GSC shows distinct, non-cannibalising queries.

### Cluster 2 — Top pikakasinot (fast casinos) — Suomi / vertailu / generic best

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `top-pikakasinot-vertailu-6` | Top 6 pikakasinot vertailu 2026 | 2389 | 2026-04-14 | 2026-04-14 | **KEEP (candidate)** |
| `top-pikakasinot-suomi-5` | Top 5 pikakasinot Suomi 2026 | 1967 | 2026-05-11 | 2026-05-12 | 301 → keep |
| `top-pikakasinot-suomi-7` | Top 7 Pikakasinot Suomi 2026 – Parhaat vaihtoehdot pelaajille | 2277 | 2026-02-06 | 2026-02-06 | 301 → keep |

**Rationale:** Three near-identical "top fast-casino" listicles differing only by N (5/6/7) and the "Suomi" vs "vertailu" qualifier — classic cannibalisation. `top-pikakasinot-vertailu-6` is the richest and most recently published. **CONFIRM WITH TRAFFIC DATA** — `suomi` vs `vertailu` may target measurably different queries; if GSC shows one "suomi" URL owns "pikakasinot suomi" and "vertailu" owns "pikakasinot vertailu", keep two distinct canonicals (one per qualifier) and only retire the redundant third (`-suomi-7`), rather than collapsing all into one.

### Cluster 3 — Top pikakasinot with bonuses

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `top-pikakasinot-bonuksilla-6` | Top 6 pikakasinot bonuksilla 2026 | 2365 | 2026-03-11 | 2026-03-12 | **KEEP** (single member) |

**Rationale:** Only one numbered member, but it sits adjacent to Cluster 2 (fast casinos) and Cluster 8 (bonus guides). Keep as the dedicated "fast casinos + bonus" listicle. Verify it does not cannibalise `top-pikakasinot-vertailu-6` (Cluster 2) or `opas-nopeisiin-nettikasino-bonuksiin-2026` (Cluster 8) in GSC; if it does, fold into the stronger of the two. No 301 by default.

### Cluster 4 — Safe / trustworthy fast casinos

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `top-turvalliset-pikakasinot-4` | Top 4 turvalliset pikakasinot 2026 | 1731 | 2026-05-10 | 2026-05-12 | **KEEP** (single numbered member) |

**Rationale:** Single numbered listicle for the "safe fast casinos" intent. Adjacent non-numbered evergreens exist (`turvallisuus-pikakasinoilla-selitettyna`, `turvallisen-pikakasinon-tarkistuslista-pelaa-huolettomasti`) but those are *informational* (what-is-safety / checklist), not *listicle* — different intent, do not merge. Keep this as the safe-fast-casino toplist. No 301 by default; monitor for overlap with Cluster 2.

### Cluster 5 — Fast withdrawals / withdrawal-time comparison

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `nopeat-kasino-kotiutusajat-opas-suomalaisille` | Nopeat kasino kotiutusajat: selkeä opas suomalaisille pelaajille | 1903 | 2026-04-25 | — | **KEEP (candidate, evergreen)** |
| `nopeat-kotiutukset-kasinot-vertailu-6` | Top 6 Nopeat Kotiutukset Kasinot Vertailu 2026 | 1872 | 2026-02-08 | 2026-02-09 | 301 → keep |
| `nopeat-kasinot-kotiutusajat-vertailu-4` | Top 4 Nopeat kasinot kotiutusajat vertailu 2026 | 1732 | 2026-04-08 | 2026-04-09 | 301 → keep |
| `nopeat-kotiutukset-kasinolla-95-prosenttia-nopeammin` | Miksi valita nopeat kotiutukset kasinolla 95 % nopeammin | 1163 | 2026-03-04 | — | review / likely 301 → keep |
| `nopeat-kotiutukset-nettikasinoilta` | Kuinka saada nopeat kotiutukset nettikasinoilta | 915 | 2025-07-25 | — | review (informational) |

**Rationale:** Two numbered "withdrawal comparison" listicles (`-vertailu-4` and `-vertailu-6`) directly cannibalise each other. The non-numbered `nopeat-kasino-kotiutusajat-opas-suomalaisille` is the richest evergreen and the natural canonical. The `95-prosenttia-nopeammin` and `nopeat-kotiutukset-nettikasinoilta` pages are softer/informational; the former overlaps the listicle intent (likely 301), the latter ("kuinka saada") is how-to and may stay distinct. **CONFIRM WITH TRAFFIC DATA** — pick KEEP between the evergreen opas and the richer `-vertailu-6` based on which earns withdrawal-comparison clicks.

### Cluster 6 — Tax-free casinos / comparison

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet` | Verovapaat kasinot 2026 – lista, vertailu ja valinnan avaimet | 1805 | 2026-04-29 | 2026-04-30 | **KEEP (candidate, evergreen-named)** |
| `verovapaat-kasinot-vertailu-7` | Top 7 Verovapaat Kasinot Vertailu 2026 | 2617 | 2026-03-10 | 2026-03-11 | 301 → keep |

**Rationale:** Two tax-free-casino comparison/list pages on the same head term. The richest by word count is the numbered `-vertailu-7` (2617 w), but the non-numbered "lista, vertailu ja valinnan avaimet" slug is the more evergreen, future-proof canonical. **CONFIRM WITH TRAFFIC DATA** — if `-vertailu-7` holds the "verovapaat kasinot vertailu" rankings, make it KEEP and 301 the other way. Adjacent tax-free *informational* pages (`nain-kaytat-verovapaita-kasinoita…`, `nain-verovapaus-vaikuttaa…`, `verovapaus-nettikasinoilla`) are different intent — leave them.

### Cluster 7 — Mobile casinos without account / mobile toplist

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `parhaat-mobiilikasinot-2026-vertailu-ja-valintaopas` | Parhaat mobiilikasinot 2026: vertailu ja valintaopas | 1787 | 2026-06-09 | 2026-06-09 | **KEEP (candidate, evergreen + newest)** |
| `top-mobiilikasinot-ilman-tilia-5` | Top 5 mobiilikasinot ilman tiliä 2026 | 1703 | 2026-04-08 | 2026-04-09 | 301 → keep |

**Rationale:** Both are "best mobile casino" listicles. The non-numbered `parhaat-mobiilikasinot-2026-vertailu-ja-valintaopas` is the newest (2026-06-09) and evergreen-named → natural canonical. **CONFIRM WITH TRAFFIC DATA** — `top-mobiilikasinot-ilman-tilia-5` carries the "ilman tiliä" (no-account) modifier; if GSC shows it owns that distinct query cluster, keep both (one general, one no-account) instead of merging.

### Cluster 8 — Pay N Play casinos toplist

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `parhaat-esimerkit-pay-n-play-kasinoista` | Parhaat esimerkit Pay N Play kasinoista 2026 | 1554 | 2026-04-01 | — | **KEEP (candidate, evergreen)** |
| `parhaat-pay-n-play-kasinot-2026-5` | Parhaat pay n play kasinot 2026 – Top 5 vaihtoehtoa | 1952 | 2026-04-10 | 2026-04-10 | 301 → keep |
| `parhaat-verovapaat-pay-n-play-kasinot-suomalaisille` | Parhaat verovapaat Pay N Play kasinot suomalaisille | 1634 | 2026-03-25 | — | review (tax-free PnP niche) |

**Rationale:** `parhaat-pay-n-play-kasinot-2026-5` and `parhaat-esimerkit-pay-n-play-kasinoista` are twin "best PnP" listicles. Keep one canonical (the numbered `-5` is richer; the `esimerkit` slug is evergreen-named — **CONFIRM WITH TRAFFIC DATA**). The `verovapaat pay n play` page targets a legitimately narrower long-tail (tax-free + PnP) and may stay distinct; verify overlap before any 301. Non-listicle PnP pages (`pay-n-play-kasinoiden-edut…`, `pay-n-play-kasinon-toimintaperiaate`) are informational — leave them.

### Cluster 9 — "Best examples of fast casinos" (richest-list variant)

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `parhaat-esimerkit-pikakasinoista-suomessa-2026` | Parhaat esimerkit pikakasinoista Suomessa 2026 | 1967 | 2026-04-28 | 2026-04-30 | review → likely 301 into Cluster 2 KEEP |

**Rationale:** "Best examples of fast casinos in Finland" is functionally the same intent as Cluster 2 (`top-pikakasinot-*`). Treat as a Cluster-2 member at execution time: **CONFIRM WITH TRAFFIC DATA**, then 301 into the Cluster-2 canonical unless it independently owns "esimerkit pikakasinoista" queries.

### Cluster 10 — "atjkitchen.com alternatives" (competitor-alternatives doorway)

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `atjkitchen-com-vaihtoehdot-6` | Top 6 atjkitchen.com vaihtoehtoa 2026 | 2326 | 2026-05-12 | 2026-05-12 | **KEEP / REVIEW (orphan-intent)** |

**Rationale:** A "Top 6 alternatives to atjkitchen.com" listicle — an off-brand competitor-alternatives doorway with no sibling on this site. No consolidation partner. **CONFIRM WITH TRAFFIC DATA**: if it earns no clicks/impressions it is a candidate for `noindex` or 301 into the closest fast-casino toplist (Cluster 2) post-cutover; if it ranks for the brand-alternative term, keep as-is. No action without data.

---

## PART B — Dated evergreen guide twins (selective, NOT mass consolidation)

These `*-2026` guides are mostly distinct-angle engine articles. Only same-intent twins are flagged below. Everything else in the dated set stays as-is.

### Cluster I — "Why choose an account-less casino" (tiliton/ilman tiliä) — near-duplicate guides

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `miksi-valita-tiliton-kasino-opas-2026` | Miksi valita tilitön kasino: opas 2026 | 1501 | 2026-06-04 | 2026-06-04 | **KEEP (candidate, newest)** |
| `miksi-valita-tiliton-kasino-pelaajan-opas-2026` | Miksi valita tilitön kasino? Pelaajan opas 2026 | 1396 | 2026-05-30 | 2026-06-04 | 301 → keep |
| `miksi-valita-kasino-ilman-tilia-vuonna-2026` | Miksi valita kasino ilman tiliä vuonna 2026 | 1649 | 2026-03-16 | 2026-03-16 | 301 → keep |

**Rationale:** Three "why choose a no-account casino 2026" guides separated only by wording (tilitön vs kasino ilman tiliä, opas vs pelaajan opas). Textbook intent duplication. Keep the newest/cleanest; 301 the rest. **CONFIRM WITH TRAFFIC DATA** — the richer `-ilman-tilia-vuonna-2026` (1649 w) may out-rank the chosen KEEP; flip if so.

### Cluster J — "What is / how do account-less casinos work" guides

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `mita-ovat-tilittomat-kasinot-selkea-opas-2026` | Mitä ovat tilittömät kasinot: selkeä opas 2026 | 1644 | 2026-05-21 | 2026-05-22 | **KEEP (candidate)** |
| `miten-tilittomat-kasinot-toimivat-opas-2026` | Miten tilittömät kasinot toimivat: opas 2026 | 1395 | 2026-05-24 | 2026-05-25 | review / possible 301 |
| `tilittoman-kasinon-toiminta-2026-opas-pelaajille` | Tilittömän kasinon toiminta 2026: opas pelaajille | 1596 | 2026-06-03 | 2026-06-03 | review / possible 301 |
| `mika-on-tiliton-kasino-ja-miten-se-toimii` | Mikä on tilitön kasino ja miten se toimii? | 1447 | 2026-06-06 | — | **KEEP (candidate, evergreen, no date)** |
| `esimerkkeja-tilittomista-kasinoista-opas-2026` | Esimerkkejä tilittömistä kasinoista: opas 2026 | 1333 | 2026-05-31 | 2026-06-04 | review (examples = listicle-ish) |

**Rationale:** A dense cluster of "what is / how does a no-account casino work" guides plus an "examples" variant — high cannibalisation risk on the "tilitön kasino" head term. The non-dated evergreen `mika-on-tiliton-kasino-ja-miten-se-toimii` is the strongest canonical candidate for the *definition* intent; `esimerkkeja-tilittomista…` leans listicle and may merge into a best-casinos toplist instead. **CONFIRM WITH TRAFFIC DATA before any 301** — this is the most ambiguous cluster; do NOT collapse five live guides without per-URL GSC data. Likely outcome: keep 1 "what-is" + 1 "how-works" + retire the rest.

### Cluster K — Tilivapaa (account-free) benefits/tips twins

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `tilivapaiden-kasinoiden-edut-opas-2026` | Tilivapaiden kasinoiden edut: opas 2026 | 1545 | 2026-06-02 | 2026-06-04 | **KEEP (candidate)** |
| `tilivapaiden-kasinoiden-kayttovinkit-2026` | Tilivapaiden kasinoiden käyttövinkit 2026 | 1379 | 2026-06-08 | 2026-06-08 | review (tips vs benefits) |

**Rationale:** "Account-free casino benefits" vs "usage tips" — adjacent but arguably distinct angles. Likely keep both if GSC shows different queries; otherwise merge tips → benefits. **CONFIRM WITH TRAFFIC DATA.** Note "tilivapaa" overlaps semantically with the "tilitön" Cluster J — check cross-cluster cannibalisation too.

### Cluster L — Step-by-step "registration-free play" guides

| URL (slug) | Title | ~Words | Publish | Modified | Action |
|---|---|---|---|---|---|
| `askel-askeleelta-rekisteroitymaton-kasinopelaaminen-2026` | Askel askeleelta rekisteröitymätön kasinopelaaminen 2026 | 1766 | 2026-03-13 | 2026-03-18 | **KEEP (candidate, richest)** |
| `askel-askeleelta-rekisteroitymattoman-kasinon-kaytto-2026` | Askel askeleelta rekisteröitymättömän kasinon käyttö 2026 | 1760 | 2026-03-19 | 2026-03-20 | 301 → keep |
| `askel-askeleelta-rekisteroitymaton-kasino` | Askel askeleelta rekisteröitymätön kasino – pelaa nopeasti | 1104 | 2026-02-15 | — | review / possible 301 |
| `askel-askeleelta-rekisteroitymattomalla-kasinolla-pelaaminen` | Askel askeleelta rekisteröitymättömällä kasinolla pelaaminen onnistuneesti | 1137 | 2026-02-03 | — | review / possible 301 |

**Rationale:** Four "step-by-step registration-free play" how-tos, nearly interchangeable titles. Keep the richest/most-recent; 301 or `noindex` the thinner duplicates. **CONFIRM WITH TRAFFIC DATA.**

---

## Summary

### Part A — numbered "Top N" listicle doorways

| Cluster | Members | KEEP | Retire (301) | Review/confirm |
|---|---|---|---|---|
| 1 Best no-reg | 3 | 1 | 2 | yes (legacy 2021) |
| 2 Top pikakasinot | 3 | 1 | 2 | yes (suomi vs vertailu) |
| 3 Pikakasinot + bonus | 1 | 1 | 0 | monitor |
| 4 Safe fast casinos | 1 | 1 | 0 | monitor |
| 5 Fast withdrawals | 5 | 1 | 2–4 | yes |
| 6 Tax-free | 2 | 1 | 1 | yes |
| 7 Mobile | 2 | 1 | 1 | yes (ilman tiliä) |
| 8 Pay N Play | 3 | 1 | 1–2 | yes |
| 9 Best examples fast | 1 | → Cluster 2 | (1 into C2) | yes |
| 10 atjkitchen alternatives | 1 | 1 / review | 0–1 | yes |

**Part A totals:** ~22 distinct URLs across 10 intent clusters. Baseline recommendation: **KEEP ~9–10 canonicals, retire ~10–13 via 301** (exact split pending traffic data; ambiguous clusters may keep a 2nd qualifier-specific canonical).

### Part B — dated evergreen guide twins (selective)

| Cluster | Members | KEEP (baseline) | Retire (301) |
|---|---|---|---|
| I Why choose no-account | 3 | 1 | 2 |
| J What-is / how-works tiliton | 5 | 2 | up to 3 |
| K Tilivapaa benefits/tips | 2 | 1–2 | 0–1 |
| L Step-by-step reg-free | 4 | 1 | up to 3 |

**Part B totals:** ~14 URLs across 4 clusters. Baseline: **KEEP ~5–6, retire ~8–9 via 301** — but Part B is lower-confidence and must NOT be touched without per-URL GSC data (distinct-angle guides can legitimately co-exist).

### Grand total
**~36 URLs in ~14 clusters identified as consolidation candidates.** Baseline plan retires **~18–22 URLs via equity-preserving 301** and keeps **~14–16 canonicals**. Final numbers depend on traffic validation.

---

## Execution checklist (post-cutover, not now)

1. Pull GSC (clicks/impressions/position by URL) + Ahrefs (organic keywords + referring domains by URL) for every slug in this doc.
2. Per cluster, set KEEP = the URL with the strongest live rankings/links (override the baseline KEEP above if data disagrees).
3. Add `301` redirect rules (retire-URL → KEEP-URL) in the existing redirect map / `vercel.json` — the same mechanism as the 958 `/go/` redirects. **Never delete fragments; never mass-delete.**
4. Update internal links pointing at retired URLs to point at the KEEP URL (avoid redirect chains).
5. Keep the KEEP page's compliance pillars (18+/Peluuri/affiliate disclosure) and `rel="sponsored nofollow"` on all `/go/` links intact.
6. Re-submit the updated sitemap; monitor GSC coverage + rankings for 4–8 weeks. This is penalty RECOVERY — roll back any 301 that loses rankings.
7. Defer Part B consolidation until Part A is validated stable.

## Verification of this analysis

- Every numbered-suffix slug (`-4/-5/-6/-7`) found in the data (`top-pikakasinot-suomi-5`, `-suomi-7`, `top-pikakasinot-vertailu-6`, `top-pikakasinot-bonuksilla-6`, `top-turvalliset-pikakasinot-4`, `nopeat-kotiutukset-kasinot-vertailu-6`, `nopeat-kasinot-kotiutusajat-vertailu-4`, `verovapaat-kasinot-vertailu-7`, `parhaat-kasinot-ilman-rekisteroitymista-5`, `suosituimmat-kasinot-ilman-rekisteroitymista-5`, `top-mobiilikasinot-ilman-tilia-5`, `parhaat-pay-n-play-kasinot-2026-5`, `atjkitchen-com-vaihtoehdot-6`) is placed in a cluster (1–10) with a KEEP+redirect recommendation.
- Dated `vuonna-2021` legacy variant captured (Cluster 1).
- Dated guide twins captured in Clusters I–L with explicit "confirm with traffic data" gating.
