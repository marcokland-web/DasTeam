"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

/* ---------- Texte (Text-Tina): Deutsch ist Standard, Englisch umschaltbar ---------- */
let LANG = document.documentElement.lang === "en" ? "en" : "de";
const LOC = () => LANG === "en" ? "en-GB" : "de-DE";
const STR = {
  tagline:["Das Einmaleins-Spiel","The times tables game"],
  tabPlay:["Spielen","Play"], tabColl:["Sammlung","Collection"], tabChest:["Schatztruhe","Treasure chest"], navAria:["Bereiche","Sections"],
  starsAria:["{n} Sterne, zur Schatztruhe","{n} stars, open treasure chest"], home:["Rechenstern, zum Start","Rechenstern, go to start"],
  hello:["Hallo, {n}!","Hi, {n}!"], helloNo:["Hallo!","Hi there!"],
  obTitle:["Wie heißt du?","What's your name?"], obSub:["Dann kann ich dich begrüßen. Dein Name bleibt nur auf diesem Gerät.","Then I can greet you. Your name stays on this device only."],
  obPh:["Vorname","First name"], obGo:["Los geht’s","Let’s go"], obSkip:["Später","Later"],
  level:["Level {n}","Level {n}"], xpTo:["Noch {n} richtige Aufgaben bis Level {l}","{n} more correct answers to reach level {l}"],
  goal:["Tagesziel","Daily goal"], goalTxt:["{d} von {g} richtigen Aufgaben","{d} of {g} correct answers"], goalDone:["Geschafft! Du hast 10 Extra-Sterne bekommen.","Done! You got 10 bonus stars."],
  goalToast:["Tagesziel geschafft! +10 Sterne","Daily goal reached! +10 stars"],
  streak1:["{n} Tag in Folge","{n} day in a row"], streakN:["{n} Tage in Folge","{n} days in a row"], streak0:["Spiel heute, dann startet deine Serie.","Play today to start your streak."],
  streakSub:["Jeden Tag ein bisschen üben","Practise a little every day"],
  cont:["Weiter mit der {n}er-Reihe","Continue with the {n} times table"], contMix:["Mix-Runde spielen","Play a mix round"],
  reihen:["Die Reihen","Times tables"], reihe:["{n}er-Reihe","{n} times table"], mastered:["gemeistert","mastered"],
  reiheAria:["{n}er-Reihe, {s} von 3 Sternen","{n} times table, {s} of 3 stars"],
  legend:["1 Stern: 7 richtig · 2 Sterne: alle 10 richtig · 3 Sterne: jede Aufgabe 3-mal hintereinander richtig.","1 star: 7 correct · 2 stars: all 10 correct · 3 stars: every problem right 3 times in a row."],
  more:["Noch mehr Spiele","More games"],
  mix:["Mix","Mix"], mixSub:["Alle Reihen gemischt","All tables mixed up"],
  blitz:["Blitzrunde","Lightning round"], blitzSub:["60 Sekunden, so viele du schaffst","60 seconds, as many as you can"], blitzRec:["Dein Rekord: {n}","Your record: {n}"],
  knobel:["Knobel-Kiste","Tricky box"], knobelSub:["{n} Aufgaben zum Wiederholen","{n} problems to practise again"], knobelSub1:["1 Aufgabe zum Wiederholen","1 problem to practise again"], knobelEmpty:["Leer. Stark!","Empty. Great work!"],
  close:["Runde beenden","End round"], del:["Löschen","Delete"], ok:["OK","OK"], next:["Weiter","Next"],
  qlabel:["Wie viel ist das?","What is it?"], tipBtn:["Tipp","Hint"], tipTxt:["Zähl in {a}er-Schritten:","Count in steps of {a}:"], tipOne:["Mal 1 bleibt die Zahl gleich.","Times 1 keeps the number the same."],
  right:["Richtig!|Super!|Klasse!|Genau!|Stark!|Spitze!","Correct!|Great!|Nice one!|Exactly!|Awesome!|Brilliant!"],
  wrong:["Noch nicht ganz.","Not quite yet."], wrongSub:["{x} × {y} = {r}. Die Aufgabe kommt gleich nochmal.","{x} × {y} = {r}. You’ll get this one again soon."],
  wrongSub2:["{x} × {y} = {r}. Die üben wir in der Knobel-Kiste weiter.","{x} × {y} = {r}. We’ll keep practising it in the tricky box."],
  wrongBlitz:["{x} × {y} = {r}","{x} × {y} = {r}"],
  dots:["{x}-mal {y} Punkte","{x} rows of {y} dots"], inarow:["{n} in Folge","{n} in a row"], kbd:["Tippe die Zahl und drücke Enter.","Type the number and press Enter."],
  progress:["Aufgabe {i} von {n}","Problem {i} of {n}"], timeLeft:["Noch {n} Sekunden","{n} seconds left"],
  rPerfect:["Volltreffer!","Perfect!"], rGood:["Super gemacht!","Well done!"], rOk:["Gut geübt!","Good practice!"],
  rSub:["{c} von {t} richtig","{c} of {t} correct"], rBlitz:["{n} Aufgaben in 60 Sekunden","{n} problems in 60 seconds"],
  rRecord:["Neuer Rekord!","New record!"], rKnobel:["Noch {n} in der Knobel-Kiste","{n} left in the tricky box"], rKnobel0:["Die Knobel-Kiste ist leer!","The tricky box is empty!"],
  earned:["+{n} Sterne","+{n} stars"], earned1:["+1 Stern","+1 star"], bonus:["inklusive {n} Bonus-Sterne für eine perfekte Runde","including {n} bonus stars for a perfect round"],
  lvlUp:["Level {n} erreicht: {t}","Level {n} reached: {t}"], newBadge:["Neues Abzeichen","New badge"],
  again:["Nochmal","Play again"], toHome:["Zur Übersicht","Back to overview"], nextReihe:["Weiter zur {n}er-Reihe","On to the {n} times table"],
  starHint1:["Für den nächsten Stern: alle 10 richtig.","For the next star: get all 10 right."], starHint0:["Für den ersten Stern: 7 richtig.","For the first star: get 7 right."],
  starHint2:["Für den dritten Stern: jede Aufgabe 3-mal hintereinander richtig.","For the third star: get every problem right 3 times in a row."],
  starHint3:["Diese Reihe hast du gemeistert!","You’ve mastered this table!"],
  board:["Deine Einmaleins-Tafel","Your times table board"], boardSub:["{n} von 100 Aufgaben sitzen sicher","{n} of 100 problems are solid"],
  kNew:["neu","new"], kPract:["geübt","practised"], kSolid:["sicher","solid"],
  badges:["Abzeichen","Badges"], badgesSub:["{n} von {t} gesammelt","{n} of {t} collected"], yourLevel:["Dein Level","Your level"],
  balance:["Deine Sterne","Your stars"], balanceSub:["Für jede richtige Aufgabe gibt es einen Stern. Tausche sie gegen Belohnungen.","You get a star for every correct answer. Trade them for rewards."],
  redeem:["Einlösen","Redeem"], need:["Noch {n} Sterne","{n} more stars"], need1:["Noch 1 Stern","1 more star"], canRedeem:["Du hast genug Sterne!","You have enough stars!"],
  cfTitle:["Zeig das Mama oder Papa","Show this to Mum or Dad"], cfSub:["Sie bestätigen mit der Eltern-PIN.","They confirm with the parent PIN."],
  pin:["Eltern-PIN","Parent PIN"], confirm:["Bestätigen","Confirm"], cancel:["Abbrechen","Cancel"],
  pinWrong:["Die PIN stimmt nicht. Versucht es nochmal.","That PIN isn’t right. Please try again."],
  noPin:["Bitte Mama oder Papa, die Schatztruhe einzurichten. Dann kannst du hier einlösen.","Ask Mum or Dad to set up the treasure chest. Then you can redeem here."],
  pinLocked:["Zu viele Versuche. Bitte warte {n} Sekunden.","Too many tries. Please wait {n} seconds."],
  pCheck:["Eltern-Aufgabe: Wie viel ist {a} × {b}?","Parent check: what is {a} × {b}?"], pCheckWrong:["Das Ergebnis stimmt nicht. Hier ist eine neue Aufgabe.","That’s not right. Here is a new one."],
  pinChange:["Neue PIN festlegen. Die alte gilt, bis du speicherst.","Choose a new PIN. The old one stays until you save."],
  quitQ:["Runde beenden? Deine Sterne bleiben.","End this round? You keep your stars."], quitYes:["Beenden","End round"], quitNo:["Weiterspielen","Keep playing"],
  solidNote:["Diese Reihe kannst du schon! Neue Sterne gibt es in den anderen Reihen, im Mix und in der Blitzrunde.","You know this table already! New stars come from the other tables, the mix and the lightning round."],
  redeemed:["Eingelöst: {r}. Viel Spaß!","Redeemed: {r}. Have fun!"], hist:["Schon eingelöst","Already redeemed"], histNone:["Noch nichts eingelöst.","Nothing redeemed yet."],
  noRewards:["Noch keine Belohnungen. Mama oder Papa können welche im Eltern-Bereich anlegen.","No rewards yet. Mum or Dad can add some in the parents’ area."],
  rw_r1:["Lieblingsessen aussuchen","Pick your favourite dinner"], rw_r2:["Spieleabend mit Papa","Game night with Dad"], rw_r3:["Ausflug nach Wahl","A trip of your choice"],
  pTitle:["Eltern-Bereich","Parents’ area"], pEnter:["Gib die Eltern-PIN ein.","Enter the parent PIN."], open:["Öffnen","Open"],
  pSet:["Lege eine vierstellige PIN fest. Damit öffnest du diesen Bereich und bestätigst Belohnungen.","Choose a four-digit PIN. You’ll use it to open this area and to confirm rewards."],
  pinNew:["Neue PIN","New PIN"], pinAgain:["PIN wiederholen","Repeat PIN"], pinShort:["Die PIN braucht genau 4 Ziffern.","The PIN needs exactly 4 digits."],
  pinMismatch:["Die beiden PINs sind verschieden.","The two PINs don’t match."], save:["Speichern","Save"], pinSaved:["PIN gespeichert","PIN saved"],
  pChild:["Kind","Child"], pName:["Name","Name"], pGoal:["Tagesziel (richtige Aufgaben pro Tag)","Daily goal (correct answers per day)"],
  pRewards:["Belohnungen","Rewards"], pRewardsSub:["Name und Preis in Sternen. Pro richtiger Aufgabe gibt es einen Stern, für das Tagesziel 10 extra.","Name and price in stars. Each correct answer earns one star, the daily goal 10 extra."],
  rwName:["Belohnung","Reward"], rwCost:["Sterne","Stars"], add:["Belohnung hinzufügen","Add reward"], newReward:["Neue Belohnung","New reward"],
  deleted:["„{r}“ gelöscht","“{r}” deleted"], undo:["Rückgängig","Undo"],
  pStats:["Lernstand","Progress"], thReihe:["Reihe","Table"], thDone:["Gerechnet","Answered"], thAcc:["Richtig","Correct"], thSolid:["Sicher","Solid"],
  pTricky:["Schwierigste Aufgaben","Trickiest problems"], trickyRow:["{n}-mal falsch","wrong {n} times"], noStats:["Noch keine Aufgaben gerechnet.","No problems answered yet."],
  pPrivacy:["Alle Daten bleiben auf diesem Gerät. Nichts wird ins Internet geschickt. Auf einem anderen Gerät beginnt das Spiel von vorn.","All data stays on this device. Nothing is sent over the internet. On another device the game starts fresh."],
  pChangePin:["PIN ändern","Change PIN"], pLock:["Eltern-Bereich schließen","Close parents’ area"],
  pReset:["Fortschritt zurücksetzen","Reset progress"], pResetQ:["Wirklich alles zurücksetzen? Sterne, Abzeichen und Lernstand sind dann weg. Belohnungen und PIN bleiben.","Really reset everything? Stars, badges and progress will be gone. Rewards and PIN stay."],
  pResetYes:["Ja, zurücksetzen","Yes, reset"], pResetDone:["Fortschritt zurückgesetzt","Progress reset"],
  stTitle:["Einstellungen","Settings"], stDone:["Fertig","Done"], stAppearance:["Darstellung","Appearance"], stAuto:["Automatisch","Automatic"],
  stLight:["Hell","Light"], stDark:["Dunkel","Dark"], stAutoHint:["„Automatisch“ folgt der Einstellung deines Geräts.","“Automatic” follows your device’s setting."],
  stLang:["Sprache","Language"], stGame:["Spiel","Game"], soundOn:["Töne an","Sounds on"], soundOff:["Töne aus","Sounds off"],
  parentsOpen:["Eltern-Bereich","Parents’ area"], stParentsHint:["Belohnungen, Tagesziel und Lernstand. Geschützt mit einer Eltern-PIN.","Rewards, daily goal and progress. Protected by a parent PIN."],
  stAbout:["Über","About"], aboutSub:["Das Einmaleins-Spiel · Version 2026.10.20","The times tables game · Version 2026.10.20"], aboutPart:["Teil des Familien-App-Studios","Part of the family app studio"],
  gear:["Einstellungen","Settings"], docTitle:["Rechenstern","Rechenstern"],
};
function t(k, v = {}){
  const e = STR[k]; const s = e ? (LANG === "en" ? e[1] : e[0]) : k;
  return s.replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m);
}
const fmt = n => Number(n).toLocaleString(LOC());
const fmtDate = ts => new Date(ts).toLocaleDateString(LOC(), { day:"numeric", month:"long", year:"numeric" });

