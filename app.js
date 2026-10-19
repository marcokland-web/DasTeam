// Erlaubte Abteilungsfarben (CSS-Tokens). Favicon braucht feste Werte, da es keine CSS-Variablen sieht.
const HUES = new Set(["moss","coral","plum","sky","ochre"]);
const ICON_HUES = {moss:"#7FC09F",coral:"#EE8D74",plum:"#C29AD3",sky:"#82B6DD",ochre:"#E0B455"};
const SVGNS = "http://www.w3.org/2000/svg";
const state = {team:[], depts:[], chronik:[], got:{}, error:false};
const $ = s => document.querySelector(s);

/* ---------- Hilfsfunktionen ---------- */
function h(tag, attrs, ...kids){
  const n = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs||{})){
    if (v==null || v===false) continue;
    if (k==="class") n.className=v;
    else if (k==="hue"){ if (HUES.has(v)) n.style.setProperty("--hue",`var(--${v})`); }
    else if (k.startsWith("on")) n.addEventListener(k.slice(2),v);
    else n.setAttribute(k,v);
  }
  for (const c of kids.flat()){ if (c==null||c===false) continue; n.append(c.nodeType?c:document.createTextNode(String(c))); }
  return n;
}
const str = v => v==null ? "" : String(v);
const arr = v => Array.isArray(v) ? v : [];
const initials = name => str(name).split(/[-\s]+/).filter(Boolean).slice(0,2).map(w=>[...w][0].toUpperCase()).join("") || "?";
const ts = v => { const t = Date.parse(v); return isNaN(t) ? -Infinity : t; };
const fmtDate = iso => {
  if (!iso) return "–";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m){ const [,y,mo,d]=m; const t=new Date(+y,mo-1,+d); return t.getMonth()===mo-1 ? `${d}.${mo}.${y}` : str(iso); }
  const d = new Date(iso);
  return isNaN(d) ? str(iso) : d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",timeZone:"Europe/Berlin"});
};
const byNr = (a,b) => (a.nr==null)-(b.nr==null) || str(a.nr).localeCompare(str(b.nr),"de",{numeric:true,sensitivity:"base"});

/* ---------- Abgeleitetes Modell: einmal pro Datenänderung ---------- */
let model = null;
function derive(){
  const team = state.team, byId = new Map(team.map(a=>[a.id,a]));
  const depts = [...state.depts].sort((a,b)=>(Number(a.reihenfolge)||99)-(Number(b.reihenfolge)||99));
  const deptById = new Map(depts.map(d=>[d.id,d]));
  const kids = new Map(), roots = [];
  for (const a of team){
    const p = a.berichtetAn;
    if (p && p!==a.id && byId.has(p)) (kids.get(p) || kids.set(p,[]).get(p)).push(a);
    else roots.push(a);
  }
  for (const list of kids.values()) list.sort(byNr);
  roots.sort((a,b)=>(b.mensch===true)-(a.mensch===true) || byNr(a,b));
  const active = depts.filter(d=>team.some(a=>a.abteilung===d.id));
  const ringDepts = active.filter(d=>d.id!=="leitung");
  const lessons = team.reduce((n,a)=>n+arr(a.lektionen).filter(Boolean).length,0);
  return {team, byId, depts, deptById, kids, roots, active, ringDepts, lessons};
}
const hueOf = a => { const d = model.deptById.get(a.abteilung); return (d && d.farbe) || a.farbe || ""; };

