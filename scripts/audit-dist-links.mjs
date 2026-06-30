#!/usr/bin/env node
/**
 * scripts/audit-dist-links.mjs — rendered internal-link audit (CI gate).
 *
 * WHY (SEO audit Phases 3 + 4): the crawl found internal links that 404 and a
 * large tail of internal links missing the trailing slash that
 * `trailingSlash: "always"` requires (each a needless 301). This script walks
 * the BUILT dist/ HTML and verifies every visible internal page link:
 *   - FATAL  : the target route does not exist in dist (a real internal 404), or
 *              a rendered reference to the legacy /sitemap_index.xml.
 *   - WARNING: the target exists but the link omits the trailing slash (301 hop).
 *
 * Trailing-slash misses are reported, not fatal, by default — they degrade to a
 * single 301, never a broken page, and hard-gating a production deploy on them
 * is too brittle. Pass `--strict` to make them fatal too (e.g. in a dedicated
 * hygiene check). Internal 404s are ALWAYS fatal.
 *
 * Link classification mirrors src/lib/html-links.ts (kept in sync by hand — this
 * is plain Node with no TS import). Ignored: in-page #hashes, mailto:/tel:/
 * javascript:/data:, external URLs, affiliate /go/, assets with file extensions,
 * and /wp-json//wp-content//wp-admin//feed//embed endpoints.
 *
 * USAGE:  node scripts/audit-dist-links.mjs [--strict]
 * EXIT:   0 = PASS, 1 = FAIL (internal 404 found, or slash miss under --strict).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(repoRoot, "dist");
const STRICT = process.argv.includes("--strict");
const SITE_HOST = "kasinotilmanrekisteroitymista.com";

const ASSET_EXT =
  /\.(?:png|jpe?g|webp|avif|gif|svg|ico|css|js|mjs|cjs|json|xml|txt|pdf|zip|csv|woff2?|ttf|eot|mp4|webm|mp3|wav)$/i;

function log(msg) {
  console.log(`[audit-links] ${msg}`);
}

/** Root-relative paths that are not normalisable pages (mirror html-links.ts). */
function isExcludedInternalPath(p) {
  if (/^\/go\//i.test(p)) return true;
  if (/^\/wp-json\//i.test(p)) return true;
  if (/^\/wp-content\//i.test(p)) return true;
  if (/^\/wp-admin\//i.test(p)) return true;
  if (/\/feed\/?$/i.test(p)) return true;
  if (/\/embed\/?$/i.test(p)) return true;
  if (ASSET_EXT.test(p)) return true;
  return false;
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

function stripScriptsStyles(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
}

/** Strip a same-origin scheme+host (or protocol-relative host) from an href. */
function stripSelfOrigin(href) {
  return href
    .replace(new RegExp(`^https?://${SITE_HOST}`, "i"), "")
    .replace(new RegExp(`^//${SITE_HOST}`, "i"), "");
}

/** Does the route exist in dist as <path>/index.html (or <path>.html, or /)? */
function routeExists(pathPart) {
  if (pathPart === "/" || pathPart === "") {
    return fs.existsSync(path.join(distDir, "index.html"));
  }
  const clean = pathPart.replace(/^\/+|\/+$/g, "");
  const parts = clean.split("/");
  const asDir = path.join(distDir, ...parts, "index.html");
  const asFile = path.join(distDir, ...parts) + ".html";
  return fs.existsSync(asDir) || fs.existsSync(asFile);
}

const HREF_RE = /<a\b[^>]*?\shref=(?:"([^"]*)"|'([^']*)')/gi;

function main() {
  if (!fs.existsSync(distDir)) {
    log(`dist/ not found at ${distDir} — nothing to check (skipping).`);
    return;
  }

  const files = htmlFiles(distDir);
  const broken = []; // FATAL: internal 404
  const slashMiss = []; // WARN (or FATAL under --strict): missing trailing slash
  const legacySitemap = []; // FATAL: rendered /sitemap_index.xml
  let internalLinkCount = 0;

  for (const file of files) {
    const rel = path.relative(distDir, file).replace(/\\/g, "/");
    const html = stripScriptsStyles(fs.readFileSync(file, "utf8"));

    if (/sitemap_index\.xml/i.test(html)) {
      legacySitemap.push(rel);
    }

    let m;
    HREF_RE.lastIndex = 0;
    const seen = new Set(); // de-dupe identical hrefs within one page
    while ((m = HREF_RE.exec(html)) !== null) {
      const rawHref = (m[1] ?? m[2] ?? "").trim();
      if (!rawHref || seen.has(rawHref)) continue;
      seen.add(rawHref);

      if (/^(#|mailto:|tel:|javascript:|data:)/i.test(rawHref)) continue;

      const pathPart = stripSelfOrigin(rawHref).split(/[?#]/)[0];
      // Still has a host → external link.
      if (/^(?:https?:)?\/\//i.test(pathPart)) continue;
      if (!pathPart.startsWith("/")) continue;
      if (isExcludedInternalPath(pathPart)) continue;

      internalLinkCount++;

      if (!routeExists(pathPart)) {
        broken.push({ file: rel, href: rawHref });
      } else if (!pathPart.endsWith("/")) {
        slashMiss.push({ file: rel, href: rawHref });
      }
    }
  }

  const bar = "─".repeat(64);
  console.log(bar);
  console.log("KIR rendered internal-link audit — dist/");
  console.log(bar);
  console.log(`HTML files scanned:     ${files.length}`);
  console.log(`Internal page links:    ${internalLinkCount}`);
  console.log("");

  let failed = false;

  if (legacySitemap.length === 0) {
    console.log("PASS  legacy sitemap        no rendered /sitemap_index.xml");
  } else {
    failed = true;
    console.log(`FAIL  legacy sitemap        ${legacySitemap.length} page(s) reference /sitemap_index.xml:`);
    for (const f of legacySitemap.slice(0, 25)) console.log(`        ${f}`);
    if (legacySitemap.length > 25) console.log(`        … and ${legacySitemap.length - 25} more`);
  }

  if (broken.length === 0) {
    console.log("PASS  internal 404          every internal page link resolves in dist");
  } else {
    failed = true;
    console.log(`FAIL  internal 404          ${broken.length} link(s) point at a missing route:`);
    for (const b of broken.slice(0, 50)) console.log(`        ${b.file}  ->  ${b.href}`);
    if (broken.length > 50) console.log(`        … and ${broken.length - 50} more`);
  }

  if (slashMiss.length === 0) {
    console.log("PASS  trailing slash        every internal page link ends in '/'");
  } else {
    const label = STRICT ? "FAIL" : "WARN";
    if (STRICT) failed = true;
    console.log(`${label}  trailing slash        ${slashMiss.length} internal link(s) miss the trailing slash (301):`);
    for (const s of slashMiss.slice(0, 50)) console.log(`        ${s.file}  ->  ${s.href}`);
    if (slashMiss.length > 50) console.log(`        … and ${slashMiss.length - 50} more`);
    if (!STRICT) console.log("      (informational — each is a single 301, not a 404; run with --strict to gate)");
  }

  console.log(bar);
  if (failed) {
    console.log("RESULT: FAIL — see above.");
    process.exit(1);
  }
  console.log("RESULT: PASS — rendered internal links are clean.");
}

main();