/* ---------- Spielstand (Daten-Dieter): nur lokal im Browser ---------- */
const KEY = "rechenstern-v1";
const DEFAULT = () => ({ v:1, name:"", skipName:false, facts:{}, stars:0, xp:0, reihe:{}, badges:{},
  day:{ date:"", count:0, goalDone:false }, streak:{ days:0, last:"" }, bestStreak:0, blitzBest:0, rounds:0,
  goal:20, sound:true, pinH:"", pinFail:{ n:0, until:0 }, bonusDay:{}, knobelHad:false,
  rewards:[{ id:"r1", key:"rw_r1", cost:60 }, { id:"r2", key:"rw_r2", cost:100 }, { id:"r3", key:"rw_r3", cost:300 }], redeemed:[] });
let S = load();
function load(){
  const D = DEFAULT();
  try {
    const raw = localStorage.getItem(KEY); if (!raw) return D;
    const d = JSON.parse(raw); if (!d || d.v !== 1) return D;
    const isObj = x => x && typeof x === "object" && !Array.isArray(x);
    for (const k of Object.keys(D)){            // jedes Feld einzeln prüfen (Daten-Dieter)
      const v = d[k], dv = D[k];
      if (Array.isArray(dv)) { if (Array.isArray(v)) D[k] = v; }
      else if (isObj(dv)) { if (isObj(v)) D[k] = Object.assign(dv, v); }
      else if (typeof v === typeof dv) D[k] = v;
    }
    if (typeof d.pinH === "string") D.pinH = d.pinH;
    if (isObj(d.pinFail)) D.pinFail = { n: +d.pinFail.n || 0, until: +d.pinFail.until || 0 };
    if (isObj(d.bonusDay)) D.bonusDay = d.bonusDay;
    D.rewards = D.rewards.filter(r => isObj(r) && r.id && +r.cost > 0);
    D.redeemed = D.redeemed.filter(isObj);
    for (const [k, f] of Object.entries(D.facts)) if (!isObj(f)) delete D.facts[k]; else { f.c = +f.c || 0; f.w = +f.w || 0; f.box = Math.max(0, Math.min(5, +f.box || 0)); }
    return D;
  } catch(e){ return DEFAULT(); }
}
/* Eltern-PIN nur als Prüfsumme speichern, mit Sperre nach Fehlversuchen (Sicherheits-Siggi) */
async function pinHash(pin){
  const txt = "rechenstern:" + pin;
  try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
  catch(e){ let h = 2166136261; for (const ch of txt){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return "f" + (h >>> 0).toString(16); }
}
const hasPin = () => !!S.pinH;
const lockLeft = () => Math.max(0, Math.ceil(((S.pinFail?.until || 0) - Date.now()) / 1000));
async function checkPin(pin){
  if (lockLeft()) return "locked";
  if (await pinHash(pin) === S.pinH){ S.pinFail = { n: 0, until: 0 }; save(); return "ok"; }
  const n = (S.pinFail?.n || 0) + 1;
  S.pinFail = { n, until: n >= 3 ? Date.now() + 30000 * Math.pow(2, Math.min(5, n - 3)) : 0 }; save();
  return n >= 3 ? "locked" : "wrong";
}
const pinErr = r => r === "locked" ? t("pinLocked", { n: lockLeft() }) : t("pinWrong");
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }

