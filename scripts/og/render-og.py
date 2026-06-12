# @custom — renders scripts/og/*.html to public/og/*.png (1200x630, < 300 KB).
# Run with the SEO-skill venv python (playwright + chromium + Pillow installed):
#   "C:/Users/chrni/.claude/skills/seo/.venv/Scripts/python.exe" scripts/og/render-og.py
import io
import pathlib
import sys

from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = pathlib.Path(__file__).resolve().parent / "mm-kisat-2026-tilastot.html"
OUT = ROOT / "public" / "og" / "mm-kisat-2026-tilastot.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    page.goto(SRC.as_uri())
    page.evaluate("() => document.fonts.ready.then(() => true)")
    page.wait_for_timeout(250)
    png_bytes = page.screenshot(type="png")
    browser.close()

img = Image.open(io.BytesIO(png_bytes))
assert img.size == (1200, 630), f"unexpected size {img.size}"

# Optimize: try plain optimized truecolor first, fall back to an adaptive
# 256-colour palette if the file would exceed the 300 KB budget.
buf = io.BytesIO()
img.convert("RGB").save(buf, "PNG", optimize=True)
data = buf.getvalue()
if len(data) > 300 * 1024:
    pal = img.convert("RGB").quantize(colors=256, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
    buf = io.BytesIO()
    pal.save(buf, "PNG", optimize=True)
    data = buf.getvalue()

OUT.write_bytes(data)
check = Image.open(OUT)
print(f"wrote {OUT} size={check.size} bytes={len(data)}")
sys.exit(0 if check.size == (1200, 630) and len(data) <= 300 * 1024 else 1)
