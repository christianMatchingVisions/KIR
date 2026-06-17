# KIR — Full Domain Migration Plan

**Goal:** make the new Astro site (kir-three.vercel.app) ready to take over the production domain
`kasinotilmanrekisteroitymista.com` via DNS cutover, with **full content + asset + SEO parity**,
**zero tracking/verification loss**, and a posture that **aids** (not repeats) the Google penalty
that the domain is recovering from.

**Status date:** 2026-06-18 · **Source:** evidence-backed audit (`kir-migration-audit` workflow, 7 parallel auditors).

> **EXECUTION STATUS (2026-06-18):** Phases **1 & 2 are implemented, built green, and pushed to `main`**
> (commit `4323793` → staging deploy at kir-three.vercel.app, noindexed). Verified by an engine-disabled
> build: 584 pages, **0 live URLs missing**, JSON-LD restored (Review 265 / Organization 306 / ht-faq 23),
> GA4+GTM+verification live via Partytown, 86 closed/stub casinos noindexed & sitemap-excluded (498 URLs),
> compliance gate PASS, cutover toggle proven both directions.
> **Remaining = owner-gated:** Phase 3 (engine deploy per runbook), Phase 4 (DNS flip), Phase 5 (doorway 301s
> post-cutover), plus the owner-input decisions listed in §8. See §4 tables for per-item ✅ status.
**Constraints (immutable):** WP REST is read-only; never fabricate per-casino data; no first-hand/"tested" claims;
mandatory 18+/Peluuri/affiliate-disclosure; every `/go/` link `rel="sponsored nofollow"`; SEO heads preserved
byte-faithful; the Content Engine is **shared with the OCL project — never break it**.

---

## 1. Readiness scorecard

| Dimension | Readiness | Headline |
|---|---|---|
| URL parity | ✅ Ready | 581/581 live URLs built, **0 missing**; +4 net-new pages |
| Assets & logos | 🟡 Minor gaps | 0 broken local refs (8610 checked), **305/305 logos present**; 2 toplist thumbnails + 3 og:images missing |
| Freshness / delta | ✅ Ready | Scrape current — **0 changes since 2026-06-09**; 2 live casinos not built |
| Redirects & URLs | 🟡 Minor gaps | 479/479 `/go/` covered; **trailing-slash dual-200** + `?p=` shortlinks broken; no 404 page |
| SEO head & schema | 🔴 Major gaps | Canonicals perfect, but **all 306 casino + 22 ht-faq pages lose their JSON-LD** |
| Technical cutover | 🔴 Major gaps | **Analytics + GSC verification go dark**; preview indexable; no cache/security headers |
| Compliance / penalty | 🟡 Minor gaps | Pillars + nofollow perfect, but first-hand claims, doorway clusters, thin E-E-A-T remain |

**Bottom line:** the *content migration is essentially complete*. The remaining work is a focused set of
**cutover-safety fixes** (a few are true blockers) plus a **penalty-recovery hardening** track.

---

## 2. Already green (do not touch — verified parity)

- **581/581 live URLs build** (post 218 / page 35 / casino 305 / ht-faq 23). 0 missing.
- **0 broken local asset references** across all 585 pages (8610 refs / 1526 unique resolved).
- **305/305 casino logos present** and resolving.
- **Canonicals: 585/585 → real domain, 0 → vercel.** No duplicate canonicals. No hreflang needed (fi-only).
- **Compliance pillars on all 585 pages:** 18+, Peluuri, affiliate disclosure (global layout).
- **All 3181 `/go/` anchors carry `rel="sponsored nofollow"`**; `/go/` is robots-disallowed.
- **Scrape is current:** 0 URLs added/changed/removed on live since the 2026-06-10 capture.
- **Strong CWV baseline:** 0 main-thread JS on homepage, 120K CSS, self-hosted Inter (preloaded), lazy images, immutable `_astro` cache.

---

## 3. Findings by severity (the work-list)

