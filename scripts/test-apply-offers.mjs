/**
 * test-apply-offers.mjs — harness for scripts/apply-offers.mjs.
 *
 * 1. restores dist/rlaaf-data from the pristine public/rlaaf-data snapshot
 * 2. runs apply-offers WITHOUT env vars -> must exit 0 and skip
 * 3. serves a mock /v1/offers feed on localhost (Bearer-auth checked),
 *    runs apply-offers against the real dist, asserts bonus/cta/logo
 *    overrides, paused removal and feed-driven reordering all landed
 * 4. restores dist/rlaaf-data again so dist matches the pristine snapshot
 *
 * Usage: node scripts/test-apply-offers.mjs   (requires an existing dist/)
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const applyScript = path.join(repoRoot, "scripts", "apply-offers.mjs");
const publicData = path.join(repoRoot, "public", "rlaaf-data");
const distData = path.join(repoRoot, "dist", "rlaaf-data");
const HOMEPAGE_LIST = "search-service-casino";
const API_KEY = "test-key-123";

const slug = (s) =>
  String(s).toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function restoreDist() {
  fs.rmSync(distData, { recursive: true, force: true });
  fs.cpSync(publicData, distData, { recursive: true });
}

function runApply(env) {
  // CE_API_URL/CE_API_KEY="" force the skip path even when a real .env
  // exists (apply-offers treats an explicitly empty value as "disabled").
  // NOTE: must be async spawn — spawnSync would block this process's event
  // loop and the in-process mock HTTP server could never answer the child.
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
  offers: [
    {
      casinoSlug: "superonni",
      name: "SuperOnni",
      logoUrl: null,
      rating: 4.5,
      bonusText: "TEST: 200% bonus + 50 kierrosta",
      ctaUrl: "https://example.com/go/superonni-test",
      status: "active",
    },
    {
      casinoSlug: "spinnair",
      name: "Spinnair",
      logoUrl: "https://example.com/img/spinnair-test.png",
      rating: null,
      bonusText: "TEST: 25% cashback",
      ctaUrl: "https://example.com/go/spinnair-test",
      status: "active",
    },
    {
      casinoSlug: "tikkari-casino",
      name: "Tikkari Casino",
      logoUrl: null,
      rating: null,
      bonusText: "irrelevant",
      ctaUrl: "https://example.com/go/tikkari",
      status: "paused",
    },
    {
      casinoSlug: "does-not-exist-casino",
      name: "Ghost Casino",
      logoUrl: null,
      rating: null,
      bonusText: "x",
      ctaUrl: "https://example.com/x",
      status: "active",
    },
  ],
  toplists: [
    {
      key: "etusivu",
      name: "Etusivun lista",
      entries: [
        { casinoSlug: "quickz-casino", position: 1, bonusTextOverride: "TEST: etusivu-erikoistarjous" },
        { casinoSlug: "superonni", position: 2, bonusTextOverride: null },
      ],
    },
  ],
};

async function main() {
  assert.ok(fs.existsSync(publicData), "public/rlaaf-data missing");
  assert.ok(
    fs.existsSync(path.join(repoRoot, "dist")),
    "dist/ missing — run `npm run build` (or `npx astro build`) first"
  );

  console.log("[test] restoring dist/rlaaf-data from public snapshot");
  restoreDist();
  const pristine = JSON.parse(
    fs.readFileSync(path.join(distData, HOMEPAGE_LIST, "page-1.json"), "utf8")
  );

  // --- 1) skip path: no env vars -------------------------------------------
  console.log("\n[test] 1. apply-offers without CE_API_URL/CE_API_KEY (skip path)");
  const skip = await runApply({});
  assert.equal(skip.status, 0, "skip path must exit 0");
  assert.match(skip.out, /feed not configured, skipping/);
  const untouched = JSON.parse(
    fs.readFileSync(path.join(distData, HOMEPAGE_LIST, "page-1.json"), "utf8")
  );
  assert.deepEqual(untouched, pristine, "skip path must not modify dist");
  console.log("[test] PASS: skip path exits 0, dist untouched");

  // --- 2) feed-down path: env set but server unreachable ---------------------
  console.log("\n[test] 2. apply-offers with unreachable feed (fallback path)");
  const down = await runApply({
    CE_API_URL: "http://127.0.0.1:1/v1",
    CE_API_KEY: API_KEY,
  });
  assert.equal(down.status, 0, "feed-down path must exit 0");
  assert.match(down.out, /offers feed unavailable/);
  console.log("[test] PASS: unreachable feed exits 0 (snapshot fallback)");

  // --- 3) mocked feed --------------------------------------------------------
  console.log("\n[test] 3. apply-offers against mocked feed");
  const server = http.createServer((req, res) => {
    if (req.headers.authorization !== `Bearer ${API_KEY}`) {
      res.writeHead(401).end("unauthorized");
      return;
    }
    if (req.method === "GET" && req.url === "/v1/offers") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(mockFeed));
      return;
    }
    res.writeHead(404).end("not found");
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;

  try {
    const run = await runApply({
      CE_API_URL: `http://127.0.0.1:${port}/v1`,
      CE_API_KEY: API_KEY,
    });
    assert.equal(run.status, 0, "mocked-feed run must exit 0");
    assert.match(run.out, /feed ok/);
    assert.match(run.out, /does-not-exist-casino/, "unmatched slug must be warned about");

    const page1 = JSON.parse(
      fs.readFileSync(path.join(distData, HOMEPAGE_LIST, "page-1.json"), "utf8")
    );
    const slugs = page1.results.map((e) => slug(e.post_title));

    // reorder: quickz-casino (pos 1) and superonni (pos 2) lead the list
    assert.equal(slugs[0], "quickz-casino", "position 1 must be quickz-casino");
    assert.equal(slugs[1], "superonni", "position 2 must be superonni");

    // overrides
    const superonni = page1.results[1];
    assert.equal(superonni.meta.no_deposit, "TEST: 200% bonus + 50 kierrosta");
    assert.equal(superonni.meta.cta, "https://example.com/go/superonni-test");
    const quickz = page1.results[0];
    assert.equal(quickz.meta.no_deposit, "TEST: etusivu-erikoistarjous", "bonusTextOverride");
    const spinnair = page1.results.find((e) => slug(e.post_title) === "spinnair");
    assert.ok(spinnair, "spinnair still present");
    assert.equal(spinnair.meta.cta, "https://example.com/go/spinnair-test");
    assert.equal(spinnair.meta.card_image.url, "https://example.com/img/spinnair-test.png", "logoUrl");

    // paused removal: tikkari-casino gone from EVERY list in dist
    for (const dir of fs.readdirSync(distData)) {
      const dirPath = path.join(distData, dir);
      if (!fs.statSync(dirPath).isDirectory()) continue;
      for (const file of fs.readdirSync(dirPath)) {
        const page = JSON.parse(fs.readFileSync(path.join(dirPath, file), "utf8"));
        for (const e of page.results ?? []) {
          assert.notEqual(slug(e.post_title), "tikkari-casino", `paused casino still in ${dir}/${file}`);
        }
      }
    }

    // unchanged entries keep their relative order after the feed-ordered ones
    const pristineSlugs = pristine.results
      .map((e) => slug(e.post_title))
      .filter((s) => !["quickz-casino", "superonni", "tikkari-casino"].includes(s));
    assert.deepEqual(slugs.slice(2, 2 + 5), pristineSlugs.slice(0, 5), "non-feed entries keep relative order");

    console.log("[test] PASS: overrides, bonusTextOverride, logo, reorder and paused removal all verified");
  } finally {
    server.close();
  }

  // --- 4) restore ------------------------------------------------------------
  console.log("\n[test] restoring dist/rlaaf-data to pristine snapshot");
  restoreDist();
  const restored = JSON.parse(
    fs.readFileSync(path.join(distData, HOMEPAGE_LIST, "page-1.json"), "utf8")
  );
  assert.deepEqual(restored, pristine, "restore failed");
  console.log("[test] ALL TESTS PASSED");
}

main().catch((err) => {
  console.error("[test] FAILED:", err);
  try { restoreDist(); } catch {}
  process.exit(1);
});
