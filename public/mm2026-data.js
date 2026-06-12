/* mm2026-data.js — Jalkapallon MM-kisat 2026: lokalisoitu tilastodata (fi-FI).
   @custom — hand-built data module for /mm-kisat-2026-tilastot/; scrapers/
   converters must never overwrite it. Single source of truth for the page:
   the Astro page parses the JSON between the markers below at build time and
   /mm2026-tilastot.js reads window.MM2026 in the browser. Derived from the
   canonical WC2026 dataset; every user-visible string is Finnish. */
window.MM2026 =
/*__MM2026_START__*/
{
  "turnaus": {
    "alkaa": "2026-06-11",
    "paattyy": "2026-07-19",
    "joukkueita": 48,
    "otteluita": 104,
    "lohkoja": 12,
    "stadioneita": 16,
    "isantamaat": [
      "Yhdysvallat",
      "Kanada",
      "Meksiko"
    ],
    "stadionit": [
      {
        "stadion": "Estadio Azteca",
        "kaupunki": "Mexico City",
        "maa": "Meksiko",
        "kapasiteetti": 80824
      },
      {
        "stadion": "MetLife Stadium",
        "kaupunki": "East Rutherford (New York/New Jersey)",
        "maa": "Yhdysvallat",
        "kapasiteetti": 80663
      },
      {
        "stadion": "AT&T Stadium",
        "kaupunki": "Arlington (Dallas)",
        "maa": "Yhdysvallat",
        "kapasiteetti": 70649
      },
      {
        "stadion": "SoFi Stadium",
        "kaupunki": "Inglewood (Los Angeles)",
        "maa": "Yhdysvallat",
        "kapasiteetti": 70492
      },
      {
        "stadion": "Arrowhead Stadium",
        "kaupunki": "Kansas City",
        "maa": "Yhdysvallat",
        "kapasiteetti": 69045
      },
      {
        "stadion": "Levi's Stadium",
        "kaupunki": "Santa Clara (San Francisco Bay Area)",
        "maa": "Yhdysvallat",
        "kapasiteetti": 68827
      },
      {
        "stadion": "NRG Stadium",
        "kaupunki": "Houston",
        "maa": "Yhdysvallat",
        "kapasiteetti": 68777
      },
      {
        "stadion": "Lincoln Financial Field",
        "kaupunki": "Philadelphia",
        "maa": "Yhdysvallat",
        "kapasiteetti": 68324
      },
      {
        "stadion": "Mercedes-Benz Stadium",
        "kaupunki": "Atlanta",
        "maa": "Yhdysvallat",
        "kapasiteetti": 68239
      },
      {
        "stadion": "Lumen Field",
        "kaupunki": "Seattle",
        "maa": "Yhdysvallat",
        "kapasiteetti": 66925
      },
      {
        "stadion": "Hard Rock Stadium",
        "kaupunki": "Miami Gardens (Miami)",
        "maa": "Yhdysvallat",
        "kapasiteetti": 64478
      },
      {
        "stadion": "Gillette Stadium",
        "kaupunki": "Foxborough (Boston)",
        "maa": "Yhdysvallat",
        "kapasiteetti": 64146
      },
      {
        "stadion": "BC Place",
        "kaupunki": "Vancouver",
        "maa": "Kanada",
        "kapasiteetti": 52497
      },
      {
        "stadion": "Estadio BBVA",
        "kaupunki": "Guadalupe (Monterrey)",
        "maa": "Meksiko",
        "kapasiteetti": 51243
      },
      {
        "stadion": "Estadio Akron",
        "kaupunki": "Zapopan (Guadalajara)",
        "maa": "Meksiko",
        "kapasiteetti": 45664
      },
      {
        "stadion": "BMO Field",
        "kaupunki": "Toronto",
        "maa": "Kanada",
        "kapasiteetti": 43036
      }
    ]
  },
  "joukkueet": [
    {
      "id": "mexico",
      "nimi": "Meksiko",
      "lippu": "🇲🇽",
      "lohko": "A",
      "fifaRanking": 14,
      "maanosa": "CONCACAF",
      "osallistumiset": 18,
      "mestaruudet": 0,
      "parasSaavutus": "Puolivälierät",
      "saavutusTaso": 3,
      "saavutusVuodet": "1970, 1986",
      "tieKisoihin": "Isäntämaa"
    },
    {
      "id": "south-africa",
      "nimi": "Etelä-Afrikka",
      "lippu": "🇿🇦",
      "lohko": "A",
      "fifaRanking": 60,
      "maanosa": "CAF",
      "osallistumiset": 4,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "1998, 2002, 2010",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "south-korea",
      "nimi": "Etelä-Korea",
      "lippu": "🇰🇷",
      "lohko": "A",
      "fifaRanking": 25,
      "maanosa": "AFC",
      "osallistumiset": 12,
      "mestaruudet": 0,
      "parasSaavutus": "Neljäs sija",
      "saavutusTaso": 4,
      "saavutusVuodet": "2002",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "czechia",
      "nimi": "Tšekki",
      "lippu": "🇨🇿",
      "lohko": "A",
      "fifaRanking": 40,
      "maanosa": "UEFA",
      "osallistumiset": 10,
      "mestaruudet": 0,
      "parasSaavutus": "MM-hopea",
      "saavutusTaso": 6,
      "saavutusVuodet": "1934, 1962",
      "tieKisoihin": "Jatkokarsinta"
    },
    {
      "id": "canada",
      "nimi": "Kanada",
      "lippu": "🇨🇦",
      "lohko": "B",
      "fifaRanking": 30,
      "maanosa": "CONCACAF",
      "osallistumiset": 3,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "1986, 2022",
      "tieKisoihin": "Isäntämaa"
    },
    {
      "id": "bosnia-herzegovina",
      "nimi": "Bosnia ja Hertsegovina",
      "lippu": "🇧🇦",
      "lohko": "B",
      "fifaRanking": 64,
      "maanosa": "UEFA",
      "osallistumiset": 2,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "2014",
      "tieKisoihin": "Jatkokarsinta"
    },
    {
      "id": "qatar",
      "nimi": "Qatar",
      "lippu": "🇶🇦",
      "lohko": "B",
      "fifaRanking": 56,
      "maanosa": "AFC",
      "osallistumiset": 2,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "2022",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "switzerland",
      "nimi": "Sveitsi",
      "lippu": "🇨🇭",
      "lohko": "B",
      "fifaRanking": 19,
      "maanosa": "UEFA",
      "osallistumiset": 13,
      "mestaruudet": 0,
      "parasSaavutus": "Puolivälierät",
      "saavutusTaso": 3,
      "saavutusVuodet": "1934, 1938, 1954",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "brazil",
      "nimi": "Brasilia",
      "lippu": "🇧🇷",
      "lohko": "C",
      "fifaRanking": 6,
      "maanosa": "CONMEBOL",
      "osallistumiset": 23,
      "mestaruudet": 5,
      "parasSaavutus": "Maailmanmestari",
      "saavutusTaso": 7,
      "saavutusVuodet": "1958, 1962, 1970, 1994, 2002",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "morocco",
      "nimi": "Marokko",
      "lippu": "🇲🇦",
      "lohko": "C",
      "fifaRanking": 7,
      "maanosa": "CAF",
      "osallistumiset": 7,
      "mestaruudet": 0,
      "parasSaavutus": "Neljäs sija",
      "saavutusTaso": 4,
      "saavutusVuodet": "2022",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "haiti",
      "nimi": "Haiti",
      "lippu": "🇭🇹",
      "lohko": "C",
      "fifaRanking": 83,
      "maanosa": "CONCACAF",
      "osallistumiset": 2,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "1974",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "scotland",
      "nimi": "Skotlanti",
      "lippu": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      "lohko": "C",
      "fifaRanking": 42,
      "maanosa": "UEFA",
      "osallistumiset": 9,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "1954, 1958, 1974, 1978, 1982, 1986, 1990, 1998",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "usa",
      "nimi": "Yhdysvallat",
      "lippu": "🇺🇸",
      "lohko": "D",
      "fifaRanking": 17,
      "maanosa": "CONCACAF",
      "osallistumiset": 12,
      "mestaruudet": 0,
      "parasSaavutus": "MM-pronssi",
      "saavutusTaso": 5,
      "saavutusVuodet": "1930",
      "tieKisoihin": "Isäntämaa"
    },
    {
      "id": "turkey",
      "nimi": "Turkki",
      "lippu": "🇹🇷",
      "lohko": "D",
      "fifaRanking": 22,
      "maanosa": "UEFA",
      "osallistumiset": 3,
      "mestaruudet": 0,
      "parasSaavutus": "MM-pronssi",
      "saavutusTaso": 5,
      "saavutusVuodet": "2002",
      "tieKisoihin": "Jatkokarsinta"
    },
    {
      "id": "paraguay",
      "nimi": "Paraguay",
      "lippu": "🇵🇾",
      "lohko": "D",
      "fifaRanking": 41,
      "maanosa": "CONMEBOL",
      "osallistumiset": 9,
      "mestaruudet": 0,
      "parasSaavutus": "Puolivälierät",
      "saavutusTaso": 3,
      "saavutusVuodet": "2010",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "australia",
      "nimi": "Australia",
      "lippu": "🇦🇺",
      "lohko": "D",
      "fifaRanking": 27,
      "maanosa": "AFC",
      "osallistumiset": 7,
      "mestaruudet": 0,
      "parasSaavutus": "Neljännesvälierät",
      "saavutusTaso": 2,
      "saavutusVuodet": "2006, 2022",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "germany",
      "nimi": "Saksa",
      "lippu": "🇩🇪",
      "lohko": "E",
      "fifaRanking": 10,
      "maanosa": "UEFA",
      "osallistumiset": 21,
      "mestaruudet": 4,
      "parasSaavutus": "Maailmanmestari",
      "saavutusTaso": 7,
      "saavutusVuodet": "1954, 1974, 1990, 2014",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "curacao",
      "nimi": "Curaçao",
      "lippu": "🇨🇼",
      "lohko": "E",
      "fifaRanking": 82,
      "maanosa": "CONCACAF",
      "osallistumiset": 1,
      "mestaruudet": 0,
      "parasSaavutus": "MM-debyytti",
      "saavutusTaso": 0,
      "saavutusVuodet": "",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "ivory-coast",
      "nimi": "Norsunluurannikko",
      "lippu": "🇨🇮",
      "lohko": "E",
      "fifaRanking": 33,
      "maanosa": "CAF",
      "osallistumiset": 4,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "2006, 2010, 2014",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "ecuador",
      "nimi": "Ecuador",
      "lippu": "🇪🇨",
      "lohko": "E",
      "fifaRanking": 23,
      "maanosa": "CONMEBOL",
      "osallistumiset": 5,
      "mestaruudet": 0,
      "parasSaavutus": "Neljännesvälierät",
      "saavutusTaso": 2,
      "saavutusVuodet": "2006",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "netherlands",
      "nimi": "Alankomaat",
      "lippu": "🇳🇱",
      "lohko": "F",
      "fifaRanking": 8,
      "maanosa": "UEFA",
      "osallistumiset": 12,
      "mestaruudet": 0,
      "parasSaavutus": "MM-hopea",
      "saavutusTaso": 6,
      "saavutusVuodet": "1974, 1978, 2010",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "japan",
      "nimi": "Japani",
      "lippu": "🇯🇵",
      "lohko": "F",
      "fifaRanking": 18,
      "maanosa": "AFC",
      "osallistumiset": 8,
      "mestaruudet": 0,
      "parasSaavutus": "Neljännesvälierät",
      "saavutusTaso": 2,
      "saavutusVuodet": "2002, 2010, 2018, 2022",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "sweden",
      "nimi": "Ruotsi",
      "lippu": "🇸🇪",
      "lohko": "F",
      "fifaRanking": 38,
      "maanosa": "UEFA",
      "osallistumiset": 13,
      "mestaruudet": 0,
      "parasSaavutus": "MM-hopea",
      "saavutusTaso": 6,
      "saavutusVuodet": "1958",
      "tieKisoihin": "Jatkokarsinta"
    },
    {
      "id": "tunisia",
      "nimi": "Tunisia",
      "lippu": "🇹🇳",
      "lohko": "F",
      "fifaRanking": 45,
      "maanosa": "CAF",
      "osallistumiset": 7,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "1978, 1998, 2002, 2006, 2018, 2022",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "belgium",
      "nimi": "Belgia",
      "lippu": "🇧🇪",
      "lohko": "G",
      "fifaRanking": 9,
      "maanosa": "UEFA",
      "osallistumiset": 15,
      "mestaruudet": 0,
      "parasSaavutus": "MM-pronssi",
      "saavutusTaso": 5,
      "saavutusVuodet": "2018",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "egypt",
      "nimi": "Egypti",
      "lippu": "🇪🇬",
      "lohko": "G",
      "fifaRanking": 29,
      "maanosa": "CAF",
      "osallistumiset": 4,
      "mestaruudet": 0,
      "parasSaavutus": "Neljännesvälierät",
      "saavutusTaso": 2,
      "saavutusVuodet": "1934",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "iran",
      "nimi": "Iran",
      "lippu": "🇮🇷",
      "lohko": "G",
      "fifaRanking": 20,
      "maanosa": "AFC",
      "osallistumiset": 7,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "1978, 1998, 2006, 2014, 2018, 2022",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "new-zealand",
      "nimi": "Uusi-Seelanti",
      "lippu": "🇳🇿",
      "lohko": "G",
      "fifaRanking": 85,
      "maanosa": "OFC",
      "osallistumiset": 3,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "1982, 2010",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "spain",
      "nimi": "Espanja",
      "lippu": "🇪🇸",
      "lohko": "H",
      "fifaRanking": 2,
      "maanosa": "UEFA",
      "osallistumiset": 17,
      "mestaruudet": 1,
      "parasSaavutus": "Maailmanmestari",
      "saavutusTaso": 7,
      "saavutusVuodet": "2010",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "cape-verde",
      "nimi": "Kap Verde",
      "lippu": "🇨🇻",
      "lohko": "H",
      "fifaRanking": 67,
      "maanosa": "CAF",
      "osallistumiset": 1,
      "mestaruudet": 0,
      "parasSaavutus": "MM-debyytti",
      "saavutusTaso": 0,
      "saavutusVuodet": "",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "saudi-arabia",
      "nimi": "Saudi-Arabia",
      "lippu": "🇸🇦",
      "lohko": "H",
      "fifaRanking": 61,
      "maanosa": "AFC",
      "osallistumiset": 7,
      "mestaruudet": 0,
      "parasSaavutus": "Neljännesvälierät",
      "saavutusTaso": 2,
      "saavutusVuodet": "1994",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "uruguay",
      "nimi": "Uruguay",
      "lippu": "🇺🇾",
      "lohko": "H",
      "fifaRanking": 16,
      "maanosa": "CONMEBOL",
      "osallistumiset": 15,
      "mestaruudet": 2,
      "parasSaavutus": "Maailmanmestari",
      "saavutusTaso": 7,
      "saavutusVuodet": "1930, 1950",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "france",
      "nimi": "Ranska",
      "lippu": "🇫🇷",
      "lohko": "I",
      "fifaRanking": 3,
      "maanosa": "UEFA",
      "osallistumiset": 17,
      "mestaruudet": 2,
      "parasSaavutus": "Maailmanmestari",
      "saavutusTaso": 7,
      "saavutusVuodet": "1998, 2018",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "senegal",
      "nimi": "Senegal",
      "lippu": "🇸🇳",
      "lohko": "I",
      "fifaRanking": 15,
      "maanosa": "CAF",
      "osallistumiset": 4,
      "mestaruudet": 0,
      "parasSaavutus": "Puolivälierät",
      "saavutusTaso": 3,
      "saavutusVuodet": "2002",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "iraq",
      "nimi": "Irak",
      "lippu": "🇮🇶",
      "lohko": "I",
      "fifaRanking": 57,
      "maanosa": "AFC",
      "osallistumiset": 2,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "1986",
      "tieKisoihin": "Jatkokarsinta"
    },
    {
      "id": "norway",
      "nimi": "Norja",
      "lippu": "🇳🇴",
      "lohko": "I",
      "fifaRanking": 31,
      "maanosa": "UEFA",
      "osallistumiset": 4,
      "mestaruudet": 0,
      "parasSaavutus": "Neljännesvälierät",
      "saavutusTaso": 2,
      "saavutusVuodet": "1998",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "argentina",
      "nimi": "Argentiina",
      "lippu": "🇦🇷",
      "lohko": "J",
      "fifaRanking": 1,
      "maanosa": "CONMEBOL",
      "osallistumiset": 19,
      "mestaruudet": 3,
      "parasSaavutus": "Maailmanmestari",
      "saavutusTaso": 7,
      "saavutusVuodet": "1978, 1986, 2022",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "algeria",
      "nimi": "Algeria",
      "lippu": "🇩🇿",
      "lohko": "J",
      "fifaRanking": 28,
      "maanosa": "CAF",
      "osallistumiset": 5,
      "mestaruudet": 0,
      "parasSaavutus": "Neljännesvälierät",
      "saavutusTaso": 2,
      "saavutusVuodet": "2014",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "austria",
      "nimi": "Itävalta",
      "lippu": "🇦🇹",
      "lohko": "J",
      "fifaRanking": 24,
      "maanosa": "UEFA",
      "osallistumiset": 8,
      "mestaruudet": 0,
      "parasSaavutus": "MM-pronssi",
      "saavutusTaso": 5,
      "saavutusVuodet": "1954",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "jordan",
      "nimi": "Jordania",
      "lippu": "🇯🇴",
      "lohko": "J",
      "fifaRanking": 63,
      "maanosa": "AFC",
      "osallistumiset": 1,
      "mestaruudet": 0,
      "parasSaavutus": "MM-debyytti",
      "saavutusTaso": 0,
      "saavutusVuodet": "",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "portugal",
      "nimi": "Portugali",
      "lippu": "🇵🇹",
      "lohko": "K",
      "fifaRanking": 5,
      "maanosa": "UEFA",
      "osallistumiset": 9,
      "mestaruudet": 0,
      "parasSaavutus": "MM-pronssi",
      "saavutusTaso": 5,
      "saavutusVuodet": "1966",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "dr-congo",
      "nimi": "Kongon demokraattinen tasavalta",
      "lippu": "🇨🇩",
      "lohko": "K",
      "fifaRanking": 46,
      "maanosa": "CAF",
      "osallistumiset": 2,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "1974",
      "tieKisoihin": "Jatkokarsinta"
    },
    {
      "id": "uzbekistan",
      "nimi": "Uzbekistan",
      "lippu": "🇺🇿",
      "lohko": "K",
      "fifaRanking": 50,
      "maanosa": "AFC",
      "osallistumiset": 1,
      "mestaruudet": 0,
      "parasSaavutus": "MM-debyytti",
      "saavutusTaso": 0,
      "saavutusVuodet": "",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "colombia",
      "nimi": "Kolumbia",
      "lippu": "🇨🇴",
      "lohko": "K",
      "fifaRanking": 13,
      "maanosa": "CONMEBOL",
      "osallistumiset": 7,
      "mestaruudet": 0,
      "parasSaavutus": "Puolivälierät",
      "saavutusTaso": 3,
      "saavutusVuodet": "2014",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "england",
      "nimi": "Englanti",
      "lippu": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "lohko": "L",
      "fifaRanking": 4,
      "maanosa": "UEFA",
      "osallistumiset": 17,
      "mestaruudet": 1,
      "parasSaavutus": "Maailmanmestari",
      "saavutusTaso": 7,
      "saavutusVuodet": "1966",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "croatia",
      "nimi": "Kroatia",
      "lippu": "🇭🇷",
      "lohko": "L",
      "fifaRanking": 11,
      "maanosa": "UEFA",
      "osallistumiset": 7,
      "mestaruudet": 0,
      "parasSaavutus": "MM-hopea",
      "saavutusTaso": 6,
      "saavutusVuodet": "2018",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "ghana",
      "nimi": "Ghana",
      "lippu": "🇬🇭",
      "lohko": "L",
      "fifaRanking": 73,
      "maanosa": "CAF",
      "osallistumiset": 5,
      "mestaruudet": 0,
      "parasSaavutus": "Puolivälierät",
      "saavutusTaso": 3,
      "saavutusVuodet": "2010",
      "tieKisoihin": "Karsinnat"
    },
    {
      "id": "panama",
      "nimi": "Panama",
      "lippu": "🇵🇦",
      "lohko": "L",
      "fifaRanking": 34,
      "maanosa": "CONCACAF",
      "osallistumiset": 2,
      "mestaruudet": 0,
      "parasSaavutus": "Lohkovaihe",
      "saavutusTaso": 1,
      "saavutusVuodet": "2018",
      "tieKisoihin": "Karsinnat"
    }
  ],
  "mestarit": [
    {
      "vuosi": 1930,
      "isannat": "Uruguay",
      "mestari": "Uruguay",
      "mestariLippu": "🇺🇾",
      "hopea": "Argentiina",
      "tulos": "4–2",
      "maalikuningas": "Guillermo Stábile",
      "maalikuningasMaa": "Argentiina",
      "maalikuningasMaalit": 8,
      "maalit": 70,
      "ottelut": 18
    },
    {
      "vuosi": 1934,
      "isannat": "Italia",
      "mestari": "Italia",
      "mestariLippu": "🇮🇹",
      "hopea": "Tšekkoslovakia",
      "tulos": "2–1 (ja.)",
      "maalikuningas": "Oldřich Nejedlý",
      "maalikuningasMaa": "Tšekkoslovakia",
      "maalikuningasMaalit": 5,
      "maalit": 70,
      "ottelut": 17
    },
    {
      "vuosi": 1938,
      "isannat": "Ranska",
      "mestari": "Italia",
      "mestariLippu": "🇮🇹",
      "hopea": "Unkari",
      "tulos": "4–2",
      "maalikuningas": "Leônidas",
      "maalikuningasMaa": "Brasilia",
      "maalikuningasMaalit": 7,
      "maalit": 84,
      "ottelut": 18
    },
    {
      "vuosi": 1950,
      "isannat": "Brasilia",
      "mestari": "Uruguay",
      "mestariLippu": "🇺🇾",
      "hopea": "Brasilia",
      "tulos": "2–1",
      "maalikuningas": "Ademir",
      "maalikuningasMaa": "Brasilia",
      "maalikuningasMaalit": 8,
      "maalit": 88,
      "ottelut": 22
    },
    {
      "vuosi": 1954,
      "isannat": "Sveitsi",
      "mestari": "Saksa",
      "mestariLippu": "🇩🇪",
      "hopea": "Unkari",
      "tulos": "3–2",
      "maalikuningas": "Sándor Kocsis",
      "maalikuningasMaa": "Unkari",
      "maalikuningasMaalit": 11,
      "maalit": 140,
      "ottelut": 26
    },
    {
      "vuosi": 1958,
      "isannat": "Ruotsi",
      "mestari": "Brasilia",
      "mestariLippu": "🇧🇷",
      "hopea": "Ruotsi",
      "tulos": "5–2",
      "maalikuningas": "Just Fontaine",
      "maalikuningasMaa": "Ranska",
      "maalikuningasMaalit": 13,
      "maalit": 126,
      "ottelut": 35
    },
    {
      "vuosi": 1962,
      "isannat": "Chile",
      "mestari": "Brasilia",
      "mestariLippu": "🇧🇷",
      "hopea": "Tšekkoslovakia",
      "tulos": "3–1",
      "maalikuningas": "Garrincha",
      "maalikuningasMaa": "Brasilia",
      "maalikuningasMaalit": 4,
      "maalit": 89,
      "ottelut": 32
    },
    {
      "vuosi": 1966,
      "isannat": "Englanti",
      "mestari": "Englanti",
      "mestariLippu": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "hopea": "Saksa",
      "tulos": "4–2 (ja.)",
      "maalikuningas": "Eusébio",
      "maalikuningasMaa": "Portugali",
      "maalikuningasMaalit": 9,
      "maalit": 89,
      "ottelut": 32
    },
    {
      "vuosi": 1970,
      "isannat": "Meksiko",
      "mestari": "Brasilia",
      "mestariLippu": "🇧🇷",
      "hopea": "Italia",
      "tulos": "4–1",
      "maalikuningas": "Gerd Müller",
      "maalikuningasMaa": "Saksa",
      "maalikuningasMaalit": 10,
      "maalit": 95,
      "ottelut": 32
    },
    {
      "vuosi": 1974,
      "isannat": "Saksa",
      "mestari": "Saksa",
      "mestariLippu": "🇩🇪",
      "hopea": "Alankomaat",
      "tulos": "2–1",
      "maalikuningas": "Grzegorz Lato",
      "maalikuningasMaa": "Puola",
      "maalikuningasMaalit": 7,
      "maalit": 97,
      "ottelut": 38
    },
    {
      "vuosi": 1978,
      "isannat": "Argentiina",
      "mestari": "Argentiina",
      "mestariLippu": "🇦🇷",
      "hopea": "Alankomaat",
      "tulos": "3–1 (ja.)",
      "maalikuningas": "Mario Kempes",
      "maalikuningasMaa": "Argentiina",
      "maalikuningasMaalit": 6,
      "maalit": 102,
      "ottelut": 38
    },
    {
      "vuosi": 1982,
      "isannat": "Espanja",
      "mestari": "Italia",
      "mestariLippu": "🇮🇹",
      "hopea": "Saksa",
      "tulos": "3–1",
      "maalikuningas": "Paolo Rossi",
      "maalikuningasMaa": "Italia",
      "maalikuningasMaalit": 6,
      "maalit": 146,
      "ottelut": 52
    },
    {
      "vuosi": 1986,
      "isannat": "Meksiko",
      "mestari": "Argentiina",
      "mestariLippu": "🇦🇷",
      "hopea": "Saksa",
      "tulos": "3–2",
      "maalikuningas": "Gary Lineker",
      "maalikuningasMaa": "Englanti",
      "maalikuningasMaalit": 6,
      "maalit": 132,
      "ottelut": 52
    },
    {
      "vuosi": 1990,
      "isannat": "Italia",
      "mestari": "Saksa",
      "mestariLippu": "🇩🇪",
      "hopea": "Argentiina",
      "tulos": "1–0",
      "maalikuningas": "Salvatore Schillaci",
      "maalikuningasMaa": "Italia",
      "maalikuningasMaalit": 6,
      "maalit": 115,
      "ottelut": 52
    },
    {
      "vuosi": 1994,
      "isannat": "Yhdysvallat",
      "mestari": "Brasilia",
      "mestariLippu": "🇧🇷",
      "hopea": "Italia",
      "tulos": "0–0 (rp. 3–2)",
      "maalikuningas": "Oleg Salenko",
      "maalikuningasMaa": "Venäjä",
      "maalikuningasMaalit": 6,
      "maalit": 141,
      "ottelut": 52
    },
    {
      "vuosi": 1998,
      "isannat": "Ranska",
      "mestari": "Ranska",
      "mestariLippu": "🇫🇷",
      "hopea": "Brasilia",
      "tulos": "3–0",
      "maalikuningas": "Davor Šuker",
      "maalikuningasMaa": "Kroatia",
      "maalikuningasMaalit": 6,
      "maalit": 171,
      "ottelut": 64
    },
    {
      "vuosi": 2002,
      "isannat": "Etelä-Korea ja Japani",
      "mestari": "Brasilia",
      "mestariLippu": "🇧🇷",
      "hopea": "Saksa",
      "tulos": "2–0",
      "maalikuningas": "Ronaldo",
      "maalikuningasMaa": "Brasilia",
      "maalikuningasMaalit": 8,
      "maalit": 161,
      "ottelut": 64
    },
    {
      "vuosi": 2006,
      "isannat": "Saksa",
      "mestari": "Italia",
      "mestariLippu": "🇮🇹",
      "hopea": "Ranska",
      "tulos": "1–1 (rp. 5–3)",
      "maalikuningas": "Miroslav Klose",
      "maalikuningasMaa": "Saksa",
      "maalikuningasMaalit": 5,
      "maalit": 147,
      "ottelut": 64
    },
    {
      "vuosi": 2010,
      "isannat": "Etelä-Afrikka",
      "mestari": "Espanja",
      "mestariLippu": "🇪🇸",
      "hopea": "Alankomaat",
      "tulos": "1–0 (ja.)",
      "maalikuningas": "Thomas Müller",
      "maalikuningasMaa": "Saksa",
      "maalikuningasMaalit": 5,
      "maalit": 145,
      "ottelut": 64
    },
    {
      "vuosi": 2014,
      "isannat": "Brasilia",
      "mestari": "Saksa",
      "mestariLippu": "🇩🇪",
      "hopea": "Argentiina",
      "tulos": "1–0 (ja.)",
      "maalikuningas": "James Rodríguez",
      "maalikuningasMaa": "Kolumbia",
      "maalikuningasMaalit": 6,
      "maalit": 171,
      "ottelut": 64
    },
    {
      "vuosi": 2018,
      "isannat": "Venäjä",
      "mestari": "Ranska",
      "mestariLippu": "🇫🇷",
      "hopea": "Kroatia",
      "tulos": "4–2",
      "maalikuningas": "Harry Kane",
      "maalikuningasMaa": "Englanti",
      "maalikuningasMaalit": 6,
      "maalit": 169,
      "ottelut": 64
    },
    {
      "vuosi": 2022,
      "isannat": "Qatar",
      "mestari": "Argentiina",
      "mestariLippu": "🇦🇷",
      "hopea": "Ranska",
      "tulos": "3–3 (rp. 4–2)",
      "maalikuningas": "Kylian Mbappé",
      "maalikuningasMaa": "Ranska",
      "maalikuningasMaalit": 8,
      "maalit": 172,
      "ottelut": 64
    }
  ],
  "kaikkienAikojen": [
    {
      "nimi": "Brasilia",
      "lippu": "🇧🇷",
      "turnaukset": 22,
      "ottelut": 114,
      "voitot": 76,
      "tasapelit": 19,
      "tappiot": 19,
      "tehdyt": 237,
      "paastetyt": 108,
      "pisteet": 247,
      "mestaruudet": 5
    },
    {
      "nimi": "Saksa",
      "lippu": "🇩🇪",
      "turnaukset": 20,
      "ottelut": 112,
      "voitot": 68,
      "tasapelit": 21,
      "tappiot": 23,
      "tehdyt": 232,
      "paastetyt": 130,
      "pisteet": 225,
      "mestaruudet": 4
    },
    {
      "nimi": "Argentiina",
      "lippu": "🇦🇷",
      "turnaukset": 18,
      "ottelut": 88,
      "voitot": 47,
      "tasapelit": 17,
      "tappiot": 24,
      "tehdyt": 152,
      "paastetyt": 101,
      "pisteet": 158,
      "mestaruudet": 3
    },
    {
      "nimi": "Italia",
      "lippu": "🇮🇹",
      "turnaukset": 18,
      "ottelut": 83,
      "voitot": 45,
      "tasapelit": 21,
      "tappiot": 17,
      "tehdyt": 128,
      "paastetyt": 77,
      "pisteet": 156,
      "mestaruudet": 4
    },
    {
      "nimi": "Ranska",
      "lippu": "🇫🇷",
      "turnaukset": 16,
      "ottelut": 73,
      "voitot": 39,
      "tasapelit": 14,
      "tappiot": 20,
      "tehdyt": 136,
      "paastetyt": 85,
      "pisteet": 131,
      "mestaruudet": 2
    },
    {
      "nimi": "Englanti",
      "lippu": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "turnaukset": 16,
      "ottelut": 74,
      "voitot": 32,
      "tasapelit": 22,
      "tappiot": 20,
      "tehdyt": 104,
      "paastetyt": 68,
      "pisteet": 118,
      "mestaruudet": 1
    },
    {
      "nimi": "Espanja",
      "lippu": "🇪🇸",
      "turnaukset": 16,
      "ottelut": 67,
      "voitot": 31,
      "tasapelit": 17,
      "tappiot": 19,
      "tehdyt": 108,
      "paastetyt": 75,
      "pisteet": 110,
      "mestaruudet": 1
    },
    {
      "nimi": "Alankomaat",
      "lippu": "🇳🇱",
      "turnaukset": 11,
      "ottelut": 55,
      "voitot": 30,
      "tasapelit": 14,
      "tappiot": 11,
      "tehdyt": 96,
      "paastetyt": 52,
      "pisteet": 104,
      "mestaruudet": 0
    },
    {
      "nimi": "Uruguay",
      "lippu": "🇺🇾",
      "turnaukset": 14,
      "ottelut": 59,
      "voitot": 25,
      "tasapelit": 13,
      "tappiot": 21,
      "tehdyt": 89,
      "paastetyt": 76,
      "pisteet": 88,
      "mestaruudet": 2
    },
    {
      "nimi": "Belgia",
      "lippu": "🇧🇪",
      "turnaukset": 14,
      "ottelut": 51,
      "voitot": 21,
      "tasapelit": 10,
      "tappiot": 20,
      "tehdyt": 69,
      "paastetyt": 74,
      "pisteet": 73,
      "mestaruudet": 0
    },
    {
      "nimi": "Ruotsi",
      "lippu": "🇸🇪",
      "turnaukset": 12,
      "ottelut": 51,
      "voitot": 19,
      "tasapelit": 13,
      "tappiot": 19,
      "tehdyt": 80,
      "paastetyt": 73,
      "pisteet": 70,
      "mestaruudet": 0
    },
    {
      "nimi": "Venäjä",
      "lippu": "🇷🇺",
      "turnaukset": 11,
      "ottelut": 45,
      "voitot": 19,
      "tasapelit": 10,
      "tappiot": 16,
      "tehdyt": 77,
      "paastetyt": 54,
      "pisteet": 67,
      "mestaruudet": 0
    },
    {
      "nimi": "Meksiko",
      "lippu": "🇲🇽",
      "turnaukset": 17,
      "ottelut": 60,
      "voitot": 17,
      "tasapelit": 15,
      "tappiot": 28,
      "tehdyt": 62,
      "paastetyt": 101,
      "pisteet": 66,
      "mestaruudet": 0
    },
    {
      "nimi": "Serbia",
      "lippu": "🇷🇸",
      "turnaukset": 13,
      "ottelut": 49,
      "voitot": 18,
      "tasapelit": 9,
      "tappiot": 22,
      "tehdyt": 71,
      "paastetyt": 71,
      "pisteet": 63,
      "mestaruudet": 0
    },
    {
      "nimi": "Portugali",
      "lippu": "🇵🇹",
      "turnaukset": 8,
      "ottelut": 35,
      "voitot": 17,
      "tasapelit": 6,
      "tappiot": 12,
      "tehdyt": 61,
      "paastetyt": 41,
      "pisteet": 57,
      "mestaruudet": 0
    },
    {
      "nimi": "Puola",
      "lippu": "🇵🇱",
      "turnaukset": 9,
      "ottelut": 38,
      "voitot": 17,
      "tasapelit": 6,
      "tappiot": 15,
      "tehdyt": 49,
      "paastetyt": 50,
      "pisteet": 57,
      "mestaruudet": 0
    },
    {
      "nimi": "Sveitsi",
      "lippu": "🇨🇭",
      "turnaukset": 12,
      "ottelut": 41,
      "voitot": 14,
      "tasapelit": 8,
      "tappiot": 19,
      "tehdyt": 55,
      "paastetyt": 73,
      "pisteet": 50,
      "mestaruudet": 0
    },
    {
      "nimi": "Unkari",
      "lippu": "🇭🇺",
      "turnaukset": 9,
      "ottelut": 32,
      "voitot": 15,
      "tasapelit": 3,
      "tappiot": 14,
      "tehdyt": 87,
      "paastetyt": 57,
      "pisteet": 48,
      "mestaruudet": 0
    },
    {
      "nimi": "Kroatia",
      "lippu": "🇭🇷",
      "turnaukset": 6,
      "ottelut": 30,
      "voitot": 13,
      "tasapelit": 8,
      "tappiot": 9,
      "tehdyt": 43,
      "paastetyt": 33,
      "pisteet": 47,
      "mestaruudet": 0
    },
    {
      "nimi": "Slovakia",
      "lippu": "🇸🇰",
      "turnaukset": 9,
      "ottelut": 34,
      "voitot": 12,
      "tasapelit": 6,
      "tappiot": 16,
      "tehdyt": 49,
      "paastetyt": 52,
      "pisteet": 42,
      "mestaruudet": 0
    },
    {
      "nimi": "Tšekki",
      "lippu": "🇨🇿",
      "turnaukset": 9,
      "ottelut": 33,
      "voitot": 12,
      "tasapelit": 5,
      "tappiot": 16,
      "tehdyt": 47,
      "paastetyt": 49,
      "pisteet": 41,
      "mestaruudet": 0
    },
    {
      "nimi": "Itävalta",
      "lippu": "🇦🇹",
      "turnaukset": 7,
      "ottelut": 29,
      "voitot": 12,
      "tasapelit": 4,
      "tappiot": 13,
      "tehdyt": 43,
      "paastetyt": 47,
      "pisteet": 40,
      "mestaruudet": 0
    },
    {
      "nimi": "Chile",
      "lippu": "🇨🇱",
      "turnaukset": 9,
      "ottelut": 33,
      "voitot": 11,
      "tasapelit": 7,
      "tappiot": 15,
      "tehdyt": 40,
      "paastetyt": 49,
      "pisteet": 40,
      "mestaruudet": 0
    },
    {
      "nimi": "Yhdysvallat",
      "lippu": "🇺🇸",
      "turnaukset": 11,
      "ottelut": 37,
      "voitot": 9,
      "tasapelit": 8,
      "tappiot": 20,
      "tehdyt": 40,
      "paastetyt": 66,
      "pisteet": 35,
      "mestaruudet": 0
    },
    {
      "nimi": "Tanska",
      "lippu": "🇩🇰",
      "turnaukset": 6,
      "ottelut": 23,
      "voitot": 9,
      "tasapelit": 6,
      "tappiot": 8,
      "tehdyt": 31,
      "paastetyt": 29,
      "pisteet": 33,
      "mestaruudet": 0
    }
  ],
  "maalintekijat": [
    {
      "nimi": "Miroslav Klose",
      "maa": "Saksa",
      "lippu": "🇩🇪",
      "maalit": 16,
      "ottelut": 24,
      "turnaukset": "2002–2014"
    },
    {
      "nimi": "Ronaldo",
      "maa": "Brasilia",
      "lippu": "🇧🇷",
      "maalit": 15,
      "ottelut": 19,
      "turnaukset": "1998–2006"
    },
    {
      "nimi": "Gerd Müller",
      "maa": "Saksa",
      "lippu": "🇩🇪",
      "maalit": 14,
      "ottelut": 13,
      "turnaukset": "1970–1974"
    },
    {
      "nimi": "Just Fontaine",
      "maa": "Ranska",
      "lippu": "🇫🇷",
      "maalit": 13,
      "ottelut": 6,
      "turnaukset": "1958"
    },
    {
      "nimi": "Lionel Messi",
      "maa": "Argentiina",
      "lippu": "🇦🇷",
      "maalit": 13,
      "ottelut": 26,
      "turnaukset": "2006–2022"
    },
    {
      "nimi": "Pelé",
      "maa": "Brasilia",
      "lippu": "🇧🇷",
      "maalit": 12,
      "ottelut": 14,
      "turnaukset": "1958–1970"
    },
    {
      "nimi": "Kylian Mbappé",
      "maa": "Ranska",
      "lippu": "🇫🇷",
      "maalit": 12,
      "ottelut": 14,
      "turnaukset": "2018–2022"
    },
    {
      "nimi": "Sándor Kocsis",
      "maa": "Unkari",
      "lippu": "🇭🇺",
      "maalit": 11,
      "ottelut": 5,
      "turnaukset": "1954"
    },
    {
      "nimi": "Jürgen Klinsmann",
      "maa": "Saksa",
      "lippu": "🇩🇪",
      "maalit": 11,
      "ottelut": 17,
      "turnaukset": "1990–1998"
    },
    {
      "nimi": "Helmut Rahn",
      "maa": "Saksa",
      "lippu": "🇩🇪",
      "maalit": 10,
      "ottelut": 10,
      "turnaukset": "1954–1958"
    },
    {
      "nimi": "Gary Lineker",
      "maa": "Englanti",
      "lippu": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "maalit": 10,
      "ottelut": 12,
      "turnaukset": "1986–1990"
    },
    {
      "nimi": "Gabriel Batistuta",
      "maa": "Argentiina",
      "lippu": "🇦🇷",
      "maalit": 10,
      "ottelut": 12,
      "turnaukset": "1994–2002"
    },
    {
      "nimi": "Teófilo Cubillas",
      "maa": "Peru",
      "lippu": "🇵🇪",
      "maalit": 10,
      "ottelut": 13,
      "turnaukset": "1970–1982"
    },
    {
      "nimi": "Thomas Müller",
      "maa": "Saksa",
      "lippu": "🇩🇪",
      "maalit": 10,
      "ottelut": 19,
      "turnaukset": "2010–2022"
    },
    {
      "nimi": "Grzegorz Lato",
      "maa": "Puola",
      "lippu": "🇵🇱",
      "maalit": 10,
      "ottelut": 20,
      "turnaukset": "1974–1982"
    }
  ],
  "ennatykset": [
    {
      "id": "biggest-win",
      "kategoria": "maalit",
      "otsikko": "Suurin voitto MM-ottelussa",
      "arvo": "10–1",
      "haltija": "Unkari – El Salvador",
      "vuosi": "1982"
    },
    {
      "id": "most-goals-one-match",
      "kategoria": "maalit",
      "otsikko": "Eniten maaleja yhdessä ottelussa (joukkueet yhteensä)",
      "arvo": "12",
      "haltija": "Itävalta – Sveitsi 7–5",
      "vuosi": "1954"
    },
    {
      "id": "fastest-goal",
      "kategoria": "maalit",
      "otsikko": "Nopein maali avauspotkusta",
      "arvo": "10,8 sekuntia",
      "haltija": "Hakan Şükür (Turkki, Etelä-Koreaa vastaan)",
      "vuosi": "2002"
    },
    {
      "id": "most-goals-one-tournament-player",
      "kategoria": "maalit",
      "otsikko": "Eniten maaleja yhdessä turnauksessa (pelaaja)",
      "arvo": "13",
      "haltija": "Just Fontaine (Ranska)",
      "vuosi": "1958"
    },
    {
      "id": "most-goals-one-match-player",
      "kategoria": "maalit",
      "otsikko": "Eniten maaleja yhdessä ottelussa (pelaaja)",
      "arvo": "5",
      "haltija": "Oleg Salenko (Venäjä, Kamerunia vastaan)",
      "vuosi": "1994"
    },
    {
      "id": "highest-scoring-final",
      "kategoria": "maalit",
      "otsikko": "Runsasmaalisin MM-loppuottelu",
      "arvo": "7 maalia",
      "haltija": "Brasilia – Ruotsi 5–2",
      "vuosi": "1958"
    },
    {
      "id": "most-career-goals",
      "kategoria": "pelaajat",
      "otsikko": "Eniten MM-maaleja uralla",
      "arvo": "16",
      "haltija": "Miroslav Klose (Saksa)",
      "vuosi": "2002–2014"
    },
    {
      "id": "most-matches-played",
      "kategoria": "pelaajat",
      "otsikko": "Eniten pelattuja MM-otteluita",
      "arvo": "26",
      "haltija": "Lionel Messi (Argentiina)",
      "vuosi": "2006–2022"
    },
    {
      "id": "most-titles-player",
      "kategoria": "pelaajat",
      "otsikko": "Eniten maailmanmestaruuksia pelaajana",
      "arvo": "3",
      "haltija": "Pelé (Brasilia)",
      "vuosi": "1958, 1962, 1970"
    },
    {
      "id": "youngest-scorer",
      "kategoria": "pelaajat",
      "otsikko": "Nuorin maalintekijä MM-historiassa",
      "arvo": "17 vuotta 239 päivää",
      "haltija": "Pelé (Brasilia, Walesia vastaan)",
      "vuosi": "1958"
    },
    {
      "id": "oldest-scorer",
      "kategoria": "pelaajat",
      "otsikko": "Vanhin maalintekijä MM-historiassa",
      "arvo": "42 vuotta 39 päivää",
      "haltija": "Roger Milla (Kamerun, Venäjää vastaan)",
      "vuosi": "1994"
    },
    {
      "id": "scored-in-five-tournaments",
      "kategoria": "pelaajat",
      "otsikko": "Ainoa pelaaja, joka on tehnyt maalin viisissä eri MM-kisoissa",
      "arvo": "5 turnausta",
      "haltija": "Cristiano Ronaldo (Portugali)",
      "vuosi": "2006–2022"
    },
    {
      "id": "most-tournaments-played",
      "kategoria": "pelaajat",
      "otsikko": "Eniten pelattuja MM-turnauksia",
      "arvo": "5",
      "haltija": "Antonio Carbajal, Lothar Matthäus, Rafael Márquez, Andrés Guardado, Lionel Messi ja Cristiano Ronaldo",
      "vuosi": "1950–2022"
    },
    {
      "id": "most-titles-team",
      "kategoria": "joukkueet",
      "otsikko": "Eniten maailmanmestaruuksia (maajoukkue)",
      "arvo": "5",
      "haltija": "Brasilia",
      "vuosi": "1958–2002"
    },
    {
      "id": "most-appearances-team",
      "kategoria": "joukkueet",
      "otsikko": "Ainoa maa, joka on pelannut kaikissa MM-kisoissa",
      "arvo": "22/22 turnausta vuoteen 2022 mennessä (2026 on 23. kerta)",
      "haltija": "Brasilia",
      "vuosi": "1930–2026"
    },
    {
      "id": "most-finals-team",
      "kategoria": "joukkueet",
      "otsikko": "Eniten MM-loppuotteluita (maajoukkue)",
      "arvo": "8",
      "haltija": "Saksa",
      "vuosi": "1954–2014"
    },
    {
      "id": "most-consecutive-titles",
      "kategoria": "joukkueet",
      "otsikko": "Ainoat kaksi mestaruutta peräkkäin voittaneet maat",
      "arvo": "2 peräkkäistä mestaruutta",
      "haltija": "Italia (1934 ja 1938) sekä Brasilia (1958 ja 1962)",
      "vuosi": "1934–1962"
    },
    {
      "id": "first-host-to-lose-opener",
      "kategoria": "joukkueet",
      "otsikko": "Ensimmäinen isäntämaa, joka hävisi avausottelunsa",
      "arvo": "0–2 Ecuadoria vastaan",
      "haltija": "Qatar",
      "vuosi": "2022"
    },
    {
      "id": "highest-match-attendance",
      "kategoria": "yleisomaarat",
      "otsikko": "Suurin virallinen yleisömäärä MM-ottelussa",
      "arvo": "173 850 katsojaa",
      "haltija": "Uruguay – Brasilia, Maracanã, Rio de Janeiro",
      "vuosi": "1950"
    },
    {
      "id": "highest-total-attendance",
      "kategoria": "yleisomaarat",
      "otsikko": "Suurin kokonaisyleisömäärä MM-turnauksessa",
      "arvo": "3 587 538 katsojaa",
      "haltija": "Yhdysvallat 1994 (52 ottelua)",
      "vuosi": "1994"
    },
    {
      "id": "highest-average-attendance",
      "kategoria": "yleisomaarat",
      "otsikko": "Suurin yleisökeskiarvo ottelua kohden",
      "arvo": "68 991 katsojaa",
      "haltija": "Yhdysvallat 1994",
      "vuosi": "1994"
    },
    {
      "id": "most-goals-edition",
      "kategoria": "turnaukset",
      "otsikko": "Eniten maaleja yhdessä MM-turnauksessa",
      "arvo": "172 maalia",
      "haltija": "Qatar 2022 (64 ottelua)",
      "vuosi": "2022"
    },
    {
      "id": "highest-goals-per-match",
      "kategoria": "turnaukset",
      "otsikko": "Korkein maalikeskiarvo MM-turnauksessa",
      "arvo": "5,38 maalia/ottelu (140 maalia 26 ottelussa)",
      "haltija": "Sveitsi 1954",
      "vuosi": "1954"
    },
    {
      "id": "largest-tournament",
      "kategoria": "turnaukset",
      "otsikko": "Kaikkien aikojen suurin MM-turnaus",
      "arvo": "48 joukkuetta ja 104 ottelua",
      "haltija": "Kanada, Meksiko ja Yhdysvallat 2026",
      "vuosi": "2026"
    },
    {
      "id": "most-times-host",
      "kategoria": "turnaukset",
      "otsikko": "Ensimmäinen maa, joka isännöi MM-kisoja kolmesti",
      "arvo": "3 kertaa",
      "haltija": "Meksiko",
      "vuosi": "1970, 1986 ja 2026"
    }
  ],
  "kategoriat": [
    {
      "id": "maalit",
      "nimi": "Maalit"
    },
    {
      "id": "pelaajat",
      "nimi": "Pelaajat"
    },
    {
      "id": "joukkueet",
      "nimi": "Joukkueet"
    },
    {
      "id": "yleisomaarat",
      "nimi": "Yleisömäärät"
    },
    {
      "id": "turnaukset",
      "nimi": "Turnaukset"
    }
  ],
  "maanosaMestaruudet": [
    {
      "maanosa": "UEFA",
      "mestaruudet": 12
    },
    {
      "maanosa": "CONMEBOL",
      "mestaruudet": 10
    }
  ],
  "maalitTurnauksittain": [
    {
      "vuosi": 1930,
      "maalit": 70,
      "ottelut": 18
    },
    {
      "vuosi": 1934,
      "maalit": 70,
      "ottelut": 17
    },
    {
      "vuosi": 1938,
      "maalit": 84,
      "ottelut": 18
    },
    {
      "vuosi": 1950,
      "maalit": 88,
      "ottelut": 22
    },
    {
      "vuosi": 1954,
      "maalit": 140,
      "ottelut": 26
    },
    {
      "vuosi": 1958,
      "maalit": 126,
      "ottelut": 35
    },
    {
      "vuosi": 1962,
      "maalit": 89,
      "ottelut": 32
    },
    {
      "vuosi": 1966,
      "maalit": 89,
      "ottelut": 32
    },
    {
      "vuosi": 1970,
      "maalit": 95,
      "ottelut": 32
    },
    {
      "vuosi": 1974,
      "maalit": 97,
      "ottelut": 38
    },
    {
      "vuosi": 1978,
      "maalit": 102,
      "ottelut": 38
    },
    {
      "vuosi": 1982,
      "maalit": 146,
      "ottelut": 52
    },
    {
      "vuosi": 1986,
      "maalit": 132,
      "ottelut": 52
    },
    {
      "vuosi": 1990,
      "maalit": 115,
      "ottelut": 52
    },
    {
      "vuosi": 1994,
      "maalit": 141,
      "ottelut": 52
    },
    {
      "vuosi": 1998,
      "maalit": 171,
      "ottelut": 64
    },
    {
      "vuosi": 2002,
      "maalit": 161,
      "ottelut": 64
    },
    {
      "vuosi": 2006,
      "maalit": 147,
      "ottelut": 64
    },
    {
      "vuosi": 2010,
      "maalit": 145,
      "ottelut": 64
    },
    {
      "vuosi": 2014,
      "maalit": 171,
      "ottelut": 64
    },
    {
      "vuosi": 2018,
      "maalit": 169,
      "ottelut": 64
    },
    {
      "vuosi": 2022,
      "maalit": 172,
      "ottelut": 64
    }
  ]
}
/*__MM2026_END__*/
;
