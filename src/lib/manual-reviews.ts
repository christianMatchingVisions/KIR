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
 * Source for every figure below: Betpanda's own promotion terms pages — the
 * "Bounty Welcome Bonus" and the "Weekly Cashback" — both supplied by the owner
 * on 2026-10-20. The operator is Star Bright Media S.R.L (Costa Rica, corporate
 * ID 3-102-880000), stated in the footer of those pages.
 *
 * Where the marketing copy and the small print disagree, the review follows the
 * small print and says so. The cashback page promises money back "guaranteed"
 * with "no opt-in", while its own terms require at least 50 casino wagers in the
 * qualifying week and the credit has to be claimed before the next one lands.
 * Both conditions are stated in the prose.
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
    "seitsemässä päivässä — ja vain kolikkopelit kerryttävät sitä täydellä painolla. Jatkuvana " +
    "etuna on viikoittainen 10 %:n cashback nettohäviöistä, joka maksetaan rahana ilman " +
    "kierrätystä; se vaatii vähintään 50 kasinopanosta viikossa. Kasino toimii Costa Ricaan " +
    "rekisteröidyn yhtiön kautta ilman ETA-lisenssiä, joten voitot ovat suomalaiselle pelaajalle " +
    "veronalaista tuloa.",
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
    "Viikoittainen 10 %:n cashback nettohäviöistä, ilman kierrätystä",
    "Bonus maksetaan kierrätyksen jälkeen käteisenä ilman lisäkierrätystä",
    "Vähimmäistalletus vain 10 €",
    "Kolikkopelit kerryttävät kierrätystä täydellä 100 %:n painolla",
    "Kumpikaan kampanja ei ole määräaikainen",
  ],
  cons: [
    "Kierrätys 40 x talletus, ja aikaa vain 7 vuorokautta",
    "Live-pelit kerryttävät kierrätystä 20 %, urheiluvedot ja pokeri 0 %",
    "Ei ETA-pelilisenssiä — voitot ovat Suomessa veronalaista tuloa",
    "Cashback vaatii vähintään 50 kasinopanosta viikossa",
  ],
  reviewHtml: `
<p><strong>Betpanda</strong> on kryptopainotteinen nettikasino, joka tarjoaa uudelle pelaajalle
<strong>100 % ensitalletusbonuksen</strong>. Bonus toimii eri tavalla kuin tavallinen
tervetuliaisbonus: sitä ei lisätä tilille pelattavaksi bonusrahaksi, vaan se maksetaan käteisenä
vasta kun kierrätysvaatimus on täytetty. Vakiotarjouksena on lisäksi <strong>viikoittainen 10 %:n
cashback</strong> nettohäviöistä ilman kierrätystä. Alla ovat kummankin kampanjan ehdot sellaisina
kuin kasino ne itse julkaisee, ja mitä ne käytännössä tarkoittavat.</p>

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

<h2>Viikoittainen cashback: 10 % nettohäviöistä</h2>
<p>Tervetuliaisbonuksen rinnalla Betpanda maksaa <strong>viikoittaista cashbackia</strong>, joka on
10 % viikon nettohäviöistä. Palautus maksetaan rahana <strong>joka keskiviikko klo 13.00 UTC</strong>
eli Suomen aikaa klo 15 talvella ja klo 16 kesällä. Cashbackiin <strong>ei liity kierrätystä</strong>,
joten se on nostettavissa heti.</p>
<p>Nettohäviö tarkoittaa viikon häviöitä miinus voitot oikealla rahalla. Laskentajakso on keskiviikosta
keskiviikkoon klo 12.00 UTC. Kasinon oma esimerkki: <strong>500 euron nettohäviöstä palautuu 50 euroa</strong>.</p>
<h3>Cashbackin ehdot</h3>
<ul>
  <li><strong>Palautus:</strong> 10 % nettohäviöistä, maksetaan rahana ilman kierrätystä</li>
  <li><strong>Maksupäivä:</strong> keskiviikko klo 13.00 UTC</li>
  <li><strong>Laskentajakso:</strong> ke klo 12.00 UTC – seuraava ke klo 12.00 UTC</li>
  <li><strong>Vähimmäisvaatimus:</strong> 50 kasinopanosta jakson aikana — ilmaiskierrokset ja
      bonuspelit eivät laske mukaan</li>
  <li><strong>Kerryttävät pelit:</strong> kolikkopelit ja live-kasino. Urheiluvedot eivät kerrytä,
      eivätkä bonusrahalla pelatut häviöt.</li>
  <li><strong>Lunastus:</strong> cashback on lunastettavissa siihen asti, kunnes seuraava cashback
      maksetaan</li>
</ul>
<p>Kasino markkinoi cashbackia sanoilla "taatusti" ja "ei erillistä liittymistä", mutta ehdoissa on
yksi kynnys, joka kannattaa huomata: <strong>jaksolta vaaditaan vähintään 50 kasinopanosta</strong>.
Satunnaisella parin panoksen viikolla cashbackia ei siis kerry. Toinen huomio on lunastus — palautus
on otettava käyttöön ennen seuraavan viikon maksua. Kierrätyksen puuttuminen on silti aito etu:
palautunut raha on heti nostettavissa, toisin kuin useimmilla kasinoilla, joilla cashback tulee
bonuksena kierrätysvaatimuksen kanssa.</p>

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
vaihtelee. Viikoittainen cashback on tarjouksista arkisempi mutta käytännössä arvokkaampi:
10 % nettohäviöistä rahana ilman kierrätystä on säännöllisesti pelaavalle enemmän kuin kertaluontoinen
bonus, kunhan 50 panoksen vähimmäisvaatimus täyttyy. Suurin yksittäinen huomio on lisenssi: ilman
ETA-lisenssiä voitot ovat Suomessa veronalaisia, mikä syö tuotosta enemmän kuin yksikään bonusehto.</p>
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
<p><strong>Viikoittainen cashback:</strong></p>
<ul>
  <li>10 % viikon nettohäviöistä, maksetaan rahana ilman kierrätystä</li>
  <li>Maksupäivä keskiviikko klo 13.00 UTC, laskentajakso ke–ke klo 12.00 UTC</li>
  <li>Vaatii vähintään 50 kasinopanosta jakson aikana</li>
  <li>Kolikkopelit ja live-kasino kerryttävät; urheiluvedot ja bonuspelit eivät</li>
</ul>
`.trim(),
  showNoReview: false,
};

/**
 * Kirpee Casino — reviewed 2026-10-21.
 *
 * Source: Kirpee's own daily-cashback campaign page and site footer, supplied
 * by the owner. No welcome-bonus terms were supplied, so the review covers the
 * cashback only and says nothing about a deposit bonus.
 *
 * LICENCE: the footer names BP Group Ltd, registered in Malta, licensed by the
 * Malta Gaming Authority under MGA/B2C/203/2011 (issued 1 August 2018, Type 1).
 * Malta is in the EEA, so license-tier.ts marks the winnings tax-free for a
 * Finnish player — the one genuinely strong point this brand has over the
 * others added in the same batch, and it leads the pros list for that reason.
 *
 * PAYMENT METHODS omitted: the supplied list arrived garbled (bank names
 * mangled in transit), and a payment logo we cannot read is not a fact.
 */
