// Captures a scripted tour of the dashboard at http://localhost:5173/
// and encodes the frames into an animated GIF
// Usage: node scripts/capture-demo.mjs
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import gifenc from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifenc;
import { writeFileSync } from 'node:fs';

import { fileURLToPath } from 'node:url';
const APP_URL = 'http://localhost:5173/';
const OUT = fileURLToPath(new URL('../src/data/demo.gif', import.meta.url));
const W = 1440, H = 900;     // desktop width → real 2-column dashboard layout

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
});
await page.goto(APP_URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(800); // let charts animate in

const frames = [];
async function snap() {
  const buf = await page.screenshot({ type: 'png', fullPage: true });
  const png = PNG.sync.read(buf);
  frames.push({ w: png.width, h: png.height, data: new Uint8Array(png.data.buffer) });
}
// Capture a state several times so it lingers in the loop.
async function hold(n = 4) { for (let i = 0; i < n; i++) { await snap(); await page.waitForTimeout(80); } }

// --- Scripted tour -------------------------------------------------
await hold(5);                                   // 1. landing (light, 12M)

const ranges = ['3Y', '5Y', 'All', '12M'];       // 2. cycle performance ranges
for (const label of ranges) {
  await page.click(`.seg button:has-text("${label}")`);
  await page.waitForTimeout(500);
  await hold(3);
}

await page.click('button.theme-toggle');          // 3. switch to dark mode
await page.waitForTimeout(600);
await hold(6);

for (const label of ['3Y', 'All']) {              // 4. ranges in dark mode
  await page.click(`.seg button:has-text("${label}")`);
  await page.waitForTimeout(500);
  await hold(3);
}

await page.click('button.theme-toggle');          // 5. back to light
await page.waitForTimeout(600);
await hold(4);

// 6. scroll the Holdings table to reveal the rows below the fold
const maxScroll = await page.$eval('.table-scroll', (el) => el.scrollHeight - el.clientHeight);
const steps = 6;
for (let i = 1; i <= steps; i++) {                 // scroll down
  await page.$eval('.table-scroll', (el, top) => { el.scrollTop = top; }, (maxScroll * i) / steps);
  await page.waitForTimeout(120);
  await snap();
}
await hold(3);                                     // pause at the bottom
for (let i = steps - 1; i >= 0; i--) {             // scroll back up
  await page.$eval('.table-scroll', (el, top) => { el.scrollTop = top; }, (maxScroll * i) / steps);
  await page.waitForTimeout(120);
  await snap();
}
await hold(4);

await browser.close();

// --- Encode GIF ----------------------------------------------------
const { w, h } = frames[0];
const gif = GIFEncoder();
const delay = 220; // ms per frame
for (const f of frames) {
  const palette = quantize(f.data, 256);
  const index = applyPalette(f.data, palette);
  gif.writeFrame(index, w, h, { palette, delay });
}
gif.finish();
writeFileSync(OUT, Buffer.from(gif.bytes()));
console.log(`Wrote ${OUT} — ${frames.length} frames @ ${w}x${h}`);
