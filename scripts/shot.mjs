// One-off screenshot helper for the README. Drives the installed Chrome.
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3000";
const shots = [
  { tab: "dashboard", file: "docs/dashboard.png", full: true, waitFor: "svg[role='img']" },
  { tab: "briefing", file: "docs/agent.png", full: false, height: 900, waitFor: "h1" },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=2"],
  defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 2 },
});

for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: s.height ?? 900, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/?tab=${s.tab}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  try { await page.waitForSelector(s.waitFor, { timeout: 8000 }); } catch {}
  await new Promise((r) => setTimeout(r, 2500)); // let hydration + rise animations settle
  await page.screenshot({ path: s.file, fullPage: !!s.full, ...(s.full ? {} : { clip: { x: 0, y: 0, width: 1280, height: s.height ?? 900 } }) });
  console.log("shot", s.file);
  await page.close();
}
await browser.close();
