/**
 * sync-static-redirects.mjs — fold data/static-redirects.json into vercel.json
 * WITHOUT touching the generated /go/ affiliate rules.
 *
 * scripts/fetch-rest.mjs already performs this merge during the daily WP sync
 * (`vercel.redirects = [...static, ...generated /go/]`), but running it needs
 * the WP origin pinned in /etc/hosts. When a static redirect is added by hand
 * (e.g. the doorway consolidation's retire→survivor 301s), this script applies
 * the SAME merge locally: static rules first, then the /go/ rules currently in
 * vercel.json, preserved verbatim.
 *
 * Refuses to run if vercel.json contains a non-/go/ redirect that is missing
 * from data/static-redirects.json (that would mean the two files diverged some
 * other way — resolve by hand rather than silently dropping a rule).
 *
 *   node scripts/sync-static-redirects.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const staticPath = path.join(ROOT, "data", "static-redirects.json");
const vercelPath = path.join(ROOT, "vercel.json");

const staticRedirects = JSON.parse(fs.readFileSync(staticPath, "utf8"));
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));

const isGo = (r) => typeof r?.source === "string" && r.source.startsWith("/go/");
const current = Array.isArray(vercel.redirects) ? vercel.redirects : [];
const goRules = current.filter(isGo);

// Divergence guard: every non-/go/ rule currently deployed must be present in
// the static file (by source), or we'd silently drop it on this rewrite.
const staticSources = new Set(staticRedirects.map((r) => r.source));
const orphans = current.filter((r) => !isGo(r) && !staticSources.has(r.source));
if (orphans.length > 0) {
  console.error(
    `FATAL: ${orphans.length} non-/go/ redirect(s) in vercel.json are missing from ` +
      `data/static-redirects.json (e.g. "${orphans[0].source}"). Reconcile by hand.`,
  );
  process.exit(1);
}

vercel.redirects = [...staticRedirects, ...goRules];
fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2));
console.log(
  `Wrote ${staticRedirects.length} static + ${goRules.length} /go/ redirect rules to vercel.json`,
);
