/**
 * apply-texts.mjs — post-build "apply editable text blocks" step.
 *
 * Pulls the text-block feed from the Matching Visions Content Engine
 * (same CE_API_URL / CE_API_KEY + Bearer-auth convention as
 * apply-offers.mjs) and rewrites the already-built HTML in dist/ ONLY —
 * src/fragments stays a pristine WordPress mirror (a re-scrape would wipe
 * any marker, which is why this site relies on kind "replace").
 *
 * Feed contract (frozen): GET {CE_API_URL}/text-blocks ->
 *   { site, updatedAt, blocks: [{ blockKey, kind: "marker"|"replace",
 *     pagePath, label, originalText, currentText }] }
 *
 * Apply rule:
 *   - blocks with currentText === originalText are no-ops and skipped
 *   - kind "replace" (the primary kind here): in dist/<pagePath>/index.html,
 *     find the EXACT originalText occurrence in the visible HTML text
 *     (whitespace runs are equivalent — built pages wrap source lines —
 *     and matches never span element boundaries or enter script/style) and
 *     replace it with HTML-escaped currentText. If it is not found exactly
 *     once, warn and skip — never guess.
 *   - kind "marker": elements carrying data-mv-text="<blockKey>" (possible
 *     on @custom pages, never on scraped fragments) get their entire inner
 *     text replaced with HTML-escaped currentText (elements are leaves).
 *
 * Behavior is a strict no-op (exit 0) when the feed is not configured or
 * unreachable: the build must never fail because the dashboard is down.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FETCH_TIMEOUT_MS = 10_000;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(repoRoot, "dist");

function log(msg) {
  console.log(`[texts] ${msg}`);
}
function warn(msg) {
  console.warn(`[texts] WARN: ${msg}`);
}

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function fetchFeed(apiUrl, apiKey) {
  const url = `${apiUrl.replace(/\/$/, "")}/text-blocks`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`text-blocks feed responded ${res.status}`);
  return res.json();
}

/**
 * Replace the EXACT originalText with escaped currentText in the visible
 * text of `html`. Visible text = text segments between tags, excluding
 * <script>/<style> contents; whitespace runs in originalText match any
 * whitespace run in the HTML (the build wraps long source lines). A match
 * must sit inside a single text segment (never spans element boundaries).
 *
 * Returns { html, count }; the replacement only happens when count === 1.
 */