const KIRPEE: CasinoReview = {
  slug: "kirpee",
  name: "Kirpee Casino",
  url: "/casino/kirpee/",
  ctaSlug: "kirpee",
  logoUrl: "/wp-content/uploads/kirpee-logo.png",
  logoAlt: "Kirpee Casino -logo: kirkaanvihreä Kirpee-teksti mustalla taustalla",
  ratingOverall: 4.5,
  subRatings: [],
  bonusText: "Päivittäinen cashback jopa 20 % nettohäviöistä",
  license: "MGA (Malta) – MGA/B2C/203/2011",
  paymentMethods: [],
  providers: [],
  verdict:
    "Kirpeen vahvuus on Maltan MGA-lisenssi: ETA-alueen lisenssi tarkoittaa, että voitot ovat " +
    "suomalaiselle pelaajalle verovapaita. Kampanjapuoli nojaa päivittäiseen cashbackiin, joka " +
    "palauttaa 5–20 % päivän nettohäviöistä portaittain. Kaksi ehtoa kannattaa lukea tarkkaan: " +
    "palautus tulee bonusrahana 10-kertaisella kierrätyksellä, joka on hoidettava vuorokaudessa, " +
    "ja cashbackia kerryttävät vain kolikkopelit.",
  foundedYear: null,
  minDeposit: "50 € (cashbackin ehto)",
  support: { liveChat: true },
  templateClaims: { registrationFree: false },
  pros: [
    "MGA-lisenssi Maltalta — voitot verovapaita suomalaispelaajalle",
    "Cashback joka päivä, ei kerran viikossa",
    "Ylin porras palauttaa jopa 20 % nettohäviöistä",
    "Cashbackiin ei tarvitse erikseen ilmoittautua",
  ],
  cons: [
    "Palautus maksetaan bonusrahana, ei käteisenä",
    "Kierrätys 10x ja aikaa vain 24 tuntia",
    "Cashback vaatii vähintään 50 euron talletuksen",
    "Vain kolikkopelien häviöt kerryttävät cashbackia",
  ],
  reviewHtml: `
<p><strong>Kirpee Casino</strong> on Maltan MGA-lisenssillä toimiva nettikasino, jonka pääkampanja
on <strong>päivittäinen cashback</strong>: osa päivän nettohäviöistä palautuu seuraavana päivänä.
Palautusprosentti nousee portaittain häviön mukana, ylimmillään 20 prosenttiin. Alla cashbackin
ehdot sellaisina kuin kasino ne itse julkaisee.</p>

<h2>Cashback-portaat</h2>
<p>Palautus lasketaan päivän nettohäviöstä, ja käytössä on <strong>vain yksi porras päivää
kohden</strong> — häviön suuruus ratkaisee, mihin portaaseen päivä osuu.</p>
<table>
  <thead>
    <tr><th>Taso</th><th>Päivän nettohäviö</th><th>Palautus</th><th>Enintään / päivä</th></tr>
  </thead>
  <tbody>
    <tr><td>Taso 1</td><td>50–100 €</td><td>5 %</td><td>5 €</td></tr>
    <tr><td>Taso 2</td><td>101–500 €</td><td>10 %</td><td>50 €</td></tr>
    <tr><td>Taso 3</td><td>501–2 000 €</td><td>15 %</td><td>300 €</td></tr>
    <tr><td>VIP</td><td>2 001 € –</td><td>jopa 20 %</td><td>tapauskohtainen</td></tr>
  </tbody>
</table>
<p>Ylin 20 prosentin taso on VIP-pelaajille ja sovitaan tapauskohtaisesti oman
VIP-yhteyshenkilön kanssa. Markkinoinnin lupaama "jopa 20 %" koskee siis käytännössä
yli 2 000 euron päivähäviöitä — tavallisella pelipäivällä palautus on 5 tai 10 prosenttia.</p>

<h2>Cashbackin ehdot</h2>
<ul>
  <li><strong>Laskentajakso:</strong> päivittäin klo 09.00–08.59</li>
  <li><strong>Vähimmäistalletus:</strong> 50 € — ilman sitä cashbackia ei kerry</li>
  <li><strong>Kerryttävät pelit:</strong> vain kolikkopelit. Pöytäpelit ja live-kasino eivät kerrytä.</li>
  <li><strong>Vain oikealla rahalla:</strong> bonusrahalla ja ilmaiskierroksilla pelatut häviöt
      eivät kerrytä cashbackia</li>
  <li><strong>Maksutapa:</strong> palautus tulee <strong>bonusrahana</strong>, ei käteisenä</li>
  <li><strong>Kierrätys:</strong> 10 x palautus, ja se on tehtävä <strong>24 tunnin sisällä</strong></li>
</ul>
<p>Kaksi viimeistä kohtaa ovat ne, jotka kannattaa lukea ennen kuin laskee cashbackin arvon. Palautus
ei ole rahaa vaan bonus, ja 10-kertainen kierrätys vuorokaudessa on tiukka: 50 euron palautus
tarkoittaa 500 euron panostusta yhden päivän aikana. Jos kierrätys ei ehdi täyttyä, bonus raukeaa.
Vertailun vuoksi kierrätysvapaat palautukset löydät
<a href="/kierratysvapaat-bonukset/">kierrätysvapaiden bonusten listalta</a>.</p>

<h2>Lisenssi ja verotus</h2>
<p>Sivustoa operoi <strong>BP Group Ltd</strong>, Maltalle rekisteröity yhtiö (The Ferries Business
Centre, Sliema). Yhtiöllä on <strong>Maltan peliviranomaisen MGA-lisenssi numerolla
MGA/B2C/203/2011</strong>, myönnetty 1.8.2018, Type 1 -pelipalveluille.</p>
<p>Malta kuuluu ETA-alueeseen, joten <strong>voitot ovat suomalaiselle pelaajalle
verovapaita</strong>. Tämä on Kirpeen selkein etu: moni kryptopainotteinen tai Curaçaon lisenssillä
toimiva kasino tarjoaa näyttävämpiä bonuksia, mutta niiden voitoista maksetaan Suomessa veroa.
Lisää ETA-lisensoituja vaihtoehtoja on
<a href="/verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet/">verovapaiden kasinoiden
vertailussa</a>.</p>

<h2>Yhteenveto</h2>
<p>Kirpee on tasainen MGA-kasino, jonka tärkein myyntivaltti on verovapaus eivätkä kampanjat.
Päivittäinen cashback on rakenteeltaan asiallinen — portaat on ilmoitettu selvästi ja ylin katto
on avoimesti tapauskohtainen — mutta bonusrahana maksettu palautus 10-kertaisella vuorokauden
kierrätyksellä on selvästi vähemmän arvokas kuin käteispalautus. Jos pelaat pääasiassa
kolikkopelejä ja talletat vähintään 50 euroa, cashback tuo oikeaa lisäarvoa; satunnaispelaajalle
se jää teoreettiseksi.</p>
`.trim(),
  bonusesHtml: `
<p><strong>Päivittäinen cashback:</strong></p>
<ul>
  <li>5 % kun päivän nettohäviö on 50–100 € (enintään 5 €)</li>
  <li>10 % kun nettohäviö on 101–500 € (enintään 50 €)</li>
  <li>15 % kun nettohäviö on 501–2 000 € (enintään 300 €)</li>
  <li>VIP: jopa 20 % yli 2 000 euron häviöistä, tapauskohtaisesti</li>
  <li>Vain yksi porras päivää kohden; laskenta klo 09.00–08.59</li>
  <li>Vaatii 50 euron talletuksen; vain kolikkopelit kerryttävät</li>
  <li>Maksetaan bonusrahana, kierrätys 10x 24 tunnin sisällä</li>
</ul>
`.trim(),
  showNoReview: false,
};

