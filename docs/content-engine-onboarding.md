# KIR — Content Engine integration (ACTIVE, daily)

Integration of **kasinotilmanrekisteroitymista.com** (project KIR) with the
**Matching Visions Content Engine** at
`C:\Users\chrni\Desktop\matching visions projects\content enigne`.

> **STATUS: ONBOARDED & ACTIVE since 2026-06-10.**
> Site slug in the engine: `kasinot-ilman-rekister-itymist`
> Schedule: **7/week (daily)** · mode **feed** · planner slot **05:00 UTC**
> · $5/day budget cap · 45 Finnish topics seeded.
> A site-scoped `articles:read` key ("KIR Astro feed") is in this repo's
> `.env` (gitignored) — it must also be set in Vercel env vars.
>
> Risk note: KIR is in Google-penalty recovery. Daily cadence currently
> publishes only to the **Vercel clone's** `/uutiset/` feed, not the live
> WP domain — re-assess cadence before the domain cutover (a sudden flood
> of templated content on the penalised domain risks re-triggering it).

**Flow (no humans in the loop):** engine planner (hourly cron) → research →
draft → humanize → SEO → **compliance gate** → delivered to this site's feed →
webhook fires → Vercel deploy hook rebuilds this site → loader pulls the feed →
article pages appear under `/uutiset/<slug>/` and on the `/uutiset/` index.

## What was run (idempotent — safe to re-run in the engine repo)

```bash
node --env-file=.env.local scripts/onboard-site.mjs \
  --name "Kasinot ilman rekisteröitymistä" --market fi --language fi \
  --mode feed --per-week 7 --topics kir-topics.txt

node --env-file=.env.local scripts/create-site-key.mjs \
  kasinot-ilman-rekister-itymist --name "KIR Astro feed" --scopes articles:read
```

Topic seeds live in the engine repo as `kir-topics.txt` (45 Finnish
search-intent angles: pikakasinot, Pay N Play, maksutavat, verotus, lisenssit
ja 2026-27 regulaatio, bonusehdot, pelinvalmistajat, vastuullinen
pelaaminen). Opinion/analysis only — **never first-hand "I tested" claims**.

## Remaining manual step (Vercel dashboard)

So new articles trigger automatic rebuilds:

1. Vercel → KIR project → **Settings → Environment Variables**: add
   `CE_API_URL` and `CE_API_KEY` (values in this repo's `.env`).
2. Vercel → **Settings → Git → Deploy Hooks**: create a hook (e.g.
   "content-engine"), then set its URL as the site's `delivery_webhook_url`
   in the engine dashboard (plus a `delivery_webhook_secret`, min 16 chars).
   Vercel deploy hooks don't verify signatures — fine; the hook only triggers
   a rebuild, content is pulled with the API key.

Until step 2 is done, delivered articles accumulate in the feed and appear on
the **next** deploy (any git push) instead of immediately.

## Maintenance

In the engine repo (see its `HOW-TO-USE-CLAUDE.md` for the full ops prompt):

```bash
# Did sites get content? Any failed / needs_review slots?
node --env-file=.env.local scripts/show-calendar.mjs 7

# Top up topics when the pending queue drops under ~2 weeks of cadence (14):
node --env-file=.env.local scripts/add-topics.mjs kasinot-ilman-rekister-itymist <topics.txt>
```

At 7/week the 45 seeded topics last ~6 weeks — top up by late July 2026.

## Compliance reminders (KIR-specific)

- The affiliate disclosure in `src/layouts/ArticleLayout.astro` is
  **mandatory** — the live site was penalised partly for a missing
  disclosure. Never remove it.
- Keep the responsible-gambling notice (Pelaa vastuullisesti, 18+,
  Peluuri.fi) on every article page.
- Affiliate links in delivered articles arrive with
  `rel="sponsored nofollow"` — the loader and layout render the HTML
  verbatim; never strip or rewrite those attributes.
- Regulatory clock: promoting the no-registration model to Finnish traffic
  becomes illegal around **July 2027** — factor that into topic planning.
