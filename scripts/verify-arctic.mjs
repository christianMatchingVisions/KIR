// Visual + console verification of the arctic cinematic theme.
// Screenshots the homepage at several scroll positions (incl. mid-scrub of
// the pinned hero scene) and dumps console errors/warnings.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const messages = [];
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) messages.push(`${m.type()}: ${m.text().slice(0, 200)}`);
});
page.on('pageerror', (e) => messages.push(`pageerror: ${String(e).slice(0, 200)}`));

await page.goto('http://localhost:4322/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2200)); // entrance timeline settles
await page.screenshot({ path: 'screenshots/arctic-1-load.png' });

// mid-scrub of the pinned hero scene (deterministic: set scroll + progress)
const sceneInfo = await page.evaluate((p) => {
  const st = ScrollTrigger.getAll().find((s) => s.pin);
  if (!st) return null;
  window.lenis.scrollTo(st.start + p * (st.end - st.start), { immediate: true });
  st.animation.progress(p);
  return { start: st.start, end: st.end };
}, 0.55);
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: 'screenshots/arctic-2-scrub.png' });

// toplist area (reveals fired)
await page.evaluate(() => window.lenis.scrollTo(innerHeight * 2.6, { immediate: true }));
await new Promise((r) => setTimeout(r, 1300));
await page.screenshot({ path: 'screenshots/arctic-3-toplist.png' });

// footer
await page.evaluate(() => window.lenis.scrollTo(document.body.scrollHeight, { immediate: true }));
await new Promise((r) => setTimeout(r, 1300));
await page.screenshot({ path: 'screenshots/arctic-4-footer.png' });

// a casino review page
await page.goto('http://localhost:4322/casino/21red-kasino/', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 1800));
await page.screenshot({ path: 'screenshots/arctic-5-casino.png' });

console.log('pinned scene found:', !!sceneInfo, JSON.stringify(sceneInfo));
console.log('console issues:', messages.length ? '\n' + messages.join('\n') : 'none');
await browser.close();
