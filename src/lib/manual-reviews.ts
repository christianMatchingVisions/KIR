/**
 * manual-reviews.ts — hand-written casino reviews for brands that have no
 * scraped WordPress fragment.
 *
 * WHY: every review under /casino/<slug>/ is normally parsed out of
 * src/fragments/casino__<slug>/body.html, which only exists for the 305 casinos
 * captured from the old WordPress site. A brand added later (Betpanda, added to
 * MANUAL_CASINOS in toplist.ts) therefore sits on the homepage toplist with a
 * card and a play button but no review to link to. This module is the review
 * counterpart of MANUAL_CASINOS: a typed CasinoReview written by hand, served
 * by casino-data.ts whenever no fragment exists for that slug.
 *
 * RULES (same as everywhere else in this repo):
 *   - Every figure here is copied from a source the owner supplied or from the
 *     operator's own published terms. Nothing is estimated, averaged or
 *     inferred. A fact we do not have is left null/empty and the template
 *     omits that block.
 *   - No first-hand testing claims. The prose describes published terms.
 *   - ratingOverall / subRatings stay null/[] unless there is a real basis for
 *     a score, so no arbitrary number is printed next to a brand.
 *
 * PRECEDENCE: a scraped fragment always wins. If the WP sync ever starts
 * producing casino__<slug> for a slug listed here, the fragment is rendered and
 * this record is ignored — so a manual review can never mask real captured
 * content. Deleting an entry here removes its page (and its sitemap row) on the
 * next build.
 */
import type { CasinoReview } from "./casino-data";

/**
 * Betpanda — reviewed 2026-10-20.
 *
 * Source for every figure below: Betpanda's own "Bounty Welcome Bonus" terms
 * page, supplied by the owner on 2026-10-20. The operator is Star Bright Media
 * S.R.L (Costa Rica, corporate ID 3-102-880000), stated in the footer of that
 * same page.
 *
 * CURRENCY: the terms quote the deposit minimum and the per-round bet cap in
 * euros (10 € / 50 €) and they are reproduced as such. The maximum bonus is
 * capped in bitcoin (1 BTC), not in euros, so it is quoted in BTC with the
 * reason stated — converting it would bake a figure that drifts with the rate
 * into a static page.
 *
 * LICENCE: Costa Rica does not issue gambling licences; operators simply
 * incorporate there. The licence field therefore says exactly that, and
 * license-tier.ts classifies it non-EEA → winnings are taxable income in
 * Finland. That is the single most important fact on the page for a Finnish
 * reader, so it also gets its own section in the prose.
 */
