# KIR GSC Indexation Audit — 2026-07-04

Source: GSC Page indexing report (domain property, last update 2026-06-30), read via browser session.
Totals: **582 indexed / 536 not indexed** (7 reasons). Plus 13 "Indexed, though blocked by robots.txt" (/go/ URLs — cosmetic).

## Buckets

| Reason | Pages | Verdict |
|---|---|---|
| Excluded by 'noindex' | 162 | ✅ Intentional (closed/stub casino reviews, ht-faq stubs, off-niche set). Sampled 10 — all `/casino/<stub>/`. No action. |
| Blocked by robots.txt | 113 | ✅ Intentional (`/go/`, `/payment-providers/`, `/casino-services/`). No action. |
| Page with redirect | 110 | ✅ Working WP migration redirects. No action. |
| **Not found (404)** | **56** | 🔧 **Fixable: 47 are `/casino/<slug>/feed/` legacy WP RSS URLs** + `/home/`, embed/case variants, 2 ghost casinos, junk literal-wildcard URLs. Redirect batch below. |
| Blocked other 4xx | 1 | ignore |
| **Crawled – currently not indexed** | **85** | 🔧 Mixed — see classification below. The quality-signal bucket. |
| Discovered – not indexed | 9 | monitor |
| Duplicate w/o canonical | 0 | — |

## "Crawled – currently not indexed" (85) classification

1. **Legacy WP noise (~12):** `/feed/` ×4, `/embed/` ×3, `wp-includes` assets ×2, `casino-index.json`, `sitemap-index.xml` (the last two are normal-not-indexable, fine).
2. **Non-trailing-slash variants (~35):** guide/hub URLs without trailing slash (site enforces `/` via 308) — most crawl dates Feb–Apr, self-resolving; monitor.
3. **Wave-2 consolidation targets (5+):** `suosituimmat-kasinot-ilman-rekisteroitymista-5`, `nopeat-kotiutukset-kasinot-vertailu-6`, `top-pikakasinot-suomi-7`, `verovapaat-kasinot-vertailu-7` etc. — already 301'd in local commits; resolved on deploy.
4. **The "turvallinen/turvallisuus" refusal cluster (~11):** Google crawled and DECLINED these near-duplicate safe-casino guides: `turvallinen-kasinopelaaminen-ilman-rekisteroitymista-2026`, `turvallinen-rekisteroitymisvapaa-kasino-2026-opas`, `turvallisuus-kasinolla-ilman-tilia-opas-suomalaisille`, `turvallisuus-pikakasinoilla-2026-90-pelaajista-luottaa-nopeuteen`, `turvallinen-pelaaminen-vertailu-kasinot-tarjoaa-vastuullisuuden`, `turvallinen-ja-varma-kuinka-tunnistaa-luotettavat-suomalaiset-nettikasinot`, `7-kohdan-turvallisen-kasinon-tarkistuslista`, `opas-turvallisen-kasinon-valintaan`, `turvallisuusvaatimukset-nettikasinoilla-2026`, `turvallisuus-pikakasinoilla-selitettyna`, `turvallisuusvaatimukset-suomalaisilla-nettikasinoilla` (+ related `turvalliset-maksutavat-nettikasinoilla-kattava-opas`, `turvallinen-kasinopelaaminen`-adjacent). **GSC empirically confirms the doorway cluster the consolidation map lacked.** Zero indexation → zero traffic risk to consolidate.
5. **Duplicate-intent triplets Google refuses:** `kasinon-edut-ilman-rekisterointia` / `kasino-ilman-rekisteroitymista-edut-suomalaisille` / `kasinoiden-edut-ilman-rekisteroitymista`; `kasino~kasinot-ilman-rekisteroitymista-ja-vastuullinen-pelaaminen-kuinka-pikakasinot-panostavat-turvallisuuteen` (singular/plural pair!); `askel-askeleelta-*` and `kuinka-pelata-*` variants.
6. **Money hubs appearing as non-slash variants:** `/mga-kasinot`, `/euteller-kasinot`, `/apple-pay-casinot`, `/uudet-kasinot`, `/live-kasinot`, `/kaikki-kasinot`, `/suomen-parhaat-nettikasinot`, `/nettikasinot-luotettavat-kasinot`, `/2026-nettikasinot` — verify the slash-canonical versions are indexed (Ahrefs GSC pages); if not, these join the improve queue.
7. **Real reviews refused:** `/casino/pelikaani-kasino/` (3,507-word real review, crawled 22 May, not indexed — investigate quality/links), plus ghost URLs (no fragment: luckynordic, kanuuna, lonkero, jackie-jackpot*, 21-com, kunkku→renamed, lucky-spins, yoyo*, scibet→renamed, dbosses, swiper, kaahus; *=meta-only stubs).
8. **Off-architecture slot pages (4):** `/pragmatic-play/{great-rhino-megaways-arvostelu, sweet-bonanza-2, wolf-gold-2, John-Hunter-...}` — decide improve vs noindex.
9. **Homepage `/` listed (crawl 2026-02-14)** — stale entry (site ranks keywords; presumably long indexed). Verify via URL inspection; no action unless confirmed.

## 404 bucket (56) → redirect batch (shipped 2026-07-04)

- `/:path+/feed/` → parent (47 URLs), `/:path+/embed/` → parent, bare `/feed/`→`/`
- `/home/` → `/`
- `/casino/kunkku-casino/` → `/casino/kunkku-kasino/` (renamed), `/casino/scibet/` → `/casino/scibet-kasino/` (renamed)
- `/casino/swiper-kasino/`, `/casino/kaahus-casino/` → `/kaikki-kasinot/` (dead, hub convention)
- `/pragmatic-play/john-hunter-and-the-tomb-of-the-scarab-queen-arvostelu/` → live lowercase URL
- `/casino/talismania-casino/` → already covered by existing rule (deploys with Wave 2)
- Left as 404 deliberately: `wp-includes`/`wp-content` assets, literal-wildcard junk (`/*`, `/wp-*.php`), `/~partytown/` (Partytown lib dir — harmless)

## Follow-ups

1. Consolidate the turvallinen refusal cluster + duplicate-intent triplets (batch A.5 — GSC-evidence based).
2. After deploy: GSC → click **VALIDER RETTELSE** (Validate fix) on the 404 and crawled-not-indexed buckets.
3. Watch indexed count (582) and the crawled-not-indexed trend line; expect 404 bucket to drain over 2–6 weeks.