/**
 * Tuhti Casino — reviewed 2026-10-21.
 *
 * Source: Tuhti's own cashback page, its welcome-offer line and the site
 * footer, all supplied by the owner.
 *
 * LICENCE — CURAÇAO ONLY, DELIBERATELY. The footer names two companies: Trivico
 * BV (Curaçao, reg. 166069(0), licensed by the GCB — the gaming licence) and
 * Fundsflare Limited (Cyprus, reg. HE454467), described as a wholly owned
 * subsidiary handling payments. Cyprus is NOT the gaming regulator. Putting it
 * in the licence field would be actively harmful, because "cyprus" is an EEA
 * marker in license-tier.ts: the badge would flip to "Voitot verovapaita" and
 * tell a Finnish reader their winnings are tax-free when the gaming licence is
 * Curaçao and they are not.
 *
 * Tuhti's cashback is the same ladder as Kirpee's with two differences, both
 * stated in the prose: the level-3 daily cap is 200 € rather than 300 €, and
 * the campaign requires a one-off opt-in.
 */
const TUHTI: CasinoReview = {
  slug: "tuhti",
  name: "Tuhti Casino",
  url: "/casino/tuhti/",
  ctaSlug: "tuhti",
  logoUrl: "/wp-content/uploads/tuhti-logo.png",
  logoAlt: "Tuhti Casino -logo: valkoinen Tuhti-teksti tummansinisellä taustalla",
  ratingOverall: 4.5,
  subRatings: [],
  bonusText: "20 x 1 € ilmaiskierrosta (Sugar Rush 1000)",
  license: "Curaçao (GCB)",
  paymentMethods: [],
  providers: ["Pragmatic Play"],
  verdict:
    "Tuhti yhdistää tervetulotarjouksen ja päivittäisen cashbackin: aloitusetuna on 20 kappaletta " +
    "euron ilmaiskierroksia Sugar Rush 1000 -peliin, ja sen jälkeen päivän nettohäviöistä palautuu " +
    "5–20 % portaittain. Cashback maksetaan bonusrahana 10-kertaisella kierrätyksellä, joka on " +
    "tehtävä vuorokaudessa, ja se vaatii kertaluontoisen osallistumisen. Pelilisenssi on Curaçaon " +
    "GCB, joten voitot ovat Suomessa veronalaista tuloa.",
  foundedYear: null,
  minDeposit: "50 € (cashbackin ehto)",
  support: { liveChat: true },
  templateClaims: { registrationFree: false },
  pros: [
    "Tervetulotarjouksena 20 x 1 € ilmaiskierrosta Sugar Rush 1000 -peliin",
    "Cashback joka päivä, ylimmillään 20 % nettohäviöistä",
    "Osallistuminen vaaditaan vain kerran, ei joka päivä",
    "Palautus maksetaan päivittäin klo 12.15, joten odotus on lyhyt",
  ],
  cons: [
    "Ei ETA-pelilisenssiä — voitot ovat Suomessa veronalaista tuloa",
    "Cashback maksetaan bonusrahana, kierrätys 10x 24 tunnissa",
    "Kolmannen portaan päiväkatto 200 € on matalampi kuin monella kilpailijalla",
    "Vain kolikkopelien häviöt kerryttävät cashbackia",
  ],
  reviewHtml: `
<p><strong>Tuhti Casino</strong> tarjoaa uudelle pelaajalle <strong>20 kappaletta euron
ilmaiskierroksia</strong> Pragmatic Playn Sugar Rush 1000 -peliin, ja jatkuvana etuna
<strong>päivittäisen cashbackin</strong>, joka palauttaa osan päivän nettohäviöistä. Alla molempien
ehdot sellaisina kuin kasino ne itse julkaisee.</p>

<h2>Tervetulotarjous: 20 x 1 € ilmaiskierrosta</h2>
<p>Aloitusetuna on 20 ilmaiskierrosta, joiden kierroskohtainen arvo on yksi euro — eli kierrosten
yhteisarvo on 20 euroa. Kierrokset on kohdistettu yhteen peliin, <strong>Sugar Rush 1000</strong>.
Kasino ei julkaise tällä sivulla kierrosten kierrätysvaatimusta eikä voittokattoa, joten ne
kannattaa tarkistaa kasinon omista bonusehdoista ennen tarjouksen lunastamista.</p>

<h2>Päivittäinen cashback</h2>
<p>Cashback lasketaan päivän nettohäviöstä, ja käytössä on <strong>vain yksi porras päivää
kohden</strong>.</p>
<table>
  <thead>
    <tr><th>Taso</th><th>Päivän nettohäviö</th><th>Palautus</th><th>Enintään / päivä</th></tr>
  </thead>
  <tbody>
    <tr><td>Taso 1</td><td>50–100 €</td><td>5 %</td><td>5 €</td></tr>
    <tr><td>Taso 2</td><td>101–500 €</td><td>10 %</td><td>50 €</td></tr>
    <tr><td>Taso 3</td><td>501–2 000 €</td><td>15 %</td><td>200 €</td></tr>
    <tr><td>VIP</td><td>2 001 € –</td><td>jopa 20 %</td><td>tapauskohtainen</td></tr>
  </tbody>
</table>
<p>Ylin 20 prosentin taso on VIP-pelaajille ja sovitaan oman yhteyshenkilön kanssa. Huomaa, että
kolmannen portaan päiväkatto on <strong>200 euroa</strong>: 2 000 euron häviöstä 15 prosenttia olisi
300 euroa, mutta katto leikkaa palautuksen 200 euroon. Portaan yläpäässä todellinen palautusprosentti
on siis 10, ei 15.</p>

<h3>Cashbackin ehdot</h3>
<ul>
  <li><strong>Osallistuminen:</strong> kampanjaan liitytään kerran, minkä jälkeen se on voimassa
      toistaiseksi</li>
  <li><strong>Laskentajakso:</strong> päivittäin klo 06.00–05.59</li>
  <li><strong>Maksuaika:</strong> palautus tilille päivittäin klo 12.15</li>
  <li><strong>Vähimmäistalletus:</strong> 50 €</li>
  <li><strong>Kerryttävät pelit:</strong> vain kolikkopelit</li>
  <li><strong>Vain oikealla rahalla:</strong> bonusraha ja ilmaiskierrokset eivät kerrytä</li>
  <li><strong>Maksutapa:</strong> bonusrahana, kierrätys 10 x palautus 24 tunnin sisällä</li>
</ul>
<p>Kierrätysehto on cashbackin heikoin kohta: 50 euron palautus vaatii 500 euron panostuksen saman
vuorokauden aikana tai bonus raukeaa. Palautus on siis pelitiliä täydentävä etu, ei nostettavaa
rahaa.</p>

<h2>Lisenssi ja verotus</h2>
<p>Tuhti.com on <strong>Trivico BV:n</strong> omistama ja operoima. Yhtiö on rekisteröity
Curaçaoon (rekisterinumero 166069(0)) ja sillä on <strong>Curaçaon GCB-pelilisenssi</strong>.
Footerissa mainitaan lisäksi kyproslainen Fundsflare Limited, joka on Trivicon kokonaan omistama
tytäryhtiö — se hoitaa maksuliikennettä, <strong>se ei ole pelilisenssin myöntäjä</strong>.</p>
<p>Pelilisenssi on siis Curaçaon, ei ETA-alueen. Käytännön seuraus suomalaiselle pelaajalle:
<strong>voitot ovat Suomessa veronalaista tuloa</strong> ja ne on ilmoitettava verotuksessa.
ETA-lisensoidut vaihtoehdot löydät
<a href="/verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet/">verovapaiden kasinoiden
vertailusta</a>.</p>

<h2>Yhteenveto</h2>
<p>Tuhti on kampanjarakenteeltaan lähes identtinen Kirpeen kanssa, mutta kahdella erolla: kolmannen
portaan päiväkatto on 100 euroa matalampi, ja cashbackiin pitää liittyä kerran. Ilmaiskierrokset
ovat konkreettinen aloitusetu, mutta niiden kierrätysehtoja ei julkaista kampanjasivulla.
Ratkaisevin ero kilpailijoihin on kuitenkin lisenssi: Curaçaon lisenssillä voitot ovat Suomessa
veronalaisia, mikä syö tuotosta enemmän kuin cashbackin prosentit tuovat.</p>
`.trim(),
  bonusesHtml: `
<p><strong>Tervetulotarjous:</strong></p>
<ul>
  <li>20 x 1 € ilmaiskierrosta peliin Sugar Rush 1000 (yhteisarvo 20 €)</li>
  <li>Kierrosten kierrätysvaatimusta ei ilmoiteta kampanjasivulla — tarkista kasinon bonusehdoista</li>
</ul>
<p><strong>Päivittäinen cashback:</strong></p>
<ul>
  <li>5 % kun päivän nettohäviö on 50–100 € (enintään 5 €)</li>
  <li>10 % kun nettohäviö on 101–500 € (enintään 50 €)</li>
  <li>15 % kun nettohäviö on 501–2 000 € (enintään 200 €)</li>
  <li>VIP: jopa 20 % yli 2 000 euron häviöistä, tapauskohtaisesti</li>
  <li>Laskenta klo 06.00–05.59, maksu päivittäin klo 12.15</li>
  <li>Vaatii 50 euron talletuksen ja kertaluontoisen osallistumisen</li>
  <li>Maksetaan bonusrahana, kierrätys 10x 24 tunnin sisällä</li>
</ul>
`.trim(),
  showNoReview: false,
};

