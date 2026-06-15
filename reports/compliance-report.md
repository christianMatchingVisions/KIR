# iGaming Compliance Report — KIR light-theme rebuild

**Verdict: PASS** (0 critical, 0 high, 0 medium fails; 1 low note)
**Jurisdiction:** `fi` (Finland — transition window 2026→2027)
**Checked:** 2026-06-15 · post-rebuild `dist/` build
**Sample:** home `/`, casino review `/casino/21red-kasino/`, money page `/trustly-kasinot/`, content-engine article `/uutiset/verkkopankkitunnistautuminen-kasinoilla-ilman-rekisteroitymista/`

## Passed (all four pages)
- **FI-AGE-18 / UNI-AGE-MARKER** ✅ 18+ marker present (footer + disclosure bar).
- **FI-RG-PELUURI / UNI-RG-RESOURCES-PRESENT** ✅ "Peluuri" + `peluuri.fi` link present; "Pelaa vastuullisesti" notice present site-wide (Footer + DisclosureBar).
- **UNI-AFFILIATE-LINK-INTEGRITY** ✅ every `/go/` affiliate link carries `rel="sponsored nofollow"` (home 5/5, review 6/6, money 20/20, article 4/4 — 0 missing). Authority/regulator citations (MGA, EUR-Lex, peluuri.fi) intentionally left followed for E-E-A-T.
- **UNI-AFFILIATE-DISCLOSURE** ✅ "Mainos · Kaupallinen yhteistyö…" disclosure bar present site-wide.
- **UNI-NO-INDUCEMENT-TO-CHASE-LOSSES / UK-GUARANTEED-WIN** ✅ no "riskitön/risk-free", "taattu/varma voitto", "voita takaisin häviöt" or equivalent inducement language.
- **First-hand-claims (penalty-recovery policy)** ✅ no "testasin/kokeilin/omakohtai/oikealla pelaajatilillä/we tested" in visible prose (enforced at load time by `scrubFirstHandClaims()`); passive third-party "pelit on testattu" preserved as allowed.
- **UNI-DATA-FRESHNESS** ✅ visible "Päivitetty" date + `article:modified_time`; preserved Rank Math heads intact.

## Low note (not blocking)
- **UNI-NO-DECEPTIVE-LANGUAGE** ⚠️ low — the home long-form intro uses "paras kasino" ("best casino") in an *instructional* sense ("Kuinka valita paras kasino… lukemalla ja vertaamalla eksperttiemme arvostelut" = how to choose the best casino by reading/comparing our reviews). This references a comparison methodology rather than asserting a specific operator is "#1", and it is **preserved original indexed content** kept verbatim for the penalty recovery. No change required; optionally add an explicit "näin vertailemme" methodology anchor later.

## Forward-looking (Finland transition — already tracked)
- **FI-NON-LICENSED-WARNING (from 2027-01-01)** and **FI-NO-WELCOME-BONUS-TO-EXCLUDED (from 2027-07-01)**: the whole "ilman rekisteröitymistä" model becomes high-risk to promote to FI traffic ~July 2027. Currently legal; a content pivot is already on the roadmap before Q2 2027.

## Result
No `BLOCK`/`WARN` conditions. The rebuilt light-theme site is safe to publish/cut over from a compliance standpoint, matching the standards enforced on the daily content-engine pipeline.
