# KIR — Content Engine onboarding (wiring only, do NOT enable yet)

Integration of **kasinotilmanrekisteroitymista.com** (project KIR) with the
**Matching Visions Content Engine** at
`C:\Users\chrni\Desktop\matching visions projects\content enigne`.

> **STATUS: WIRING ONLY.** The site-side code (loader, `/uutiset/` pages,
> layout) is in place, but the site has **not** been onboarded in the engine
> and **no schedule is enabled**. KIR is in Google-penalty recovery — do not
> turn on automated publishing until the recovery/trust work signs off on it.

**Flow once enabled:** engine planner → research → draft → humanize → SEO →
**compliance gate** → delivered to this site's feed → webhook fires → Vercel
deploy hook rebuilds this site → loader pulls the feed → article pages appear
under `/uutiset/<slug>/` and on the `/uutiset/` index. No humans in the loop.

## Onboarding command (run later, in the engine repo)

Run Claude **in the engine repo** (`content enigne` folder) and use the prompt
in its `HOW-TO-USE-CLAUDE.md`. The onboarding command for KIR:

```bash
node --env-file=.env.local scripts/onboard-site.mjs \
  --name "Kasinot ilman rekisteröitymistä" --market fi --language fi \
  --mode feed --per-week 2 --topics kir-topics.txt
```

- `--market fi --language fi` — both are already supported by the onboarding
  script (markets `uk dk fi se no de global`, languages `en da fi sv no de`).
- `--per-week 2` — **deliberately conservative** (2-3 articles/week max).
  The site suffered an algorithmic demotion partly for thin/templated
  content; a sudden flood of AI articles risks re-triggering the penalty.
- `--mode feed` — delivery mode is **feed** (this Astro site pulls at build
  time), not WordPress.
- Topic seeds (`kir-topics.txt`): Finnish search-intent angles around
  no-registration casinos (pikakasinot, Pay N Play, verotus/Verovapaus,
  maksutavat, lisenssit/regulaatio, vastuullinen pelaaminen) — opinion and
  analysis only, **never first-hand "I tested" claims** (compliance gate
  enforces this, but don't seed topics that invite it).

Status / calendar check (in the engine repo):

```bash
node --env-file=.env.local scripts/show-calendar.mjs 7
```

## One-time setup steps (alongside onboarding)

1. **Engine dashboard → Sites → Add site** — name
   "Kasinot ilman rekisteröitymistä" (done by the onboarding script above).
2. **Dashboard → Keys** — create a **site-scoped** API key with
   `articles:read`.
3. **Vercel project for this repo** — create a **Deploy Hook**
   (Settings → Git → Deploy Hooks) and set it as the site's
   `delivery_webhook_url` in the engine (plus a `delivery_webhook_secret`,
   min 16 chars). Vercel deploy hooks don't verify signatures — that's fine,
   the hook only triggers a rebuild; the actual content is pulled with the
   API key.
4. **Env vars** (locally in `.env`, and in Vercel → Environment Variables —
   see `.env.example`):

   ```
   CE_API_URL=https://<engine-deployment>/v1
   CE_API_KEY=<site-scoped key>
   ```

   Without them the build still succeeds — `/uutiset/` is just empty.

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
  becomes illegal around **July 2027** — factor that into topic planning
  before enabling the schedule.