### 🔴 Blockers — must fix before DNS flips
- **B1 — Analytics & Search Console go dark.** GA4 `G-72MZEB7RDD`, GTM `GT-5DCRZLHV`, and **two `google-site-verification`** meta tags are on live but in **0 dist files** (`seo-head.ts` intentionally drops `<script>`/verification). Flipping DNS stops data collection *and* can drop GSC verification mid-recovery — exactly when impression/position data is needed.
- **B2 — Casino + ht-faq structured data lost.** All **306 casino pages lose live `Organization` + `Review` JSON-LD** (Review on 265 live pages); **22/23 ht-faq lose `Organization`**. Root cause: schema lives in `body.html`, but `seo-head.ts` extracts only from `head.html`. The build also injects a `FAQPage` that wasn't on live. Biggest SEO regression in the build.

### 🟠 High — fix before cutover
- **H1 — Vercel preview is indexable.** `kir-three.vercel.app` has no `X-Robots-Tag: noindex`; crawlable staging during active penalty recovery.
- **H2 — Trailing-slash dual-200.** Vercel serves `/x` and `/x/` both 200; live 301s no-slash→slash. Duplicate-content / canonicalization mismatch. (`vercel.json` has no `trailingSlash`.)
- **H3 — Thin engine-demo pages indexable.** `/oppaat/engine-guide-talletukset/` and `/uutiset/engine-news-uutinen/` ship with dummy `"Guide desc"`/`"News desc"` metadata, ~1.7KB body, indexable, in the sitemap.
- **H4 — 2 live casinos not built.** `yoyo-casino` and `jackie-jackpot` are published+indexable on live (in `casino.json`, not in the sitemap/fragments) → would **404 on cutover**.
- **H5 — First-hand "tested" claims on 10 pages** (`testasimme`/`kokeilimme`/`olemme testanneet`) inherited from scrape — fabricated-experience E-E-A-T risk, violates the no-first-hand constraint.
- **H6 — Doorway pattern: ~42 numbered/dated near-duplicate money pages** (~12 clusters, e.g. `top-pikakasinot-suomi-5/-7`, `-vertailu-6`). Leading penalty hypothesis.
- **H7 — Thin E-E-A-T.** 0/305 reviews carry author/Organization schema; `/meista/` is a privacy policy with a placeholder author (`norskcasino_user3281`) and off-domain contact (`admin@trafficpuma.com`).

### 🟡 Medium
- **M1 —** 7 casino pages missing a meta description (`hupislots, kumobet-ccasino, quickz-casino, spinnair, superonni, tikkari-casino, urho-casino`).
- **M2 —** No cache headers: fonts + `/wp-content` images are `max-age=0, must-revalidate` (CWV/bandwidth regression).
- **M3 —** Missing security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`); HSTS already present.
- **M4 —** WP shortlinks `/?p=<id>` 301 on live but return the homepage (200) on Vercel — broken legacy entry points (~258 ids).
- **M5 —** 61 dofollow outbound links to game-provider domains (`fugaso/endorphina/pragmaticplay`) lack `nofollow`.
- **M6 —** 2 toplist thumbnails missing (`buumi-3-647x300.png`, `kakadu-2-393x300.png`) — present full-size; live has the variants.
- **M7 —** `FAQPage` schema injected on 219 casino pages was never on live — validate it's on-page and doesn't conflict with restored `Review` schema.

### ⚪ Low / cosmetic
- **L1 —** No custom 404 page (Vercel default served; 404 status is correct).
- **L2 —** og:image missing on 3 net-new pages (`/oppaat/`, 2 engine stubs).
- **L3 —** `/sitemap_index.xml` (old WP path, in live robots.txt) → 404 on new site; add compat redirect to `/sitemap-index.xml`.
- **L4 —** `/feed/`, `/comments/feed/`, `/page/N`, uppercase paths: live 200, new 404. Non-canonical surfaces — 404 acceptable; optional `/feed/ → /` redirect for subscribers.
- **L5 —** 12 shortpixel-proxied Supabase images on 4 article pages depend on a third-party CDN (not self-hosted).
- **L6 —** 1 broken external anchor (`http://uusimmat kasinot`, space in URL) in `casinobuck` fragment.
- **L7 —** 86/305 thin review pages (25 open stubs + 61 closed `Suljettu`) — candidates for engine-fill / noindex.