const pad2 = n => String(n).padStart(2, "0");
const dayStr = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const today = () => dayStr(new Date());
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };
function touchDay(){
  const d = today();
  if (S.day.date !== d) S.day = { date:d, count:0, goalDone:false };
  if (S.streak.last !== d){ S.streak.days = S.streak.last === yesterday() ? S.streak.days + 1 : 1; S.streak.last = d; }
}
const todayCount = () => S.day.date === today() ? S.day.count : 0;
const todayGoalDone = () => S.day.date === today() && S.day.goalDone;
const streakNow = () => (S.streak.last === today() || S.streak.last === yesterday()) ? S.streak.days : 0;

/* ---------- Lernlogik (Wissens-Wilma) ---------- */
const ORDER = [1, 10, 2, 5, 3, 4, 6, 9, 7, 8];   // erst Kernaufgaben, die schweren Reihen zuletzt
const key = (a, b) => `${a}x${b}`;
const fact = (a, b) => S.facts[key(a, b)] || (S.facts[key(a, b)] = { c:0, w:0, box:0 });
const box = (a, b) => S.facts[key(a, b)]?.box || 0;
const seen = (a, b) => { const f = S.facts[key(a, b)]; return f ? f.c + f.w > 0 : false; };
const mastered = a => { for (let b = 1; b <= 10; b++) if (box(a, b) < 3) return false; return true; };
function reiheStars(a){ if (mastered(a)) return 3; const best = S.reihe[a]?.best || 0; return best >= 10 ? 2 : best >= 7 ? 1 : 0; }
const solidCount = () => { let n = 0; for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) if (box(a, b) >= 3) n++; return n; };
const recoReihe = () => ORDER.find(a => reiheStars(a) < 2) ?? ORDER.find(a => reiheStars(a) < 3) ?? null;
function allFacts(){ const l = []; for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) l.push([a, b]); return l; }
function knobelList(){ return Object.entries(S.facts).filter(([, f]) => f.w > 0 && f.box < 2).map(([k]) => k.split("x").map(Number)); }
function shuffle(l){ const a = l.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pickWeighted(list, n, avoid){
  const pool = list.filter(([a, b]) => !avoid || key(a, b) !== avoid).map(([a, b]) => ({ a, b, w: Math.pow(6 - box(a, b), 2) * (a === 1 || a === 10 ? 0.4 : 1) }));
  const out = [];
  while (out.length < n && pool.length){
    let r = Math.random() * pool.reduce((s, x) => s + x.w, 0);
    let i = 0; while (i < pool.length - 1 && (r -= pool[i].w) > 0) i++;
    out.push([pool[i].a, pool[i].b]); pool.splice(i, 1);
  }
  return out;
}

/* Level und Abzeichen */
const LV = [0, 20, 50, 100, 170, 260, 380, 530, 720, 950];
const lvlOf = xp => xp >= 950 ? 10 + Math.floor((xp - 950) / 300) : LV.filter(x => xp >= x).length;
const lvlStart = l => l <= 10 ? LV[l - 1] : 950 + (l - 10) * 300;
const LVT = [["Zahlen-Entdecker","Number explorer"],["Rechen-Lehrling","Maths apprentice"],["Einmaleins-Kenner","Times table pro"],["Rechen-Ass","Maths ace"],["Einmaleins-Meister","Times table master"],["Rechenstern","Maths star"]];
const lvlTitle = l => LVT[Math.min(5, Math.floor((l - 1) / 2))][LANG === "en" ? 1 : 0];

const G = {
  play:'<path class="gl" d="M24 19.5v17l13-8.5z"/>',
  target:'<circle class="gl" cx="28" cy="28" r="10"/><circle class="gl" cx="28" cy="28" r="4.5"/><circle class="gf" cx="28" cy="28" r="1.6"/>',
  flame:'<path class="gl" d="M28 16c2 5 8 7.5 8 14a8 8 0 0 1-16 0c0-3 1.5-5 3.2-6.6.4 2.6 1.8 4 3.6 4.4-.8-4.3-.3-8.4 1.2-11.8z"/>',
  check:'<circle class="gl" cx="28" cy="28" r="10.5"/><path class="gl" d="M23 28.3l3.6 3.6 6.6-7.2"/>',
  cal:'<rect class="gl" x="18" y="20" width="20" height="17" rx="3"/><path class="gl" d="M18 25.5h20M23 17v5M33 17v5"/>',
  bolt:'<path class="gl" d="M30 15.5l-9 14h7l-2 11 9-14h-7z"/>',
  box:'<path class="gl" d="M18 24h20v13H18zM16.5 19.5h23V24h-23zM28 19.5V37"/>',
  star:'<path class="gl" d="M28 16.5l3.4 7.2 7.8.9-5.8 5.3 1.6 7.7L28 33.7l-7 3.9 1.6-7.7-5.8-5.3 7.8-.9z"/>',
};
const gt = s => `<text x="28" y="33.5" text-anchor="middle">${s}</text>`;
const BADGES = [
  { id:"first", g:G.play, n:["Erste Runde","First round"], h:["Spiel deine erste Runde.","Play your first round."], ok:() => S.rounds >= 1 },
  { id:"perfect", g:G.target, n:["Volltreffer","Bullseye"], h:["Alle 10 Aufgaben einer Runde richtig.","All 10 problems in a round right."], ok:c => c.perfect || S.badges.perfect },
  { id:"s10", g:G.flame, n:["Zehnerkette","Chain of ten"], h:["10 richtige Antworten hintereinander.","10 correct answers in a row."], ok:() => S.bestStreak >= 10 },
  { id:"s25", g:G.flame, n:["Superkette","Super chain"], h:["25 richtige Antworten hintereinander.","25 correct answers in a row."], ok:() => S.bestStreak >= 25 },
  { id:"goal", g:G.check, n:["Tagesziel","Daily goal"], h:["Schaffe dein Tagesziel.","Reach your daily goal."], ok:() => todayGoalDone() },
  { id:"d3", g:G.cal, n:["Drei Tage dabei","Three days in"], h:["An 3 Tagen hintereinander üben.","Practise 3 days in a row."], ok:() => streakNow() >= 3 },
  { id:"d7", g:G.cal, n:["Eine Woche dabei","A whole week"], h:["An 7 Tagen hintereinander üben.","Practise 7 days in a row."], ok:() => streakNow() >= 7 },
  { id:"blitz15", g:G.bolt, n:["Blitzschnell","Quick as lightning"], h:["15 Aufgaben in einer Blitzrunde.","15 problems in one lightning round."], ok:() => S.blitzBest >= 15 },
  { id:"blitz25", g:G.bolt, n:["Donnerwetter","Thunderstruck"], h:["25 Aufgaben in einer Blitzrunde.","25 problems in one lightning round."], ok:() => S.blitzBest >= 25 },
  { id:"knobel", g:G.box, n:["Knobel-Profi","Puzzle pro"], h:["Leere die Knobel-Kiste.","Empty the tricky box."], ok:c => c.mode === "knobel" && knobelList().length === 0 },
  { id:"core", g:gt("1·2·5"), n:["Starke Basis","Strong basics"], h:["Meistere die 1er-, 2er-, 5er- und 10er-Reihe.","Master the 1, 2, 5 and 10 times tables."], ok:() => [1, 2, 5, 10].every(mastered) },
  { id:"hard", g:gt("7·8"), n:["Harte Nüsse","Tough nuts"], h:["Meistere die 7er- und 8er-Reihe.","Master the 7 and 8 times tables."], ok:() => [7, 8].every(mastered) },
  { id:"n100", g:gt("100"), n:["100 Aufgaben","100 problems"], h:["Rechne 100 Aufgaben richtig.","Get 100 problems right."], ok:() => S.xp >= 100 },
  { id:"n500", g:gt("500"), n:["500 Aufgaben","500 problems"], h:["Rechne 500 Aufgaben richtig.","Get 500 problems right."], ok:() => S.xp >= 500 },
  { id:"n1000", g:gt("1000"), n:["1000 Aufgaben","1,000 problems"], h:["Rechne 1000 Aufgaben richtig.","Get 1,000 problems right."], ok:() => S.xp >= 1000 },
  { id:"all", g:G.star, n:["Rechenstern","Maths star"], h:["Meistere alle zehn Reihen.","Master all ten times tables."], ok:() => ORDER.every(mastered) },
];
const L2 = p => p[LANG === "en" ? 1 : 0];
function checkBadges(c = {}){
  const fresh = [];
  for (const b of BADGES) if (!S.badges[b.id] && b.ok(c)){ S.badges[b.id] = Date.now(); fresh.push(b); }
  return fresh;
}
const medal = b => `<svg class="medal" viewBox="0 0 56 56" aria-hidden="true"><circle class="rim" cx="28" cy="28" r="25"/>${b.g}</svg>`;

/* ---------- Grafik-Bausteine ---------- */
function starPath(cx, cy, R, r){
  let d = ""; for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
    d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(2) + " " + (cy + rr * Math.sin(a)).toFixed(2); }
  return d + "Z";
}
const STAR = `<path d="${starPath(12, 12.6, 10, 4.3)}"/>`;
const starSvg = cls => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${STAR}</svg>`;
// Logo „Rechenstern“ (Logo-Luisa): Bordeaux-Fläche, goldener Linienstern mit Mal-Zeichen
function logoSvg(uid){
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="b${uid}" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8C2545"/><stop offset="1" stop-color="#5A1028"/></linearGradient><linearGradient id="g${uid}" x1="0" y1="10" x2="0" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F0D08A"/><stop offset="1" stop-color="#C8963E"/></linearGradient></defs><rect width="64" height="64" rx="14.4" fill="url(#b${uid})"/><path d="${starPath(32, 33.6, 21, 9.2)}" fill="none" stroke="url(#g${uid})" stroke-width="2.6" stroke-linejoin="round"/><path d="M28.4 30.2l7.2 7.2M35.6 30.2l-7.2 7.2" stroke="url(#g${uid})" stroke-width="2.8" stroke-linecap="round"/></svg>`;
}
const ICON = {
  mix:'<path d="M4 7h4l8 10h4M4 17h4l2.5-3.1M13.5 10.1 16 7h4M17 4l3 3-3 3M17 14l3 3-3 3"/>',
  blitz:'<path d="M13 2.5 5.5 13.5h5.5l-1 8 7.5-11h-5.5z"/>',
  knobel:'<path d="M4.5 9h15v10.5h-15zM3 5h18v4H3zM12 5v14.5"/>',
};
const FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c1 3.2 4.6 4.8 4.6 9.4a4.6 4.6 0 0 1-9.2 0c0-1.9.9-3.1 2-4.1.2 1.6 1 2.5 2.1 2.8-.5-2.6-.2-5.4.5-8.1z"/></svg>';

