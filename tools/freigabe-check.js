// Freigabe-Prüfung vor jeder Auslieferung (Idee der Teamleiter-Runde, umgesetzt von Technik & Betrieb).
//
// Prüft eine laufende Seite gegen die Team-Standards:
//   1. iPhone, iPad, Desktop – hell und dunkel: kein seitliches Scrollen, keine Konsolenfehler
//   4. Installierbar: Manifest, apple-touch-icon (180 px), Icons 192/512 und maskable erreichbar,
//      Chrome meldet keine Installationsfehler
// Legt Screenshots als Beweis in den Ausgabeordner. Endet mit Code 1, wenn ein Punkt fehlschlägt.
//
// Aufruf:  node tools/freigabe-check.js <url> [ausgabeordner]
// Umgebung: PLAYWRIGHT_MODULE (Pfad zum playwright-Paket), CHROME_PATH (Chrome-Programm)

const path = require("path");
const fs = require("fs");
const os = require("os");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const URL = process.argv[2];
const OUT = process.argv[3] || "freigabe";
if (!URL) { console.error("Aufruf: node tools/freigabe-check.js <url> [ausgabeordner]"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

const DEVICES = [
  { name: "iphone", viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  { name: "ipad", viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
];
const launch = { executablePath: process.env.CHROME_PATH || undefined };
const results = [];
const check = (punkt, ok, detail = "") => { results.push({ punkt, ok, detail }); };

(async () => {
  const browser = await chromium.launch(launch);

  // Standard 1: Geräte
  for (const d of DEVICES) {
    for (const scheme of ["light", "dark"]) {
      const ctx = await browser.newContext({ ...d, colorScheme: scheme });
      const page = await ctx.newPage();
      const errors = [];
      page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
      page.on("pageerror", e => errors.push(String(e)));
      await page.goto(URL, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const r = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth }));
      const label = `${d.name} (${scheme === "light" ? "hell" : "dunkel"})`;
      check(`Ansicht ${label}: kein seitliches Scrollen`, r.docW <= r.winW, `${r.docW}px Inhalt bei ${r.winW}px Fenster`);
      check(`Ansicht ${label}: keine Fehler`, errors.length === 0, errors.slice(0, 3).join(" | "));
      await page.screenshot({ path: path.join(OUT, `${d.name}-${scheme}.png`), fullPage: scheme === "light" });
      await ctx.close();
    }
  }

  // Standard 4: Installierbarkeit und Icons (normales Profil, nicht inkognito)
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "freigabe-"));
  const ctx = await chromium.launchPersistentContext(profile, launch);
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  const cdp = await ctx.newCDPSession(page);
  const man = await cdp.send("Page.getAppManifest");
  check("Manifest vorhanden und fehlerfrei", !!man.url && man.errors.length === 0, man.url || "kein Manifest verlinkt");
  const inst = await cdp.send("Page.getInstallabilityErrors");
  check("Desktop: als App installierbar", inst.installabilityErrors.length === 0, inst.installabilityErrors.map(e => e.errorId).join(", "));
  const touch = await page.evaluate(async () => {
    const href = document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href");
    if (!href) return { ok: false, detail: "kein apple-touch-icon verlinkt" };
    const r = await fetch(href); if (!r.ok) return { ok: false, detail: `${href}: HTTP ${r.status}` };
    const b = await createImageBitmap(await r.blob());
    return { ok: b.width >= 180 && b.width === b.height, detail: `${href}: ${b.width}x${b.height}` };
  });
  check("iPhone: Home-Bildschirm-Icon (mind. 180 px, quadratisch)", touch.ok, touch.detail);
  const icons = (JSON.parse(man.data || "{}").icons) || [];
  for (const need of ["192x192", "512x512"]) {
    check(`Manifest-Icon ${need}`, icons.some(i => (i.sizes || "").split(" ").includes(need)), "");
  }
  check("Manifest-Icon maskable (Android)", icons.some(i => (i.purpose || "").includes("maskable")), "");
  for (const i of icons) {
    const st = await page.evaluate(async src => (await fetch(src)).status, i.src);
    check(`Icon erreichbar: ${i.src}`, st === 200, `HTTP ${st}`);
  }
  await ctx.close();
  fs.rmSync(profile, { recursive: true, force: true });
  await browser.close();

  // Bericht
  const failed = results.filter(r => !r.ok);
  const lines = [`# Freigabe-Prüfung`, ``, `Seite: ${URL}`, `Ergebnis: ${failed.length ? `NICHT freigegeben (${failed.length} Punkte offen)` : "freigegeben"}`, ``,
    ...results.map(r => `- ${r.ok ? "✅" : "❌"} ${r.punkt}${r.detail && !r.ok ? ` – ${r.detail}` : ""}`)];
  fs.writeFileSync(path.join(OUT, "bericht.md"), lines.join("\n") + "\n");
  console.log(lines.join("\n"));
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