---

## 4. The migration — phased plan with agent teams

Execution is organised into **named agent teams** (parallel workstreams). Each team gets a self-contained
brief; teams within a phase run concurrently; phases are gated. Effort: **S** ≤ ½ day, **M** ≈ 1 day, **L** = multi-day.

### Phase 1 — Parity hardening *(pre-cutover, blocks the flip)*
Everything that would lose signal/tracking/SEO the moment DNS flips. **Gate: head-parity diff + curl checks pass.**

| Team | Owns (findings) | Key tasks | Effort |
|---|---|---|---|
| **A · SEO-Schema** | B2, M1, M7, L2 | Restore `Organization`+`Review` JSON-LD from each casino `body.html` and the `Organization` from ht-faq bodies (mirror `seo-head.ts` head extraction, re-emit verbatim); validate restored schema coexists with the new `FAQPage` (Rich Results Test ×3); add 7 missing fi meta descriptions (confirm vs live); add og:image+robots to `/oppaat/` hub. | M |
| **B · Analytics-Verify** | B1 | Re-inject GA4 `G-72MZEB7RDD` + GTM `GT-5DCRZLHV` into `BaseLayout` via **`@astrojs/partytown`** (preserve 0-main-thread-JS); add both `google-site-verification` meta verbatim **and** add a DNS TXT verification in GSC as belt-and-suspenders; decide cookie-consent (EU igaming likely requires one). | M |
| **C · Redirects-URL** | H2, H4, M4, L1, L3, L4 | Add `"trailingSlash": true` to `vercel.json` (308 no-slash→slash); resolve `yoyo-casino`+`jackie-jackpot` (scrape into fragments **or** 301); build `?p=<id>→slug` map (~258 rules via `has` query match); add `src/pages/404.astro` (branded, 18+/Peluuri, noindex); add `/sitemap_index.xml → /sitemap-index.xml` (308); decide `/feed/` handling. | M |
| **D · Infra-Headers** | H1, M2, M3 | Add `vercel.json` `headers`: immutable 1yr cache for `/fonts/(.*)`, long cache for `/wp-content/uploads/(.*)` + `/og/(.*)`; `X-Content-Type-Options/X-Frame-Options/Referrer-Policy` on all routes; **conditional `X-Robots-Tag: noindex` for the preview host only** (removed for the real domain at cutover via `VERCEL_ENV`/host check). | M |
| **E · Asset-Finish** | M6, L2, L5, L6 | Fetch the 2 missing rlaaf thumbnails into `public/wp-content/uploads/...`; add og card for net-new pages; fix the `casinobuck` broken anchor; (optional) self-host the 12 Supabase images; wire `audit-assets`/`audit-logos`/`rlaaf-image` checks as a pre-deploy CI gate. | S–M |

**Phase 1 gate:** rebuild + redeploy → (1) head-parity diff of 5 live-vs-built URLs (casino/post/page/ht-faq) shows matching canonical/title/description/JSON-LD types; (2) `curl -I` confirms GA4/GTM + verification present, `/x` redirects to `/x/`, 404.html returns 404, fonts/images immutable, security headers present, **preview host noindexed**; (3) 0 broken assets.

### Phase 2 — Compliance & penalty hardening *(pre-cutover where cheap; structural items post)*
**Gate: build-time compliance grep gates pass; About/editorial live.**

| Team | Owns (findings) | Key tasks | Effort |
|---|---|---|---|
| **F · Compliance-Copy** | H5, M5 | Rewrite the 10 first-hand-claim fragments into neutral/sourced phrasing (incl. `/meista/` line); add `nofollow` (keep `noopener`) to the 61 game-provider outbound links with an authority/RG allowlist; add **build-time grep gates** that fail CI on first-hand verbs or a missing-`nofollow` regression (survives re-sync). | M |
| **G · E-E-A-T** | H7 | Author a real About + "how we rate casinos" editorial-methodology page (named publisher/reviewer, on-domain contact); replace `norskcasino_user3281` + `trafficpuma.com`; attach consistent `Organization` (publisher) + named-author `Person` JSON-LD to the 305 reviews via the layer (no prose edits). | M |
| **H · Thin-Content** | H3, L7 | `noindex` (+ sitemap-exclude) the 61 closed + 25 unfilled-stub reviews; `noindex`/remove the 2 engine-demo pages; add a build gate failing any **new** indexable URL with < ~3000 visible chars. | M |