/**
 * Aurakasino — reviewed 2026-10-21.
 *
 * Source: Aurakasino's own welcome-offer page and its full bonus terms, both
 * supplied by the owner.
 *
 * CONFLICTING BONUS FIGURE — handled, not papered over. The welcome-offer page
 * advertises "100% up to 500 €, min. 20 €". The binding bonus terms, §1.1, say
 * "Welcome Bonus: 100% of your first deposit up to 200 €". Two numbers from the
 * same operator, so the review states both, says which document governs, and
 * tells the reader to check the figure at sign-up. bonusText quotes the match
 * with no cap for the same reason. Get the affiliate manager to confirm and the
 * cap can be stated outright.
 *
 * LICENCE: no regulator is named anywhere in the supplied material, so the
 * licence field is empty and license-tier.ts returns "unknown" — no badge, no
 * guessed tax treatment. The prose says plainly that the licence is unstated,
 * which for a Finnish reader is itself the relevant fact.
 *
 * The terms carry "Last updated: January 17, 2022", noted in the prose.
 */
const AURAKASINO: CasinoReview = {
  slug: "aurakasino",
  name: "Aurakasino",
  url: "/casino/aurakasino/",
  ctaSlug: "aurakasino",
  logoUrl: "/wp-content/uploads/aurakasino-logo.jpg",
  logoAlt: "Aurakasinon logo: Aura Kasino -teksti neonsinisellä hehkulla mustassa kehyksessä",
  ratingOverall: 4.5,
  subRatings: [],
  bonusText: "100 % ensitalletusbonus",
  license: "",
  paymentMethods: [],
  providers: [],
  verdict:
    "Aurakasinon kiinnostavin piirre ei ole bonuksen koko vaan sen rakenne: kierrätystä ei tarvitse " +
    "viedä loppuun, vaan nostaa voi sen osuuden saldosta, jonka on ehtinyt kierrättää. Kierrätys on " +
    "30-kertainen bonus ja talletus, ja vain kolikkopelit kerryttävät sitä täysin. Huomioi kaksi " +
    "asiaa: kasinon oma markkinointi lupaa bonuksen 500 euroon asti, kun bonusehdot puhuvat 200 " +
    "eurosta, eikä pelilisenssiä kerrota missään toimittamassamme aineistossa.",
  foundedYear: null,
  minDeposit: "20 €",
  support: { liveChat: true },
  templateClaims: { registrationFree: false, formalLicense: false },
  pros: [
    "Kierrätystä ei tarvitse tehdä loppuun — voit nostaa kierrättämäsi osuuden",
    "Kierrätys 30x koskee kolikkopeleillä 100 %:n painolla",
    "Vähimmäistalletus vain 20 €",
    "Bonusehdot on kirjoitettu poikkeuksellisen selkeästi ja esimerkein",
  ],
  cons: [
    "Pelilisenssiä ei kerrota — emme voi vahvistaa valvojaa emmekä verokohtelua",
    "Bonuksen enimmäismäärästä kaksi eri lukua: 500 € mainoksessa, 200 € ehdoissa",
    "Pöytä- ja live-pelit kerryttävät kierrätystä vain 10 %",
    "Bonusehdot päivitetty viimeksi tammikuussa 2022",
  ],
  reviewHtml: `
<p><strong>Aurakasino</strong> tarjoaa uudelle pelaajalle <strong>100 %:n ensitalletusbonuksen</strong>.
Bonuksen rakenteessa on yksi aito poikkeus alan tavasta: <strong>kierrätystä ei tarvitse viedä
loppuun</strong>, vaan nostaa voi sen osuuden saldosta, jonka on ehtinyt kierrättää. Alla bonuksen
ehdot sellaisina kuin kasino ne itse julkaisee — sekä yksi ristiriita, joka kannattaa tietää.</p>

<h2>Bonuksen enimmäismäärässä on ristiriita</h2>
<p>Kasinon oma tervetulosivu mainostaa bonusta sanoin <strong>"100 % jopa 500 €"</strong>
vähintään 20 euron talletuksella. Sitovissa bonusehdoissa kohdassa 1.1 lukee kuitenkin
<strong>"Tervetuliaisbonus: 100 % ensitalletuksesta, enintään 200 €"</strong>.</p>
<p>Kyseessä on kaksi eri lukua samalta operaattorilta. Ristiriitatilanteessa sitovat ehdot
ratkaisevat, eli varmin oletus on 200 euron katto — mutta koska emme voi vahvistaa kumpi luku on
ajan tasalla, <strong>tarkista bonuksen enimmäismäärä rekisteröitymisen yhteydessä</strong> ennen
kuin talletat ison summan. Tällä sivulla emme ilmoita kattoa kumpanakaan lukuna.</p>

<h2>Osittainen nosto — bonuksen paras ominaisuus</h2>
<p>Useimmilla kasinoilla kesken jäänyt kierrätys tarkoittaa, että bonus ja sillä voitetut rahat
menetetään. Aurakasinolla voit nostaa <strong>sen prosenttiosuuden saldostasi, jonka olet
kierrättänyt</strong>.</p>
<p>Kasinon oma esimerkki: jos olet tallettanut 100 € ja ottanut 100 € bonuksen, ja olet täyttänyt
kierrätyksestä 80 % saldon ollessa 1 000 €, voit nostaa 800 € (80 %) ja loput jäävät kasinolle.
Tämä on pelaajan kannalta selvästi tavanomaista reilumpi malli, ja se on syytä laskea mukaan
bonuksen arvoon.</p>

<h2>Kierrätys ja pelien painotus</h2>
<ul>
  <li><strong>Kierrätys:</strong> 30 x (bonus + talletus) 100 %:n bonukselle</li>
  <li><strong>Muut bonukset:</strong> alle tai yli 100 %:n bonuksille 60 x bonuksen määrä</li>
  <li><strong>Ilmaiskierrokset:</strong> 60 x kierroksilla voitettu summa</li>
  <li><strong>Urheiluvedot:</strong> 8 x (bonus + talletus), kertoimen oltava vähintään 1,80 ja
      kohteessa vähintään kolme lopputulosvaihtoehtoa</li>
  <li><strong>Voimassaolo:</strong> bonus ja sillä voitetut rahat 30 vuorokautta</li>
  <li><strong>Enimmäispanos:</strong> enintään 30 % aloitussaldosta, tai 10 € per kierros ja
      50 senttiä per voittolinja</li>
</ul>
<p>Pelien painotus kierrätyksessä:</p>
<ul>
  <li>Kolikkopelit, keno, bingo ja raaputusarvat: <strong>100 %</strong></li>
  <li>Muut pelit: 20 %</li>
  <li>Videopokeri: 15 %</li>
  <li>Ruletti, pöytäpelit ja live-pelit: <strong>10 %</strong></li>
</ul>
<p>Kolikkopelaajalle 30-kertainen kierrätys on kohtuullinen. Live-pöydissä se on käytännössä
kymmenkertainen: 10 %:n painolla 30 x muuttuu 300-kertaiseksi panostukseksi.</p>

<h2>Lisenssiä ei kerrota</h2>
<p>Toimittamassamme aineistossa — tervetulosivulla eikä bonusehdoissa — <strong>ei mainita
pelilisenssiä eikä valvovaa viranomaista</strong>. Emme siksi ilmoita kasinolle lisenssiä, emmekä
voi kertoa, ovatko voitot suomalaiselle pelaajalle verovapaita vai veronalaisia: se riippuu
täysin siitä, onko lisenssi ETA-alueelta vai sen ulkopuolelta.</p>
<p>Tämä on olennainen puute. ETA-lisensoidulla kasinolla voitot ovat verovapaita, ETA-alueen
ulkopuolisella veronalaista tuloa — ero voi olla satoja euroja. <strong>Tarkista lisenssi kasinon
sivun alatunnisteesta ennen pelaamista.</strong> Varmasti ETA-lisensoituja vaihtoehtoja on
<a href="/verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet/">verovapaiden kasinoiden
vertailussa</a>.</p>
<p>Huomaa myös, että bonusehtojen oma päiväys on <em>17.1.2022</em>, joten osa yksityiskohdista
voi olla vanhentunut.</p>

<h2>Yhteenveto</h2>
<p>Aurakasinon bonus on rakenteeltaan alan parhaasta päästä: osittainen nosto poistaa bonusten
pahimman ongelman eli kesken jääneen kierrätyksen menetyksen, ja 30-kertainen kierrätys on
kolikkopeleillä täysin kohtuullinen. Kaksi asiaa vetää arviota alas. Bonuksen enimmäismäärästä on
julkaistu kaksi eri lukua, ja pelilisenssi puuttuu kokonaan — jälkimmäinen tarkoittaa, ettei
voittojen verokohtelua voi tietää etukäteen. Jos lisenssi osoittautuu ETA-alueen lisenssiksi,
tämä on vertailun kiinnostavimpia bonuksia.</p>
`.trim(),
  bonusesHtml: `
<ul>
  <li>100 % ensitalletuksesta, vähimmäistalletus 20 €</li>
  <li>Enimmäismäärästä kaksi eri lukua: mainoksessa 500 €, bonusehdoissa 200 € — tarkista
      rekisteröityessä</li>
  <li>Kierrätys 30 x (bonus + talletus)</li>
  <li>Osittainen nosto: voit nostaa sen osuuden saldosta, jonka olet kierrättänyt</li>
  <li>Kolikkopelit kerryttävät 100 %, muut 20 %, videopokeri 15 %, ruletti ja live-pelit 10 %</li>
  <li>Voimassa 30 vuorokautta; enimmäispanos 10 € / kierros</li>
</ul>
`.trim(),
  showNoReview: false,
};

