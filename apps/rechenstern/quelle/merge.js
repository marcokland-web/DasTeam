/* ---------- Verlustfreie Zusammenführung zweier Spielstände (Daten-Dieter) ----------
   merge3(base, local, remote): base = Stand beim letzten Abgleich (oder {} beim ersten Koppeln).
   Zähler werden addiert (remote + eigene Änderung seit base), Erfolge vereinigt, Bestwerte maximiert.
   Kein Fortschritt eines Geräts geht verloren. */
function merge3(base, local, remote){
  base = base || {}; local = local || {}; remote = remote || {};
  const isObj = x => x && typeof x === "object" && !Array.isArray(x);
  const num = x => (typeof x === "number" && isFinite(x)) ? x : 0;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const add = (b, l, r) => num(r) + num(l) - num(b);
  const pickChanged = (b, l, r) => (same(l, b) ? (r === undefined ? l : r) : l);
  // Vereinigung von Zeitstempel-Maps: früheste Zeit gewinnt (z. B. Abzeichen „seit“).
  const union = (l, r) => { const o = { ...(isObj(r) ? r : {}) }; for (const [k, v] of Object.entries(isObj(l) ? l : {})) o[k] = o[k] == null ? v : (typeof v === "number" && typeof o[k] === "number" ? Math.min(v, o[k]) : o[k]); return o; };
  const deepUnion = (l, r) => { const o = {}; for (const k of new Set([...Object.keys(isObj(l) ? l : {}), ...Object.keys(isObj(r) ? r : {})])) { const a = l?.[k], b = r?.[k]; o[k] = isObj(a) || isObj(b) ? union(a, b) : (a ?? b); } return o; };
  const out = {}, first = Object.keys(base).length === 0;
  const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  for (const k of keys){
    const b = base[k], l = local[k], r = remote[k];
    switch (k){
      case "stars": out[k] = Math.max(0, add(b, l, r)); break;
      case "xp": case "rounds": case "stories": out[k] = Math.max(0, add(b, l, r)); break;
      case "bestStreak": case "blitzBest": out[k] = Math.max(num(l), num(r)); break;
      case "knobelHad": out[k] = !!(l || r); break;
      case "facts": {
        const o = {};
        for (const f of new Set([...Object.keys(l || {}), ...Object.keys(r || {})])){
          const fb = (b || {})[f] || {}, fl = (l || {})[f] || {}, fr = (r || {})[f] || {};
          const newer = num(fl.t) >= num(fr.t) ? fl : fr;
          o[f] = { c: Math.max(0, add(fb.c, fl.c, fr.c)), w: Math.max(0, add(fb.w, fl.w, fr.w)), box: num(newer.box), t: Math.max(num(fl.t), num(fr.t)) };
        }
        out[k] = o; break;
      }
      case "reihe": {
        const o = {};
        for (const a of new Set([...Object.keys(l || {}), ...Object.keys(r || {})])) o[a] = { best: Math.max(num(l?.[a]?.best), num(r?.[a]?.best)) };
        out[k] = o; break;
      }
      case "badges": case "tricks": case "cases": out[k] = union(l, r); break;
      case "path": case "advent": out[k] = deepUnion(l, r); break;
      case "bonusDay": { const o = { ...(r || {}) }; for (const [x, v] of Object.entries(l || {})) o[x] = !o[x] || v > o[x] ? v : o[x]; out[k] = o; break; }
      case "day": {
        const L = l || {}, Rr = r || {}, B = b || {};
        if (L.date && L.date === Rr.date){
          const bb = B.date === L.date ? B : {};
          out[k] = { date: L.date, count: Math.max(0, add(bb.count, L.count, Rr.count)), goalDone: !!(L.goalDone || Rr.goalDone),
            sg: Math.max(0, add(bb.sg, L.sg, Rr.sg)), du: Math.max(0, add(bb.du, L.du, Rr.du)) };
        } else out[k] = (L.date || "") >= (Rr.date || "") ? L : Rr;
        break;
      }
      case "streak": { const L = l || {}, Rr = r || {}; out[k] = L.last === Rr.last ? { last: L.last, days: Math.max(num(L.days), num(Rr.days)) } : ((L.last || "") > (Rr.last || "") ? L : Rr); break; }
      case "lastActive": out[k] = (l || "") > (r || "") ? l : r; break;
      case "log": {
        const o = {};
        for (const d of new Set([...Object.keys(l || {}), ...Object.keys(r || {})])){
          const db = (b || {})[d] || {}, dl = (l || {})[d] || {}, dr = (r || {})[d] || {}, e = {};
          for (const f of new Set([...Object.keys(dl), ...Object.keys(dr)])) e[f] = Math.max(0, add(db[f], dl[f], dr[f]));
          o[d] = e;
        }
        out[k] = o; break;
      }
      case "redeemed": case "duels": {
        const id = x => x.id || `${x.ts}|${x.name}`;
        const seen = new Map(); for (const x of [...(r || []), ...(l || [])]) if (x && !seen.has(id(x))) seen.set(id(x), x);
        out[k] = [...seen.values()].sort((a, c) => num(a.ts) - num(c.ts)).slice(-200); break;
      }
      case "rewards": {
        const byId = a => new Map((a || []).filter(x => x && x.id).map(x => [x.id, x]));
        const B = byId(b), L = byId(l), Rr = byId(r), o = [];
        for (const [i, x] of Rr){
          const inL = L.get(i), inB = B.get(i);
          if (inB && !inL) continue;                       // lokal gelöscht
          o.push(inL && inB && !same(inL, inB) ? inL : (inL && !inB ? inL : x));
        }
        for (const [i, x] of L) if (!Rr.has(i) && !B.has(i)) o.push(x);   // lokal neu
        out[k] = o; break;
      }
      case "pinFail": out[k] = l; break;               // bleibt pro Gerät
      default: out[k] = first ? (r !== undefined && r !== null && r !== "" ? r : l) : pickChanged(b, l, r);   // erstes Koppeln: Einstellungen der Familie gelten
    }
  }
  return out;
}
if (typeof module !== "undefined") module.exports = { merge3 };