/* ---------- Töne ---------- */
let AC = null;
function tone(seq){
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime;
    for (const [f, d, st] of seq){
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + st); g.gain.exponentialRampToValueAtTime(0.16, t0 + st + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + st + d);
      o.connect(g).connect(AC.destination); o.start(t0 + st); o.stop(t0 + st + d + 0.05);
    }
  } catch(e){}
}
const SND = { right:[[784, .14, 0], [1175, .22, .08]], wrong:[[330, .18, 0], [262, .26, .12]], win:[[523, .14, 0], [659, .14, .12], [784, .14, .24], [1047, .4, .36]] };

/* ---------- Konfetti ---------- */
function burst(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = $("#fx"), ctx = cv.getContext("2d"), dpr = window.devicePixelRatio || 1;
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement), cols = ["--gold", "--accent", "--ok", "--gold"].map(v => cs.getPropertyValue(v).trim());
  const ps = Array.from({ length: 90 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .38, vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 4,
    s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[Math.floor(Math.random() * cols.length)] }));
  const t0 = performance.now();
  (function step(now){
    const k = (now - t0) / 1600; ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (k >= 1) return;
    for (const p of ps){ p.vy += .32; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.globalAlpha = 1 - k; ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .66); ctx.restore(); }
    requestAnimationFrame(step);
  })(t0);
}

/* ---------- Hinweis unten ---------- */
let toastTimer = 0, undoBuf = null;
function toast(msg, withUndo){
  const el = $("#toast");
  el.innerHTML = `<span>${esc(msg)}</span>` + (withUndo ? `<button type="button" data-act="undo">${esc(t("undo"))}</button>` : "");
  el.hidden = false; clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; undoBuf = null; }, withUndo ? 5000 : 2600);
}

