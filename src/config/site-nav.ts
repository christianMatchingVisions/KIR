/**
 * site-nav.ts — Single source of truth for the KIR global chrome.
 *
 * The navigation, footer, brand, and site-wide compliance strings live here so
 * Header / Footer / DisclosureBar / BaseLayout all read from ONE typed model.
 * Every internal href is absolute-from-root and ends with a trailing slash
 * (astro.config.mjs sets `trailingSlash: "always"` — do NOT drop the slashes,
 * or the existing indexed URLs would 301/404 and undo the penalty recovery).
 *
 * Finnish copy is intentional: this is a Finnish-language site.
 */

/* --------------------------------------------------------------------------
 * Site constants
 * ------------------------------------------------------------------------ */

export const SITE_NAME = "Kasinot ilman rekisteröitymistä";
/** Short wordmark / brand label used in chrome where the full name is too long. */
export const SITE_NAME_SHORT = "K.I.R";
export const SITE_URL = "https://kasinotilmanrekisteroitymista.com";

/** Responsible-gambling helpline (shown site-wide; rel/nofollow enforced in markup). */
export const PELUURI_URL = "https://www.peluuri.fi/";
export const PELUURI_LABEL = "Peluuri";

/** 18+ / responsible-gambling one-liner reused by Footer + DisclosureBar. */
export const RG_NOTICE =
  "Rahapelaaminen on sallittu vain täysi-ikäisille (18+). Pelaa vastuullisesti.";

/**
 * Slim affiliate-disclosure + 18+ bar text. MANDATORY site-wide (penalty
 * recovery + compliance). Kept as a constant so the wording is auditable in
 * one place.
 */
export const DISCLOSURE_TEXT =
  "Mainos · Kaupallinen yhteistyö: tämä sivusto sisältää affiliate-linkkejä, joista voimme saada komission. Tämä ei vaikuta arvosteluihimme eikä tuo sinulle lisäkustannuksia. Pelaa vastuullisesti. 18+.";

/** Trust badges shipped in /public (already downloaded). Footer renders these. */
export interface TrustLogo {
  src: string;
  alt: string;
  width: number;
  height: number;
}
// width/height are the images' TRUE intrinsic sizes — the footer renders them
// at height:42 width:auto, so a wrong ratio here (e.g. a square logo tagged
// 120x48) would stretch them. ssl-secure.png = 70x34, peluuri.png = 400x400.
export const TRUST_LOGOS: TrustLogo[] = [
  {
    src: "/wp-content/uploads/2021/06/ssl-secure.png",
    alt: "SSL-suojattu sivusto",
    width: 70,
    height: 34,
  },
  {
    src: "/wp-content/uploads/2021/06/peluuri.png",
    alt: "Peluuri — apua peliongelmiin",
    width: 400,
    height: 400,
  },
];

/* --------------------------------------------------------------------------
 * Main navigation
 * ------------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
  /** Optional dropdown children (desktop hover / mobile accordion). */
  children?: NavItem[];
}

/**
 * mainNav — the desktop horizontal nav + mobile slide-over source.
 * Every dropdown parent is itself a real, linkable page (the dropdown
 * preserves the existing internal URLs the site already ranks for).
 */
export const mainNav: NavItem[] = [
  { label: "Etusivu", href: "/" },
  {
    label: "Parhaat kasinot",
    href: "/suomen-parhaat-nettikasinot/",
    children: [
      { label: "Pikakasinot", href: "/pikakasinot/" },
      { label: "Nettikasino ilman rekisteröitymistä", href: "/nettikasino-ilman-rekisteroitymista/" },
      { label: "Kaikki kasinot", href: "/kaikki-kasinot/" },
      { label: "Uudet kasinot", href: "/uudet-kasinot/" },
      { label: "Trustly-kasinot", href: "/trustly-kasinot/" },
      { label: "Zimpler-pikakasinot", href: "/zimpler-pikakasinot/" },
      { label: "Apple Pay -kasinot", href: "/apple-pay-casinot/" },
      { label: "Brite-kasinot", href: "/brite-kasinot/" },
      { label: "Kryptokasinot", href: "/kryptokasinot/" },
      { label: "Euteller-kasinot", href: "/euteller-kasinot/" },
      { label: "MGA-kasinot", href: "/mga-kasinot/" },
      { label: "Curacao-kasinot", href: "/curacao-kasinot/" },
    ],
  },
  {
    label: "Bonukset",
    href: "/kasinobonukset/",
    children: [
      { label: "Kasinobonukset", href: "/kasinobonukset/" },
      { label: "Cashback-kasinot", href: "/cashback-kasinot/" },
    ],
  },
  { label: "Arvostelut", href: "/casino/" },
  { label: "Oppaat", href: "/oppaat/" },
  { label: "Uutiset", href: "/uutiset/" },
];

