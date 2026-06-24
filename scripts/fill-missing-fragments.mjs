/**
 * fill-missing-fragments.mjs — restore pages for published WordPress POSTS that
 * exist in the REST dump but have no scraped fragment (so they 404 on the site).
 *
 * The new site renders posts from src/fragments/<slug>/ (meta.json routes it,
 * head.html gives SEO, the body comes from getPost() in data/rest/posts.json).
 * When fetch-rest captured newer posts but scrape-pages wasn't re-run, those
 * posts have data but no fragment → no page. This regenerates the missing
 * fragments from the REST data: a clean head (title, description, canonical,
 * Article JSON-LD) + the article body. Compliance hardening (sponsored nofollow,
 * etc.) is applied at render time by the catch-all, exactly like every other post.
 *
 * Idempotent: skips any slug that already has a fragment. Posts only (pages like
 * the Pragmatic-Play game reviews already render under their own /…/ paths).
 *
 *   node scripts/fill-missing-fragments.mjs            # report
 *   node scripts/fill-missing-fragments.mjs --apply    # write fragments
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FRAG = path.join(ROOT, "src", "fragments");
const REST = path.join(ROOT, "data", "rest");
const SITE = "https://kasinotilmanrekisteroitymista.com";
const APPLY = process.argv.includes("--apply");

const stripTags = (h) =>
  (h || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const escAttr = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function buildHead({ slug, title, desc, date, modified }) {
  const url = `${SITE}/${slug}/`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: desc,
    inLanguage: "fi",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    datePublished: date,
    dateModified: modified || date,
    author: { "@type": "Organization", name: "Kasinot ilman rekisteröitymistä" },
    publisher: { "@type": "Organization", name: "Kasinot ilman rekisteröitymistä", url: SITE + "/" },
  };
  return [
    `<title>${escAttr(title)}</title>`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="description" content="${escAttr(desc)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta property="og:locale" content="fi_FI" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${escAttr(title)}" />`,
    `<meta property="og:description" content="${escAttr(desc)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="kasinotilmanrekisteroitymista.com" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escAttr(title)}" />`,
    `<meta name="twitter:description" content="${escAttr(desc)}" />`,
    `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
  ].join("\n");
}

const posts = JSON.parse(fs.readFileSync(path.join(REST, "posts.json"), "utf8"));
let created = 0;
for (const it of posts) {
  if (it.status !== "publish") continue;
  const slug = it.slug;
  if (!slug) continue;
  const dir = path.join(FRAG, slug);
  if (fs.existsSync(dir)) continue; // already has a page

  const title = stripTags(it.title?.rendered) || slug;
  const desc = (stripTags(it.excerpt?.rendered) || title).slice(0, 160);
  const content = it.content?.rendered || "";
  console.log(`  ${APPLY ? "creating" : "would create"}: /${slug}/  (${title.slice(0, 60)})`);
  if (!APPLY) {
    created++;
    continue;
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "meta.json"),
    JSON.stringify({ htmlAttrs: 'lang="fi" prefix="og: https://ogp.me/ns#"', bodyAttrs: 'class="post"', path: `/${slug}/` }, null, 2) + "\n",
  );
  fs.writeFileSync(path.join(dir, "body.html"), `<div class="wp-content-area">\n${content}\n</div>\n`);
  fs.writeFileSync(path.join(dir, "head.html"), buildHead({ slug, title, desc, date: it.date, modified: it.modified }) + "\n");
  created++;
}
console.log(`\n${APPLY ? "Created" : "Would create"} ${created} fragment(s).${APPLY ? "" : "  Re-run with --apply to write."}`);
