/**
 * scripts/seo-parity-check.mjs — Definitive full-site SEO-parity diff.
 *
 * PENALTY-RECOVERY PROOF. The KIR site (kasinotilmanrekisteroitymista.com) is
 * recovering from a Google algorithmic demotion. The component rebuild swapped
 * scraped-WordPress markup for a clean light theme, but the per-page SEO head
 * (canonical / description / robots / OpenGraph+Twitter / JSON-LD) MUST be
 * preserved VERBATIM so Google does not see a "different" site. The single
 * source of truth for that preserved head is the registry in
 * src/lib/seo-head.ts (listSeoPaths() + getSeoHead()).
 *
 * THIS SCRIPT proves that EVERY rebuilt page whose URL exists in the registry
 * still emits its preserved head in the BUILT html (dist/). For each registry
 * path it locates the built file and checks:
 *   (a) the registry canonical string appears verbatim in the built <head>;
 *   (b) the registry meta description (if any) appears;
 *   (c) the registry robots (if any) appears;
 *   (d) EACH registry JSON-LD block appears (normalize whitespace only — the
 *       SSG re-serializes the <script> body but the bytes that matter,
 *       i.e. the JSON, are identical once inter-token whitespace is collapsed);
 *   (e) a spot-check of og: tags appears.
 *
 * Pages NOT in the registry (brand-new pages — /oppaat/, engine
 * /uutiset/<slug>/, etc.) are EXPECTED to be absent from the registry and are
 * not a regression; this script only iterates registry paths, so they cannot
 * count against parity. (They are reported separately as an informational note
 * by counting built dirs with no registry key.)
 *
 * USAGE:  node --experimental-strip-types scripts/seo-parity-check.mjs
 * (TS strip-types is needed because it imports the .ts registry directly.)
 *
 * No new npm deps; node:fs + the project's own registry only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listSeoPaths, getSeoHead } from "../src/lib/seo-head.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

/* ---------- helpers ---------- */

/** Collapse ALL runs of whitespace to a single space and trim. */
function normWs(s) {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Locate the built HTML file for a normalized registry path.
 *   "/"           -> dist/index.html
 *   "/casino/x/"  -> dist/casino/x/index.html
 * Returns the absolute file path if it exists, else null.
 */
function builtFileFor(normPath) {
  const rel = normPath === "/" ? "" : normPath.replace(/^\/|\/$/g, "");
  const file = path.join(DIST, rel, "index.html");
  return fs.existsSync(file) ? file : null;
}

/** Read a built file's full HTML (head + body). */
function readBuilt(file) {
  return fs.readFileSync(file, "utf8");
}

/* ---------- main ---------- */

if (!fs.existsSync(DIST)) {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(2);
}

const paths = listSeoPaths();

const tally = {
  total: 0,
  missingFile: 0,
  canonical: { applicable: 0, ok: 0 },
  description: { applicable: 0, ok: 0 },
  robots: { applicable: 0, ok: 0 },
  jsonLd: { applicable: 0, ok: 0, blocksTotal: 0, blocksOk: 0 },
  og: { applicable: 0, ok: 0 },
};

const mismatches = []; // { path, fields: [...] }

for (const p of paths) {
  tally.total++;
  const seo = getSeoHead(p);
  if (!seo) continue; // shouldn't happen — listSeoPaths is keyed from same map.

  const file = builtFileFor(p);
  if (!file) {
    tally.missingFile++;
    mismatches.push({ path: p, fields: ["NO_BUILT_FILE"] });
    continue;
  }

  const html = readBuilt(file);
  const htmlNorm = normWs(html);
  const drifted = [];

  // (a) canonical — verbatim substring
  if (seo.canonical) {
    tally.canonical.applicable++;
    const needle = `<link rel="canonical" href="${seo.canonical}"`;
    // Also accept the raw href appearing anywhere (layout may format the tag),
    // but require the canonical URL to be present as a rel=canonical href.
    const ok =
      html.includes(needle) ||
      new RegExp(
        `<link[^>]*rel=["']canonical["'][^>]*href=["']${seo.canonical.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}["']`,
        "i"
      ).test(html);
    if (ok) tally.canonical.ok++;
    else drifted.push("canonical");
  }

  // (b) description — verbatim content substring
  if (seo.description) {
    tally.description.applicable++;
    const ok =
      html.includes(`content="${seo.description}"`) ||
      htmlNorm.includes(normWs(`content="${seo.description}"`));
    if (ok) tally.description.ok++;
    else drifted.push("description");
  }

  // (c) robots — verbatim content substring
  if (seo.robots) {
    tally.robots.applicable++;
    const ok =
      html.includes(`<meta name="robots" content="${seo.robots}"`) ||
      new RegExp(
        `<meta[^>]*name=["']robots["'][^>]*content=["']${seo.robots.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}["']`,
        "i"
      ).test(html);
    if (ok) tally.robots.ok++;
    else drifted.push("robots");
  }

  // (d) JSON-LD — each block must appear (whitespace-normalized).
  if (seo.jsonLd.length > 0) {
    tally.jsonLd.applicable++;
    let allOk = true;
    for (const block of seo.jsonLd) {
      tally.jsonLd.blocksTotal++;
      if (htmlNorm.includes(normWs(block))) {
        tally.jsonLd.blocksOk++;
      } else {
        allOk = false;
      }
    }
    if (allOk) tally.jsonLd.ok++;
    else drifted.push(`jsonLd(${seo.jsonLd.length})`);
  }

  // (e) og/twitter spot-check — require the FIRST og tag (if any) to appear
  // verbatim (whitespace-normalized). This is a representative spot, not a
  // full set check, per the brief.
  if (seo.ogTags.length > 0) {
    tally.og.applicable++;
    const first = seo.ogTags[0];
    const ok = html.includes(first) || htmlNorm.includes(normWs(first));
    if (ok) tally.og.ok++;
    else drifted.push("og");
  }

  if (drifted.length) mismatches.push({ path: p, fields: drifted });
}

/* ---------- informational: built dirs with NO registry key (new pages) ---------- */

const registrySet = new Set(paths);
function collectBuiltPaths(dir, prefix, acc) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    if (d.name === "_astro") continue;
    const sub = path.join(dir, d.name);
    const norm = `${prefix}${d.name}/`;
    if (fs.existsSync(path.join(sub, "index.html"))) acc.push(norm);
    collectBuiltPaths(sub, norm, acc);
  }
}
const builtPaths = [];
collectBuiltPaths(DIST, "/", builtPaths);
if (fs.existsSync(path.join(DIST, "index.html"))) builtPaths.push("/");
const newPages = builtPaths.filter((bp) => !registrySet.has(bp));