const BETPANDA: CasinoReview = {
  slug: "betpanda",
  name: "Betpanda",
  url: "/casino/betpanda/",
  ctaSlug: "betpanda",
  logoUrl: "/wp-content/uploads/betpanda-logo.png",
  // 4.5/5 — set by the site owner on 2026-10-20. Editorial score, not derived
  // from the terms above; it is the owner's assessment of the brand, the same
  // basis as the scores on the scraped reviews. No sub-ratings: a per-criterion
  // breakdown would have to be invented, and the rating bars omit themselves
  // when the list is empty.
  ratingOverall: 4.5,
  subRatings: [],
  bonusText: "100 % ensitalletuksesta, jopa 1 BTC",
  license: "Costa Rica (yhtiörekisteröinti, ei ETA-pelilisenssiä)",
  paymentMethods: [],
  providers: [],
  verdict:
    "Betpandan tervetuliaisbonus on bounty-tyyppinen: bonusta ei makseta ennakkoon, vaan " +
    "kierrätät ensitalletuksesi 40 kertaa ja saat bonuksen vasta sen jälkeen käteisenä ilman " +
    "lisäkierrätystä. Ehdot ovat poikkeuksellisen tiukat ajan osalta — kierrätys on tehtävä " +
    "seitsemässä päivässä — ja vain kolikkopelit kerryttävät sitä täydellä painolla. Kasino " +
    "toimii Costa Ricaan rekisteröidyn yhtiön kautta ilman ETA-lisenssiä, joten voitot ovat " +
    "suomalaiselle pelaajalle veronalaista tuloa.",
  foundedYear: null,
  minDeposit: "10 €",
  support: { liveChat: true },
  /* Two claims the review template states for every scraped casino are NOT
   * true here: Betpanda's own terms tell the player to "create your account",
   * so it is not a no-registration bank-ID casino, and Costa Rica issues no
   * gambling licence, so "Costa Rica -lisenssi" would be a falsehood. Both
   * claims are switched off; the prose states the real position instead. */
  templateClaims: { registrationFree: false, formalLicense: false },
  /* Plus/minus points, every one of them lifted straight from the published
   * bonus terms — not an editorial impression. They also put the review into
   * ReviewHighlights' "real points" mode, which replaces the derived bullets. */
  pros: [
    "Bonus maksetaan kierrätyksen jälkeen käteisenä ilman lisäkierrätystä",
    "Vähimmäistalletus vain 10 €",
    "Kolikkopelit kerryttävät kierrätystä täydellä 100 %:n painolla",
    "Bonuskampanjalla ei ole ilmoitettua päättymispäivää",
  ],
  cons: [
    "Kierrätys 40 x talletus, ja aikaa vain 7 vuorokautta",
    "Live-pelit kerryttävät kierrätystä 20 %, urheiluvedot ja pokeri 0 %",
    "Ei ETA-pelilisenssiä — voitot ovat Suomessa veronalaista tuloa",
    "Kierrätykseen lasketaan enintään 50 € panos kierrosta kohden",
  ],
  reviewHtml: `
<p><strong>Betpanda</strong> on kryptopainotteinen nettikasino, joka tarjoaa uudelle pelaajalle
<strong>100 % ensitalletusbonuksen</strong>. Bonus toimii eri tavalla kuin tavallinen
tervetuliaisbonus: sitä ei lisätä tilille pelattavaksi bonusrahaksi, vaan se maksetaan käteisenä
vasta kun kierrätysvaatimus on täytetty. Alla on bonuksen ehdot sellaisina kuin kasino ne itse
julkaisee, ja mitä ne käytännössä tarkoittavat.</p>

<h2>Tervetuliaisbonus on bounty-tyyppinen</h2>
<p>Tavallisessa bonuksessa saat bonusrahan heti talletuksen jälkeen ja kierrätät sitä. Betpandalla
järjestys on päinvastainen: <strong>kierrätät ensin oman talletuksesi 40 kertaa</strong>, ja kun
vaatimus on täynnä, bonus maksetaan tilillesi käteisenä. Maksettuun bonukseen ei liity enää
kierrätystä, joten sen voi nostaa kasinon normaalien nosto- ja tunnistautumiskäytäntöjen mukaisesti.</p>
<p>Käytännön ero on iso. Et pelaa bonusrahalla, vaan omalla rahallasi, ja bonus on palkkio
kierrätyksen loppuun viemisestä. Jos kierrätys jää kesken, bonusta ei makseta lainkaan.</p>

<h2>Bonuksen ehdot numeroina</h2>
<ul>
  <li><strong>Bonus:</strong> 100 % ensitalletuksesta</li>
  <li><strong>Enimmäisbonus:</strong> 1 BTC tai vastaava määrä tuetuissa kryptovaluutoissa. Katto on
      asetettu bitcoineina, joten sen euromäärä seuraa bitcoinin kurssia.</li>
  <li><strong>Vähimmäistalletus:</strong> 10 €</li>
  <li><strong>Kierrätys:</strong> 40 x talletus</li>
  <li><strong>Kierrätykseen laskettava enimmäispanos:</strong> 50 € kierrosta kohden</li>
  <li><strong>Aikaa kierrätykseen:</strong> 7 vuorokautta ensitalletuksesta</li>
  <li><strong>Maksetaan:</strong> käteisenä, ilman lisäkierrätystä</li>
</ul>

<h2>Näin bonus avataan</h2>
<ol>
  <li><strong>Luo tili.</strong> Rekisteröityminen vie kasinon mukaan alle minuutin.</li>
  <li><strong>Tee talletus.</strong> Bonus aktivoituu vähintään 10 euron talletuksesta.</li>
  <li><strong>Kierrätä talletus 40 kertaa.</strong> Yli 50 euron panokset lasketaan kierrätykseen
      vain 50 euroon asti, eli suurilla panoksilla kierrätys ei edisty nopeammin.</li>
  <li><strong>Saat bonuksen käteisenä.</strong> Kun kierrätys on valmis seitsemän vuorokauden
      sisällä, bonus maksetaan tilille ilman uutta kierrätysvaatimusta.</li>
</ol>

<h2>Mitkä pelit kerryttävät kierrätystä</h2>
<p>Pelien painotus ratkaisee, ehtiikö kierrätys valmistua viikossa. Betpandan ehdot jakavat pelit
näin:</p>
<ul>
  <li><strong>Kolikkopelit: 100 %</strong> — ainoa peliryhmä, joka kerryttää kierrätystä täydellä painolla.</li>
  <li><strong>Live-pelit: 20 %</strong> — live-pöydissä kierrätykseen tarvitaan viisinkertainen määrä panoksia.</li>
  <li><strong>0 %:</strong> provably fair -pelit, progressiiviset jackpot-pelit, urheiluvedot, baccarat
      sekä pokeri ja videopokeri. Nämä eivät kerrytä kierrätystä lainkaan.</li>
</ul>
<p>Käytännössä bonus on siis kolikkopelaajan bonus. Jos pelaat pääasiassa live-pöydissä tai
urheiluvetoja, seitsemän vuorokauden aikaraja on hyvin tiukka tai kierrätys ei edisty ollenkaan.</p>

<h2>Rajoitukset, jotka kannattaa tietää</h2>
<ul>
  <li><strong>Yksi tili per pelaaja.</strong> Ehdot rajaavat tarjouksen yhteen tiliin pelaajaa,
      taloutta, IP-osoitetta ja laitetta kohden. Useamman tilin käyttö johtaa tarjouksen
      menettämiseen.</li>
  <li><strong>Aikaraja on ehdoton.</strong> Jos 40-kertainen kierrätys ei täyty seitsemässä
      vuorokaudessa, bonus ja siihen liittyvät voitot menetetään.</li>
  <li><strong>Yksittäisiä pelejä on rajattu ulos.</strong> Ehdoissa mainitaan nimeltä muun muassa
      Scrooge, Devil's Delight, Aliens ja Wish Master.</li>
  <li><strong>Tarjous on vapaa-ajan pelaajille.</strong> Kasino pidättää oikeuden sulkea pois
      pelaajat, joiden toiminnassa se katsoo olevan väärinkäyttöä, sekä muuttaa tai lopettaa
      kampanjan ilman ennakkoilmoitusta.</li>
  <li><strong>Nostoihin sovelletaan normaaleja tarkistuksia.</strong> Bonusrahan ja voittojen
      nostot kulkevat kasinon tavallisten nosto- ja compliance-käytäntöjen kautta.</li>
</ul>

<h2>Lisenssi ja verotus</h2>
<p>Betpandaa operoi <strong>Star Bright Media S.R.L</strong>, joka on rekisteröity Costa Ricaan
(yritystunnus 3-102-880000). Costa Rica ei myönnä varsinaisia rahapelilisenssejä, vaan yhtiöt
rekisteröidään siellä tavallisina yrityksinä. Kasinolla ei siis ole ETA-alueen pelilisenssiä.</p>
<p>Tällä on suomalaiselle pelaajalle suora rahallinen seuraus: <strong>ETA-alueen ulkopuolella
toimivalta kasinolta saadut voitot ovat Suomessa veronalaista tuloa</strong> ja ne on ilmoitettava
verotuksessa. ETA-alueella lisensoidun kasinon voitot ovat vastaavasti verovapaita. Jos verovapaus
on sinulle tärkeää, vertaa vaihtoehtoja
<a href="/verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet/">verovapaiden kasinoiden
listalta</a>.</p>

<h2>Yhteenveto</h2>
<p>Betpandan bonus on rehellisen rakenteinen siinä mielessä, että maksettuun bonukseen ei liity
piilokierrätystä — kun 40-kertainen kierrätys on tehty, raha on omaa. Tiukkuus on ajassa ja
pelivalikoimassa: seitsemän vuorokautta on lyhyt aika 40-kertaiseen kierrätykseen, ja vain
kolikkopelit kerryttävät sitä täysin. Bonuskatto on ilmoitettu bitcoineina, joten sen euroarvo
vaihtelee. Suurin yksittäinen huomio on lisenssi: ilman ETA-lisenssiä voitot ovat Suomessa
veronalaisia, mikä syö tuotosta enemmän kuin yksikään bonusehto.</p>
`.trim(),
  bonusesHtml: `
<ul>
  <li>100 % ensitalletuksesta, enimmäisbonus 1 BTC (tai vastaava kryptomäärä)</li>
  <li>Vähimmäistalletus 10 €</li>
  <li>Kierrätys 40 x talletus, aikaa 7 vuorokautta</li>
  <li>Kierrätykseen laskettava enimmäispanos 50 € / kierros</li>
  <li>Kolikkopelit kerryttävät 100 %, live-pelit 20 %, muut 0 %</li>
  <li>Bonus maksetaan kierrätyksen jälkeen käteisenä ilman lisäkierrätystä</li>
</ul>
`.trim(),
  showNoReview: false,
};