/**
 * Lunaloots Casino — reviewed 2026-10-21.
 *
 * Source: Lunaloots' own "Welcome Casino Package" page and its 29-point bonus
 * terms, plus the site footer, all supplied by the owner.
 *
 * THE "225 %" NEEDS ARITHMETIC, AND THE REVIEW DOES IT. The package is three
 * separate deposit bonuses — 100 % up to 250 €, 75 % up to 500 €, 50 % up to
 * 750 € — and the operator adds the percentages together to advertise "225 %".
 * No single deposit is matched at 225 %. Collecting the full 1 500 € requires
 * deposits of 250 € + 666,67 € + 1 500 € = 2 416,67 €, and the 35x wagering
 * applies to deposit AND bonus. Those figures are stated in the prose because
 * they are what the offer actually costs to use.
 *
 * LICENCE — ANJOUAN ONLY, DELIBERATELY. The footer names three entities: Green
 * Champions Leader SRL (Costa Rica) as the operator, the Government of the
 * Autonomous Island of Anjouan as the LICENSOR (ALSI-202502014-FI1), and Widoma
 * Trading Co. Limited (Cyprus) as the PAYMENT PROCESSOR. Only Anjouan is the
 * gaming regulator. Cyprus stays out of the licence field: it is an EEA marker
 * in license-tier.ts, so including it would flip the badge to "Voitot
 * verovapaita" and tell a Finnish reader their winnings are tax-free when the
 * licence is Anjouan and they are not.
 */
