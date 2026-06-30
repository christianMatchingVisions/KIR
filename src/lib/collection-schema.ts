/**
 * collection-schema.ts — CollectionPage + ItemList JSON-LD for list/hub pages.
 *
 * WHY (SEO audit Phase 6): the money hubs and review/guide indexes are ranked
 * lists, but ship no list structured data. A CollectionPage whose mainEntity is
 * an ItemList of the ranked items tells Google the page IS a curated list and
 * makes each item eligible for richer treatment. Additive only — it never
 * touches the preserved <head>; callers emit it in the body (JSON-LD is valid
 * anywhere) and DEDUPE against any CollectionPage/ItemList already in the head.
 *
 * Pure string builder, no deps. Same verbatim-injection model as related.ts
 * (breadcrumbJsonLd) — the output is a ready <script type="application/ld+json">.
 */

const SITE_ORIGIN = "https://kasinotilmanrekisteroitymista.com";

/** One entry in the list (an internal page — never an affiliate /go/ link). */
export interface CollectionItem {
  /** Display name (e.g. the casino or guide title). */
  name: string;
  /** Root-relative or absolute internal URL of the item's own page (optional). */
  url?: string;
}

/** JSON string-escape for values placed inside the JSON-LD literal. */
function esc(s: string): string {
  return JSON.stringify(String(s ?? ""));
}

/** Absolutise a root-relative internal path; pass through absolute URLs. */
function abs(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return SITE_ORIGIN + (url.startsWith("/") ? url : "/" + url);
}

/**
 * Build a CollectionPage + nested ItemList (ListItem[]) JSON-LD block for a hub.
 * Returns "" when there are no items (nothing useful to declare).
 *
 *   url   — the hub's own canonical path ("/trustly-kasinot/").
 *   name  — the hub's name / H1.
 *   items — ordered list entries; position is the 1-based index.
 *   description — optional CollectionPage description.
 */
export function collectionPageJsonLd(opts: {
  url: string;
  name: string;
  items: CollectionItem[];
  description?: string;
}): string {
  const items = (opts.items ?? []).filter((i) => i && i.name && i.name.trim());
  if (items.length === 0) return "";

  const pageUrl = abs(opts.url);
  const listItems = items.map((it, i) => {
    const parts = [
      `"@type":"ListItem"`,
      `"position":${i + 1}`,
      `"name":${esc(it.name.trim())}`,
    ];
    if (it.url && it.url.trim()) parts.push(`"url":${esc(abs(it.url.trim()))}`);
    return `{${parts.join(",")}}`;
  });

  const collection = [
    `"@context":"https://schema.org"`,
    `"@type":"CollectionPage"`,
    `"@id":${esc(pageUrl + "#collection")}`,
    `"url":${esc(pageUrl)}`,
    `"name":${esc(opts.name)}`,
    opts.description ? `"description":${esc(opts.description)}` : null,
    `"mainEntity":{"@type":"ItemList","itemListOrder":"https://schema.org/ItemListOrderDescending","numberOfItems":${items.length},"itemListElement":[${listItems.join(",")}]}`,
  ]
    .filter(Boolean)
    .join(",");

  return `<script type="application/ld+json">{${collection}}</script>`;
}

/** True if a preserved-head JSON-LD set already declares a CollectionPage/ItemList. */
export function headHasCollectionSchema(jsonLd: readonly string[] | undefined): boolean {
  return (jsonLd ?? []).some((b) =>
    /"@type"\s*:\s*"(?:CollectionPage|ItemList)"/.test(b),
  );
}