/* --------------------------------------------------------------------------
 * Footer
 * ------------------------------------------------------------------------ */

export interface FooterLink {
  label: string;
  href: string;
  /** External link: render with target=_blank + rel below. */
  external?: boolean;
  /** Override rel for compliance-sensitive outbound links. */
  rel?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/**
 * footerColumns — the 4-column navy footer.
 * NOTE: the "Vastuullinen pelaaminen" column is rendered specially by
 * Footer.astro (Peluuri link + 18+ note + trust logos), so it is modelled
 * separately below rather than as a plain link column.
 */
export const footerColumns: FooterColumn[] = [
  {
    title: SITE_NAME_SHORT,
    links: [
      { label: "Meistä", href: "/meista/" },
      { label: "Toimitus & menetelmä", href: "/toimitus/" },
      { label: "Mainosvastuu & riippumattomuus", href: "/toimitus/#avoimuus" },
      // /tietosuoja/ + /kayttoehdot/ are net-new legal pages (2026-07 plan);
      // "Evästeet" now points at the cookie/consent section of the privacy
      // policy (it previously fell back to /meista/, whose legacy blurb only
      // covers cookies generically — the consent mechanics live on
      // /tietosuoja/#evasteet).
      { label: "Tietosuojaseloste", href: "/tietosuoja/" },
      { label: "Käyttöehdot", href: "/kayttoehdot/" },
      { label: "Evästeet", href: "/tietosuoja/#evasteet" },
      { label: "Sivukartta", href: "/sitemap-index.xml" },
    ],
  },
  {
    title: "Luokat",
    links: [
      { label: "Etusivu", href: "/" },
      { label: "Pikakasinot", href: "/pikakasinot/" },
      { label: "Nettikasino ilman rekisteröitymistä", href: "/nettikasino-ilman-rekisteroitymista/" },
      { label: "Parhaat nettikasinot", href: "/suomen-parhaat-nettikasinot/" },
      { label: "Arvostelut", href: "/casino/" },
      { label: "Uudet kasinot", href: "/uudet-kasinot/" },
      { label: "Kasinobonukset", href: "/kasinobonukset/" },
      { label: "Cashback-kasinot", href: "/cashback-kasinot/" },
      { label: "Trustly-kasinot", href: "/trustly-kasinot/" },
      { label: "Zimpler-pikakasinot", href: "/zimpler-pikakasinot/" },
    ],
  },
  {
    title: "Uutiset",
    links: [
      { label: "Uutiset ja artikkelit", href: "/uutiset/" },
      { label: "Pelioppaat", href: "/oppaat/" },
      { label: "Bonusoppaat", href: "/kasinobonukset/" },
    ],
  },
];

/**
 * The responsible-gambling footer column is special-cased in Footer.astro.
 * Exposed here for completeness / a single auditable place.
 */
export const responsibleColumn = {
  title: "Vastuullinen pelaaminen",
  peluuri: { label: PELUURI_LABEL, href: PELUURI_URL },
  notice: RG_NOTICE,
  trustLogos: TRUST_LOGOS,
} as const;

/* --------------------------------------------------------------------------
 * Brand
 * ------------------------------------------------------------------------ */

/**
 * Brand wordmark parts — the inline-SVG/CSS logo recreates the reference mark:
 * a navy/brand "+" plus-badge, "KASINOT" in heavy navy, and the small-caps
 * "ILMAN REKISTERÖITYMISTÄ" subtitle. Header + Footer both render this; the
 * pieces live here so the copy never drifts.
 */
export const brand = {
  href: "/",
  badge: "+",
  /** Primary wordmark line. */
  wordmark: "KASINOT",
  /** Small-caps subtitle line. */
  subtitle: "ILMAN REKISTERÖITYMISTÄ",
  /** Accessible full name for screen readers / aria-label. */
  ariaLabel: SITE_NAME,
} as const;
