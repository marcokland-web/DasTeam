// Test der Extras (Bug-Bodo): Sync mit nachgebautem Supabase, Duell, Wochenbericht, Urkunde, Advent, Stella, Vorlesen.
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const URL = process.argv[2], OUT = process.argv[3];
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DEV = {
  iphone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  ipad: { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
// Nachgebauter Server: gleiche Regeln wie die SQL-Funktionen
const SRV = {}; const norm = c => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
async function mock(page){
  await page.route("**/rest/v1/rpc/*", async route => {
    const fn = route.request().url().split("/").pop(), a = JSON.parse(route.request().postData() || "{}"), code = norm(a.p_code);
    const fam = SRV[code], reply = (j, s = 200) => route.fulfill({ status: s, contentType: "application/json", body: JSON.stringify(j) });
    if (fn === "rechenstern_create"){ SRV[code] = { version: 0, state: null, hist: [] }; return reply(true); }
    if (!fam) return reply({ message: "not_found" }, 400);
    if (fn === "rechenstern_pull") return reply({ version: fam.version, state: fam.state });
    if (fn === "rechenstern_push"){
      if (a.p_base !== fam.version) return reply({ ok: false, version: fam.version, state: fam.state });
      fam.version++; fam.state = a.p_state; fam.hist.push({ version: fam.version, state: a.p_state, saved_at: new Date().toISOString(), device: a.p_device });
      return reply({ ok: true, version: fam.version });
    }
    if (fn === "rechenstern_versions") return reply(fam.hist.slice().reverse().map(h => ({ version: h.version, saved_at: h.saved_at, device: h.device, stars: h.state.stars })));
    if (fn === "rechenstern_version_get") return reply(fam.hist.find(h => h.version === a.p_version)?.state ?? null);
    return reply({ message: "unknown" }, 404);
  });
}
async function answer(page, right){
  const q = await page.evaluate(() => { const s = [...document.querySelectorAll(".q > span")].map(x => x.textContent); return { x: +s[0], y: +s[2] }; });
  const v = right ? q.x * q.y : q.x * q.y + 1;
  for (const d of String(v)) await page.click(`.key[data-k="${d}"]`);
  await page.click(".key.ok");
}
async function round(page, a){
  await page.evaluate(() => show("home")); await page.click(`.tile[data-a="${a}"]`);
  for (let i = 0; i < 10; i++){ await answer(page, true); await sleep(800); }
}
async function parents(page, pin = "1234"){
  await page.evaluate(() => show("eltern")); await sleep(100);
  if (await page.$("#pchk")){
    const c = await page.evaluate(() => EL.check.a * EL.check.b);
    await page.fill("#pchk", String(c)); await page.fill("#pin1", pin); await page.fill("#pin2", pin); await page.click("#pin-form button[type=submit]");
  } else { await page.fill("#pin1", pin); await page.click("#pin-form button[type=submit]"); }
  await sleep(250);
}
const over = async (page, tag) => { const r = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(r[0] <= r[1], `${tag}: seitlich ${r[0]}>${r[1]}`); };
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/google/chrome/chrome" });
  // ---------- Sync zwischen zwei Geräten ----------
  {
    const ctxA = await b.newContext(DEV.ipad), A = await ctxA.newPage(); await mock(A);
    const ctxB = await b.newContext(DEV.iphone), B = await ctxB.newPage(); await mock(B);
    const errs = []; for (const p of [A, B]){ p.on("pageerror", e => errs.push(String(e))); }
    await A.goto(URL); await B.goto(URL); await sleep(400);
    await A.evaluate(() => { S.name = "Ben"; S.skipName = true; save(); });
    await round(A, 2); const starsA = await A.evaluate(() => S.stars);
    await parents(A); await A.click('[data-act="syNew"]'); await sleep(800);
    const code = await A.evaluate(() => SY && SY.code); ok(!!code && code.length === 29, "Sync: Code angelegt " + code);
    ok(await A.evaluate(() => SY.version >= 1), "Sync: erster Stand hochgeladen");
    await A.screenshot({ path: `${OUT}/x1-sync-ipad.png`, fullPage: true }); await over(A, "sync ipad");
    await B.evaluate(() => { S.skipName = true; save(); });
    await round(B, 5); const starsB = await B.evaluate(() => S.stars);
    await parents(B, "5555"); await B.fill("#sy-code", "falsch-12345"); await B.click("#sy-join button[type=submit]"); await sleep(300);
    ok((await B.textContent("#v-eltern")).includes("passt nicht"), "Sync: falscher Code abgelehnt");
    await B.fill("#sy-code", code.toLowerCase().replace(/-/g, " ")); await B.click("#sy-join button[type=submit]"); await sleep(900);
    const mB = await B.evaluate(() => ({ stars: S.stars, f2: !!S.facts["2x3"], f5: !!S.facts["5x3"], name: S.name, rounds: S.rounds }));
    ok(mB.stars === starsA + starsB, `Sync: Sterne zusammengezählt ${mB.stars} = ${starsA} + ${starsB}`);
    ok(mB.f2 && mB.f5, "Sync: Lernstand beider Geräte vereint"); ok(mB.name === "Ben", "Sync: Name übernommen");
    await A.evaluate(() => syncNow(true)); await sleep(800);
    const mA = await A.evaluate(() => ({ stars: S.stars, rounds: S.rounds }));
    ok(mA.stars === mB.stars && mA.rounds === mB.rounds, `Sync: iPad hat denselben Stand ${mA.stars}/${mB.stars}`);
    // gleichzeitige Änderungen auf beiden Geräten
    await A.evaluate(() => { S.stars += 7; saveLocal(); }); await B.evaluate(() => { S.stars += 5; saveLocal(); });
    await A.evaluate(() => syncNow(true)); await sleep(500); await B.evaluate(() => syncNow(true)); await sleep(500); await A.evaluate(() => syncNow(true)); await sleep(500);
    const s1 = await A.evaluate(() => S.stars), s2 = await B.evaluate(() => S.stars);
    ok(s1 === mB.stars + 12 && s2 === s1, `Sync: gleichzeitige Änderungen beide erhalten ${s1}/${s2}/${mB.stars + 12}`);
    // Verlauf und Zurückholen
    await A.evaluate(() => show("eltern")); await A.click('[data-act="syHist"]'); await sleep(300);
    ok((await A.$$(".hist [data-act='syRestore']")).length >= 2, "Sync: Verlauf sichtbar");
    ok(await A.evaluate(() => (JSON.parse(localStorage.getItem("rechenstern-backups") || "[]")).length) >= 1 || await B.evaluate(() => (JSON.parse(localStorage.getItem("rechenstern-backups") || "[]")).length) >= 1, "Sync: lokale Sicherung angelegt");
    ok(errs.length === 0, "Sync: Fehler " + errs.join(" | "));
    await ctxA.close(); await ctxB.close();
  }
  // ---------- Geräte und Themen: Stella, Duell, Bericht, Urkunde, Advent ----------
  for (const [name, d] of Object.entries(DEV)) for (const scheme of ["light", "dark"]) {
    const ctx = await b.newContext({ ...d, colorScheme: scheme }), page = await ctx.newPage(); await mock(page);
    const errs = []; page.on("pageerror", e => errs.push(String(e))); page.on("console", m => m.type() === "error" && errs.push(m.text()));
    const tag = `${name}-${scheme}`, shot = n => page.screenshot({ path: `${OUT}/${tag}-${n}.png`, fullPage: true });
    await page.goto(URL); await sleep(300);
    await page.evaluate(() => { S.name = "Ben"; S.skipName = true; S.advPreview = true; save(); render(); });
    ok(await page.isVisible(".surprise .stella-svg"), tag + ": Stella auf der Lernseite");
    await page.click(".surprise .stella-fig"); await sleep(200);
    ok((await page.textContent(".surprise .bubble")).length > 10, tag + ": Stella gibt einen Tipp");
    ok(await page.isVisible(".doors"), tag + ": Adventskalender (Vorschau)");
    await over(page, tag + " lernen"); await shot("x2-lernen");
    // Advent Türchen 1
    await page.click('.door[data-d="1"]'); await page.click('[data-act="advPick"][data-v="20"]'); await sleep(150);
    ok(await page.evaluate(() => advSolved(1)), tag + ": Türchen 1 gelöst"); if (scheme === "light") await shot("x3-advent");
    await page.click('[data-act="actClose"]');
    // Duell
    await page.evaluate(() => show("home")); await page.click('[data-act="duelSetup"]');
    await page.fill("#d-p2", ""); await page.click("#duel-form button[type=submit]");
    ok((await page.textContent("#v-act")).includes("beide Namen"), tag + ": Duell verlangt zweiten Namen");
    await page.fill("#d-p2", "Oma Gisela"); await page.check('input[name="d-seat"][value="opp"]', { force: true }); await page.click("#duel-form button[type=submit]"); await sleep(200);
    await over(page, tag + " duell"); await shot("x4-duell");
    for (let i = 0; i < 10; i++){ const r = await page.evaluate(() => A.pl[0].q.r); await page.locator(`.dchoice[data-duel="0"][data-v="${r}"]`).dispatchEvent("pointerdown"); await sleep(30); }
    const wrong = await page.evaluate(() => A.done ? null : A.pl[1].q.opts.find(v => v !== A.pl[1].q.r));
    ok(await page.isVisible(".dwin"), tag + ": Duell-Sieger angezeigt"); ok((await page.textContent(".dwin")).includes("Ben"), tag + ": Sieger heißt Ben");
    ok(await page.evaluate(() => S.duels.length === 1 && S.duels[0].p2 === "Oma Gisela"), tag + ": Duell gespeichert mit zweitem Namen");
    if (scheme === "dark") await shot("x5-duellsieg");
    await page.click('.dwin [data-act="actClose"]');
    // Wochenbericht
    await round(page, 3);
    await parents(page); ok(await page.isVisible(".wk"), tag + ": Wochenbericht sichtbar");
    ok((await page.textContent(".wk")).includes("10"), tag + ": Bericht zählt Aufgaben");
    ok((await page.textContent("#v-eltern")).includes("Geräte verbinden"), tag + ": Abschnitt Geräte verbinden");
    await over(page, tag + " eltern"); await shot("x6-eltern");
    // Urkunde
    await page.evaluate(() => { for (let b = 1; b <= 10; b++) S.facts["3x" + b] = { c: 3, w: 0, box: 3, t: 1 }; save(); show("sammlung"); });
    await page.click('[data-act="cert"][data-a="3"]'); await sleep(150);
    ok((await page.textContent(".cert")).includes("Ben") && (await page.textContent(".cert")).includes("3er-Reihe"), tag + ": Urkunde mit Name und Reihe");
    await over(page, tag + " urkunde"); await shot("x7-urkunde");
    // Vorlesen-Knöpfe
    await page.evaluate(() => show("home")); await page.click('.tile[data-a="4"]');
    ok(await page.evaluate(() => !canSpeak || !!document.querySelector(".qcard .spk")), tag + ": Vorlese-Knopf bei der Aufgabe");
    ok(errs.length === 0, tag + ": Fehler " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  await b.close();
  console.log(fails.length ? "FEHLER:\n" + fails.join("\n") : "alles bestanden");
})();
