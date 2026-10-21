// Spieltest von Bug-Bodo: spielt Runden, prüft Belohnungen, Eltern-Bereich, Sprachen und Geräte.
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const URL = process.argv[2], OUT = process.argv[3];
const DEV = {
  iphone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  ipad: { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
async function answer(page, right) {
  const q = await page.evaluate(() => { const s = [...document.querySelectorAll(".q > span")].map(x => x.textContent); return { x: +s[0], y: +s[2] }; });
  const v = right ? q.x * q.y : q.x * q.y + 1;
  for (const d of String(v)) await page.click(`.key[data-k="${d}"]`);
  await page.click(".key.ok");
}
async function overflow(page, tag) {
  const r = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  ok(r[0] <= r[1], `${tag}: seitliches Scrollen ${r[0]}>${r[1]}`);
}
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/google/chrome/chrome" });
  for (const [name, d] of Object.entries(DEV)) {
    for (const scheme of ["light", "dark"]) {
      const ctx = await b.newContext({ ...d, colorScheme: scheme });
      const page = await ctx.newPage();
      const errs = []; page.on("pageerror", e => errs.push(String(e))); page.on("console", m => m.type() === "error" && errs.push(m.text()));
      await page.goto(URL); await page.waitForTimeout(300);
      const tag = `${name}-${scheme}`;
      await overflow(page, tag + " start");
      if (scheme === "light") await page.screenshot({ path: `${OUT}/${tag}-1-start.png`, fullPage: true });
      // Name eingeben
      await page.evaluate(() => show("lernen")); await page.waitForTimeout(400);
      await page.fill("#np-name", "Testkind"); await page.click('#np-form button[type="submit"]'); await page.waitForTimeout(200); await page.evaluate(() => show("home"));
      ok((await page.textContent(".hello")).includes("Testkind"), tag + ": Begrüßung");
      // 1er-Reihe: 9 richtig, 1 falsch, Wiederholung richtig
      await page.click('.tile[data-a="1"]');
      for (let i = 0; i < 10; i++) {
        if (i === 3) {
          await answer(page, false); await page.waitForTimeout(150);
          if (i === 3 && scheme === "light") await page.screenshot({ path: `${OUT}/${tag}-2-falsch.png` });
          await overflow(page, tag + " falsch");
          await page.click("#nextbtn");
        } else { await answer(page, true); await page.waitForTimeout(820); }
      }
      await answer(page, true); await page.waitForTimeout(900);
      ok(await page.isVisible("#v-result"), tag + ": Ergebnis sichtbar");
      ok((await page.textContent("#v-result")).includes("9 von 10"), tag + ": 9 von 10");
      if (scheme === "light") await page.screenshot({ path: `${OUT}/${tag}-3-ergebnis.png`, fullPage: true });
      await overflow(page, tag + " ergebnis");
      // Perfekte Runde 10er-Reihe
      await page.click('[data-act="tab"][data-v="home"] >> nth=-1').catch(() => {});
      await page.evaluate(() => show("home"));
      await page.click('.tile[data-a="10"]');
      await page.screenshot({ path: `${OUT}/${tag}-4-frage.png` });
      const padOk = await page.evaluate(() => { const p = document.querySelector("#v-play .pad"), k = [...document.querySelectorAll("#v-play .key")].map(e => e.getBoundingClientRect());
        return getComputedStyle(p).gridTemplateColumns.split(" ").length === 3 && getComputedStyle(p).position === "static" && k[0].top === k[1].top && k[0].width > 60; });
      ok(padOk, tag + ": Ziffernblock 3 Spalten, Tasten breit");
      await overflow(page, tag + " frage");
      for (let i = 0; i < 10; i++) { await answer(page, true); await page.waitForTimeout(820); }
      const txt = await page.textContent("#v-result");
      ok(txt.includes("Volltreffer"), tag + ": Volltreffer");
      const st = await page.evaluate(() => S.stars);
      ok(st === 10 + 10 + 10 + 5, tag + ": Sterne " + st);   // 10 + 10 richtig + Tagesziel 10 + Bonus 5
      // Schatztruhe: PIN fehlt -> Hinweis
      await page.evaluate(() => show("truhe"));
      await page.evaluate(() => { S.stars = 70; save(); render(); });
      await page.click('[data-act="redeem"][data-id="r1"]');
      ok((await page.textContent("#v-truhe")).includes("einzurichten"), tag + ": PIN-Hinweis ohne Anleitung");
      // Eltern-Bereich: PIN setzen
      await page.click("#open-settings"); await page.click("#st-parents");
      // Eltern-Aufgabe erst falsch, dann richtig
      await page.fill("#pchk", "1"); await page.fill("#pin1", "1234"); await page.fill("#pin2", "1234"); await page.click("#pin-form button[type=submit]");
      ok((await page.textContent("#v-eltern")).includes("stimmt nicht"), tag + ": Eltern-Aufgabe falsch abgelehnt");
      const chk = await page.evaluate(() => EL.check.a * EL.check.b);
      await page.fill("#pchk", String(chk)); await page.fill("#pin1", "1234"); await page.fill("#pin2", "1234"); await page.click("#pin-form button[type=submit]");
      await page.waitForTimeout(200);
      ok(await page.evaluate(() => !("pin" in S) || !S.pin) && await page.evaluate(() => S.pinH.length > 8), tag + ": PIN nur als Prüfsumme");
      ok(await page.isVisible("#p-name"), tag + ": Eltern-Bereich offen");
      if (scheme === "light") await page.screenshot({ path: `${OUT}/${tag}-5-eltern.png`, fullPage: true });
      await overflow(page, tag + " eltern");
      await page.click('[data-act="addReward"]');
      ok(await page.evaluate(() => S.rewards.length) === 4, tag + ": Belohnung hinzugefügt");
      await page.click('[data-act="delReward"] >> nth=-1'); await page.click('#toast [data-act="undo"]');
      ok(await page.evaluate(() => S.rewards.length) === 4, tag + ": Rückgängig");
      // Einlösen mit falscher und richtiger PIN
      await page.evaluate(() => show("truhe"));
      await page.click('[data-act="redeem"][data-id="r1"]');
      await page.fill("#cf-pin", "9999"); await page.click("#cf-form button[type=submit]"); await page.waitForTimeout(150);
      ok((await page.textContent("#v-truhe")).includes("stimmt nicht"), tag + ": falsche PIN");
      await page.fill("#cf-pin", "1234"); await page.click("#cf-form button[type=submit]"); await page.waitForTimeout(200);
      ok(await page.evaluate(() => S.stars) === 10 && (await page.evaluate(() => S.redeemed.length)) === 1, tag + ": eingelöst");
      if (scheme === "light") await page.screenshot({ path: `${OUT}/${tag}-6-truhe.png`, fullPage: true });
      await overflow(page, tag + " truhe");
      // Sperre nach drei Fehlversuchen
      await page.click('[data-act="redeem"][data-id="r2"]').catch(() => {});
      await page.evaluate(() => { S.stars = 500; save(); RD = { id: "r2", err: "" }; render(); });
      for (let k = 0; k < 3; k++){ await page.fill("#cf-pin", "000" + k); await page.click("#cf-form button[type=submit]"); await page.waitForTimeout(120); }
      ok((await page.textContent("#v-truhe")).includes("warte"), tag + ": Sperre nach 3 Versuchen");
      await page.fill("#cf-pin", "1234"); await page.click("#cf-form button[type=submit]"); await page.waitForTimeout(120);
      ok(await page.evaluate(() => S.stars) === 500, tag + ": gesperrt trotz richtiger PIN");
      await page.evaluate(() => { S.pinFail = { n: 0, until: 0 }; S.stars = 10; save(); RD = null; render(); });
      // Abbrechen mit Rückfrage
      await page.evaluate(() => show("home")); await page.click('.tile[data-a="2"]'); await answer(page, true); await page.waitForTimeout(820);
      await page.click('[data-act="close"]');
      ok(await page.isVisible(".quitbox"), tag + ": Rückfrage beim Beenden");
      await page.click('[data-act="quitNo"]'); ok(await page.isVisible("#v-play"), tag + ": weiterspielen");
      await page.click('[data-act="close"]'); await page.click('.quitbox [data-act="close"]');
      ok(await page.isVisible("#v-home"), tag + ": beendet");
      await page.evaluate(() => { S.stars = 10; save(); render(); });
      // Sammlung
      await page.evaluate(() => show("sammlung"));
      if (scheme === "light") await page.screenshot({ path: `${OUT}/${tag}-7-sammlung.png`, fullPage: true });
      await overflow(page, tag + " sammlung");
      // Blitzrunde kurz
      await page.evaluate(() => show("home"));
      await page.click('[data-mode="blitz"]');
      await answer(page, true); await page.waitForTimeout(820); await answer(page, false); await page.waitForTimeout(1400);
      await page.evaluate(() => { P.end = Date.now(); });
      await page.waitForTimeout(500);
      ok(await page.isVisible("#v-result"), tag + ": Blitz-Ergebnis");
      // Knobel-Kiste vorhanden?
      // Englisch + Dunkel über Einstellungen
      await page.click('[data-act="tab"][data-v="home"] >> visible=true').catch(async () => page.evaluate(() => show("home")));
      await page.click("#open-settings"); await page.check("#st-lang-en", { force: true }); await page.click("#st-done");
      ok((await page.textContent("#v-home")).includes("Times tables"), tag + ": Englisch");
      ok(await page.evaluate(() => document.documentElement.lang) === "en", tag + ": lang=en");
      if (scheme === "dark") await page.screenshot({ path: `${OUT}/${tag}-8-en.png`, fullPage: true });
      await overflow(page, tag + " en");
      await page.reload(); await page.waitForTimeout(300);
      ok((await page.textContent("#v-home")).includes("Testkind"), tag + ": Stand bleibt nach Neuladen");
      ok(await page.evaluate(() => document.documentElement.lang) === "en", tag + ": Sprache bleibt");
      ok(errs.length === 0, tag + ": Fehler " + errs.join(" | "));
      await ctx.close();
    }
  }
  await b.close();
  console.log(fails.length ? "FEHLER:\n" + fails.join("\n") : "alles bestanden");
})();