/* ---------- Logo „Runde“: ein Punkt je Abteilung, Leitung in der Mitte ---------- */
function ringPoints(n){
  const R = 20, r = n<=6 ? 5.5 : Math.max(2.5, R*Math.sin(Math.PI/n)-1.2);
  return Array.from({length:n},(_,i)=>{ const a = -Math.PI/2 + i*2*Math.PI/n; return {x:+(32+R*Math.cos(a)).toFixed(2), y:+(32+R*Math.sin(a)).toFixed(2), r}; });
}
function logoEl(depts){
  const svg = document.createElementNS(SVGNS,"svg");
  svg.setAttribute("viewBox","0 0 64 64");
  const c = (attrs, prop, val) => { const e = document.createElementNS(SVGNS,"circle"); for (const k in attrs) e.setAttribute(k,attrs[k]); e.style.setProperty(prop,val); svg.append(e); };
  c({cx:32,cy:32,r:20,fill:"none","stroke-width":1.5},"stroke","var(--line)");
  c({cx:32,cy:32,r:8},"fill","var(--fg)");
  ringPoints(depts.length).forEach((p,i)=>{ const k = depts[i].farbe; c({cx:p.x,cy:p.y,r:p.r},"fill",`var(--${HUES.has(k)?k:"accent"})`); });
  return svg;
}
function faviconHref(depts){
  const dots = ringPoints(depts.length).map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="${(p.r+0.5).toFixed(2)}" fill="${ICON_HUES[depts[i].farbe]||"#86C4AC"}"/>`).join("");
  const svg = `<svg xmlns="${SVGNS}" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1C2420"/><circle cx="32" cy="32" r="8.5" fill="#F2F4F0"/>${dots}</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
let logoKey = null;
function renderBrand(){
  const key = model.ringDepts.map(d=>d.id+":"+d.farbe).join("|");
  if (key===logoKey) return; logoKey = key;
  $("#logo").replaceChildren(logoEl(model.ringDepts));
  $("#favicon").href = faviconHref(model.ringDepts);
}

/* ---------- Organigramm ---------- */
function card(a, big){
  const human = a.mensch===true, n = arr(a.lektionen).filter(Boolean).length;
  return h("button",{class:"card"+(big?" big":"")+(human?" human":""),hue:hueOf(a),type:"button","data-fid":a.id,onclick:()=>openSb(a.id),"aria-label":`Steckbrief von ${str(a.name)||"Ohne Namen"} öffnen`},
    h("span",{class:"mono-badge","aria-hidden":"true"}, initials(a.name)),
    h("span",{class:"who"}, h("strong",{},str(a.name)||"Ohne Namen"), h("span",{class:"role"},str(a.rolle))),
    h("span",{class:"meta"}, h("span",{},str(a.nr)), h("span",{}, human ? "Mensch" : `Version ${str(a.version)||"1.0"} · ${n} ${n===1?"Lektion":"Lektionen"}`))
  );
}
function deptColumn(d, members){
  return h("div",{class:"branch dept",hue:d.farbe},
    h("div",{class:"dept-tab"}, h("h3",{},str(d.name)||"Abteilung"), d.beschreibung?h("p",{},str(d.beschreibung)):null),
    members.map(a=>card(a,false)));
}
function nodeEl(a, seen){
  seen.add(a.id);
  const ks = (model.kids.get(a.id)||[]).filter(k=>!seen.has(k.id));
  const leads = ks.filter(k=>(model.kids.get(k.id)||[]).length);
  const leaves = ks.filter(k=>!leads.includes(k));
  const items = [];
  for (const d of model.depts){ const m = leaves.filter(k=>k.abteilung===d.id); if (m.length){ m.forEach(k=>seen.add(k.id)); items.push(deptColumn(d,m)); } }
  const loose = leaves.filter(k=>!seen.has(k.id));
  if (loose.length){ loose.forEach(k=>seen.add(k.id)); items.push(deptColumn({name:"Ohne Abteilung",beschreibung:"Noch keiner Abteilung zugeordnet"},loose)); }
  const sub = leads.map(l=>nodeEl(l,seen));
  const level = h("div",{class:"level"}, h("div",{class:"node"+(sub.length||items.length?" has-kids":"")}, card(a,true)));
  if (sub.length===1 && !items.length) level.append(sub[0]);
  else if (sub.length || items.length) level.append(h("div",{class:"branches"}, sub.map(s=>h("div",{class:"branch"},s)), items));
  return level;
}
function renderChart(){
  const chart = $("#chart");
  const fid = document.activeElement?.dataset?.fid;
  chart.replaceChildren();
  if (!model.team.length){
    chart.append(h("div",{class:"notice"},h("strong",{},"Noch keine Teammitglieder"),h("span",{},"Sobald HR-Heidi das erste Teammitglied einstellt, erscheint es hier.")));
    return;
  }
  const seen = new Set(), tree = h("div",{class:"tree"});
  for (const r of model.roots) tree.append(nodeEl(r, seen));
  const unclear = model.team.filter(a=>!seen.has(a.id)).sort(byNr);
  if (unclear.length) tree.append(h("div",{class:"branches unclear"}, deptColumn({name:"Berichtslinie unklar",beschreibung:"Bitte „berichtet an“ prüfen"},unclear)));
  chart.append(tree);
  fitChart();
  if (fid) chart.querySelector(`[data-fid="${CSS.escape(fid)}"]`)?.focus({preventScroll:true});
}
function fitChart(){
  const chart = $("#chart"), tree = chart.querySelector(".tree");
  if (!tree) return;
  chart.classList.remove("vertical");
  if (tree.scrollWidth > chart.clientWidth + 1) chart.classList.add("vertical");
}
new ResizeObserver(()=>fitChart()).observe($("#chart"));

function renderFacts(){
  $("#f-team").textContent = model.team.length;
  $("#f-depts").textContent = model.active.length;
  $("#f-lessons").textContent = model.lessons;
  const last = state.chronik.find(e=>ts(e.datum)>-Infinity);
  $("#f-last").textContent = last ? fmtDate(last.datum) : "–";
}

function renderChronik(){
  const ol = $("#chronik"); ol.replaceChildren();
  if (!state.chronik.length){ ol.append(h("li",{},h("span"),h("span",{class:"hint"},"Noch keine Einträge."))); return; }
  for (const e of state.chronik){
    const a = model ? model.byId.get(e.agent) : null;
    ol.append(h("li",{},
      h("time",{datetime:str(e.datum)}, fmtDate(e.datum)),
      h("div",{class:"entry"},
        h("span",{class:"pill",hue:a?hueOf(a):""}, str(e.typ)||"Notiz"),
        h("span",{}, a ? h("button",{class:"linkish",type:"button",onclick:()=>openSb(a.id)},str(a.name)) : null, a?" ":"", str(e.text))
      )));
  }
}

/* ---------- Steckbrief ---------- */
function fillSb(id){
  const dlg = $("#sb"), a = model && model.byId.get(id);
  if (!a){ if (dlg.open) dlg.close(); return; }
  const hadCloseFocus = document.activeElement?.classList?.contains("close");
  dlg.dataset.id = id;
  const human = a.mensch===true, d = model.deptById.get(a.abteilung), boss = model.byId.get(a.berichtetAn);
  const lessons = arr(a.lektionen).filter(l=>l!=null);
  const skills = arr(a.faehigkeiten).filter(Boolean);
  dlg.replaceChildren(h("article",{class:"sb",hue:hueOf(a)},
    h("div",{class:"sb-head"},
      h("span",{class:"mono-badge","aria-hidden":"true"}, initials(a.name)),
      h("div",{}, h("h3",{id:"sb-name"},str(a.name)||"Ohne Namen"), h("p",{},str(a.rolle))),
      h("button",{class:"close",type:"button","aria-label":"Steckbrief schließen",onclick:()=>dlg.close()},"×")),
    h("div",{class:"sb-strip"},
      a.nr ? h("span",{},"Nr. ",h("b",{},str(a.nr))) : null,
      h("span",{},"Abteilung ",h("b",{},d?str(d.name):"–")),
      boss ? h("span",{},"Berichtet an ",h("b",{},str(boss.name))) : (a.berichtetAn ? h("span",{},"Berichtet an ",h("b",{},"unbekannt")) : h("span",{},h("b",{},"Oberste Leitung"))),
      h("span",{},"Seit ",h("b",{},fmtDate(a.seit))),
      human ? null : h("span",{},"Version ",h("b",{},str(a.version)||"1.0"))),
    h("div",{class:"sb-body"},
      a.motto ? h("p",{class:"motto"},"„"+str(a.motto)+"“") : null,
      a.persoenlichkeit ? h("div",{},h("h4",{},"Persönlichkeit"),h("p",{},str(a.persoenlichkeit))) : null,
      arr(a.aufgaben).length ? h("div",{},h("h4",{},human?"Aufgaben":"Übernimmt für dich"),h("ul",{},arr(a.aufgaben).map(t=>h("li",{},str(t))))) : null,
      skills.length ? h("div",{},h("h4",{},"Fähigkeiten"),h("div",{class:"skills"},skills.map(s=>{
        const lv = Math.max(0,Math.min(5,Number(s.stufe)||0));
        return h("div",{class:"skill"},h("span",{},str(s.name)),h("span",{class:"dots",role:"img","aria-label":`Stufe ${lv} von 5`},[1,2,3,4,5].map(i=>h("i",{class:i<=lv?"on":""}))));
      }))) : null,
      human ? null : h("div",{},h("h4",{},`Lektionen (${lessons.length})`),
        lessons.length ? h("ul",{},lessons.map(l=>h("li",{}, typeof l==="object" ? `${str(l.text)}${l.datum?" ("+fmtDate(l.datum)+")":""}` : str(l))))
                       : h("p",{class:"lessons-empty"},"Noch keine Lektionen. Sobald du Feedback gibst, steht hier, was daraus gelernt wurde.")),
      a.datei ? h("div",{},h("h4",{},"Bauplan"),h("div",{class:"file"},str(a.datei))) : null
    )));
  if (hadCloseFocus) dlg.querySelector(".close")?.focus();
}
function openSb(id){ fillSb(id); const dlg=$("#sb"); if(!dlg.open){ try{dlg.showModal()}catch(e){dlg.setAttribute("open","")} dlg.querySelector(".close")?.focus(); } }
$("#sb").addEventListener("click",e=>{ if(e.target===e.currentTarget) e.currentTarget.close(); });

/* ---------- Rendern: gesammelt, einmal pro Bild ---------- */
const dirty = new Set(); let queued = 0;
function invalidate(...parts){ parts.forEach(p=>dirty.add(p)); if(!queued) queued = requestAnimationFrame(flush); }
function flush(){
  queued = 0;
  try{
    model = derive();
    renderChronik();
    if (state.got.team && state.got.depts){
      if (dirty.has("org")){ renderFacts(); renderChart(); renderBrand(); }
      else renderFacts();
      const dlg = $("#sb"); if (dlg.open && dirty.has("org")) fillSb(dlg.dataset.id);
    }
  } catch(e){ console.error(e); showBanner("Ein Eintrag in der Personalakte ist fehlerhaft. Marco kann ihn prüfen."); }
  dirty.clear();
}
function showBanner(msg){ const b=$("#banner"); b.textContent=msg; b.hidden=false; }
function fail(msg){
  $("#chart").replaceChildren(h("div",{class:"notice"},h("strong",{},"Das Team lässt sich gerade nicht anzeigen"),h("span",{},msg)));
}
function setData(part, docs){
  if (part==="chronik") docs = [...docs].sort((a,b)=>ts(b.datum)-ts(a.datum));
  state[part] = docs; state.got[part] = true;
  invalidate(part==="chronik" ? "chronik" : "org");
}

/* ---------- Daten: claude.ai-Datenbank, sonst data/studio.json ---------- */
async function connect(){
  let db = null;
  try { db = window.claude?.use ? await window.claude.use("db") : null; } catch(e){ db = null; }
  if (db){
    const onErr = () => showBanner("Die Verbindung ist abgerissen. Lade die Seite bitte neu.");
    for (const [part,coll] of [["depts","abteilungen"],["team","team"],["chronik","chronik"]])
      db.collection(coll).onSnapshot(s=>setData(part, s.docs.map(d=>({id:d.id,...d.data()}))), onErr);
    return;
  }
  let d;
  try {
    const r = await fetch("data/studio.json",{cache:"no-store"});
    if (!r.ok) throw new Error("HTTP "+r.status);
    d = await r.json();
  } catch(e){
    console.warn("data/studio.json nicht ladbar:", e);
    fail("Lade die Seite bitte neu. Klappt es dann immer noch nicht, sag Marco Bescheid.");
    return;
  }
  setData("depts", arr(d.abteilungen)); setData("team", arr(d.team)); setData("chronik", arr(d.chronik));
}
connect().catch(e=>{ console.error(e); fail("Lade die Seite bitte neu. Klappt es dann immer noch nicht, sag Marco Bescheid."); });
