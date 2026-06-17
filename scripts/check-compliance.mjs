#!/usr/bin/env node
/**
 * scripts/check-compliance.mjs — RE-SYNC COMPLIANCE GATE (pure Node, no deps)
 *
 * WHY THIS EXISTS
 * ---------------
 * kasinotilmanrekisteroitymista.com is in Google penalty recovery. Two rules are
 * non-negotiable and were enforced by hand across src/fragments:
 *
 *   1. NO FIRST-HAND / "we tested it ourselves" CLAIMS in the scraped corpus.
 *      An affiliate that has not actually played at 300+ casinos must not assert
 *      first-hand testing. We removed every such verb; if a future re-scrape /
 *      re-sync from the live WordPress re-introduces one, this gate goes red.
 *
 *   2. EVERY affiliate out-link (/go/<slug>/) must SHIP rel="sponsored nofollow".
 *      In this repo the source fragments carry rel="nofollow" and the build-time
 *      helper `ensureSponsored()` (src/lib/content.ts) MERGES in `sponsored`
 *      (and re-adds `nofollow`) before render. So the SHIPPED link is always
 *      sponsored+nofollow. This gate models that exactly: for every /go/ anchor
 *      it re-derives the SHIPPED rel with the SAME merge rule and FAILS if the
 *      result would somehow lack either token (a guard against the merge wiring
 *      being removed or a malformed anchor the regex/merge can't repair).
 *
 *      It ALSO emits a non-fatal WARNING for any /go/ anchor whose RAW SOURCE rel
 *      does not already contain `nofollow` (e.g. an inline image link with no rel
 *      attribute). Those ship correctly only because of the build layer, so a
 *      re-sync that both drops the rel AND bypasses ensureSponsored would leak —
 *      the warning keeps them visible without blocking the known-good corpus.
 *
 * USAGE:   node scripts/check-compliance.mjs
 * EXIT:    0 = PASS, 1 = FAIL (so it can wedge a CI / re-sync pipeline).
 *
 * Scans every *.html under src/fragments (both head.html and body.html — meta
 * descriptions and JSON-LD can carry first-hand claims too).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAGMENTS_DIR = path.resolve(__dirname, "..", "src", "fragments");

/**
 * First-hand / first-person "we tested it" verbs that must never appear in the
 * corpus. Case-insensitive. Kept in sync with the gate list agreed for the
 * fragments edit pass. Word-ish boundaries via the surrounding scan.
 */
const FIRST_HAND_VERBS = [
  "testasimme",
  "kokeilimme",
  "olemme testanneet",
  "pelasimme",
  "huomasimme",
  "käyttäneet sivustoja",
];

/** Recursively collect every *.html file under dir. */
function collectHtml(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...collectHtml(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

/** Return the rel="..." token set (lowercased) for an <a> tag string, or null. */
function relTokens(aTag) {
  const m = aTag.match(/\brel\s*=\s*"([^"]*)"/i);
  if (!m) return null;
  return new Set(m[1].split(/\s+/).filter(Boolean).map((t) => t.toLowerCase()));
}

/** href value of an <a> tag string, or null. */
function hrefOf(aTag) {
  const m = aTag.match(/\bhref\s*=\s*"([^"]*)"/i);
  return m ? m[1] : null;
}

function lineOf(content, index) {
  return content.slice(0, index).split(/\n/).length;
}

function main() {
  let files;
  try {
    files = collectHtml(FRAGMENTS_DIR);
  } catch (err) {
    console.error(`[compliance] cannot read ${FRAGMENTS_DIR}: ${err.message}`);
    process.exit(1);
  }

  const firstHandHits = [];
  const goLinkHits = [];   // FATAL: shipped rel would lack sponsored/nofollow
  const goLinkWarns = [];  // WARN: source rel lacks nofollow (build layer fixes it)
  let goLinkCount = 0;

  const verbRe = new RegExp(`(${FIRST_HAND_VERBS.map((v) =>
    v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const anchorRe = /<a\b[^>]*>/gi;

  for (const file of files) {
    const rel = path.relative(FRAGMENTS_DIR, file).replace(/\\/g, "/");
    const content = fs.readFileSync(file, "utf8");

    // (1) first-hand verbs
    let vm;
    verbRe.lastIndex = 0;
    while ((vm = verbRe.exec(content)) !== null) {
      firstHandHits.push({ file: rel, line: lineOf(content, vm.index), match: vm[0] });
    }

    // (2) /go/ affiliate links — must be sponsored+nofollow after build merge,
    //     and must already carry nofollow in source.
    let am;
    anchorRe.lastIndex = 0;
    while ((am = anchorRe.exec(content)) !== null) {
      const tag = am[0];
      const href = hrefOf(tag);
      if (!href || !/^\/go\//i.test(href)) continue;
      goLinkCount++;
      const tokens = relTokens(tag);
      const sourceHasNofollow = tokens ? tokens.has("nofollow") : false;
      // Re-derive the SHIPPED rel exactly like ensureSponsored() does.
      const effective = new Set(tokens ?? []);
      effective.add("sponsored");
      effective.add("nofollow");
      const shippedOk = effective.has("sponsored") && effective.has("nofollow");
      const where = {
        file: rel,
        line: lineOf(content, am.index),
        rel: tokens ? [...tokens].join(" ") : "(no rel attribute)",
      };
      if (!shippedOk) {
        goLinkHits.push(where);
      } else if (!sourceHasNofollow) {
        goLinkWarns.push(where);
      }
    }
  }

  // ---- Report --------------------------------------------------------------
  const bar = "─".repeat(60);
  console.log(bar);
  console.log("KIR compliance gate — src/fragments");
  console.log(bar);
  console.log(`Files scanned:        ${files.length}`);
  console.log(`/go/ affiliate links: ${goLinkCount}`);
  console.log("");

  let failed = false;

  if (firstHandHits.length === 0) {
    console.log("PASS  first-hand claims      no banned verbs found");
  } else {
    failed = true;
    console.log(`FAIL  first-hand claims      ${firstHandHits.length} occurrence(s):`);
    for (const h of firstHandHits.slice(0, 50)) {
      console.log(`        ${h.file}:${h.line}  "${h.match}"`);
    }
    if (firstHandHits.length > 50) {
      console.log(`        … and ${firstHandHits.length - 50} more`);
    }
  }

  if (goLinkHits.length === 0) {
    console.log("PASS  /go/ rel=sponsored nofollow   every affiliate link compliant");
  } else {
    failed = true;
    console.log(`FAIL  /go/ rel=sponsored nofollow   ${goLinkHits.length} non-compliant link(s):`);
    for (const h of goLinkHits.slice(0, 50)) {
      console.log(`        ${h.file}:${h.line}  rel=[${h.rel}]`);
    }
    if (goLinkHits.length > 50) {
      console.log(`        … and ${goLinkHits.length - 50} more`);
    }
  }

  if (goLinkWarns.length > 0) {
    console.log("");
    console.log(`WARN  ${goLinkWarns.length} /go/ link(s) have no nofollow in source`);
    console.log("      (they ship compliant via ensureSponsored() — informational):");
    for (const h of goLinkWarns.slice(0, 50)) {
      console.log(`        ${h.file}:${h.line}  rel=[${h.rel}]`);
    }
    if (goLinkWarns.length > 50) {
      console.log(`        … and ${goLinkWarns.length - 50} more`);
    }
  }

  console.log(bar);
  if (failed) {
    console.log("RESULT: FAIL — compliance regression detected. See above.");
    process.exit(1);
  }
  console.log("RESULT: PASS — corpus is compliant.");
  process.exit(0);
}

main();
