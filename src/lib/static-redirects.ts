/**
 * static-redirects.ts — build-time view of the maintained 301 map
 * (`data/static-redirects.json`, the source folded into vercel.json by
 * scripts/fetch-rest.mjs ahead of the generated /go/ rules).
 *
 * WHY (doorway consolidation, 2026-07): retiring a near-duplicate page means
 * (1) its route must disappear from the build, (2) the URL must 301 to its
 * cluster survivor, and (3) every surviving internal reference to it must be
 * corrected at BUILD TIME — the daily WP re-sync regenerates data/rest/ and
 * would otherwise resurrect links (and, via fill-missing-fragments.mjs, the
 * page itself). Keying all three off this ONE maintained file means a retired
 * URL can never silently come back with a different survivor than it 301s to.
 *
 * Consumers:
 *   - src/lib/html-links.ts   → link-corrects in-prose hrefs straight to the
 *                               redirect destination (no 301 hop),
 *   - src/lib/content.ts      → getPosts() drops retired posts from listings/
 *                               related-link pools,
 *   - scripts/fill-missing-fragments.mjs mirrors the same rule in plain Node
 *                               so the WP sync never regenerates a retired page.
 *
 * Build-time only (node:fs), memoized, same cwd-anchored resolution as the
 * other data-layer modules.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface StaticRedirect {
  source: string;
  destination: string;
  permanent?: boolean;
}

function resolveDataFile(): string {
  const fromCwd = path.join(process.cwd(), "data", "static-redirects.json");
  if (fs.existsSync(fromCwd)) return fromCwd;
  return fileURLToPath(new URL("../../data/static-redirects.json", import.meta.url));
}

/** "/x" and "/x/" → "/x/" (the map stores both variants; we key on slashed). */
function slashed(p: string): string {
  let s = p.startsWith("/") ? p : "/" + p;
  if (!s.endsWith("/")) s += "/";
  return s.replace(/\/{2,}/g, "/");
}

let _map: Map<string, string> | null = null;

function redirectMap(): Map<string, string> {
  if (_map === null) {
    const m = new Map<string, string>();
    try {
      const rules = JSON.parse(
        fs.readFileSync(resolveDataFile(), "utf8"),
      ) as StaticRedirect[];
      for (const r of rules) {
        if (typeof r?.source === "string" && typeof r?.destination === "string") {
          m.set(slashed(r.source), slashed(r.destination));
        }
      }
    } catch {
      // Missing/invalid file → empty map; the audit gate still catches any 404.
    }
    _map = m;
  }
  return _map;
}

/**
 * The maintained 301 destination for an internal page path, or null if the
 * path is not a redirect source. Accepts either slash variant.
 */
export function staticRedirectTarget(pathPart: string): string | null {
  return redirectMap().get(slashed(pathPart)) ?? null;
}

/** Is this path a retired URL (a source in the maintained 301 map)? */
export function isRetiredPath(pathPart: string): boolean {
  return redirectMap().has(slashed(pathPart));
}
