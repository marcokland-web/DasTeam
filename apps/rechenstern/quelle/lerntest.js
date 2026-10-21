// Lernbereich-Test (Bug-Bodo): alle Lernspiele, Entdeckerpfad, Zufallsmodus, Geräte und Themen.
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const URL = process.argv[2], OUT = process.argv[3];
const DEV = {
  iphone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  ipad: { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/google/chrome/chrome" });
  for (const [name, d] of Object.entries(DEV)) for (const scheme of ["light", "dark"]) {
    const ctx = await b.newContext({ ...d, colorScheme: scheme }); const page = await ctx.newPage();
    const errs = []; page.on("pageerror", e => errs.push(String(e))); page.on("console", m => m.type() === "error" && errs.push(m.text()));
    const tag = `${name}-${scheme}`, shot = async n => page.screenshot({ path: `${OUT}/${tag}-${n}.png`, fullPage: true });
    const over = async w => { const r = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(r[0] <= r[1], `${tag} ${w}: seitlich ${r[0]}>${r[1]}`); };
    await page.goto(URL); await sleep(500); await page.evaluate(() => { const d = document.querySelector("#namepop"); if (d && d.open) d.close(); });
    ok(await page.isVisible("#v-lernen"), tag + ": Start im Lernbereich"); await over("lernen"); await shot("l1-lernen");
    // Station 1: Schokolade für die 7er-Reihe
    await page.click('.rchip[data-a="7"]');
    await page.click('[data-act="station"][data-st="schoko"]');
    for (let i = 0; i < 3; i++) {
      const tk = await page.evaluate(() => A.tasks[A.ti]);
      const cell = page.locator(`#choco .pc[data-r="${tk.x - 1}"][data-c="${tk.y - 1}"]`);
      const bx = await cell.boundingBox();
      await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await page.mouse.down(); await page.mouse.up();
      await sleep(150);
      if (i === 0) { await over("schoko"); await shot("l2-schoko"); }
      ok(await page.isVisible('[data-act="chNext"]'), `${tag}: Schoko-Aufgabe ${i + 1} erkannt`);
      await page.click('[data-act="chNext"]'); await sleep(100);
    }
    ok(await page.evaluate(() => !!S.path[7]?.schoko), tag + ": Station Schokolade gespeichert");
    // Station 2: Frosch
    await page.click('.donebox [data-act="station"]'); await sleep(200);
    ok(await page.evaluate(() => A.kind === "frosch" && A.a === 7), tag + ": weiter zum Frosch");
    const wrong = await page.evaluate(() => A.opts.find(v => v !== 7));
    await page.click(`[data-act="frPick"][data-v="${wrong}"]`); await sleep(450);
    ok((await page.textContent("#fr-q")).includes("7"), tag + ": Frosch-Hinweis");
    for (let k = 0; k < 10; k++) {
      const c = await page.evaluate(() => (A.pos + 1) * A.a);
      await page.click(`[data-act="frPick"][data-v="${c}"]`); await sleep(560);
      if (k === 4) { await over("frosch"); await shot("l3-frosch"); }
    }
    ok(await page.evaluate(() => A.done && !!S.path[7]?.frosch), tag + ": Frosch fertig");
    // Station 3: Trick (Nachbar-Trick für die 7er)
    await page.click('.frogcard [data-act="station"]'); await sleep(200);
    ok(await page.evaluate(() => A.kind === "trick" && A.id === "nachbar"), tag + ": Nachbar-Trick geöffnet");
    await page.click('[data-act="trOp"]'); await page.click('[data-act="trOp"]'); await sleep(200);
    await over("trick-demo"); await shot("l4-trick");
    await page.click('[data-act="trStart"]');
    for (let i = 0; i < 3; i++) {
      if (i === 0) { await page.click('[data-act="trHint"]'); }
      const r = await page.evaluate(() => A.q.r); await page.click(`[data-act="trPick"][data-v="${r}"]`); await page.click('[data-act="trNext"]');
    }
    ok(await page.evaluate(() => !!S.tricks.nachbar), tag + ": Trick gelernt");
    ok(await page.evaluate(() => stationDone(7, "trick")), tag + ": Station Trick");
    // 9er-Finger-Trick ansehen
    await page.click('[data-act="actClose"]'); await page.click('[data-act="game"][data-g="trick"]'); await page.click('[data-act="openTrick"][data-id="finger"]');
    await page.click('[data-act="trFinger"][data-k="7"]'); ok((await page.textContent(".demo")).includes("63"), tag + ": Finger-Trick 9 × 7 = 63");
    await over("finger"); if (scheme === "dark") await shot("l5-finger");
    // Geschichten
    await page.click('[data-act="actClose"]'); await page.click('[data-act="game"][data-g="story"]');
    for (let i = 0; i < 5; i++) {
      await page.click('[data-act="sgTap"][data-i="0"]');
      if (i === 0) { await over("story"); await shot("l6-story"); }
      const r = await page.evaluate(() => A.list[A.i].n * A.list[A.i].s.p);
      await page.click(`[data-act="sgPick"][data-v="${r}"]`); await page.click('[data-act="sgNext"]');
    }
    ok(await page.evaluate(() => S.stories === 5), tag + ": 5 Geschichten");
    // Muster-Detektiv 9er
    await page.click('[data-act="actClose"]'); await page.click('[data-act="game"][data-g="detect"]'); await page.click('[data-act="muPick"][data-c="9"]');
    await page.click('[data-act="muCell"][data-n="10"]'); await sleep(100);
    ok((await page.textContent("#v-act")).includes("10"), tag + ": falsche Zahl erklärt"); await sleep(400);
    for (let n = 9; n <= 99; n += 9) await page.click(`[data-act="muCell"][data-n="${n}"]`);
    ok(await page.evaluate(() => A.solved && !!S.cases[9]), tag + ": Fall gelöst");
    await over("muster"); await shot("l7-muster");
    // Zufallsmodus
    await page.click('[data-act="actClose"]'); await page.click('[data-act="surprise"]'); await sleep(250);
    if (scheme === "light") await shot("l8-spin");
    await sleep(3200);
    ok(await page.evaluate(() => A && A.kind !== "spin"), tag + ": Zufall öffnet ein Spiel");
    await over("zufall");
    // zurück, Lernseite zeigt Fortschritt; Englisch
    await page.evaluate(() => { A = null; show("lernen"); });
    await page.click('.rchip[data-a="7"]');
    ok((await page.$$(".station.done")).length >= 3, tag + ": 3 Stationen erledigt angezeigt");
    await page.click("#open-settings"); await page.check("#st-lang-en", { force: true }); await page.click("#st-done");
    ok((await page.textContent("#v-lernen")).includes("discovery path"), tag + ": Englisch");
    await over("en"); if (scheme === "dark") await shot("l9-en");
    // Tab-Navigation
    await page.evaluate(() => show("home")); ok(await page.isVisible("#v-home"), tag + ": Üben erreichbar");
    ok(errs.length === 0, tag + ": Fehler " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  await b.close();
  console.log(fails.length ? "FEHLER:\n" + fails.join("\n") : "alles bestanden");
})();