### Phase 3 — Content Engine go-live *(parallel with 1–2; fills the 25 open stubs)*
Owner-executed per **`docs/engine-reviews-runbook.md`** (apply migration → deploy Railway → enable
`news,guide,review` streams → pilot `enqueue-reviews-kir` → confirm Vercel env). `getCasino()` already
promotes a stub out of `showNoReview` when the engine supplies pros/cons/ratings/summary — so filled
stubs become real reviews automatically. **Must not break OCL** (changes are additive/gated). Replaces the
two thin engine-demo pages with real content (closing H3 the right way).

### Phase 4 — DNS cutover *(the flip)*
**Gate: Phases 1–2 gates green on the production build.**
1. **T-24/48h:** lower TTL on current `kasinotilmanrekisteroitymista.com` A/CNAME to ≤300s.
2. **T-24h:** final delta re-sync (`npm run sync:content`) + URL-parity diff; **block if `new_since_scrape > 0`** until built; rebuild; re-confirm 585 pages + canonical parity.
3. Add **apex + www** as domains in the Vercel project; set primary + 308 apex↔www; let Vercel provision SSL + Force-HTTPS.
4. **Flip:** apex A → `76.76.21.21` (or Vercel ALIAS), `www` CNAME → `cname.vercel-dns.com`; wait for SSL "Valid" + domain "Verified"; **remove the preview noindex for the production host in the same deploy.**
5. **Verify:** `curl -I` real domain → 200, **no** noindex, HSTS + security headers, canonical = self; robots.txt + sitemap resolve; spot-check 10 URLs across types; **submit sitemap in GSC + request reindex** of key pages.
6. **Keep WordPress origin warm 48–72h** as rollback target.

### Phase 5 — Post-cutover recovery *(structural, GSC/Ahrefs-driven)*
- **H6 doorway consolidation:** map the ~12 clusters; per cluster pick the ranking page (GSC/Ahrefs), **301 the weak near-twins into it** (or `noindex,follow`); re-point internal links. Never mass-delete — preserve equity via redirects.
- Monitor GSC coverage/impressions/position daily for 2–4 weeks; watch for crawl errors, soft-404s, indexing drops.
- Ongoing: Content Engine daily fi articles (`/uutiset/`), guides (`/oppaat/`), and stub-review fills.

---

## 5. Dependency & sequencing summary

```
Phase 1 (A,B,C,D,E ‖)  ─┐
Phase 2 (F,G,H ‖)      ─┼─► Phase 1+2 GATE ─► Phase 4 cutover ─► Phase 5 recovery
Phase 3 (engine) ‖ ────┘        (head-parity + curl + compliance gates)
```
- Phases 1, 2, 3 run **in parallel**. Phase 4 requires the **combined Phase 1+2 gate**.
- Phase 3 (engine) is owner-gated and can land before *or* shortly after cutover (graceful either way).
- Phase 5 begins only **after** a verified, stable cutover (parity preserved first).

## 6. Rollback
TTL is pre-lowered, so rollback = re-point apex/www to the WordPress host (warm for 72h). Triggers:
sustained GSC indexing/position regression, SSL/verification failure, or >X% 404 spike. The build is
additive/reversible (noindex toggles, redirect rules, layer-injected schema) — no destructive content changes.

## 7. Definition of done (cutover-ready)
- [ ] B1, B2, H1, H2, H3, H4 closed and verified by curl/Rich-Results/head-diff.
- [ ] Phase 1 + Phase 2 gates green on the production build.
- [ ] Final delta re-sync clean (`new_since_scrape = 0`); 585 pages; canonical parity intact.
- [ ] GA4/GTM collecting; GSC verified (meta **and** DNS TXT); sitemap submitted.
- [ ] WordPress kept warm as rollback for ≥48h post-flip.
