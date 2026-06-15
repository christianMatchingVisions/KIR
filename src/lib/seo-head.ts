/**
 * SEO-head registry — the single source of truth for every page's <head> SEO
 * metadata during the KIR redesign (kasinotilmanrekisteroitymista.com).
 *
 * WHY THIS EXISTS (penalty recovery):
 * The site is recovering from a Google algorithmic demotion. The full
 * component rebuild swaps the scraped-WordPress presentation for a clean
 * light theme, but the per-page SEO surface (canonical, description, robots,
 * OpenGraph/Twitter cards, and JSON-LD) MUST be preserved byte-for-byte so the
 * rebuild does not look like a fresh/different site to Google. Those tags
 * currently live inside each scraped fragment at
 * `src/fragments/<name>/head.html`. This module reads them at BUILD TIME and
 * exposes them keyed by URL path, so the new Astro layout can re-inject the
 * exact same SEO head into the new markup.
 *
 * This is a DATA-LAYER module: it only READS the scraped fragments + meta.json
 * with node:fs and parses them with regex. No new npm dependencies (no
 * cheerio/jsdom). Runs at build time only — never ship node:fs to the client.
 *
 * --------------------------------------------------------------------------
 * HOW AN ASTRO LAYOUT INJECTS THIS (example — keep canonical/description/robots
 * as discrete tags so a layout can still override <title> if it wants to):
 *
 *   ---
 *   // src/layouts/Base.astro
 *   import { getSeoHead } from "../lib/seo-head";
 *   const { pathname } = Astro.url;
 *   const seo = getSeoHead(pathname);
 *   ---
 *   <head>
 *     <meta charset="utf-8" />
 *     <meta name="viewport" content="width=device-width, initial-scale=1" />
 *     {seo && (
 *       <>
 *         <title>{seo.title}</title>
 *         {seo.canonical   && <link rel="canonical" href={seo.canonical} />}
 *         {seo.description && <meta name="description" content={seo.description} />}
 *         {seo.robots      && <meta name="robots" content={seo.robots} />}
 *         {seo.ogTags.map((t) => <Fragment set:html={t} />)}
 *         {seo.jsonLd.map((s) => <Fragment set:html={s} />)}
 *       </>
 *     )}
 *   </head>
 *
 * Notes:
 *  - `seo.title` is plain text (decode-free, verbatim from <title>); render it
 *    inside a real <title> element so a layout can choose to override it.
 *  - `seo.ogTags` are RAW `<meta property="og:..."/>` and
 *    `<meta name="twitter:..."/>` strings — inject with set:html so the exact
 *    attribute order/values are preserved.
 *  - `seo.jsonLd` are RAW `<script type="application/ld+json">...</script>`
 *    strings, kept VERBATIM — inject with set:html. Do NOT JSON.parse/restringify
 *    (that would re-order keys and change escaping that Google has indexed).
 *  - Absolute self-origin URLs (canonical / og:url) stay ABSOLUTE
 *    (https://kasinotilmanrekisteroitymista.com/...). They are intentionally
 *    NOT relativized.
 * --------------------------------------------------------------------------
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Parsed SEO head for a single page. */
export interface SeoHead {
  /** Plain text from <title>…</title> (verbatim, not HTML-decoded). */
  title: string;
  /** Absolute canonical URL (kept absolute), or null if the fragment lacked one. */
  canonical: string | null;
  /** Content of <meta name="description">, or null. */
  description: string | null;
  /** Content of <meta name="robots">, or null. */
  robots: string | null;
  /**
   * Raw <meta property="og:*"> AND <meta name="twitter:*"> tag strings,
   * in document order, kept verbatim for set:html injection.
   */
  ogTags: string[];
  /**
   * Raw <script type="application/ld+json">…</script> blocks, in document
   * order, kept VERBATIM for set:html injection.
   */
  jsonLd: string[];
}

/** Shape of each fragment's meta.json (only the fields we need). */
interface FragmentMeta {
  path?: string;
  htmlAttrs?: string;
  bodyAttrs?: string;
}

/**
 * Resolve src/fragments from the Astro project root (`process.cwd()`), which is
 * stable in both `astro dev` and `astro build`. NOTE: anchoring on
 * `import.meta.url` is NOT safe here — Vite bundles this module into
 * `dist/pages/*.astro.mjs` for the SSG render pass, so at build time
 * `import.meta.url` resolves to `dist/pages/` and a `../fragments` hop misses
 * the real `src/fragments` (it points at the non-existent `dist/fragments`),
 * silently producing an EMPTY SEO registry. The `import.meta.url`-derived path
 * is kept only as a fallback for unbundled/dev execution.
 */
function resolveFragmentsDir(): string {
  const fromCwd = path.join(process.cwd(), "src", "fragments");
  if (fs.existsSync(fromCwd)) return fromCwd;
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "fragments");
}
const FRAGMENTS_DIR = resolveFragmentsDir();

/**
 * Normalize a URL path to have a single leading AND trailing slash, e.g.
 *   ""                -> "/"
 *   "/"               -> "/"
 *   "casino/superonni"-> "/casino/superonni/"
 *   "/ht-faq/x"       -> "/ht-faq/x/"
 * Query/hash are stripped (SEO head is keyed by path only).
 */