const LUNALOOTS: CasinoReview = {
  slug: "lunaloots",
  name: "Lunaloots Casino",
  url: "/casino/lunaloots/",
  ctaSlug: "lunaloots",
  logoUrl: "/wp-content/uploads/lunaloots-logo.png",
  logoAlt: "Lunaloots Casino -logo: sininen Luna Loots -teksti kilvessä, ympärillä tähtiä",
  ratingOverall: 4.5,
  subRatings: [],
  bonusText: "225 % jopa 1 500 € + 500 IK (1.–3. talletus)",
  license: "Anjouan (ALSI-202502014-FI1)",
  paymentMethods: [],
  providers: ["Pragmatic Play"],
  verdict:
    "Lunaloots tarjoaa vertailun suurimman bonuspaketin: kolme talletusbonusta, joiden katot ovat " +
    "yhteensä 1 500 €, sekä 500 ilmaiskierrosta. Markkinoinnin \"225 %\" on kolmen eri prosentin " +
    "summa, ei yhden talletuksen kerroin — koko paketin lunastaminen vaatii yhteensä noin 2 417 " +
    "euron talletukset. Kierrätys on 35 x talletus ja bonus, live-kasino ei kerrytä sitä lainkaan, " +
    "ja pelilisenssi on Anjouanin, joten voitot ovat Suomessa veronalaista tuloa.",
  foundedYear: null,
  minDeposit: "25 €",
  support: { liveChat: true },
  templateClaims: { registrationFree: false },
  pros: [
    "Vertailun suurin bonuspaketti: jopa 1 500 € kolmelta talletukselta",
    "500 ilmaiskierrosta Big Bass Splash -peliin (arvo 50 €)",
    "Vähimmäistalletus 25 € per porras — paketin voi aloittaa pienellä summalla",
    "Bonuksen voi peruuttaa, jos haluaa nostaa ennen kierrätyksen täyttymistä",
  ],
  cons: [
    "Ei ETA-pelilisenssiä (Anjouan) — voitot ovat Suomessa veronalaista tuloa",
    "Kierrätys 35 x talletus JA bonus — ensitalletuksesta 17 500 € panoksia",
    "Live-kasinolla bonusta ei voi kierrättää lainkaan",
    "Ilmaiskierrosten voitot on kierrätettävä 48 tunnissa",
  ],
  reviewHtml: `
<p><strong>Lunaloots Casino</strong> tarjoaa uudelle pelaajalle kolmen talletuksen bonuspaketin,
jota kasino markkinoi nimellä <strong>"225 % jopa 1 500 € + 500 ilmaiskierrosta"</strong>. Paketti
on vertailun suurin, mutta myös sen kierrätysehdot ovat vertailun raskaimmat. Alla ehdot sellaisina
kuin kasino ne itse julkaisee, ja mitä ne käytännössä maksavat.</p>

<h2>Paketin kolme porrasta</h2>
<table>
  <thead>
    <tr><th>Talletus</th><th>Bonus</th><th>Enintään</th><th>Ilmaiskierroksia</th></tr>
  </thead>
  <tbody>
    <tr><td>1. talletus</td><td>100 %</td><td>250 €</td><td>50</td></tr>
    <tr><td>2. talletus</td><td>75 %</td><td>500 €</td><td>100</td></tr>
    <tr><td>3. talletus</td><td>50 %</td><td>750 €</td><td>350</td></tr>
    <tr><td><strong>Yhteensä</strong></td><td><strong>225 %</strong></td><td><strong>1 500 €</strong></td><td><strong>500</strong></td></tr>
  </tbody>
</table>
<p>Vähimmäistalletus on <strong>25 euroa jokaisessa portaassa</strong>, ja bonus on valittava
talletuksen yhteydessä pudotusvalikosta — sitä ei anneta automaattisesti.</p>

<h2>Mitä "225 %" tarkoittaa käytännössä</h2>
<p>Luku 225 % on kolmen eri prosentin summa, <strong>ei yhden talletuksen kerroin</strong>. Yksikään
talletus ei saa 225 prosentin bonusta: ensimmäinen saa 100 %, toinen 75 % ja kolmas 50 %.</p>
<p>Koko 1 500 euron bonuksen saaminen vaatii, että jokainen porras talletetaan kattoon asti:</p>
<ul>
  <li>1. talletus 250 € → bonus 250 €</li>
  <li>2. talletus 666,67 € → bonus 500 €</li>
  <li>3. talletus 1 500 € → bonus 750 €</li>
</ul>
<p>Eli <strong>noin 2 417 euron talletukset tuottavat 1 500 euron bonuksen</strong>. Luku on hyvä
tietää ennen kuin arvioi tarjouksen kokoa — pienellä budjetilla paketista käytetään vain
ensimmäinen porras, jossa bonus on 100 % enintään 250 euroon.</p>

<h2>Kierrätys on paketin raskain ehto</h2>
<ul>
  <li><strong>Kierrätys:</strong> 35 x <strong>sekä talletus että bonus</strong></li>
  <li><strong>Ilmaiskierrosten voitot:</strong> 35 x voittosumma</li>
  <li><strong>Aikaa kierrätykseen:</strong> 30 vuorokautta bonuksen aktivoinnista</li>
  <li><strong>Ilmaiskierrosten voitot:</strong> kierrätettävä <strong>48 tunnin sisällä</strong></li>
  <li><strong>Enimmäispanos bonuksella:</strong> 5 € / kierros</li>
  <li><strong>Vähimmäispanos bonuksella:</strong> 0,50 € / kierros — tätä pienemmät panokset eivät
      kerrytä kierrätystä, ja niiden voitot menetetään</li>
</ul>
<p>Esimerkki ensimmäisestä portaasta: 250 euron talletus ja 250 euron bonus tarkoittavat
<strong>(250 + 250) x 35 = 17 500 euron</strong> panostusta ennen kuin nostaminen on mahdollista.
Se on paljon, ja se on syytä suhteuttaa bonuksen 250 euron arvoon.</p>

<h3>Pelien painotus</h3>
<ul>
  <li>Kolikkopelit: <strong>100 %</strong></li>
  <li>Virtuaalipelit: 50 %</li>
  <li>Onnenpelit: 50 %</li>
  <li>Pöytäpelit: 20 %</li>
  <li><strong>Live-kasino: bonusta ei voi kierrättää live-peleissä lainkaan</strong></li>
</ul>
<p>Live-kasinon täydellinen poissulkeminen on tiukempi ehto kuin alalla tavallinen alennettu
painotus. Paketti on siis kolikkopelaajan paketti.</p>

<h2>Ilmaiskierrokset</h2>
<p>Kaikki 500 kierrosta annetaan samaan peliin, Pragmatic Playn <strong>Big Bass Splash</strong>
-kolikkopeliin, ja kierroksen arvo on <strong>0,10 €</strong> — eli 500 kierroksen yhteisarvo on
50 euroa. Kierrokset on aktivoitava <strong>7 vuorokauden</strong> sisällä siitä, kun ne ilmestyvät
"Saatavilla"-osioon, ja bonusraha 30 vuorokauden sisällä. Alle 0,10 euron kierrosvoittoja ei
hyvitetä lainkaan.</p>

<h2>Muut ehdot, jotka kannattaa tietää</h2>
<ul>
  <li><strong>Vain uusille pelaajille,</strong> yksi bonus per henkilö, tili, IP-osoite, talous,
      katuosoite, puhelinnumero ja pankkitili talletusta kohden</li>
  <li><strong>Bonuksen voi peruuttaa</strong> ennen kierrätyksen täyttymistä, mutta silloin bonus ja
      sillä voitetut rahat vähennetään saldosta</li>
  <li><strong>Ei yhdistettävissä</strong> muihin kampanjoihin</li>
  <li><strong>Pelin ominaisuuksien "säästäminen"</strong> bonuksen päättymisen jälkeiseen
      lunastukseen katsotaan ehdoissa vilpiksi, ja voitot menetetään</li>
  <li><strong>Riitatilanteessa</strong> ehtojen englanninkielinen versio ratkaisee</li>
</ul>

<h2>Lisenssi ja verotus</h2>
<p>Lunaloots on <strong>Green Champions Leader SRL:n</strong> omistama ja operoima (rekisterinumero
3-102-917157, kotipaikka San José, Costa Rica). Kasino toimii
<strong>Anjouanin saaren hallituksen myöntämällä pelilisenssillä numero
ALSI-202502014-FI1</strong> (Komorien liitto).</p>
<p>Footerissa mainitaan lisäksi kyproslainen Widoma Trading Co. Limited — se on
<strong>maksunvälittäjä, ei pelilisenssin myöntäjä</strong>. Pelilisenssi on siis Anjouanin, ei
ETA-alueen.</p>
<p>Seuraus suomalaiselle pelaajalle: <strong>voitot ovat Suomessa veronalaista tuloa</strong> ja ne
on ilmoitettava verotuksessa. Anjouanin lisenssi on myös valvonnan tasolta kevyin tässä
vertailussa. ETA-lisensoidut vaihtoehdot löydät
<a href="/verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet/">verovapaiden kasinoiden
vertailusta</a>.</p>
<p><strong>Huomionarvoista:</strong> täsmälleen sama bonuspaketti — samat kolme porrasta, samat
Big Bass Splash -kierrokset, sama 35-kertainen kierrätys — on tarjolla myös
<a href="/casino/betbay/">Betbay-kasinolla</a>, joka toimii Maltan MGA-lisenssillä. Siellä voitot
ovat verovapaita. Jos valitset näiden kahden väliltä, tarjous on identtinen ja lisenssi on ainoa
ero, joka näkyy kukkarossa.</p>

<h2>Yhteenveto</h2>
<p>Lunaloots on tämän vertailun suurin bonus ja samalla sen kallein kierrätys. Paketti on
rakenteeltaan rehellinen siinä, että kaikki kolme porrasta ja niiden katot on ilmoitettu selvästi,
ja 25 euron vähimmäistalletus tekee aloituksesta helpon. Mutta 35-kertainen kierrätys talletuksesta
<em>ja</em> bonuksesta on raskas, live-kasino ei kerrytä sitä lainkaan, ja ilmaiskierrosten voitoille
annettu 48 tuntia on erittäin lyhyt. Suurin varaus on lisenssi: Anjouan on kevyin valvoja
vertailussa, ja voitot ovat Suomessa veronalaisia. Jos haet suurta bonusta ja pelaat
kolikkopelejä pitkäjänteisesti, paketti toimii; muussa tapauksessa kierrätys jää kesken.</p>
`.trim(),
  bonusesHtml: `
<p><strong>Tervetuliaispaketti (1.–3. talletus):</strong></p>
<ul>
  <li>1. talletus: 100 % enintään 250 € + 50 ilmaiskierrosta</li>
  <li>2. talletus: 75 % enintään 500 € + 100 ilmaiskierrosta</li>
  <li>3. talletus: 50 % enintään 750 € + 350 ilmaiskierrosta</li>
  <li>Yhteensä 225 % / enintään 1 500 € + 500 ilmaiskierrosta</li>
  <li>Vähimmäistalletus 25 € jokaisessa portaassa; bonus valittava pudotusvalikosta</li>
  <li>Kierrätys 35 x talletus ja bonus, aikaa 30 vrk</li>
  <li>Ilmaiskierrokset peliin Big Bass Splash, kierroksen arvo 0,10 €; voitot kierrätettävä
      48 tunnissa</li>
  <li>Enimmäispanos bonuksella 5 € / kierros, vähimmäispanos 0,50 €</li>
  <li>Kolikkopelit kerryttävät 100 %, virtuaali- ja onnenpelit 50 %, pöytäpelit 20 %; live-kasino
      ei kerrytä lainkaan</li>
</ul>
`.trim(),
  showNoReview: false,
};

