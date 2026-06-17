#!/usr/bin/env node
/**
 * verify-cutover.mjs — smoke-test a deployed KIR host before/after DNS cutover.
 *
 *   node scripts/verify-cutover.mjs                       # default host kir-three.vercel.app
 *   node scripts/verify-cutover.mjs kasinotilmanrekisteroitymista.com
 *   node scripts/verify-cutover.mjs --host example.com
 *
 * Asserts the things that matter for a safe cutover of a penalty-recovering
 * site:
 *   1. Key pages return 200 (home, reviews hub, a real review, news, guides,
 *      the new /toimitus/ page).
 *   2. trailingSlash is enforced — a no-trailing-slash URL REDIRECTS (3xx),
 *      it does not serve 200 (avoids duplicate-URL dilution).
 *   3. A bogus path returns 404 (the branded dist/404.html is wired).
 *   4. robots.txt and the sitemap index resolve (200).
 *   5. Each 200 HTML page's canonical points to the REAL domain
 *      (https://kasinotilmanrekisteroitymista.com/...), never the staging host.
 *   6. Reports whether `X-Robots-Tag: noindex` is present. On the REAL domain
 *      that is a FAILURE-worthy warning (the site must be indexable); on a
 *      *.vercel.app staging host it is expected/good.
 *
 * Node 18+ (global fetch). No dependencies. Exit code 0 = all assertions pass,
 * 1 = at least one failure. Warnings do not fail the run unless they are on the
 * real domain (noindex on prod).
 */

const REAL_DOMAIN = "kasinotilmanrekisteroitymista.com";
const REAL_ORIGIN = `https://${REAL_DOMAIN}`;
const DEFAULT_HOST = "kir-three.vercel.app";

function parseHost(argv) {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--host") return argv[i + 1];
    if (a.startsWith("--host=")) return a.slice("--host=".length);
    if (!a.startsWith("--")) return a; // first positional = host
  }
  return DEFAULT_HOST;
}

const host = (parseHost(process.argv.slice(2)) || DEFAULT_HOST)
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");
const base = `https://${host}`;
const isRealDomain = host === REAL_DOMAIN;

let failures = 0;
let warnings = 0;

function pass(msg) {
  console.log(`  PASS  ${msg}`);
}
function fail(msg) {
  failures++;
  console.log(`  FAIL  ${msg}`);
}
function warn(msg, hard = false) {
  if (hard) {
    failures++;
    console.log(`  FAIL  (warn→fail) ${msg}`);
  } else {
    warnings++;
    console.log(`  WARN  ${msg}`);
  }
}

/** fetch with no redirect-following, returning status/headers/body. */
async function get(pathname, { follow = false } = {}) {
  const url = pathname.startsWith("http") ? pathname : base + pathname;
  const res = await fetch(url, {
    redirect: follow ? "follow" : "manual",
    headers: { "user-agent": "kir-verify-cutover/1.0" },
  });
  let body = "";
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("text") || ct.includes("html") || ct.includes("xml")) {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body, url };
}

function extractCanonical(html) {
  const m =
    /<link[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i.exec(html) ||
    /<link[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']canonical["']/i.exec(html);
  return m ? m[1] : null;
}

async function check200(pathname, label) {
  try {
    const r = await get(pathname);
    if (r.status === 200) pass(`${label} → 200 (${pathname})`);
    else fail(`${label} → expected 200, got ${r.status} (${pathname})`);
    return r;
  } catch (err) {
    fail(`${label} → request error: ${err.message} (${pathname})`);
    return null;
  }
}

async function checkCanonicalReal(r, pathname) {
  if (!r || r.status !== 200 || !r.body) return;
  const canon = extractCanonical(r.body);
  if (!canon) {
    warn(`no canonical found on ${pathname}`);
    return;
  }
  if (canon.startsWith(REAL_ORIGIN)) {
    pass(`canonical → real domain (${pathname} → ${canon})`);
  } else {
    fail(`canonical does NOT point to real domain (${pathname} → ${canon})`);
  }
}

function reportNoindex(r, pathname) {
  if (!r) return;
  const xrt = r.headers.get("x-robots-tag") || "";
  const present = /noindex/i.test(xrt);
  if (present) {
    if (isRealDomain) {
      // On the live domain noindex is a launch-blocker.
      warn(`X-Robots-Tag noindex PRESENT on REAL domain (${pathname}: "${xrt}") — site would be deindexed!`, true);
    } else {
      pass(`X-Robots-Tag noindex present on staging host (${pathname}) — expected`);
    }
  } else {
    if (isRealDomain) {
      pass(`no X-Robots-Tag noindex on real domain (${pathname}) — indexable`);
    } else {
      warn(`X-Robots-Tag noindex NOT present on staging host (${pathname}) — staging is publicly indexable; run set-cutover-mode --mode staging`);
    }
  }
}

async function main() {
  console.log(`\nKIR cutover verification → ${base}`);
  console.log(`(real domain mode: ${isRealDomain ? "YES" : "no — staging host"})\n`);

  // 1. Key pages → 200, canonical→real, noindex report.
  const keyPages = [
    ["/", "Home"],
    ["/casino/", "Reviews hub"],
    ["/casino/superonni/", "Sample review"],
    ["/uutiset/", "News hub"],
    ["/oppaat/", "Guides hub"],
    ["/toimitus/", "Editorial page"],
  ];
  console.log("[ key pages ]");
  for (const [p, label] of keyPages) {
    const r = await check200(p, label);
    await checkCanonicalReal(r, p);
    reportNoindex(r, p);
  }

  // 2. trailingSlash enforcement — no-slash URL must REDIRECT, not serve 200.
  console.log("\n[ trailing-slash redirect ]");
  try {
    const r = await get("/casino/superonni"); // intentionally no trailing slash
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get("location") || "(no Location)";
      pass(`no-trailing-slash redirects (${r.status} → ${loc})`);
    } else if (r.status === 200) {
      fail(`no-trailing-slash served 200 — trailingSlash NOT enforced (duplicate URLs)`);
    } else {
      warn(`no-trailing-slash returned ${r.status} (expected 3xx)`);
    }
  } catch (err) {
    fail(`trailing-slash check error: ${err.message}`);
  }

  // 3. 404 behaviour.
  console.log("\n[ 404 handling ]");
  try {
    const r = await get("/this-page-does-not-exist-xyz-123/");
    if (r.status === 404) pass(`bogus path → 404`);
    else fail(`bogus path → expected 404, got ${r.status}`);
  } catch (err) {
    fail(`404 check error: ${err.message}`);
  }

  // 4. robots.txt + sitemap.
  console.log("\n[ robots / sitemap ]");
  await check200("/robots.txt", "robots.txt");
  // Astro @astrojs/sitemap emits sitemap-index.xml.
  const sm = await get("/sitemap-index.xml");
  if (sm.status === 200) pass(`sitemap-index.xml → 200`);
  else {
    // Some builds emit sitemap.xml — try as a fallback before failing.
    const alt = await get("/sitemap.xml");
    if (alt.status === 200) pass(`sitemap.xml → 200 (index not found, single sitemap)`);
    else fail(`sitemap not found (sitemap-index.xml=${sm.status}, sitemap.xml=${alt.status})`);
  }

  // ---- summary ----
  console.log(
    `\n${failures === 0 ? "OK" : "PROBLEMS"} — ${failures} failure(s), ${warnings} warning(s).`
  );
  if (isRealDomain && failures === 0) {
    console.log("Real-domain cutover checks passed: pages 200, canonical→real, indexable.");
  }
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`verify-cutover fatal: ${err.stack || err.message}`);
  process.exit(1);
});