/* ---------- Ansichten ---------- */
let V = "home", P = null, R = null, RD = null, EL = { open:false, err:"", reset:false, change:false, check:null }, roundId = 0;
const VIEWS = ["home", "play", "result", "sammlung", "truhe", "eltern"];
function show(v){
  V = v;
  for (const x of VIEWS) $("#v-" + x).hidden = x !== v;
  document.body.classList.toggle("playing", v === "play");
  const tab = v === "result" ? "home" : v;
  $$("#tabbar [data-v], #toptabs [data-v]").forEach(b => { if (b.dataset.v === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
  if (v !== "eltern"){ EL = { open:false, err:"", reset:false, change:false, check:null }; }
  if (v !== "truhe") RD = null;
  render();
  if (v !== "play") window.scrollTo(0, 0);
}
function render(){
  $("#hdr-stars").textContent = fmt(S.stars);
  $("#starpill").setAttribute("aria-label", t("starsAria", { n: fmt(S.stars) }));
  ({ home:renderHome, play:renderPlay, result:renderResult, sammlung:renderColl, truhe:renderChest, eltern:renderParents })[V]();
  $$("[data-w]").forEach(e => e.style.width = e.dataset.w + "%");
  $$("[data-cols]").forEach(e => e.style.setProperty("--cols", e.dataset.cols));
}

function levelBlock(){
  const l = lvlOf(S.xp), a = lvlStart(l), b = lvlStart(l + 1), pct = Math.round((S.xp - a) / (b - a) * 100);
  return `<div><div class="lvl"><span class="pill">${esc(t("level", { n: l }))}</span><b>${esc(lvlTitle(l))}</b></div>
    <div class="bar" role="img" aria-label="${pct} %"><i data-w="${pct}"></i></div>
    <p class="xpcap">${esc(t("xpTo", { n: fmt(b - S.xp), l: l + 1 }))}</p></div>`;
}

function renderHome(){
  const reco = recoReihe(), c = todayCount(), g = S.goal, done = todayGoalDone(), st = streakNow();
  const circ = 2 * Math.PI * 26, off = circ * (1 - Math.min(1, c / g));
  const kn = knobelList().length;
  const ob = !S.name && !S.skipName && S.rounds === 0;
  const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(a => {
    const s = reiheStars(a);
    return `<button type="button" class="tile${s === 3 ? " master" : ""}${a === reco ? " reco" : ""}" data-act="start" data-mode="reihe" data-a="${a}" aria-label="${esc(t("reiheAria", { n: a, s }))}">
      <b class="num"><small>×</small>${a}</b><span class="stars">${[0, 1, 2].map(i => starSvg(i < s ? "on" : "off")).join("")}</span></button>`;
  }).join("");
  $("#v-home").innerHTML = `<div class="home">
    <div class="hero card">
      ${ob ? `<form class="ob" id="ob"><h2 class="hello">${esc(t("obTitle"))}</h2><p class="muted">${esc(t("obSub"))}</p>
        <input id="ob-name" name="ob-name" autocomplete="off" maxlength="24" placeholder="${esc(t("obPh"))}" aria-label="${esc(t("obPh"))}">
        <div class="acts"><button type="submit" class="btn tinted">${esc(t("obGo"))}</button><button type="button" class="btn plain" data-act="skipName">${esc(t("obSkip"))}</button></div></form>`
        : `<h2 class="hello">${esc(S.name ? t("hello", { n: S.name }) : t("helloNo"))}</h2>`}
      ${levelBlock()}
      <div class="today">
        <div class="ring${done ? " done" : ""}" role="img" aria-label="${esc(t("goal") + ": " + t("goalTxt", { d: c, g }))}">
          <svg viewBox="0 0 60 60" aria-hidden="true"><circle class="tr" cx="30" cy="30" r="26"/><circle class="pr" cx="30" cy="30" r="26" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg>
          <span class="num">${Math.min(c, g)}</span></div>
        <div class="tx"><b>${esc(t("goal"))}</b><small>${esc(done ? t("goalDone") : t("goalTxt", { d: Math.min(c, g), g }))}</small></div>
        <div class="flame${st ? "" : " off"}">${FLAME}</div>
        <div class="tx"><b>${esc(st ? t(st === 1 ? "streak1" : "streakN", { n: st }) : t("streakSub"))}</b><small>${esc(st ? t("streakSub") : t("streak0"))}</small></div>
      </div>
      <button type="button" class="btn primary wide" data-act="start" data-mode="${reco ? "reihe" : "mix"}" data-a="${reco ?? ""}">${esc(reco ? t("cont", { n: reco }) : t("contMix"))}</button>
    </div>
    <div class="stack">
      <div><p class="kicker">${esc(t("reihen"))}</p><div class="reihen">${tiles}</div><p class="legend">${esc(t("legend"))}</p></div>
      <div><p class="kicker">${esc(t("more"))}</p><div class="list">
        ${modeRow("mix", ICON.mix, t("mix"), t("mixSub"))}
        ${modeRow("blitz", ICON.blitz, t("blitz"), S.blitzBest ? t("blitzSub") + " · " + t("blitzRec", { n: S.blitzBest }) : t("blitzSub"))}
        ${modeRow("knobel", ICON.knobel, t("knobel"), kn ? t(kn === 1 ? "knobelSub1" : "knobelSub", { n: kn }) : t("knobelEmpty"), !kn)}
      </div></div>
    </div></div>`;
}
const CHEV = '<svg class="chev" viewBox="0 0 10 16" aria-hidden="true"><path d="M2 2l6 6-6 6"/></svg>';
function modeRow(mode, ic, title, sub, disabled){
  return `<button type="button" class="row" data-act="start" data-mode="${mode}"${disabled ? ' aria-disabled="true"' : ""}><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg></span>
    <span class="tx"><b>${esc(title)}</b><small>${esc(sub)}</small></span>${disabled ? "" : CHEV}</button>`;
}

/* ---------- Runde ---------- */
const mk = (a, b) => ({ a, b, swap: Math.random() < 0.35 });
const shown = q => q.swap ? [q.a, q.b] : [q.b, q.a];   // Schreibweise der Schule: 3 × 7 gehört zur 7er-Reihe
function startRound(mode, a){
  let qs = [];
  if (mode === "reihe") qs = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map(b => mk(a, b));
  else if (mode === "mix") qs = pickWeighted(allFacts(), 10).map(([x, y]) => mk(x, y));
  else if (mode === "knobel"){ const l = knobelList(); if (!l.length) return; qs = shuffle(l).slice(0, 10).map(([x, y]) => mk(x, y)); }
  else if (mode === "blitz") qs = pickWeighted(allFacts(), 1).map(([x, y]) => mk(x, y));
  P = { id: ++roundId, mode, a, queue: qs, base: mode === "blitz" ? Infinity : qs.length, idx: 0, score: 0, res: [], streak: 0, maxStreak: 0,
    requeued: new Set(), input: "", phase: "ask", tip: false, earned: 0, lvl0: lvlOf(S.xp), stars0: mode === "reihe" ? reiheStars(a) : 0,
    goalJust: false, blitz: 0, end: 0, timer: 0, fresh: [], quit: false, again: false, solid: mode === "reihe" && mastered(a) };
  if (mode === "blitz"){ P.end = Date.now() + 60000; P.timer = setInterval(tickBlitz, 200); }
  show("play");
}
function tickBlitz(){
  if (!P || P.mode !== "blitz") return;
  const left = Math.max(0, P.end - Date.now()), bar = $("#tbar");
  if (bar) bar.style.width = (left / 600) + "%";
  const lab = $("#tleft"); if (lab) lab.textContent = t("timeLeft", { n: Math.ceil(left / 1000) });
  if (left <= 0 && P.phase === "ask") endRound();
}
function renderPlay(){
  if (!P) return;
  const q = P.queue[P.idx], [x, y] = shown(q), r = q.a * q.b, blitz = P.mode === "blitz";
  const ans = P.phase === "ask" ? (P.input || "?") : P.phase === "right" ? String(r) : (P.input || "?");
  const segs = blitz ? "" : P.queue.map((_, i) => `<i class="${i < P.idx || (i === P.idx && P.phase !== "ask") ? (P.res[i] ? "ok" : "bad") : i === P.idx ? "cur" : ""}"></i>`).join("");
  const tip = P.tip ? (q.b === 1 || q.a === 1 ? `<p class="tip">${esc(t("tipOne"))}</p>`
    : `<p class="tip">${esc(t("tipTxt", { a: y }))} <span class="num">${Array.from({ length: x - 1 }, (_, i) => fmt(y * (i + 1))).join(" · ")} · …</span></p>`) : "";
  let mid = "";
  if (P.phase === "right"){
    const msgs = t("right").split("|");
    mid = `<p class="fb ok">${esc(msgs[(P.idx * 7 + r) % msgs.length])}</p><span class="plus">+1 ${starSvg("")}</span>`;
  } else if (P.phase === "wrong"){
    mid = blitz ? `<p class="fb bad">${esc(t("wrongBlitz", { x, y, r }))}</p>`
      : `<p class="fb bad">${esc(t("wrong"))}</p><p class="fbsub">${esc(t(P.again ? "wrongSub" : "wrongSub2", { x, y, r }))}</p>
         <div class="dots" data-cols="${y}" role="img" aria-label="${esc(t("dots", { x, y }))}">${"<i></i>".repeat(x * y)}</div><p class="dotcap">${esc(t("dots", { x, y }))}</p>`;
  } else if (!blitz){
    mid = P.tip ? tip : `<button type="button" class="tipbtn" data-act="tip">${esc(t("tipBtn"))}</button>`;
  }
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" class="key num" data-act="key" data-k="${n}">${n}</button>`).join("")
    + `<button type="button" class="key del" data-act="del" aria-label="${esc(t("del"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg></button>`
    + `<button type="button" class="key num" data-act="key" data-k="0">0</button>`
    + `<button type="button" class="key ok" data-act="ok">${esc(t("ok"))}</button>`;
  const total = blitz ? "" : t("progress", { i: Math.min(P.idx + 1, P.queue.length), n: P.queue.length });
  $("#v-play").innerHTML = `<div class="play">
    <div class="pbar"><button type="button" class="x" data-act="close" aria-label="${esc(t("close"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      ${blitz ? `<div class="timer" role="img" aria-label="${esc(t("timeLeft", { n: Math.ceil((P.end - Date.now()) / 1000) }))}"><i id="tbar"></i></div><span class="chip num">${P.blitz}</span>`
        : `<div class="segs" role="img" aria-label="${esc(total)}">${segs}</div>`}
      <span class="chip${P.streak >= 3 ? "" : " off"}">${FLAME}${esc(t("inarow", { n: P.streak }))}</span></div>
    ${blitz ? `<p class="sr" id="tleft"></p>` : ""}
    <div class="card qcard">
      <p class="qlabel">${esc(blitz ? t("blitz") : P.mode === "reihe" ? t("reihe", { n: P.a }) : P.mode === "mix" ? t("mix") : t("knobel"))}</p>
      <div class="q" aria-live="polite"><span>${x}</span><span class="op">×</span><span>${y}</span><span class="op">=</span>
        <span class="ans${P.phase === "right" ? " right" : P.phase === "wrong" ? " wrong" : !P.input ? " empty" : ""}" id="ans">${esc(ans)}</span></div>
      ${mid}
    </div>
    ${P.quit ? `<div class="card confirm quitbox" role="alertdialog" aria-label="${esc(t("quitQ"))}"><p><b>${esc(t("quitQ"))}</b></p><div class="ob"><div class="acts"><button type="button" class="btn danger" data-act="close">${esc(t("quitYes"))}</button><button type="button" class="btn tinted" data-act="quitNo">${esc(t("quitNo"))}</button></div></div></div>` : ""}
    ${P.phase === "wrong" && !blitz ? `<button type="button" class="btn primary wide" data-act="next" id="nextbtn">${esc(t("next"))}</button>` : `<div class="pad">${keys}</div>`}
    ${P.goalJust && P.phase !== "ask" ? `<p class="toastline">${esc(t("goalToast"))}</p>` : ""}
    <p class="kbd">${esc(t("kbd"))}</p>
  </div>`;
  if (blitz){ tickBlitz(); if (!P) return; }
  if (P.phase === "wrong" && !blitz) $("#nextbtn")?.focus({ preventScroll: true });
}
function typeKey(k){
  if (!P || P.phase !== "ask" || P.input.length >= 3) return;
  P.input = (P.input === "0" ? "" : P.input) + k;
  const el = $("#ans"); if (el){ el.textContent = P.input; el.classList.remove("empty"); }
}
function delKey(){
  if (!P || P.phase !== "ask") return;
  P.input = P.input.slice(0, -1);
  const el = $("#ans"); if (el){ el.textContent = P.input || "?"; el.classList.toggle("empty", !P.input); }
}
function submit(){
  if (!P) return;
  if (P.phase === "wrong" && P.mode !== "blitz"){ advance(); return; }
  if (P.phase !== "ask" || !P.input) return;
  const q = P.queue[P.idx], r = q.a * q.b, ok = parseInt(P.input, 10) === r;
  record(q, ok);
  const id = P.id, i = P.idx;
  if (ok){ P.phase = "right"; tone(SND.right); renderPlay(); setTimeout(() => { if (P && P.id === id && P.idx === i) advance(); }, 750); }
  else {
    P.phase = "wrong"; tone(SND.wrong);
    P.again = false;
    if (P.mode !== "blitz" && !P.requeued.has(key(q.a, q.b))){ P.requeued.add(key(q.a, q.b)); P.queue.push({ a: q.a, b: q.b, swap: !q.swap, re: true }); P.again = true; }
    renderPlay();
    if (P.mode === "blitz") setTimeout(() => { if (P && P.id === id && P.idx === i) advance(); }, 1300);
  }
}
function record(q, ok){
  touchDay();
  const f = fact(q.a, q.b);
  if (ok){
    f.c++; if (!P.tip) f.box = Math.min(5, f.box + 1);
    P.streak++; P.maxStreak = Math.max(P.maxStreak, P.streak); S.bestStreak = Math.max(S.bestStreak, P.streak);
    S.xp++;
    if (!P.solid){ S.stars++; P.earned++; }        // gemeisterte Reihe: keine Sterne mehr, damit sich Üben der schweren Reihen lohnt
    if (P.idx < P.base) P.score++;
    if (P.mode === "blitz") P.blitz++;
    S.day.count++;                                // Tagesziel zählt nur richtige Antworten
  } else { f.w++; f.box = 0; P.streak = 0; S.knobelHad = true; }
  P.res[P.idx] = ok;
  if (!S.day.goalDone && S.day.count >= S.goal){ S.day.goalDone = true; S.stars += 10; P.earned += 10; P.goalJust = true; }
  P.fresh.push(...checkBadges({}));
  save();
}
function advance(){
  if (!P || V !== "play") return;
  P.idx++; P.input = ""; P.tip = false; P.phase = "ask"; P.goalJust = false;
  if (P.mode === "blitz"){
    if (Date.now() >= P.end){ endRound(); return; }
    const prev = P.queue[P.idx - 1];
    P.queue.push(...pickWeighted(allFacts(), 1, key(prev.a, prev.b)).map(([x, y]) => mk(x, y)));
  } else if (P.idx >= P.queue.length){ endRound(); return; }
  renderPlay();
}
function endRound(){
  if (!P) return;
  clearInterval(P.timer);
  const c = { perfect: false, mode: P.mode };
  S.rounds++;
  let bonus = 0;
  if ((P.mode === "reihe" || P.mode === "mix") && P.score === P.base){
    c.perfect = true;
    const bk = P.mode === "reihe" ? "r" + P.a : "mix";
    if (!P.solid && S.bonusDay[bk] !== today()){ bonus = 5; S.bonusDay[bk] = today(); }   // Bonus einmal pro Reihe und Tag
  }
  if (P.mode === "reihe"){ const x = S.reihe[P.a] || (S.reihe[P.a] = { best: 0 }); x.best = Math.max(x.best, P.score); }
  let rec = false;
  if (P.mode === "blitz" && P.blitz > S.blitzBest){ rec = S.blitzBest > 0; S.blitzBest = P.blitz; }
  S.stars += bonus; P.earned += bonus;
  const fresh = [...P.fresh, ...checkBadges(c)], l1 = lvlOf(S.xp);
  save();
  R = { mode: P.mode, a: P.a, score: P.score, base: P.base, blitz: P.blitz, earned: P.earned, bonus, fresh, lvlUp: l1 > P.lvl0 ? l1 : 0,
    rec, perfect: c.perfect, stars0: P.stars0, solid: P.solid, total: P.res.filter(Boolean).length, asked: P.res.length };
  P = null;
  show("result");
  if (R.perfect || R.lvlUp || R.rec || R.fresh.length){ tone(SND.win); setTimeout(burst, 150); }
}
function renderResult(){
  if (!R){ show("home"); return; }
  let title, sub, stars = "", hint = "";
  if (R.mode === "blitz"){
    title = R.rec ? t("rRecord") : R.blitz >= 10 ? t("rGood") : t("rOk");
    sub = t("rBlitz", { n: R.blitz }) + (S.blitzBest && !R.rec ? " · " + t("blitzRec", { n: S.blitzBest }) : "");
  } else {
    title = R.perfect || (R.mode === "knobel" && R.score === R.base) ? t("rPerfect") : R.score >= Math.ceil(R.base * 0.7) ? t("rGood") : t("rOk");
    sub = t("rSub", { c: R.score, t: R.base });
    if (R.mode === "knobel"){ const k = knobelList().length; sub += " · " + (k ? t("rKnobel", { n: k }) : t("rKnobel0")); }
  }
  if (R.mode === "reihe"){
    const s = reiheStars(R.a);
    stars = `<div class="bigstars" role="img" aria-label="${esc(t("reiheAria", { n: R.a, s }))}">${[0, 1, 2].map(i => `<svg viewBox="0 0 24 24" class="${i < s ? "on" : "off"}" aria-hidden="true">${STAR}</svg>`).join("")}</div>`;
    hint = `<p class="starhint">${esc(t(["starHint0", "starHint1", "starHint2", "starHint3"][s]))}</p>`;
  }
  const nextR = R.mode === "reihe" && reiheStars(R.a) >= 2 ? recoReihe() : null;
  const earned = R.earned === 1 ? t("earned1") : t("earned", { n: R.earned });
  $("#v-result").innerHTML = `<div class="result"><div class="card">
      ${stars}
      <h2>${esc(title)}</h2>
      <p class="muted m0">${esc(sub)}</p>
      <span class="earn num">${starSvg("")}${esc(earned)}</span>
      ${R.bonus ? `<p class="starhint">${esc(t("bonus", { n: R.bonus }))}</p>` : ""}
      ${hint}
      ${R.solid ? `<p class="starhint">${esc(t("solidNote"))}</p>` : ""}
      ${R.lvlUp ? `<p class="lvlup">${esc(t("lvlUp", { n: R.lvlUp, t: lvlTitle(R.lvlUp) }))}</p>` : ""}
      <div class="xpwrap">${levelBlock()}</div>
      ${R.fresh.length ? `<div class="newb"><p class="kicker flush">${esc(t("newBadge"))}</p>${R.fresh.map(b => `<div class="b">${medal(b)}<span><b>${esc(L2(b.n))}</b><br><small class="muted">${esc(L2(b.h))}</small></span></div>`).join("")}</div>` : ""}
    </div>
    <div class="acts">
      ${nextR && nextR !== R.a ? `<button type="button" class="btn primary wide" data-act="start" data-mode="reihe" data-a="${nextR}">${esc(t("nextReihe", { n: nextR }))}</button>
        <button type="button" class="btn tinted wide" data-act="start" data-mode="reihe" data-a="${R.a}">${esc(t("again"))}</button>`
      : `<button type="button" class="btn primary wide" data-act="start" data-mode="${R.mode}" data-a="${R.a ?? ""}"${R.mode === "knobel" && !knobelList().length ? " disabled" : ""}>${esc(t("again"))}</button>`}
      <button type="button" class="btn plain wide" data-act="tab" data-v="home">${esc(t("toHome"))}</button>
    </div></div>`;
}

/* ---------- Sammlung ---------- */
function renderColl(){
  const n = solidCount(), got = BADGES.filter(b => S.badges[b.id]).length;
  let cells = `<span class="h">×</span>` + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(b => `<span class="h">${b}</span>`).join("");
  for (let a = 1; a <= 10; a++){
    cells += `<span class="h">${a}</span>`;
    for (let b = 1; b <= 10; b++){ const x = box(a, b) >= 3 ? "s" : seen(a, b) ? "p" : ""; cells += `<span class="${x}">${a * b}</span>`; }
  }
  $("#v-sammlung").innerHTML = `<div class="coll">
    <div class="stack">
      <div class="card"><p class="kicker flush">${esc(t("yourLevel"))}</p>${levelBlock()}</div>
      <div class="card"><h2 class="h-card">${esc(t("board"))}</h2><p class="muted sub-card">${esc(t("boardSub", { n }))}</p>
        <div class="boardwrap"><div class="board" role="img" aria-label="${esc(t("boardSub", { n }))}">${cells}</div></div>
        <div class="keyrow"><span><i></i>${esc(t("kNew"))}</span><span><i class="p"></i>${esc(t("kPract"))}</span><span><i class="s"></i>${esc(t("kSolid"))}</span></div></div>
    </div>
    <div><p class="kicker">${esc(t("badges"))} · ${esc(t("badgesSub", { n: got, t: BADGES.length }))}</p>
      <div class="badges">${BADGES.map(b => `<div class="badge${S.badges[b.id] ? "" : " locked"}">${medal(b)}<b>${esc(L2(b.n))}</b><small>${esc(S.badges[b.id] ? fmtDate(S.badges[b.id]) : L2(b.h))}</small></div>`).join("")}</div></div>
  </div>`;
}

/* ---------- Schatztruhe ---------- */
const rwName = r => r.name ?? (r.key ? t(r.key) : "");
function renderChest(){
  const rws = S.rewards.map(r => {
    const can = S.stars >= r.cost, pct = Math.min(100, Math.round(S.stars / Math.max(1, r.cost) * 100)), miss = r.cost - S.stars;
    const open = RD && RD.id === r.id;
    return `<div class="card rw">
      <div class="head"><b>${esc(rwName(r))}</b><span class="cost num">${starSvg("")}${fmt(r.cost)}</span></div>
      <div class="bar" role="img" aria-label="${pct} %"><i data-w="${pct}"></i></div>
      ${open ? (hasPin() ? `<form class="confirm" data-rid="${esc(r.id)}" id="cf-form"><p><b>${esc(t("cfTitle"))}</b></p><p class="muted">${esc(t("cfSub"))}</p>
          <input class="pin field-pin" id="cf-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="${esc(t("pin"))}" placeholder="••••">
          ${RD.err ? `<p class="err" role="alert">${esc(RD.err)}</p>` : ""}
          <div class="ob"><div class="acts"><button type="submit" class="btn primary">${esc(t("confirm"))}</button><button type="button" class="btn plain" data-act="rdCancel">${esc(t("cancel"))}</button></div></div></form>`
        : `<div class="confirm"><p>${esc(t("noPin"))}</p><div><button type="button" class="btn plain" data-act="rdCancel">${esc(t("cancel"))}</button></div></div>`)
      : `<div class="foot"><small>${esc(can ? t("canRedeem") : miss === 1 ? t("need1") : t("need", { n: fmt(miss) }))}</small>
          <button type="button" class="btn ${can ? "primary" : "tinted"}" data-act="redeem" data-id="${esc(r.id)}"${can ? "" : " disabled"}>${esc(t("redeem"))}</button></div>`}
    </div>`;
  }).join("");
  const hist = S.redeemed.slice().reverse().slice(0, 12).map(h => `<div class="row"><span class="tx"><b>${esc(h.name)}</b><small>${esc(fmtDate(h.ts))}</small></span><span class="cost num">−${fmt(h.cost)}</span></div>`).join("");
  $("#v-truhe").innerHTML = `<div class="chest">
    <div class="stack">
      <div class="card bal"><p class="kicker m0">${esc(t("balance"))}</p><div class="n num">${starSvg("")}${fmt(S.stars)}</div><p class="muted m0">${esc(t("balanceSub"))}</p></div>
      <div><p class="kicker">${esc(t("hist"))}</p><div class="list hist">${hist || `<div class="row"><span class="tx"><small>${esc(t("histNone"))}</small></span></div>`}</div></div>
    </div>
    <div><p class="kicker">${esc(t("pRewards"))}</p><div class="rewards">${rws || `<div class="card"><p class="muted m0">${esc(t("noRewards"))}</p></div>`}</div></div>
  </div>`;
  if (RD && hasPin()) $("#cf-pin")?.focus({ preventScroll: true });
}

/* ---------- Eltern-Bereich ---------- */
function renderParents(){
  const el = $("#v-eltern");
  const PININ = (id, label) => `<div class="field"><label for="${id}">${esc(label)}</label><input class="pin" id="${id}" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="••••"></div>`;
  if (!EL.open || EL.change){
    const mode = EL.change ? "change" : hasPin() ? "enter" : "set";
    if (mode === "set" && !EL.check) EL.check = { a: 13 + Math.floor(Math.random() * 37), b: 12 + Math.floor(Math.random() * 18) };
    el.innerHTML = `<div class="parents"><h2>${esc(t("pTitle"))}</h2>
      <form class="list" id="pin-form" data-mode="${mode}">
        <div class="field"><p class="m0">${esc(mode === "enter" ? t("pEnter") : mode === "change" ? t("pinChange") : t("pSet"))}</p></div>
        ${mode === "set" ? `<div class="field"><label for="pchk">${esc(t("pCheck", { a: EL.check.a, b: EL.check.b }))}</label><input id="pchk" inputmode="numeric" pattern="[0-9]*" maxlength="5" autocomplete="off" class="num"></div>` : ""}
        ${PININ("pin1", mode === "enter" ? t("pin") : t("pinNew"))}
        ${mode === "enter" ? "" : PININ("pin2", t("pinAgain"))}
        <div class="field">${EL.err ? `<p class="err" role="alert">${esc(EL.err)}</p>` : ""}<div class="ob"><div class="acts"><button type="submit" class="btn primary">${esc(mode === "enter" ? t("open") : t("save"))}</button>${mode === "change" ? `<button type="button" class="btn plain" data-act="changeCancel">${esc(t("cancel"))}</button>` : ""}</div></div></div>
      </form><p class="note">${esc(t("pPrivacy"))}</p></div>`;
    $(mode === "set" ? "#pchk" : "#pin1")?.focus({ preventScroll: true });
    return;
  }
  const rows = ORDER.slice().sort((x, y) => x - y).map(a => {
    let c = 0, w = 0, s = 0; for (let b = 1; b <= 10; b++){ const f = S.facts[key(a, b)]; if (f){ c += f.c; w += f.w; } if (box(a, b) >= 3) s++; }
    return `<tr><td>${esc(t("reihe", { n: a }))}</td><td class="n">${fmt(c + w)}</td><td class="n">${c + w ? Math.round(c / (c + w) * 100) + " %" : "–"}</td><td class="n">${s}/10</td></tr>`;
  }).join("");
  const tricky = Object.entries(S.facts).filter(([, f]) => f.w > 0).sort((x, y) => y[1].w - x[1].w || x[1].c - y[1].c).slice(0, 6)
    .map(([k, f]) => { const [a, b] = k.split("x").map(Number); return `<div class="row"><span class="tx"><b class="num">${b} × ${a} = ${a * b}</b><small>${esc(t("trickyRow", { n: f.w }))}</small></span></div>`; }).join("");
  const anyStats = Object.keys(S.facts).length > 0;
  el.innerHTML = `<div class="parents"><h2>${esc(t("pTitle"))}</h2>
    <div><p class="kicker">${esc(t("pChild"))}</p><div class="list">
      <div class="field"><label for="p-name">${esc(t("pName"))}</label><input id="p-name" maxlength="24" autocomplete="off" value="${esc(S.name)}" placeholder="${esc(t("obPh"))}"></div>
      <div class="field"><span id="p-goal-l" class="muted small">${esc(t("pGoal"))}</span>
        <div class="seg" role="radiogroup" aria-labelledby="p-goal-l">${[10, 20, 30, 50].map(n => `<label><input type="radio" name="p-goal" id="p-goal-${n}" value="${n}"${S.goal === n ? " checked" : ""}><span class="num">${n}</span></label>`).join("")}</div></div>
    </div></div>
    <div><p class="kicker">${esc(t("pRewards"))}</p><div class="list" id="rw-list">
      ${S.rewards.map(r => `<div class="rwedit"><input id="rw-n-${esc(r.id)}" data-rid="${esc(r.id)}" data-f="name" value="${esc(rwName(r))}" maxlength="40" aria-label="${esc(t("rwName"))}">
        <input id="rw-c-${esc(r.id)}" data-rid="${esc(r.id)}" data-f="cost" value="${r.cost}" inputmode="numeric" pattern="[0-9]*" maxlength="4" aria-label="${esc(t("rwCost"))}" class="num">
        <button type="button" class="del" data-act="delReward" data-id="${esc(r.id)}" aria-label="${esc(t("del") + ": " + rwName(r))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></button></div>`).join("")}
      <div class="segw"><button type="button" class="btn plain" data-act="addReward">+ ${esc(t("add"))}</button></div>
    </div><p class="note">${esc(t("pRewardsSub"))}</p></div>
    <div><p class="kicker">${esc(t("pStats"))}</p><div class="list">
      ${anyStats ? `<div class="boardwrap"><table class="stats"><thead><tr><th>${esc(t("thReihe"))}</th><th class="n">${esc(t("thDone"))}</th><th class="n">${esc(t("thAcc"))}</th><th class="n">${esc(t("thSolid"))}</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<div class="field"><p class="muted m0">${esc(t("noStats"))}</p></div>`}
    </div></div>
    ${tricky ? `<div><p class="kicker">${esc(t("pTricky"))}</p><div class="list hist">${tricky}</div></div>` : ""}
    <div class="list">
      <button type="button" class="row" data-act="changePin"><span class="tx"><b>${esc(t("pChangePin"))}</b></span>${CHEV}</button>
      <button type="button" class="row" data-act="lock"><span class="tx"><b>${esc(t("pLock"))}</b></span>${CHEV}</button>
    </div>
    <div class="card stack-s">
      ${EL.reset ? `<p class="m0">${esc(t("pResetQ"))}</p><div class="ob"><div class="acts"><button type="button" class="btn danger" data-act="resetYes">${esc(t("pResetYes"))}</button><button type="button" class="btn plain" data-act="resetNo">${esc(t("cancel"))}</button></div></div>`
        : `<div><button type="button" class="btn plain bad-link" data-act="reset">${esc(t("pReset"))}</button></div>`}
    </div>
    <p class="note">${esc(t("pPrivacy"))}</p></div>`;
}

/* ---------- Bedienung ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b || b.disabled || b.getAttribute("aria-disabled") === "true") return;
  const act = b.dataset.act;
  switch (act){
    case "tab": if (P){ clearInterval(P.timer); P = null; } show(b.dataset.v); break;
    case "start": { const m = b.dataset.mode; startRound(m, m === "reihe" ? Number(b.dataset.a) : null); break; }
    case "key": typeKey(b.dataset.k); break;
    case "del": delKey(); break;
    case "ok": submit(); break;
    case "next": advance(); break;
    case "tip": if (P && P.phase === "ask"){ P.tip = true; renderPlay(); } break;
    case "close": if (P && P.res.length && !P.quit){ P.quit = true; renderPlay(); break; } if (P){ clearInterval(P.timer); P = null; } show("home"); break;
    case "quitNo": if (P){ P.quit = false; renderPlay(); } break;
    case "skipName": S.skipName = true; save(); render(); break;
    case "redeem": RD = { id: b.dataset.id, err: "" }; render(); break;
    case "rdCancel": RD = null; render(); break;
    case "parents": $("#settings").close(); show("eltern"); break;
    case "addReward": { const id = "r" + Date.now().toString(36); S.rewards.push({ id, name: t("newReward"), cost: 50 }); save(); render(); $(`#rw-n-${id}`)?.select(); break; }
    case "delReward": { const i = S.rewards.findIndex(r => r.id === b.dataset.id); if (i < 0) break; const [r] = S.rewards.splice(i, 1); undoBuf = { r, i }; save(); render(); toast(t("deleted", { r: rwName(r) }), true); break; }
    case "undo": if (undoBuf){ S.rewards.splice(Math.min(undoBuf.i, S.rewards.length), 0, undoBuf.r); undoBuf = null; save(); render(); $("#toast").hidden = true; } break;
    case "changePin": EL.change = true; EL.err = ""; render(); break;
    case "changeCancel": EL.change = false; EL.err = ""; render(); break;
    case "lock": show("home"); break;
    case "reset": EL.reset = true; render(); break;
    case "resetNo": EL.reset = false; render(); break;
    case "resetYes": { const keep = { goal: S.goal, sound: S.sound, pinH: S.pinH, pinFail: S.pinFail, rewards: S.rewards, name: S.name, skipName: S.skipName };
      S = Object.assign(DEFAULT(), keep); save(); EL.reset = false; render(); toast(t("pResetDone")); break; }
  }
});
document.addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === "ob"){ const n = $("#ob-name").value.trim(); if (n){ S.name = n; } else S.skipName = true; save(); render(); }
  else if (f.id === "cf-form"){
    const r = S.rewards.find(x => x.id === f.dataset.rid), pin = $("#cf-pin").value.trim();
    if (!r) return;
    const res = await checkPin(pin);
    if (res !== "ok"){ if (RD) RD.err = pinErr(res); render(); return; }
    if (S.stars < r.cost) { RD = null; render(); return; }
    S.stars -= r.cost; S.redeemed.push({ name: rwName(r), cost: r.cost, ts: Date.now() }); save(); RD = null; render();
    tone(SND.win); burst(); toast(t("redeemed", { r: rwName(r) }));
  }
  else if (f.id === "pin-form"){
    const mode = f.dataset.mode, p1 = $("#pin1").value.trim();
    if (mode === "set" && parseInt($("#pchk").value, 10) !== EL.check.a * EL.check.b){ EL.check = null; EL.err = t("pCheckWrong"); render(); return; }
    if (!/^\d{4}$/.test(p1)){ EL.err = t("pinShort"); render(); return; }
    if (mode !== "enter"){
      if (p1 !== $("#pin2").value.trim()){ EL.err = t("pinMismatch"); render(); return; }
      S.pinH = await pinHash(p1); S.pinFail = { n: 0, until: 0 }; save();
      EL = { open: true, err: "", reset: false, change: false, check: null }; render(); toast(t("pinSaved"));
    } else {
      const res = await checkPin(p1);
      if (res !== "ok"){ EL.err = pinErr(res); render(); return; }
      EL = { open: true, err: "", reset: false, change: false, check: null }; render();
    }
  }
});
document.addEventListener("change", e => {
  const el = e.target;
  if (el.id === "p-name"){ S.name = el.value.trim(); save(); }
  else if (el.name === "p-goal"){ S.goal = Number(el.value); save(); }
  else if (el.dataset.rid && el.dataset.f){
    const r = S.rewards.find(x => x.id === el.dataset.rid); if (!r) return;
    if (el.dataset.f === "name"){ const v = el.value.trim(); if (v){ r.name = v; delete r.key; } else el.value = rwName(r); }
    else { const n = parseInt(el.value.replace(/\D/g, ""), 10); r.cost = n > 0 ? Math.min(9999, n) : r.cost; el.value = r.cost; }
    save();
  }
});
document.addEventListener("keydown", e => {
  if (V !== "play" || !P || e.target.closest("input,dialog") || e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^[0-9]$/.test(e.key)){ typeKey(e.key); e.preventDefault(); }
  else if (e.key === "Backspace"){ delKey(); e.preventDefault(); }
  else if (e.key === "Enter"){ if (e.target.closest("button") && P.phase !== "ask") return; submit(); e.preventDefault(); }
  else if (e.key === "Escape"){ if (P.res.length && !P.quit){ P.quit = true; renderPlay(); } else if (P.quit){ P.quit = false; renderPlay(); } else { clearInterval(P.timer); P = null; show("home"); } }
});