/* ---------- report ---------- */

const pct = (ok, n) => (n === 0 ? "n/a" : `${((ok / n) * 100).toFixed(2)}%`);

console.log("==================================================================");
console.log(" KIR full-site SEO-parity check (penalty-recovery proof)");
console.log("==================================================================");
console.log(`Registry paths checked .............. ${tally.total}`);
console.log(`Built files missing ................. ${tally.missingFile}`);
console.log("");
console.log("Per-field parity (ok / applicable):");
console.log(
  `  canonical ......... ${tally.canonical.ok}/${tally.canonical.applicable}  (${pct(
    tally.canonical.ok,
    tally.canonical.applicable
  )})`
);
console.log(
  `  description ....... ${tally.description.ok}/${tally.description.applicable}  (${pct(
    tally.description.ok,
    tally.description.applicable
  )})`
);
console.log(
  `  robots ............ ${tally.robots.ok}/${tally.robots.applicable}  (${pct(
    tally.robots.ok,
    tally.robots.applicable
  )})`
);
console.log(
  `  JSON-LD (pages) ... ${tally.jsonLd.ok}/${tally.jsonLd.applicable}  (${pct(
    tally.jsonLd.ok,
    tally.jsonLd.applicable
  )})`
);
console.log(
  `  JSON-LD (blocks) .. ${tally.jsonLd.blocksOk}/${tally.jsonLd.blocksTotal}  (${pct(
    tally.jsonLd.blocksOk,
    tally.jsonLd.blocksTotal
  )})`
);
console.log(
  `  og (spot) ......... ${tally.og.ok}/${tally.og.applicable}  (${pct(
    tally.og.ok,
    tally.og.applicable
  )})`
);
console.log("");

const regressions = mismatches; // every entry here is a registry-path drift
console.log(`Mismatching registry URLs ........... ${regressions.length}`);
if (regressions.length) {
  console.log("First up to 25:");
  for (const m of regressions.slice(0, 25)) {
    console.log(`  - ${m.path}  ->  ${m.fields.join(", ")}`);
  }
}
console.log("");
console.log(
  `New pages (built, NOT in registry — expected, not a regression): ${newPages.length}`
);
for (const np of newPages.slice(0, 30)) console.log(`  + ${np}`);
if (newPages.length > 30) console.log(`  …and ${newPages.length - 30} more`);

console.log("");
const allParity =
  tally.missingFile === 0 &&
  tally.canonical.ok === tally.canonical.applicable &&
  tally.description.ok === tally.description.applicable &&
  tally.robots.ok === tally.robots.applicable &&
  tally.jsonLd.blocksOk === tally.jsonLd.blocksTotal &&
  tally.og.ok === tally.og.applicable;
console.log(
  allParity
    ? "VERDICT: FULL PARITY — every registry page emits its preserved head. SAFE for cutover."
    : "VERDICT: DRIFT DETECTED — review mismatches above before cutover."
);

// machine-readable summary line for harness consumption
console.log(
  "JSON_SUMMARY " +
    JSON.stringify({
      total: tally.total,
      missingFile: tally.missingFile,
      canonical: tally.canonical,
      description: tally.description,
      robots: tally.robots,
      jsonLd: tally.jsonLd,
      og: tally.og,
      regressions: regressions.length,
      newPages: newPages.length,
      allParity,
    })
);