/** Hand-written reviews, keyed by slug. */
export const MANUAL_REVIEWS: Readonly<Record<string, CasinoReview>> = {
  betpanda: BETPANDA,
};

/**
 * Head copy for the manual reviews.
 *
 * A scraped review's <title> and description come from the preserved Rank Math
 * head in the Phase-1 SEO registry, which only has entries for URLs that
 * existed on the old WordPress site. A manual review is a net-new URL with no
 * registry entry, so the route builds a clean head from these values instead.
 * Written by hand rather than generated from a template so each one reads as a
 * real search result and stays inside the ~60/155-character limits.
 */
export interface ManualReviewHead {
  title: string;
  description: string;
}

export const MANUAL_REVIEW_HEADS: Readonly<Record<string, ManualReviewHead>> = {
  betpanda: {
    title: "Betpanda arvostelu – 100 % bonus ja 40x kierrätys",
    description:
      "Betpandan tervetuliaisbonus on 100 % ensitalletuksesta. Kierrätys 40x, " +
      "vähimmäistalletus 10 €, aikaa 7 vrk — ja bonus maksetaan käteisenä. Lue ehdot.",
  },
};

/** Head copy for this slug's manual review, or null. */
export function getManualReviewHead(slug: string): ManualReviewHead | null {
  return MANUAL_REVIEW_HEADS[slug] ?? null;
}

/** Slugs that have a hand-written review. */
export const MANUAL_REVIEW_SLUGS: readonly string[] = Object.keys(MANUAL_REVIEWS);

/** The hand-written review for this slug, or null. */
export function getManualReview(slug: string): CasinoReview | null {
  return MANUAL_REVIEWS[slug] ?? null;
}
