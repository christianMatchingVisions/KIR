/**
 * check-build.mjs — final build guard (CI gate).
 *
 * Fails the build (exit 1) if the generated dist/ HTML contains a known
 * regression liability. This runs LAST in the build chain so a bad deploy is
 * blocked before it ships to a penalty-recovering domain.
 *
 * Guards:
 *   1. Placeholder author `norskcasino_user3281` — a sister-site username that
 *      leaked into preserved JSON-LD. seo-head.ts sanitises it at build time;
 *      this guard ensures it can never silently reappear (e.g. a re-scrape that
 *      bypasses the sanitiser).
 *   2. Unrendered template literal in a link/src attribute (e.g. href="${...}")
 *      — an SSR/hydration escaping bug that ships a broken, uncrawlable link.
 *      We strip <script>/<style> first so legitimate inline-JS template strings
 *      do not false-positive.
 *
 * Add new invariants here as templates evolve.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(repoRoot, "dist");

function log(msg) {
  console.log(`[check-build] ${msg}`);
}

/** Recursively collect every .html file under dir. */
function htmlFiles(dir) {
  const out = [];
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) out.push(...htmlFiles(full));
    else if (dirent.isFile() && full.endsWith(".html")) out.push(full);
  }
  return out;
}

const PLACEHOLDER_AUTHOR = /norskcasino_user3281/i;
const UNRENDERED_ATTR = /(?:href|src)=["']\$\{/i;
// Legacy WordPress sitemap path. The live + submitted sitemap is
// `/sitemap-index.xml` (hyphen); the underscore form `/sitemap_index.xml` 404s
// and a failed duplicate was sitting in Search Console. The new chrome links the
// hyphen form, but the scraped fragment footers still carry the underscore one —
// this guard fails the build if it ever leaks into RENDERED page HTML (outside
// <script>/<style>), so a fragmentProse fallback can never re-surface it.
const BAD_SITEMAP = /sitemap_index\.xml/i;

function main() {
  if (!fs.existsSync(distDir)) {
    log(`dist/ not found at ${distDir} — nothing to check (skipping).`);
    return;
  }

  const files = htmlFiles(distDir);
  const violations = [];

  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(repoRoot, file);

    if (PLACEHOLDER_AUTHOR.test(html)) {
      violations.push(`${rel}: contains placeholder author "norskcasino_user3281"`);
    }
    // Strip scripts/styles so inline-JS template strings don't false-positive.
    const noScript = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");
    if (UNRENDERED_ATTR.test(noScript)) {
      violations.push(`${rel}: unrendered template literal in href/src attribute`);
    }
    if (BAD_SITEMAP.test(noScript)) {
      violations.push(`${rel}: references legacy sitemap_index.xml (use /sitemap-index.xml)`);
    }
  }

  log(`scanned ${files.length} HTML file(s).`);

  if (violations.length > 0) {
    console.error(`[check-build] FAILED — ${violations.length} violation(s):`);
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }

  log("OK — no regressions found.");
}

main();
