# KIR Revenue-Guard /go/ Sweep — 2026-07-15

Workflow step 4 (revenue guard). Followed every visible affiliate CTA on the built money pages (`/go/<slug>/` → tracker → operator) and compared the **landing domain** to the **brand label the user is shown**. Read-only detection; no links changed (fixes are owner/network-gated — see below).

29 unique visible CTAs checked. **25 clean.** 4 flagged:

## 🔴 Confirmed brand mismatch (user promised X, sent to Y)

| Slug | Label shown to user | Actually lands on | Status |
|---|---|---|---|
| `21casino` | **KarhuBet Casino** | kodabet.com | Known (brand-mapping-audit-2026-07.md). 21.com campaign repointed to Kodabet. |
| `nubet` | **Nubet Casino** | **lataamo.com** | **NEW.** "/go/nubet/" sends "Nubet Casino" clicks to Lataamo — a different, live brand. (The `lataamo` slug itself correctly → lataamo.com, so Nubet's tracker was repointed to Lataamo by the network.) |

Both are the same failure mode: an affiliate network discontinued a campaign and repointed its tracker to a different live brand, but KIR's page still displays the **old** brand name. Effect: click misattribution (GA4 `affiliate_click` logs the wrong `brand`) **and** a misleading-offer compliance exposure (user told "Nubet", delivered Lataamo).

## 🟡 Suspicious — verify with one real-browser click

| Slug | Label | Lands on | Why flagged |
|---|---|---|---|
| `casinofest` | **Vauhdikas** | afftrackcf.21.partners/C.ashx (bare tracker, empty `c=`) | Label "Vauhdikas" (a Finnish adjective, not a brand) is anomalous; same **21.partners** network as the confirmed Kodabet bug. Likely another repointed/relabelled campaign. |
| `dreamvegas-3` | Dream Vegas | ivyaffsolutions.com/C.ashx (bare tracker, empty `c=`) | Label matches the brand (probably fine — IvyAffiliates is Dream Vegas's network); the empty click param means curl couldn't confirm the final operator. One manual click confirms. |

## Fix path (owner/network — same protocol as KarhuBet)

Not fixable in-repo unilaterally: the correct destination needs affiliate-network confirmation, and the recovery rules forbid editing the pristine `rlaaf` snapshot. For each confirmed case:
1. Ask the network what the campaign (`21casino`→siteid 15705; `nubet`→check siteid) currently pays for.
2. Then via the **offers feed** (`apply-offers.mjs` supports `status:"paused"` and per-casino overrides): either **pause** the entry, or **relabel** it to the real destination brand. Do NOT hand-edit `public/rlaaf-data/`.
3. Blocker upstream: the offers feed currently **403s** (CE_API token) — the override channel is inert until that's fixed, so today these can only be paused, not corrected.

## Systemic note
2 confirmed mislabels out of 29 visible CTAs (~7%) — worth a full 958-slug sweep once the CE feed is restored, and a recurring monthly check (added to SEO_FIX_WORKFLOW.md §4 revenue guard). A repointed tracker with a *matching* label stays invisible to a label-vs-landing check, so the real fix is the offers feed keeping destinations authoritative.