/**
 * Betbay Casino — reviewed 2026-10-21.
 *
 * Source: Betbay's own "Welcome Casino Package" page, its 29-point bonus terms
 * and the site footer, all supplied by the owner.
 *
 * SAME PLATFORM AS LUNALOOTS, DIFFERENT LICENCE. The two brands publish
 * byte-identical bonus terms — the same three tiers, the same Big Bass Splash
 * free spins at 0,10 € a spin, the same 35x on deposit and bonus, the same 29
 * numbered points. They are the same white-label. The licences differ, and that
 * is the only thing that matters to a Finnish reader: Betbay is MGA-licensed
 * (MGA/B2C/233/2013, LCS Limited, Malta) so winnings are tax-free, while
 * Lunaloots runs on an Anjouan licence so its winnings are taxable income here.
 *
 * DUPLICATE-CONTENT HANDLING: because the offers really are identical, this
 * review deliberately does NOT restate every bonus mechanic that
 * /casino/lunaloots/ already covers. It leads on the licence difference, gives
 * the tier table and the figures a reader needs to decide, and links across for
 * the full mechanics. Two near-identical 1,400-word pages on a
 * penalty-recovering domain would be a self-inflicted thin-content problem.
 */
const BETBAY: CasinoReview = {
  slug: "betbay",
  name: "Betbay Casino",
  url: "/casino/betbay/",
  ctaSlug: "betbay",
  logoUrl: "/wp-content/uploads/betbay-logo.jpg",
  logoAlt: "Betbay Casino -logo: punainen b-kirjainmerkki ja BetBay-teksti tummalla taustalla",
  ratingOverall: 4.5,
  subRatings: [],
  bonusText: "225 % jopa 1 500 € + 500 IK (1.–3. talletus)",
  license: "MGA (Malta) – MGA/B2C/233/2013",
  paymentMethods: [],
  providers: ["Pragmatic Play"],
  verdict:
    "Betbay tarjoaa saman kolmen talletuksen paketin kuin Lunaloots — 225 % jopa 1 500 € ja 500 " +
    "ilmaiskierrosta, kierrätys 35 x talletus ja bonus — mutta Maltan MGA-lisenssillä. Ero on " +
    "suomalaiselle pelaajalle rahassa mitattava: ETA-lisensoidun kasinon voitot ovat verovapaita, " +
    "Anjouanin lisenssillä toimivan eivät. Jos valitset näiden kahden väliltä, Betbay on sama " +
    "tarjous paremmalla lisenssillä.",
  foundedYear: null,
  minDeposit: "25 €",
  support: { liveChat: true },
  templateClaims: { registrationFree: false },
  pros: [
    "MGA-lisenssi Maltalta — voitot verovapaita suomalaispelaajalle",
    "Sama 1 500 € + 500 IK paketti kuin Anjouan-lisensoidulla kilpailijalla",
    "Vähimmäistalletus 25 € per porras",
    "Bonuksen voi peruuttaa, jos haluaa nostaa ennen kierrätyksen täyttymistä",
  ],
  cons: [
    "Kierrätys 35 x talletus JA bonus — ensitalletuksesta 17 500 € panoksia",
    "Live-kasinolla bonusta ei voi kierrättää lainkaan",
    "Ilmaiskierrosten voitot on kierrätettävä 48 tunnissa",
    "Koko 1 500 € vaatii yhteensä noin 2 417 euron talletukset",
  ],
  reviewHtml: `
<p><strong>Betbay Casino</strong> on Maltan MGA-lisenssillä toimiva kasino, jonka tervetuliaispaketti
on <strong>225 % jopa 1 500 € ja 500 ilmaiskierrosta</strong> kolmelta ensimmäiseltä talletukselta.
Paketti on ehdoiltaan täsmälleen sama kuin
<a href="/casino/lunaloots/">Lunaloots-kasinolla</a> — kyse on samasta alustasta. Yksi ero
kuitenkin on, ja se on suomalaiselle pelaajalle se tärkeämpi: <strong>lisenssi</strong>.</p>

<h2>Lisenssi ratkaisee — ja se on tässä parempi</h2>
<p>Betbayn pelilisenssi on <strong>Maltan peliviranomaisen MGA/B2C/233/2013</strong>, myönnetty
2.7.2013 yhtiölle LCS Limited (C-64070, TA' Xbiex, Malta), joka myös operoi sivustoa.</p>
<p>Malta kuuluu ETA-alueeseen, joten <strong>voitot ovat suomalaiselle pelaajalle
verovapaita</strong>. Sama paketti Anjouanin lisenssillä toimivalta kasinolta tarkoittaisi, että
voitot ovat Suomessa veronalaista tuloa. Kun tarjous on identtinen, lisenssi on ainoa ero joka
näkyy pelaajan kukkarossa — ja ero voi olla satoja euroja. Muut ETA-lisensoidut vaihtoehdot ovat
<a href="/verovapaat-kasinot-2026-lista-vertailu-ja-valinnan-avaimet/">verovapaiden kasinoiden
vertailussa</a>.</p>

<h2>Paketin kolme porrasta</h2>
<table>
  <thead>
    <tr><th>Talletus</th><th>Bonus</th><th>Enintään</th><th>Ilmaiskierroksia</th></tr>
  </thead>
  <tbody>
    <tr><td>1. talletus</td><td>100 %</td><td>250 €</td><td>50</td></tr>
    <tr><td>2. talletus</td><td>75 %</td><td>500 €</td><td>100</td></tr>
    <tr><td>3. talletus</td><td>50 %</td><td>750 €</td><td>350</td></tr>
    <tr><td><strong>Yhteensä</strong></td><td><strong>225 %</strong></td><td><strong>1 500 €</strong></td><td><strong>500</strong></td></tr>
  </tbody>
</table>
<p>Vähimmäistalletus on 25 euroa jokaisessa portaassa, ja bonus on valittava talletuksen yhteydessä
pudotusvalikosta. Huomaa, että <strong>"225 %" on kolmen eri prosentin summa</strong>, ei yhden
talletuksen kerroin: koko 1 500 euron bonus edellyttää yhteensä noin
<strong>2 417 euron talletuksia</strong> (250 € + 666,67 € + 1 500 €).</p>

<h2>Kierrätys lyhyesti</h2>
<ul>
  <li><strong>Kierrätys:</strong> 35 x sekä talletus että bonus — ensitalletuksesta
      (250 + 250) x 35 = <strong>17 500 €</strong> panoksia</li>
  <li><strong>Aikaa:</strong> 30 vuorokautta bonuksen aktivoinnista</li>
  <li><strong>Ilmaiskierrosten voitot:</strong> kierrätys 35x ja aikaa vain
      <strong>48 tuntia</strong></li>
  <li><strong>Panosrajat bonuksella:</strong> 0,50–5 € kierrokselta</li>
  <li><strong>Kolikkopelit</strong> kerryttävät 100 %, virtuaali- ja onnenpelit 50 %, pöytäpelit
      20 %. <strong>Live-kasinossa bonusta ei voi kierrättää lainkaan.</strong></li>
  <li><strong>Ilmaiskierrokset</strong> peliin Big Bass Splash, kierroksen arvo 0,10 € (500
      kierrosta = 50 €)</li>
</ul>
<p>Ehdot ovat sanasta sanaan samat kuin Lunaloots-kasinolla, joten kaikki yksityiskohdat — bonuksen
peruutus, 7 vuorokauden aktivointiaika kierroksille, vilppisäännöt — on käyty läpi
<a href="/casino/lunaloots/">Lunalootsin arvostelussa</a>. Ne pätevät tässä sellaisinaan.</p>

<h2>Yhteenveto</h2>
<p>Betbay on tässä vertailussa helppo suositus siinä mielessä, että se tarjoaa saman suuren paketin
kuin kilpailijansa mutta ETA-lisenssillä. Kierrätys on raskas — 35-kertainen talletuksesta ja
bonuksesta tarkoittaa, että paketti kannattaa vain pitkäjänteiselle kolikkopelaajalle — ja
ilmaiskierrosten voitoille annettu 48 tuntia on lyhyt. Mutta jos vertaat tätä samaa tarjousta
Anjouanin lisenssillä toimivaan versioon, verovapaus tekee valinnasta selvän.</p>
`.trim(),
  bonusesHtml: `
<p><strong>Tervetuliaispaketti (1.–3. talletus):</strong></p>
<ul>
  <li>1. talletus: 100 % enintään 250 € + 50 ilmaiskierrosta</li>
  <li>2. talletus: 75 % enintään 500 € + 100 ilmaiskierrosta</li>
  <li>3. talletus: 50 % enintään 750 € + 350 ilmaiskierrosta</li>
  <li>Yhteensä 225 % / enintään 1 500 € + 500 ilmaiskierrosta</li>
  <li>Vähimmäistalletus 25 € jokaisessa portaassa</li>
  <li>Kierrätys 35 x talletus ja bonus, aikaa 30 vrk</li>
  <li>Ilmaiskierrokset peliin Big Bass Splash (0,10 € / kierros); voitot kierrätettävä 48 tunnissa</li>
  <li>Panosrajat bonuksella 0,50–5 € / kierros; live-kasino ei kerrytä kierrätystä</li>
</ul>
`.trim(),
  showNoReview: false,
};

