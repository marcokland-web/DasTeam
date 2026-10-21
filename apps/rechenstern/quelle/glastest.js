const { chromium } = require("/opt/node-tools/node_modules/playwright");
const URL = process.argv[2], OUT = process.argv[3]; const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/google/chrome/chrome" });
  for (const [name, vp] of [["iphone", { width: 390, height: 844 }], ["ipad", { width: 820, height: 1180 }], ["desktop", { width: 1440, height: 900 }]]) for (const scheme of ["light", "dark"]) {
    const ctx = await b.newContext({ viewport: vp, colorScheme: scheme, deviceScaleFactor: 2, isMobile: name !== "desktop", hasTouch: name !== "desktop" }); const page = await ctx.newPage();
    const errs = []; page.on("pageerror", e => errs.push(String(e)));
    const tag = `${name}-${scheme}`;
    await page.goto(URL); await sleep(600);
    ok(await page.isVisible("#namepop"), tag + ": Namens-Pop-up beim Start");
    if (scheme === "light") await page.screenshot({ path: `${OUT}/${tag}-g1-name.png` });
    await page.fill("#np-name", "Ben"); await page.click('#np-form button[type="submit"]'); await sleep(300);
    ok(!(await page.isVisible("#namepop")), tag + ": Pop-up schließt");
    ok((await page.textContent("#v-lernen")).includes("Ben"), tag + ": Name auf der Lernseite");
    await page.reload(); await sleep(500); ok(!(await page.isVisible("#namepop")), tag + ": Pop-up nicht erneut");
    await page.screenshot({ path: `${OUT}/${tag}-g2-lernen.png` });
    // Mischen
    await page.check('input[name="pmode"][value="mix"]', { force: true }); await sleep(100);
    await page.click('.rchip[data-a="3"]'); await page.click('.rchip[data-a="7"]'); await sleep(100);
    ok((await page.textContent("#v-lernen")).includes("Gemischt"), tag + ": Mischung angezeigt");
    if (scheme === "dark") await page.screenshot({ path: `${OUT}/${tag}-g3-mix.png`, fullPage: true });
    await page.click('[data-act="mixStation"][data-st="ueben"]'); await sleep(200);
    const qs = await page.evaluate(() => P.queue.map(q => q.a)); ok(qs.length === 10 && qs.every(a => [1, 3, 7].includes(a)), tag + ": gemischte Runde nur aus gewählten Reihen " + qs.join(","));
    await page.click('[data-act="close"]'); await sleep(100);
    await page.evaluate(() => show("lernen")); await page.check('input[name="pmode"][value="mix"]', { force: true });
    await page.click('[data-act="mixStation"][data-st="schoko"]').catch(() => {}); await sleep(200);
    ok(await page.evaluate(() => A && A.kind === "schoko" && A.tasks.length === 4), tag + ": gemischte Schokolade");
    await page.click('[data-act="actClose"]');
    // Name in Sammlung, Truhe
    await page.evaluate(() => show("sammlung")); ok((await page.textContent("#v-sammlung")).includes("Bens"), tag + ": Bens Sammlung");
    await page.evaluate(() => show("truhe")); ok((await page.textContent("#v-truhe")).includes("Bens Sterne"), tag + ": Bens Sterne");
    // Einstellungen mit Stimme
    await page.click("#open-settings"); await sleep(300); await page.screenshot({ path: `${OUT}/${tag}-g4-settings.png` });
    ok(await page.$("#st-voice"), tag + ": Stimmenauswahl");
    ok((await page.textContent("#st-done")).trim() === "Fertig", tag + ": Knopf heißt Fertig");
    const dw = await page.evaluate(() => { const d = document.querySelector("#settings"); return [d.scrollWidth, d.clientWidth]; }); ok(dw[0] <= dw[1] + 1, tag + ": Einstellungen ohne seitliches Scrollen " + dw);
    await page.click("#st-done");
    // Glas angewendet
    const bf = await page.evaluate(() => getComputedStyle(document.querySelector(".top")).backdropFilter || getComputedStyle(document.querySelector(".top")).webkitBackdropFilter);
    ok(/blur/.test(bf || ""), tag + ": Glas-Effekt " + bf);
    const r = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(r[0] <= r[1], tag + ": seitlich");
    await page.evaluate(() => show("home")); await sleep(200); await page.screenshot({ path: `${OUT}/${tag}-g5-ueben.png` });
    ok(errs.length === 0, tag + ": Fehler " + errs.join(" | "));
    await ctx.close();
  }
  await b.close(); console.log(fails.length ? "FEHLER:\n" + fails.join("\n") : "alles bestanden");
})();
