/**
 * link-rotation.ts — spread internal links evenly across a corpus.
 *
 * WHY (measured 2026-11-01 from dist/, sitewide nav and footer excluded so
 * boilerplate does not mask the real graph):
 *
 *     125 pages had exactly ONE incoming internal link — 79 of them casino
 *     reviews — while a handful of pages absorbed the rest.
 *
 * The cause was not missing link blocks; the review template already renders
 * two of them. It was that both blocks pick the SAME targets on every page:
 *
 *   - the "Muut kasinot" strip took `.slice(0, 4)` of one 20-row toplist, so
 *     all ~305 reviews pointed at the same four casinos;
 *   - `relatedReviews()` sorts by fact overlap and then ALPHABETICALLY, so
 *     every review with no licence/payment overlap fell back to the same
 *     alphabetically-first names.
 *
 * Multiply either by 305 pages and you get a funnel: a few URLs with hundreds
 * of internal links and a long tail with one.
 *
 * THE FIX IS POSITIONAL, NOT RANDOM. Sort the candidates, find where the
 * current page sits, and take the next N after it, wrapping around the end.
 * Every page then links to a different N, and — because the walk is a single
 * cycle over the whole list — every page RECEIVES exactly N links too. The
 * distribution is provably even rather than merely shuffled.
 *
 * Deterministic by construction: same corpus in, same links out, so a rebuild
 * never churns the HTML and the diff stays reviewable. No hashing, no RNG, no
 * build-order dependency.
 */

/**
 * Cyclic distance from `currentKey` to every key, as a tiebreaker.
 *
 * Scoring systems funnel just as hard as `.slice()` does. `relatedReviews()`
 * ranks candidates by how many licence and payment tokens they share with the
 * current review, which is a coarse score: dozens of casinos tie on it, and the
 * tie was broken ALPHABETICALLY, so the same handful of names won on every one
 * of ~305 pages. Rotating only the leftover backfill slots barely moved the
 * measured distribution (125 single-link pages -> 124), because the scored
 * slots were the funnel.
 *
 * Feeding this rank in as the tiebreaker keeps the genuine signal — a real
 * token overlap still outranks none — while spreading everything that ties.
 *
 * @returns Map from key to its distance after `currentKey` in the sorted cycle
 *          (1 = immediately after). Lower sorts first.
 */
export function rotationRank(keys: readonly string[], currentKey: string): Map<string, number> {
  const sorted = [...new Set(keys)].sort((a, b) => a.localeCompare(b, "en"));
  const n = sorted.length;
  const out = new Map<string, number>();
  if (n === 0) return out;

  let start = sorted.indexOf(currentKey);
  if (start < 0) {
    const after = sorted.findIndex((k) => k.localeCompare(currentKey, "en") > 0);
    start = (after < 0 ? 0 : after) - 1;
  }
  for (let i = 0; i < n; i += 1) {
    out.set(sorted[(start + 1 + i + n * 2) % n], i + 1);
  }
  return out;
}

/**
 * Pick `count` items following `currentKey` in a stable cyclic order.
 *
 * @param items      Candidates. Order does not matter; they are sorted here.
 * @param keyOf      Stable unique key per item (a slug or URL).
 * @param currentKey Key of the page doing the linking. It is never picked.
 * @param count      How many to return.
 *
 * Returns fewer than `count` only when the corpus itself is smaller.
 */
export function rotatePick<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
  currentKey: string,
  count: number,
): T[] {
  if (count <= 0 || items.length === 0) return [];

  // Sort by key so the cycle is identical on every page of every build.
  const sorted = [...items].sort((a, b) => keyOf(a).localeCompare(keyOf(b), "en"));

  // Where does the current page sit in the cycle? A page that is not itself a
  // candidate (e.g. a closed review linking out to open ones) still needs a
  // stable position, so fall back to the first key that sorts after it.
  let start = sorted.findIndex((item) => keyOf(item) === currentKey);
  if (start < 0) {
    const after = sorted.findIndex((item) => keyOf(item).localeCompare(currentKey, "en") > 0);
    start = after < 0 ? 0 : after;
    // Step back one so the loop below starts AT that item rather than past it.
    start -= 1;
  }

  const out: T[] = [];
  const max = Math.min(count, sorted.length);
  for (let step = 1; out.length < max && step <= sorted.length; step += 1) {
    const item = sorted[(start + step + sorted.length * 2) % sorted.length];
    if (keyOf(item) === currentKey) continue;
    out.push(item);
  }
  return out;
}
