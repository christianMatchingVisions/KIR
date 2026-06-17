#!/usr/bin/env node
/**
 * set-cutover-mode.mjs — toggle the staging-only `X-Robots-Tag: noindex` header
 * in vercel.json ON (staging) or OFF (production), idempotently and safely.
 *
 *   node scripts/set-cutover-mode.mjs --mode staging      # add the noindex header
 *   node scripts/set-cutover-mode.mjs --mode production   # remove it
 *
 * WHY: while the rebuild lives at kir-three.vercel.app it MUST NOT be indexed
 * (a staging copy of a recovering domain competing for the same content would
 * be harmful). At DNS cutover to the real domain the noindex must come OFF.
 * This script flips that single header without touching the (large) redirects
 * block or anything else in vercel.json.
 *
 * HOW IT STAYS SAFE / IDEMPOTENT:
 *  - It locates OUR header entry by a STABLE SENTINEL header — every line we
 *    manage carries `X-KIR-Cutover` — so we never guess based on the source
 *    pattern alone and never collide with unrelated headers a human may add.
 *  - It re-parses and re-stringifies the WHOLE file; if the JSON is invalid it
 *    refuses to write (throws) rather than corrupting it.
 *  - Running staging twice = no duplicate entry; running production when
 *    already off = no-op. Both print what they did.
 *
 * Node built-ins only (fs / path / url) — no dependencies.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERCEL_JSON = path.resolve(__dirname, "..", "vercel.json");

/** Stable marker. Every header block this script manages carries it, and the
 *  whole-site source pattern is fixed so we can find/replace deterministically. */
const SENTINEL_HEADER = "X-KIR-Cutover";
const CUTOVER_SOURCE = "/(.*)";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--mode") args.mode = argv[++i];
    else if (a.startsWith("--mode=")) args.mode = a.slice("--mode=".length);
  }
  return args;
}

/** Build the managed header entry (staging). */
function makeStagingEntry() {
  return {
    source: CUTOVER_SOURCE,
    headers: [
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: SENTINEL_HEADER, value: "staging-noindex" },
    ],
  };
}

/** True if a headers entry is one WE manage (carries the sentinel). */
function isManagedEntry(entry) {
  return (
    entry &&
    Array.isArray(entry.headers) &&
    entry.headers.some((h) => h && h.key === SENTINEL_HEADER)
  );
}

function main() {
  const { mode } = parseArgs(process.argv.slice(2));
  if (mode !== "staging" && mode !== "production") {
    console.error(
      "Usage: node scripts/set-cutover-mode.mjs --mode <staging|production>"
    );
    process.exit(2);
  }

  let raw;
  try {
    raw = fs.readFileSync(VERCEL_JSON, "utf8");
  } catch (err) {
    console.error(`[cutover] cannot read ${VERCEL_JSON}: ${err.message}`);
    process.exit(1);
  }

  // Refuse to touch a file we cannot parse — never corrupt vercel.json.
  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    console.error(
      `[cutover] ${VERCEL_JSON} is not valid JSON (${err.message}). Refusing to write.`
    );
    process.exit(1);
  }
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    console.error("[cutover] vercel.json root is not an object. Refusing to write.");
    process.exit(1);
  }

  const headers = Array.isArray(config.headers) ? config.headers : [];

  // Strip any header entry we previously managed (idempotent baseline).
  const cleaned = headers.filter((e) => !isManagedEntry(e));
  const hadManaged = cleaned.length !== headers.length;

  let action;
  if (mode === "staging") {
    cleaned.push(makeStagingEntry());
    config.headers = cleaned;
    action = hadManaged
      ? "refreshed existing staging noindex header (idempotent)"
      : "ADDED staging noindex header (X-Robots-Tag: noindex)";
  } else {
    // production: remove ours; drop the headers key entirely if now empty AND
    // it didn't exist before (keep an existing non-empty array intact).
    if (cleaned.length === 0) {
      delete config.headers;
    } else {
      config.headers = cleaned;
    }
    action = hadManaged
      ? "REMOVED staging noindex header (production: page is now indexable)"
      : "no staging header present — already production (no-op)";
  }

  // Preserve a trailing newline if the original had one.
  const endsWithNewline = raw.endsWith("\n");
  const out = JSON.stringify(config, null, 2) + (endsWithNewline ? "\n" : "");

  // Final guard: re-parse our own output before committing it to disk.
  try {
    JSON.parse(out);
  } catch (err) {
    console.error(`[cutover] internal error — generated invalid JSON (${err.message}). Aborting.`);
    process.exit(1);
  }

  fs.writeFileSync(VERCEL_JSON, out, "utf8");
  console.log(`[cutover] mode=${mode}: ${action}`);
  console.log(`[cutover] wrote ${VERCEL_JSON}`);
}

main();