/** Hand-written reviews, keyed by slug. */
export const MANUAL_REVIEWS: Readonly<Record<string, CasinoReview>> = {
  betpanda: BETPANDA,
  kirpee: KIRPEE,
  tuhti: TUHTI,
  aurakasino: AURAKASINO,
  lunaloots: LUNALOOTS,
  betbay: BETBAY,
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
      "Betpandan tervetuliaisbonus on 100 % ensitalletuksesta: kierrätys 40x, aikaa 7 vrk, " +
      "bonus käteisenä. Lisäksi 10 % viikkocashback ilman kierrätystä. Lue ehdot.",
  },
  kirpee: {
    title: "Kirpee Casino arvostelu – päivittäinen cashback",
    description:
      "Kirpee Casino palauttaa 5–20 % päivän nettohäviöistä joka päivä. MGA-lisenssi, " +
      "voitot verovapaita. Lue cashbackin portaat, kierrätys ja ehdot.",
  },
  tuhti: {
    title: "Tuhti Casino arvostelu – 20 x 1 € kierrosta ja cashback",
    description:
      "Tuhti Casino: 20 x 1 € ilmaiskierrosta Sugar Rush 1000 -peliin ja päivittäinen " +
      "cashback jopa 20 %. Curaçaon lisenssi — lue ehdot ja verotus.",
  },
  betbay: {
    title: "Betbay Casino arvostelu – 225 % ja MGA-lisenssi",
    description:
      "Betbay: 225 % jopa 1 500 € + 500 ilmaiskierrosta kolmelta talletukselta, " +
      "MGA-lisenssi ja verovapaat voitot. Kierrätys 35x — lue ehdot.",
  },
  lunaloots: {
    title: "Lunaloots arvostelu – 225 % jopa 1 500 € + 500 IK",
    description:
      "Lunaloots antaa kolmelta talletukselta 225 % jopa 1 500 € ja 500 ilmaiskierrosta. " +
      "Kierrätys 35x — laskimme mitä paketti todella vaatii. Lue ehdot.",
  },
  aurakasino: {
    title: "Aurakasino arvostelu – 100 % bonus ja osittainen nosto",
    description:
      "Aurakasinon 100 % ensitalletusbonus, kierrätys 30x — ja poikkeuksellinen etu: voit " +
      "nostaa kierrättämäsi osuuden. Lue ehdot ja huomiot ennen pelaamista.",
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