export function normalizePath(p: string): string {
  if (!p) return "/";
  // Drop query string / hash if a caller passes a full pathname+search.
  let s = p.split(/[?#]/)[0];
  if (!s.startsWith("/")) s = "/" + s;
  if (!s.endsWith("/")) s = s + "/";
  // Collapse accidental double slashes.
  s = s.replace(/\/{2,}/g, "/");
  return s;
}

/**
 * Extract the first match of `re` from `html` and return capture group 1,
 * trimmed, or null if not present.
 */
function firstCapture(html: string, re: RegExp): string | null {
  const m = re.exec(html);
  return m ? m[1].trim() : null;
}

/**
 * Extract ALL whole-tag/block matches of `re` from `html` (the full match,
 * group 0), in document order.
 */
function allMatches(html: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  // Caller passes a global regex.
  while ((m = re.exec(html)) !== null) {
    out.push(m[0]);
    // Guard against zero-length matches looping forever.
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return out;
}

/**
 * Parse a single fragment's head.html into a SeoHead. Every field is optional
 * at the source — we return whatever exists and null for the rest.
 */
function parseHead(html: string): SeoHead {
  // <title>…</title> — single line in this corpus, but allow newlines defensively.
  const title = firstCapture(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? "";

  // <link rel="canonical" href="…"> — also tolerate href-before-rel ordering.
  const canonical =
    firstCapture(html, /<link[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']*)["'][^>]*>/i) ??
    firstCapture(html, /<link[^>]*\bhref=["']([^"']*)["'][^>]*\brel=["']canonical["'][^>]*>/i);

  // <meta name="description" content="…">
  const description =
    firstCapture(html, /<meta[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/i) ??
    firstCapture(html, /<meta[^>]*\bcontent=["']([^"']*)["'][^>]*\bname=["']description["'][^>]*>/i);

  // <meta name="robots" content="…">
  const robots =
    firstCapture(html, /<meta[^>]*\bname=["']robots["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/i) ??
    firstCapture(html, /<meta[^>]*\bcontent=["']([^"']*)["'][^>]*\bname=["']robots["'][^>]*>/i);

  // All OpenGraph (<meta property="og:*">) and Twitter (<meta name="twitter:*">)
  // tags, kept verbatim and in document order. Two passes, then re-sort by the
  // position they appeared so set:html output mirrors the source ordering.
  const ogRe = /<meta[^>]*\bproperty=["']og:[^"']*["'][^>]*>/gi;
  const twRe = /<meta[^>]*\bname=["']twitter:[^"']*["'][^>]*>/gi;
  const ordered: { tag: string; idx: number }[] = [];
  for (const re of [ogRe, twRe]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      ordered.push({ tag: m[0], idx: m.index });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  ordered.sort((a, b) => a.idx - b.idx);
  const ogTags = ordered.map((o) => o.tag);

  // Every <script type="application/ld+json">…</script> block, VERBATIM.
  const jsonLd = allMatches(
    html,
    /<script[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi
  );

  return { title, canonical, description, robots, ogTags, jsonLd };
}

/**
 * Read every fragment's meta.json + head.html, build the path-keyed registry.
 * Built lazily once and cached for the lifetime of the build process.
 */
let _registry: Map<string, SeoHead> | null = null;

function buildRegistry(): Map<string, SeoHead> {
  const registry = new Map<string, SeoHead>();

  let dirents: fs.Dirent[];
  try {
    dirents = fs.readdirSync(FRAGMENTS_DIR, { withFileTypes: true });
  } catch {
    // Fragments dir missing (e.g. a context where it wasn't synced) — return
    // an empty registry rather than throwing, so the layout degrades gracefully.
    return registry;
  }

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue;
    const dir = path.join(FRAGMENTS_DIR, dirent.name);
    const metaFile = path.join(dir, "meta.json");
    const headFile = path.join(dir, "head.html");

    let meta: FragmentMeta;
    try {
      meta = JSON.parse(fs.readFileSync(metaFile, "utf8")) as FragmentMeta;
    } catch {
      // No/invalid meta.json — we cannot key it by path, skip.
      continue;
    }
    if (!meta.path) continue;

    let html: string;
    try {
      html = fs.readFileSync(headFile, "utf8");
    } catch {
      // No head.html — nothing to parse, skip.
      continue;
    }

    registry.set(normalizePath(meta.path), parseHead(html));
  }

  return registry;
}

function getRegistry(): Map<string, SeoHead> {
  if (_registry === null) _registry = buildRegistry();
  return _registry;
}

/**
 * Look up the preserved SEO head for a URL path. Accepts any of "/casino/x/",
 * "/casino/x", "casino/x" — the path is normalized before lookup.
 * Returns null if the path has no scraped fragment (e.g. a brand-new page).
 */
export function getSeoHead(p: string): SeoHead | null {
  return getRegistry().get(normalizePath(p)) ?? null;
}

/** List every normalized path the registry knows about (sorted). */
export function listSeoPaths(): string[] {
  return [...getRegistry().keys()].sort();
}

/**
 * Convenience renderer: assemble the discrete-tag portion of the head as a
 * single HTML string (canonical + description + robots + og/twitter + jsonLd),
 * for layouts/frameworks that prefer one set:html blob over per-tag rendering.
 *
 * NOTE: <title> is intentionally OMITTED so the layout owns/can override it
 * (render `seo.title` inside your own <title> element). Pass the SeoHead from
 * getSeoHead(). Returns "" for null. The output is already valid HTML — inject
 * with Astro's set:html.
 */
export function renderSeoHeadHtml(seo: SeoHead | null): string {
  if (!seo) return "";
  const parts: string[] = [];
  if (seo.canonical) parts.push(`<link rel="canonical" href="${seo.canonical}" />`);
  if (seo.description)
    parts.push(`<meta name="description" content="${escapeAttr(seo.description)}" />`);
  if (seo.robots) parts.push(`<meta name="robots" content="${escapeAttr(seo.robots)}" />`);
  parts.push(...seo.ogTags); // raw, verbatim
  parts.push(...seo.jsonLd); // raw, verbatim
  return parts.join("\n");
}

/** Minimal attribute escaper for the reconstructed discrete tags only. */
function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