/* ---------- Sprache, Darstellung, Einstellungsmenü (Studio-Baustein) ---------- */
function applyLang(){
  document.documentElement.lang = LANG;
  document.title = "Rechenstern";
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $("#open-settings").setAttribute("aria-label", t("gear"));
  $("#brandbtn").setAttribute("aria-label", t("home"));
  $$("#toptabs,#tabbar").forEach(n => n.setAttribute("aria-label", t("navAria")));
  render();
}
function storedTheme(){ try { const v = localStorage.getItem("studio-theme"); return v === "light" || v === "dark" ? v : "auto"; } catch(e){ return "auto"; } }
function applyTheme(v){
  const r = document.documentElement;
  if (v === "auto"){ if (window.__studioHost) r.setAttribute("data-theme", window.__studioHost); else r.removeAttribute("data-theme"); }
  else r.setAttribute("data-theme", v);
  $$('meta[name="theme-color"]').forEach(m => { if (m.dataset.orig == null) m.dataset.orig = m.content; m.content = v === "light" ? "#FAF7F2" : v === "dark" ? "#141012" : m.dataset.orig; });
}
(function(){
  const dlg = $("#settings");
  const sync = () => { $(`#st-theme-${storedTheme()}`).checked = true; $(`#st-lang-${LANG}`).checked = true; $(`#st-sound-${S.sound ? "on" : "off"}`).checked = true; };
  $("#open-settings").addEventListener("click", () => { sync(); try { dlg.showModal(); } catch(e){ dlg.setAttribute("open", ""); } });
  $("#st-done").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  dlg.querySelectorAll('input[name="st-theme"]').forEach(i => i.addEventListener("change", () => {
    try { if (i.value === "auto") localStorage.removeItem("studio-theme"); else localStorage.setItem("studio-theme", i.value); } catch(e){}
    applyTheme(i.value);
  }));
  dlg.querySelectorAll('input[name="st-lang"]').forEach(i => i.addEventListener("change", () => {
    LANG = i.value === "en" ? "en" : "de";
    try { if (LANG === "de") localStorage.removeItem("studio-lang"); else localStorage.setItem("studio-lang", "en"); } catch(e){}
    applyLang();
  }));
  dlg.querySelectorAll('input[name="st-sound"]').forEach(i => i.addEventListener("change", () => { S.sound = i.value === "on"; save(); }));
  $("#mark").innerHTML = logoSvg("h");
  $("#st-icon").innerHTML = logoSvg("a");
  const fav = $("#favicon"); if (fav && fav.getAttribute("href") === "data:,") fav.href = "data:image/svg+xml," + encodeURIComponent(logoSvg("f"));
  applyTheme(storedTheme());
  applyLang();
  show("home");
})();
