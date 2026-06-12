/**
 * apply-offers.mjs — post-build "apply offers" step.
 *
 * Pulls the casino-offer feed from the Matching Visions Content Engine
 * (same CE_API_URL / CE_API_KEY + Bearer-auth convention as
 * src/lib/content-engine-loader.ts) and rewrites the pre-captured RLAAF
 * toplist JSON in dist/rlaaf-data/. Operates on dist/ ONLY — the repo copy
 * under public/rlaaf-data stays a pristine WordPress snapshot and is the
 * fallback whenever the feed is unavailable.
 *
 * Behavior is a strict no-op (exit 0) when the feed is not configured or
 * unreachable: the build must never fail because the dashboard is down.
 *
 * Feed contract (frozen): GET {CE_API_URL}/offers ->
 *   { site, updatedAt, offers: [{ casinoSlug, name, logoUrl|null,
 *     rating|null, bonusText, ctaUrl, status: "active"|"paused" }],
 *     toplists: [{ key, name, entries: [{ casinoSlug, position,
 *     bonusTextOverride|null }] }] }
 *
 * Slug matching (must agree with the dashboard seeder, which keys offers by
 * the WordPress post_name): each captured entry is matched primarily by its
 * sanitized post_name (the canonical WP slug, e.g. "kumobet-ccasino" — WP
 * typos and all), with a title-derived fallback (lowercase post_title,
 * ä->a / ö->o, non-alphanumeric runs -> single hyphen, trimmed).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Feed toplist key -> dist/rlaaf-data/<dir> mapping. Extend as the
 * dashboard grows more curated lists. Keys not in this table fall back to
 * a directory of the same name when one exists (e.g. a feed toplist keyed
 * "search-two-casino-bonus" maps onto that captured list directly).
 */
const TOPLIST_KEY_MAP = {
  etusivu: "search-service-casino", // homepage list (dist/index.html init-settings)
};

const FETCH_TIMEOUT_MS = 10_000;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rlaafDistDir = path.join(repoRoot, "dist", "rlaaf-data");

