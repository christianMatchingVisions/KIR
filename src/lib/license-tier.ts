/**
 * license-tier.ts — classify a casino's licence and say what it means for a
 * Finnish player's taxes.
 *
 * WHY (content review 2026-09-22): the licence is the single most
 * safety-relevant fact on a casino card, and for Finnish players it is also a
 * MONEY fact — winnings from an operator licensed in the EEA are tax-free
 * here, winnings from an operator licensed outside it are taxable income. The
 * cards used to print the raw licence string (when they printed one at all),
 * so an Anjouan-licensed casino looked exactly like an MGA one.
 *
 * Source of the strings: `meta.license_type` in the captured toplist data
 * (public/rlaaf-data) — every captured casino has a value, e.g. "MGA",
 * "Curaçao eGaming", "Estonia", "MGA, UKGC, SGA", "Island of Anjouan".
 *
 * NOTE on the tax line: this reflects the rules in force in 2026. Finland's
 * licensing system changes in 2027; revisit the wording then.
 */

export type LicenseTier = "eea" | "non-eea" | "unknown";

export interface LicenseInfo {
  /** Tier used for the colour treatment. */
  tier: LicenseTier;
  /** The licence text to show (the raw value, trimmed). */
  label: string;
  /** Short consequence line for a Finnish player, or null when unknown. */
  note: string | null;
  /** Long form for title/aria text. */
  title: string;
}

/**
 * EEA regulators (winnings tax-free for Finnish players). Matched as
 * lowercase substrings against the licence string, so a combined licence such
 * as "MGA, UKGC, SGA" counts as EEA on the strength of MGA/SGA.
 */
const EEA_MARKERS = [
  "mga",
  "malta",
  "estonia",
  "emta",
  "viro",
  "sga",
  "spelinspektionen",
  "sweden",
  "ruotsi",
  "cyprus",
  "kypros",
  "denmark",
  "spillemyndigheden",
  "tanska",
  "latvia",
  "lithuania",
  "greece",
  "romania",
  "ireland",
];

/**
 * Non-EEA regulators (winnings taxable in Finland). Kept explicit rather than
 * "anything not EEA" so an unrecognised string stays `unknown` instead of
 * being labelled taxable on a guess.
 */
const NON_EEA_MARKERS = [
  "curacao",
  "curaçao",
  "anjouan",
  "kahnawake",
  "pagcor",
  "pacqor",
  "gibraltar",
  "isle of man",
  "ukgc",
  "uk gambling",
  "united kingdom",
  "tobique",
  "costa rica",
  "panama",
];

/** Classify a raw licence string from the toplist/review data. */
export function licenseInfo(raw: string | null | undefined): LicenseInfo {
  const label = (raw ?? "").trim();
  if (!label) {
    return { tier: "unknown", label: "", note: null, title: "Lisenssitieto puuttuu" };
  }
  const hay = label.toLowerCase();
  const isEea = EEA_MARKERS.some((m) => hay.includes(m));
  const isNonEea = NON_EEA_MARKERS.some((m) => hay.includes(m));

  // An EEA licence in the mix is what decides the tax treatment, so a combined
  // licence (e.g. "MGA, UKGC") is EEA even though UKGC alone would not be.
  if (isEea) {
    return {
      tier: "eea",
      label,
      note: "Voitot verovapaita",
      title: `${label} — ETA-alueen lisenssi, voitot pääsääntöisesti verovapaita suomalaispelaajalle`,
    };
  }
  if (isNonEea) {
    return {
      tier: "non-eea",
      label,
      note: "Voitot veronalaisia Suomessa",
      title: `${label} — ETA-alueen ulkopuolinen lisenssi, voitot ovat Suomessa veronalaista tuloa`,
    };
  }
  return { tier: "unknown", label, note: null, title: label };
}
