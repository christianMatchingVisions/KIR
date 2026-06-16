// Remove the near-white background from the hero lion render so it sits flush
// on the page (transparent PNG/WebP). Uses an EDGE flood-fill: only background
// pixels connected to the image border are cleared, so interior whites (jersey
// trim, chip rims, slot reels, crown highlights) are preserved. A small alpha
// feather softens the cut edge.
//
// Usage: node scripts/remove-hero-bg.mjs [srcPng] [outWebp] [tolerance]
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.argv[2] ||
  "C:/Users/chrni/.claude/image-cache/9fe7ee5b-2ee5-4181-8ffc-0d293cbd2061/7.png";
const OUT = process.argv[3] || path.join(ROOT, "public", "hero", "lion-slot.webp");
const TOL = Number(process.argv[4] || 78); // Euclidean RGB distance from bg color

const { data, info } = await sharp(SRC)
  .resize({ width: 1100, withoutEnlargement: true })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info; // C === 4

// Reference background colour = average of the four corner blocks.
function cornerAvg() {
  const pts = [];
  const b = 12;
  for (const [ox, oy] of [[0, 0], [W - b, 0], [0, H - b], [W - b, H - b]]) {
    for (let y = oy; y < oy + b; y++)
      for (let x = ox; x < ox + b; x++) pts.push((y * W + x) * C);
  }
  let r = 0, g = 0, bl = 0;
  for (const i of pts) { r += data[i]; g += data[i + 1]; bl += data[i + 2]; }
  return [r / pts.length, g / pts.length, bl / pts.length];
}
const [BR, BG, BB] = cornerAvg();
const dist = (i) => {
  const dr = data[i] - BR, dg = data[i + 1] - BG, db = data[i + 2] - BB;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

// Flood-fill background from every border pixel (4-connected), within TOL.
const isBg = new Uint8Array(W * H); // 1 = background (to clear)
const stack = [];
const pushIfBg = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const p = y * W + x;
  if (isBg[p]) return;
  if (dist(p * C) <= TOL) { isBg[p] = 1; stack.push(p); }
};
for (let x = 0; x < W; x++) { pushIfBg(x, 0); pushIfBg(x, H - 1); }
for (let y = 0; y < H; y++) { pushIfBg(0, y); pushIfBg(W - 1, y); }
while (stack.length) {
  const p = stack.pop();
  const x = p % W, y = (p / W) | 0;
  pushIfBg(x + 1, y); pushIfBg(x - 1, y); pushIfBg(x, y + 1); pushIfBg(x, y - 1);
}

// Build an alpha mask (255 keep, 0 clear), then feather the boundary 1px so the
// cut isn't jagged (3x3 box blur over the mask only).
const keep = new Float32Array(W * H);
for (let p = 0; p < W * H; p++) keep[p] = isBg[p] ? 0 : 255;
const soft = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        s += keep[ny * W + nx]; n++;
      }
    soft[y * W + x] = s / n;
  }
}
for (let p = 0; p < W * H; p++) {
  const a = Math.round(soft[p]);
  data[p * C + 3] = a < 255 ? a : data[p * C + 3]; // never increase existing alpha
}

let cleared = 0;
for (let p = 0; p < W * H; p++) if (isBg[p]) cleared++;
await sharp(data, { raw: { width: W, height: H, channels: C } })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT);
const fs = await import("node:fs");
console.log(
  `bg=[${BR.toFixed(0)},${BG.toFixed(0)},${BB.toFixed(0)}] tol=${TOL} | cleared ${(100 * cleared / (W * H)).toFixed(1)}% of pixels | ${OUT} ${fs.statSync(OUT).size} bytes`,
);