/** Title-derived fallback slug (used when post_name doesn't match the feed). */
export function deriveSlug(title) {
  return String(title)
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Candidate slugs for a captured entry, in match-priority order: the
 * sanitized WordPress post_name first (the dashboard seeder's key), then
 * the title-derived fallback.
 */
export function entrySlugs(entry) {
  const fromName = entry?.post_name
    ? String(entry.post_name)
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : null;
  const fromTitle = deriveSlug(entry?.post_title ?? "");
  return fromName && fromName !== fromTitle ? [fromName, fromTitle] : [fromTitle];
}

/** First candidate slug present in the given Map/Set, else undefined. */
function matchSlug(entry, lookup) {
  return entrySlugs(entry).find((s) => lookup.has(s));
}

function log(msg) {
  console.log(`[offers] ${msg}`);
}
function warn(msg) {
  console.warn(`[offers] WARN: ${msg}`);
}

async function fetchFeed(apiUrl, apiKey) {
  const url = `${apiUrl.replace(/\/$/, "")}/offers`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`offers feed responded ${res.status}`);
  return res.json();
}

/** Load every page-N.json of one list dir, concatenated in page order. */
function loadList(listDir) {
  const pageFiles = fs
    .readdirSync(listDir)
    .filter((f) => /^page-\d+\.json$/.test(f))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  if (pageFiles.length === 0) return null;

  const firstPage = JSON.parse(
    fs.readFileSync(path.join(listDir, pageFiles[0]), "utf8")
  );
  const postsPerPage = Number(firstPage.pagination?.posts_per_page) || 20;

  const entries = [];
  for (const file of pageFiles) {
    const page = JSON.parse(fs.readFileSync(path.join(listDir, file), "utf8"));
    if (Array.isArray(page.results)) entries.push(...page.results);
  }
  return {
    entries,
    postsPerPage,
    // keep the original string-vs-number typing of the WP payload
    postsPerPageRaw: firstPage.pagination?.posts_per_page ?? String(postsPerPage),
    pageFiles,
  };
}

/** Re-chunk entries into page-N.json files; delete surplus stale pages. */
function writeList(listDir, list) {
  const { entries, postsPerPage, postsPerPageRaw, pageFiles } = list;
  const maxPages = Math.max(1, Math.ceil(entries.length / postsPerPage));
  for (let i = 0; i < maxPages; i++) {
    const payload = {
      pagination: {
        page: String(i + 1),
        max_pages: maxPages,
        posts_per_page: postsPerPageRaw,
      },
      results: entries.slice(i * postsPerPage, (i + 1) * postsPerPage),
    };
    fs.writeFileSync(
      path.join(listDir, `page-${i + 1}.json`),
      JSON.stringify(payload)
    );
  }
  // remove pages made obsolete by paused-casino removals
  for (const file of pageFiles) {
    const n = Number(file.match(/\d+/)[0]);
    if (n > maxPages) fs.rmSync(path.join(listDir, file));
  }
}

function applyOfferToEntry(entry, offer) {
  entry.meta = entry.meta || {};
  entry.meta.no_deposit = offer.bonusText;
  entry.meta.cta = offer.ctaUrl;
  if (offer.logoUrl != null) {
    if (entry.meta.card_image && typeof entry.meta.card_image === "object") {
      entry.meta.card_image.url = offer.logoUrl;
    } else {
      entry.meta.card_image = { url: offer.logoUrl };
    }
  }
}

function reorderByFeed(entries, feedEntries) {
  // position in feed -> rank; matched entries first in feed order,
  // unmatched keep their original relative order AFTER the feed-ordered ones
  const rank = new Map();
  for (const fe of [...feedEntries].sort((a, b) => a.position - b.position)) {
    if (!rank.has(fe.casinoSlug)) rank.set(fe.casinoSlug, rank.size);
  }
  const matched = [];
  const rest = [];
  for (const entry of entries) {
    if (matchSlug(entry, rank) !== undefined) matched.push(entry);
    else rest.push(entry);
  }
  matched.sort(
    (a, b) => rank.get(matchSlug(a, rank)) - rank.get(matchSlug(b, rank))
  );
  return [...matched, ...rest];
}

/**
 * Minimal .env fallback (no dependencies): Astro/Vite loads .env for the
 * article loader, but this script runs as plain Node after the build. On
 * Vercel the vars are real environment variables; locally we read .env so
 * both feeds share the exact same configuration. process.env wins, and an
 * explicitly empty value ("") disables the feed.
 */
function envOrDotenv(name) {
  if (process.env[name] !== undefined) return process.env[name];
  try {
    const raw = fs.readFileSync(path.join(repoRoot, ".env"), "utf8");
    const m = raw.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`, "m"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    /* no .env — fine */
  }
  return undefined;
}

async function main() {
  const apiUrl = envOrDotenv("CE_API_URL");
  const apiKey = envOrDotenv("CE_API_KEY");
  if (!apiUrl || !apiKey) {
    log("feed not configured, skipping");
    return;
  }

  let feed;
  try {
    feed = await fetchFeed(apiUrl, apiKey);
  } catch (err) {
    warn(
      `offers feed unavailable (${err?.message ?? err}) — keeping captured snapshot, build continues`
    );
    return;
  }

  const offers = Array.isArray(feed?.offers) ? feed.offers : [];
  const toplists = Array.isArray(feed?.toplists) ? feed.toplists : [];
  log(
    `feed ok (site=${feed?.site ?? "?"}, updatedAt=${feed?.updatedAt ?? "?"}, ` +
      `${offers.length} offer(s), ${toplists.length} toplist(s))`
  );

  if (!fs.existsSync(rlaafDistDir)) {
    warn(`${rlaafDistDir} not found — run astro build first; nothing to apply`);
    return;
  }

  const offerBySlug = new Map();
  const pausedSlugs = new Set();
  for (const offer of offers) {
    offerBySlug.set(offer.casinoSlug, offer);
    if (offer.status === "paused") pausedSlugs.add(offer.casinoSlug);
  }
  const toplistByDir = new Map();
  for (const toplist of toplists) {
    const dir =
      TOPLIST_KEY_MAP[toplist.key] ??
      (fs.existsSync(path.join(rlaafDistDir, toplist.key)) ? toplist.key : null);
    if (dir) toplistByDir.set(dir, toplist);
    else warn(`feed toplist key "${toplist.key}" matches no captured list — ignored`);
  }

  const matchedFeedSlugs = new Set();
  const stats = []; // per-list summary rows
  let totalOverridden = 0;
  let totalRemoved = 0;

  const listDirs = fs
    .readdirSync(rlaafDistDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const dirName of listDirs) {
    const listDir = path.join(rlaafDistDir, dirName);
    const list = loadList(listDir);
    if (!list) continue;

    let overridden = 0;
    const before = list.entries.length;

    // 1) paused casinos disappear from every list
    list.entries = list.entries.filter((entry) => {
      const slug = matchSlug(entry, pausedSlugs);
      if (slug !== undefined) {
        matchedFeedSlugs.add(slug);
        return false;
      }
      return true;
    });
    const removed = before - list.entries.length;

    // 2) per-casino overrides from active offers
    for (const entry of list.entries) {
      const slug = matchSlug(entry, offerBySlug);
      if (slug === undefined) continue;
      const offer = offerBySlug.get(slug);
      matchedFeedSlugs.add(slug);
      applyOfferToEntry(entry, offer);
      overridden++;
    }

    // 3) feed-driven ordering + per-list bonus overrides
    const toplist = toplistByDir.get(dirName);
    let reordered = false;
    if (toplist && Array.isArray(toplist.entries) && toplist.entries.length > 0) {
      list.entries = reorderByFeed(list.entries, toplist.entries);
      for (const fe of toplist.entries) {
        if (fe.bonusTextOverride == null) continue;
        const entry = list.entries.find((e) =>
          entrySlugs(e).includes(fe.casinoSlug)
        );
        if (entry) {
          entry.meta = entry.meta || {};
          entry.meta.no_deposit = fe.bonusTextOverride;
        }
      }
      reordered = true;
    }

    if (overridden > 0 || removed > 0 || reordered) {
      writeList(listDir, list);
      stats.push({
        list: dirName,
        casinos: list.entries.length,
        overridden,
        removed,
        reordered: reordered ? `yes (${toplist.key})` : "no",
      });
      totalOverridden += overridden;
      totalRemoved += removed;
    }
  }

  const unmatched = offers
    .map((o) => o.casinoSlug)
    .filter((slug) => !matchedFeedSlugs.has(slug));

  log(`summary: ${stats.length} list(s) touched, ${totalOverridden} override(s), ${totalRemoved} paused removal(s)`);
  if (stats.length > 0) console.table(stats);
  if (unmatched.length > 0) {
    warn(`unmatched feed slugs (no rlaaf casino matched): ${unmatched.join(", ")}`);
  }
}

main().catch((err) => {
  // never fail the build over the offers layer
  warn(`unexpected error (${err?.stack ?? err}) — build continues`);
  process.exitCode = 0;
});
