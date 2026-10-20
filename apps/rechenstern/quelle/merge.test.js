const { merge3 } = require("./merge.js"); const assert = require("assert");
const base = { stars: 50, xp: 100, facts: { "7x8": { c: 3, w: 1, box: 2, t: 100 } }, badges: { first: 10 }, name: "Ben", goal: 20,
  day: { date: "2026-10-20", count: 5, goalDone: false }, streak: { days: 3, last: "2026-10-20" },
  rewards: [{ id: "r1", key: "rw_r1", cost: 60 }, { id: "r2", key: "rw_r2", cost: 100 }], redeemed: [], path: { 7: { schoko: 5 } }, log: { "2026-10-20": { c: 5, w: 1 } } };
const local = JSON.parse(JSON.stringify(base)), remote = JSON.parse(JSON.stringify(base));
// iPad: 10 richtige, 7x8 einmal richtig (später), Belohnung r2 teurer, Abzeichen neu
local.stars = 60; local.xp = 110; local.facts["7x8"] = { c: 4, w: 1, box: 3, t: 300 }; local.badges.perfect = 300;
local.day.count = 15; local.log["2026-10-20"] = { c: 15, w: 1 }; local.rewards[1].cost = 150; local.path[7].frosch = 310;
// iPhone: 4 richtige, 1 falsch bei 7x8 (früher), Stern eingelöst (−60), neue Belohnung, Name geändert
remote.stars = 50 + 4 - 60; remote.xp = 104; remote.facts["7x8"] = { c: 4, w: 2, box: 0, t: 200 }; remote.facts["6x7"] = { c: 1, w: 0, box: 1, t: 210 };
remote.day.count = 9; remote.log["2026-10-20"] = { c: 9, w: 2 }; remote.redeemed = [{ id: "x1", name: "Lieblingsessen", cost: 60, ts: 250 }];
remote.rewards.push({ id: "r9", name: "Kino", cost: 400 }); remote.name = "Benni";
const m = merge3(base, local, remote);
assert.strictEqual(m.stars, 50 + 10 + 4 - 60, "Sterne: beide Geräte addiert, Einlösung abgezogen");
assert.strictEqual(m.xp, 114);
assert.deepStrictEqual(m.facts["7x8"], { c: 5, w: 2, box: 3, t: 300 }, "Zähler addiert, Box vom neueren Gerät");
assert.ok(m.facts["6x7"]); assert.ok(m.badges.perfect && m.badges.first);
assert.strictEqual(m.day.count, 19); assert.deepStrictEqual(m.log["2026-10-20"], { c: 19, w: 2 });
assert.strictEqual(m.rewards.find(r => r.id === "r2").cost, 150); assert.ok(m.rewards.find(r => r.id === "r9"));
assert.strictEqual(m.redeemed.length, 1); assert.strictEqual(m.name, "Benni");
assert.deepStrictEqual(m.path[7], { schoko: 5, frosch: 310 });
// Erstes Koppeln: base leer -> alles addiert, nichts verloren
const a = { stars: 30, xp: 30, facts: { "2x3": { c: 3, w: 0, box: 3, t: 5 } }, badges: { first: 1 } }, b = { stars: 12, xp: 12, facts: { "2x3": { c: 1, w: 1, box: 0, t: 9 } }, badges: { goal: 2 } };
const j = merge3({}, a, b);
assert.strictEqual(j.stars, 42); assert.strictEqual(j.facts["2x3"].c, 4); assert.deepStrictEqual(Object.keys(j.badges).sort(), ["first", "goal"]);
// Löschen einer Belohnung lokal bleibt gelöscht
const bl = { rewards: [{ id: "r1", cost: 1 }, { id: "r2", cost: 2 }] }, ll = { rewards: [{ id: "r1", cost: 1 }] }, rr = { rewards: [{ id: "r1", cost: 1 }, { id: "r2", cost: 2 }] };
assert.deepStrictEqual(merge3(bl, ll, rr).rewards.map(x => x.id), ["r1"]);
// Idempotent: gleicher Stand bleibt gleich
assert.deepStrictEqual(merge3(base, base, base).stars, 50);
// Neuer Tag auf einem Gerät
const n = merge3(base, { ...base, day: { date: "2026-10-21", count: 3 } }, base);
assert.strictEqual(n.day.date, "2026-10-21");
console.log("merge3: alle Tests bestanden");