export function replaceVisibleText(html, originalText, currentText) {
  const needle = new RegExp(
    escapeRegExp(originalText.trim()).replace(/\s+/g, "\\s+"),
    "g"
  );

  // Mask script/style bodies so we never match inside them.
  const masked = html.replace(
    /(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,
    (_, open, _tag, body, close) => open + " ".repeat(body.length) + close
  );

  const matches = [];
  const segRe = />([^<]+)</g;
  let seg;
  while ((seg = segRe.exec(masked))) {
    const segStart = seg.index + 1;
    needle.lastIndex = 0;
    let m;
    while ((m = needle.exec(seg[1]))) {
      matches.push({ start: segStart + m.index, end: segStart + m.index + m[0].length });
    }
  }

  if (matches.length !== 1) return { html, count: matches.length };
  const { start, end } = matches[0];
  return {
    html: html.slice(0, start) + escapeHtml(currentText) + html.slice(end),
    count: 1,
  };
}

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(p, out);
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

/** Same minimal .env fallback as apply-offers.mjs (process.env wins; "" disables). */
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

/**
 * Run the apply step. Never throws — exported so the test harness can run
 * it in-process (real HTTP fetch, no cross-process loopback needed).
 */
export async function applyTexts({ apiUrl, apiKey } = {}) {
  const API_URL = apiUrl ?? envOrDotenv("CE_API_URL");
  const API_KEY = apiKey ?? envOrDotenv("CE_API_KEY");
  if (!API_URL || !API_KEY) {
    log("feed not configured, skipping");
    return;
  }

  let feed;
  try {
    feed = await fetchFeed(API_URL, API_KEY);
    if (!Array.isArray(feed?.blocks)) throw new Error("malformed feed: no blocks[]");
  } catch (err) {
    warn(
      `text-blocks feed unavailable (${err?.message ?? err}) — keeping built fallback text, build continues`
    );
    return;
  }

  const blocks = feed.blocks.filter((b) => b && b.blockKey);
  const edited = blocks.filter(
    (b) => typeof b.currentText === "string" && b.currentText !== b.originalText
  );
  log(
    `feed ok (site=${feed.site ?? "?"}, updatedAt=${feed.updatedAt ?? "?"}, ` +
      `${blocks.length} block(s), ${edited.length} edited)`
  );
  if (edited.length === 0) return;

  if (!fs.existsSync(distDir)) {
    warn(`${distDir} not found — run astro build first; nothing to apply`);
    return;
  }

  const markerBlocks = new Map(); // blockKey -> block
  const replaceBlocks = [];
  for (const b of edited) {
    if (b.kind === "marker") markerBlocks.set(b.blockKey, b);
    else if (b.kind === "replace") replaceBlocks.push(b);
    else warn(`block "${b.blockKey}" has unknown kind "${b.kind}" — skipped`);
  }

  let filesTouched = 0;
  const applied = new Map(); // blockKey -> count
  const bump = (key) => applied.set(key, (applied.get(key) ?? 0) + 1);

  // --- kind "replace" (primary): exact visible-text swap on one page ---------
  for (const block of replaceBlocks) {
    const { blockKey, pagePath, originalText, currentText } = block;
    if (typeof originalText !== "string" || !originalText.trim()) {
      warn(`replace block "${blockKey}" has no originalText — skipped`);
      continue;
    }
    const relPath = String(pagePath ?? "").replace(/^\/+|\/+$/g, "");
    const file = path.join(distDir, ...relPath.split("/").filter(Boolean), "index.html");
    if (!fs.existsSync(file)) {
      warn(`replace block "${blockKey}": page ${pagePath} not in dist — skipped`);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    const { html: next, count } = replaceVisibleText(html, originalText, currentText);
    if (count !== 1) {
      warn(
        `replace block "${blockKey}": originalText found ${count} time(s) in ${pagePath} (need exactly 1) — skipped, never guessing`
      );
      continue;
    }
    fs.writeFileSync(file, next, "utf8");
    filesTouched++;
    bump(blockKey);
  }

  // --- kind "marker": data-mv-text elements (@custom pages only) -------------
  if (markerBlocks.size > 0) {
    const MARKER_RE = /<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*\bdata-mv-text="([^"]+)"[^>]*>/g;

    /**
     * Index of the CLOSING tag that matches the element opened just before
     * `from`, tracking nested same-name tags. indexOf of the first `</tag>`
     * would truncate at an inner element (e.g. a <div> icon inside a tagged
     * <div>) and ship unbalanced HTML — tagged elements are EXPECTED to be
     * leaves, but that constraint was never validated, so validate it here.
     * Returns -1 when unbalanced.
     */
    const findMatchingClose = (src, tagName, from) => {
      const pair = new RegExp(`<(/?)${tagName}\\b[^>]*>`, "gi");
      pair.lastIndex = from;
      let depth = 1;
      let t;
      while ((t = pair.exec(src)) !== null) {
        depth += t[1] === "/" ? -1 : 1;
        if (depth === 0) return t.index;
      }
      return -1;
    };
    for (const file of walkHtml(distDir)) {
      let html = fs.readFileSync(file, "utf8");
      if (!html.includes("data-mv-text=")) continue;
      const original = html;

      let out = "";
      let cursor = 0;
      let m;
      MARKER_RE.lastIndex = 0;
      while ((m = MARKER_RE.exec(html))) {
        if (m.index < cursor) continue;
        const [openTag, tagName, key] = m;
        const block = markerBlocks.get(key);
        if (!block) continue;
        // Replace the element's entire inner content, honouring nested
        // same-name tags so the close tag we cut at is the MATCHING one.
        const innerStart = m.index + openTag.length;
        const closeIdx = findMatchingClose(html, tagName, innerStart);
        if (closeIdx === -1) continue;
        out += html.slice(cursor, innerStart) + escapeHtml(block.currentText.trim());
        cursor = closeIdx;
        bump(key);
      }
      out += html.slice(cursor);
      html = out;

      if (html !== original) {
        fs.writeFileSync(file, html, "utf8");
        filesTouched++;
      }
    }
  }

  // --- summary ----------------------------------------------------------------
  log(`summary: ${filesTouched} file(s) touched, ${applied.size} block(s) applied`);
  for (const key of [...applied.keys()].sort()) {
    log(`  ${key}: ${applied.get(key)} replacement(s)`);
  }
  const unmatchedMarkers = [...markerBlocks.keys()].filter((k) => !applied.has(k));
  if (unmatchedMarkers.length) {
    warn(`feed marker keys with no matching data-mv-text elements in dist: ${unmatchedMarkers.sort().join(", ")}`);
  }
}

// CLI entry point (skipped when imported by the test harness).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await applyTexts();
  } catch (err) {
    // never fail the build over the text layer
    warn(`unexpected error (${err?.stack ?? err}) — build continues`);
  }
  process.exit(0);
}
