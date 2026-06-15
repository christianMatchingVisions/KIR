/**
 * test-apply-texts.mjs — harness for scripts/apply-texts.mjs.
 *
 * Works against the REAL built dist/ (requires an existing build):
 *
 * 1. snapshots dist/mm-kisat-2026-tilastot/index.html (the @custom WC stats
 *    page) so it can be byte-restored afterwards
 * 2. runs apply-texts WITHOUT env vars -> must exit 0 and skip
 * 3. runs apply-texts against an unreachable feed -> must exit 0 and warn
 * 4. serves a mock /v1/text-blocks feed on localhost (Bearer-auth checked)
 *    and runs the apply step in-process (same workaround as OCL's harness —
 *    some Windows setups firewall cross-process loopback TCP; the feed is
 *    still fetched over real HTTP). Asserts:
 *      - a real sentence from the stats-page intro is swapped for a sentinel
 *        (HTML-escaped, exactly once)
 *      - a no-op block (currentText === originalText) changes nothing
 *      - a block whose originalText is not found is warned about and skipped
 *      - a block whose originalText matches MANY times is skipped (never guess)
 *      - an unmatched marker block triggers a warning
 * 5. restores the snapshot and verifies dist is byte-identical again
 *
 * Usage: node scripts/test-apply-texts.mjs   (requires an existing dist/)
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const applyScript = path.join(repoRoot, "scripts", "apply-texts.mjs");
const targetPage = path.join(repoRoot, "dist", "mm-kisat-2026-tilastot", "index.html");
const API_KEY = "test-key-456";

// First sentence of the stats-page hero intro, whitespace-normalized exactly
// like the dashboard seed stores it (the built HTML wraps these lines).
const HERO_SENTENCE =
  "Jalkapallon MM-kisat 2026 pelataan Yhdysvalloissa, Kanadassa ja Meksikossa 11.6.–19.7.2026.";
const SENTINEL = 'TESTILAUSE-789: muokattu hallinnasta <b>&"turvallisesti"</b>.';
const SENTINEL_ESCAPED = 'TESTILAUSE-789: muokattu hallinnasta &lt;b&gt;&amp;"turvallisesti"&lt;/b&gt;.';

function runApply(env) {
  // async spawn, same reasoning as test-apply-offers.mjs
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [applyScript], {
      cwd: repoRoot,
      env: { ...process.env, CE_API_URL: "", CE_API_KEY: "", ...env },
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (status) => {
      console.log(out.trim().split("\n").map((l) => "  | " + l).join("\n"));
      resolve({ status, out });
    });
  });
}

const mockFeed = {
  site: "kasinot-ilman-rekister-itymist",
  updatedAt: new Date().toISOString(),
  blocks: [
    {
      blockKey: "mm-kisat-2026-tilastot-hero-intro-1",
      kind: "replace",
      pagePath: "/mm-kisat-2026-tilastot/",
      label: "WC 2026 stats — hero intro first sentence",
      originalText: HERO_SENTENCE,
      currentText: SENTINEL,
    },
    {
      blockKey: "mm-kisat-2026-tilastot-update-cadence",
      kind: "replace",
      pagePath: "/mm-kisat-2026-tilastot/",
      label: "WC 2026 stats — update cadence line",
      originalText: "Päivitämme tilastot turnauksen aikana.",
      currentText: "Päivitämme tilastot turnauksen aikana.", // no-op -> skipped
    },
    {
      blockKey: "kir-not-found-block",
      kind: "replace",
      pagePath: "/mm-kisat-2026-tilastot/",
      label: "Text that exists nowhere",
      originalText: "Tämä lause ei esiinny sivulla 9999.",
      currentText: "ei saa näkyä missään",
    },
    {
      blockKey: "kir-ambiguous-block",
      kind: "replace",
      pagePath: "/mm-kisat-2026-tilastot/",
      label: "Text that matches many times",
      originalText: "FIFA-ranking", // appears repeatedly -> must skip
      currentText: "ei saa näkyä missään",
    },
    {
      blockKey: "kir-ghost-marker",
      kind: "marker",
      pagePath: "/mm-kisat-2026-tilastot/",
      label: "Marker with no element",
      originalText: "a",
      currentText: "b",
    },
  ],
};

async function main() {
  assert.ok(
    fs.existsSync(targetPage),
    "dist/mm-kisat-2026-tilastot/index.html missing — run `npm run build` (or `npx astro build`) first"
  );
  const pristine = fs.readFileSync(targetPage);

  const restore = () => fs.writeFileSync(targetPage, pristine);

  try {
    // sanity: the seed sentence really is in the built page, exactly once
    const { replaceVisibleText } = await import("./apply-texts.mjs");
    const probe = replaceVisibleText(pristine.toString("utf8"), HERO_SENTENCE, "x");
    assert.equal(probe.count, 1, "hero sentence must occur exactly once in the built page");
    console.log("[test] sanity: hero intro sentence found exactly once in dist");

    // --- 1) skip path: no env vars -------------------------------------------
    console.log("\n[test] 1. apply-texts without CE_API_URL/CE_API_KEY (skip path)");
    const skip = await runApply({});
    assert.equal(skip.status, 0, "skip path must exit 0");
    assert.match(skip.out, /feed not configured, skipping/);
    assert.ok(fs.readFileSync(targetPage).equals(pristine), "skip path must not modify dist");
    console.log("[test] PASS: skip path exits 0, dist untouched");

    // --- 2) feed-down path: env set but server unreachable ---------------------
    console.log("\n[test] 2. apply-texts with unreachable feed (fallback path)");
    const down = await runApply({
      CE_API_URL: "http://127.0.0.1:1/v1",
      CE_API_KEY: API_KEY,
    });
    assert.equal(down.status, 0, "feed-down path must exit 0");
    assert.match(down.out, /text-blocks feed unavailable/);
    assert.ok(fs.readFileSync(targetPage).equals(pristine), "feed-down path must not modify dist");
    console.log("[test] PASS: unreachable feed exits 0 (built fallback)");

    // --- 3) mocked feed (in-process apply, real HTTP fetch) --------------------
    console.log("\n[test] 3. apply-texts against mocked feed");
    const server = http.createServer((req, res) => {
      if (req.headers.authorization !== `Bearer ${API_KEY}`) {
        res.writeHead(401).end("unauthorized");
        return;
      }
      if (req.method === "GET" && req.url === "/v1/text-blocks") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(mockFeed));
        return;
      }
      res.writeHead(404).end("not found");
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const port = server.address().port;

    let out = "";
    const origLog = console.log;
    const origWarn = console.warn;
    console.log = (...a) => { out += a.join(" ") + "\n"; };
    console.warn = (...a) => { out += a.join(" ") + "\n"; };
    try {
      const { applyTexts } = await import("./apply-texts.mjs");
      await applyTexts({ apiUrl: `http://127.0.0.1:${port}/v1`, apiKey: API_KEY });
    } finally {
      console.log = origLog;
      console.warn = origWarn;
      server.close();
    }
    console.log(out.trim().split("\n").map((l) => "  | " + l).join("\n"));

    const after = fs.readFileSync(targetPage, "utf8");
    assert.ok(after.includes(SENTINEL_ESCAPED), "sentinel must be present, HTML-escaped");
    assert.ok(!after.includes('<b>&"turvallisesti"</b>'), "raw sentinel HTML must never land in the page");
    assert.equal(
      replaceVisibleText(after, HERO_SENTENCE, "x").count, 0,
      "original hero sentence must be gone"
    );
    assert.ok(!after.includes("ei saa näkyä missään"), "not-found/ambiguous blocks must not be applied");
    assert.match(out, /kir-not-found-block.*found 0 time/, "not-found block must be warned about");
    assert.match(out, /kir-ambiguous-block.*found \d{2,} time|kir-ambiguous-block.*found [2-9] time/, "ambiguous block must be warned about");
    assert.match(out, /kir-ghost-marker/, "unmatched marker key must be warned about");
    // everything else byte-identical: undo the one swap and compare
    const undone = after.replace(SENTINEL_ESCAPED, "");
    const expected = pristine.toString("utf8").replace(
      new RegExp(HERO_SENTENCE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")),
      ""
    );
    assert.equal(undone, expected, "only the matched sentence may differ from the pristine page");
    console.log("[test] PASS: replace, escaping, no-op, not-found, ambiguity and marker warnings all verified");
  } finally {
    // --- 4) restore -----------------------------------------------------------
    restore();
  }

  assert.ok(fs.readFileSync(targetPage).equals(pristine), "restore failed");
  console.log("\n[test] dist restored byte-identical — ALL TESTS PASSED");
}

main().catch((err) => {
  console.error("[test] FAILED:", err);
  process.exit(1);
});
