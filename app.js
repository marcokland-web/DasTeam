// Erlaubte Abteilungsfarben (CSS-Tokens).
const HUES = new Set(["moss","coral","plum","sky","ochre"]);
const SVGNS = "http://www.w3.org/2000/svg";
const state = {team:[], depts:[], chronik:[], ideen:[], got:{}, error:false};
const $ = s => document.querySelector(s);

/* ---------- Sprache (Team-Standard 7): Standard Deutsch ---------- */
let LANG = "de";
try { if (localStorage.getItem("studio-lang")==="en") LANG = "en"; } catch(e){}
const T = (de, en) => LANG==="en" ? en : de;
const LOCALE = () => LANG==="en" ? "en-GB" : "de-DE";
// Feste Begriffe aus den Teamdaten (Abteilungen, Arten, Status); eigene Namen werden nie übersetzt.
const DATA_EN = {
  "Leitung":"Management","Planung & Wissen":"Planning & Knowledge","Gestaltung":"Design","Technik & Betrieb":"Engineering & Operations","Qualität & Sicherheit":"Quality & Security",
  "Personal, Standards, Betreuung":"People, standards, support","Was gebaut wird und was man darüber wissen muss":"What gets built and what to know about it",
  "Wie es aussieht und wie es sich liest":"How it looks and reads","Daten, Schnittstellen, Auslieferung":"Data, interfaces, delivery","Was rausgeht, funktioniert und ist sicher":"What ships works and is secure",
  "Neuzugang":"New member","Lektion":"Lesson","Leitung ":"Management","Logo":"Logo","Porträts":"Portraits","Prüfung":"Review","Umgesetzt":"Done","Entscheidung":"Decision","Teamleiter-Runde":"Team leads meeting","Notiz":"Note",
  "Wartet auf Marco":"Waiting for Marco","Wartet auf Genehmigung":"Waiting for approval","Genehmigt":"Approved","Abgelehnt":"Declined","In Umsetzung":"In progress","Neu":"New",
  "Verbesserung":"Improvement","Neues Angebot":"New offering","Zusammenarbeit":"Collaboration","Personal":"Staffing"
};
const D = v => LANG==="en" && DATA_EN[str(v)] ? DATA_EN[str(v)] : str(v);

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
  if (m){ const [,y,mo,d]=m; const t=new Date(+y,mo-1,+d); return t.getMonth()===mo-1 ? (LANG==="en" ? `${d}/${mo}/${y}` : `${d}.${mo}.${y}`) : str(iso); }
  const d = new Date(iso);
  return isNaN(d) ? str(iso) : d.toLocaleDateString(LOCALE(),{day:"2-digit",month:"2-digit",year:"numeric",timeZone:"Europe/Berlin"});
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
// Logo „Runde“ im Familienstil: Bordeaux-Fläche, goldener Ring, Mittelpunkt und ein Punkt je Abteilung.
// Maße aus Logo-Luisas Vorlage (1024er Raster) auf 64 umgerechnet.
function ringPoints(n){
  const R = 12.25, r = n<=4 ? 3.75 : Math.max(1.6, R*Math.sin(Math.PI/n)-0.7);
  return Array.from({length:n},(_,i)=>{ const a = -Math.PI/2 + i*2*Math.PI/n; return {x:+(32+R*Math.cos(a)).toFixed(2), y:+(32+R*Math.sin(a)).toFixed(2), r:+r.toFixed(2)}; });
}
function logoSvg(n, uid){
  const dots = ringPoints(n).map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="url(#g-${uid})"/>`).join("");
  return `<svg xmlns="${SVGNS}" viewBox="0 0 64 64"><defs>`+
    `<linearGradient id="b-${uid}" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8C2545"/><stop offset="1" stop-color="#5A1028"/></linearGradient>`+
    `<linearGradient id="g-${uid}" x1="0" y1="13" x2="0" y2="51" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F0D08A"/><stop offset="1" stop-color="#C8963E"/></linearGradient>`+
    `</defs><rect width="64" height="64" rx="14.4" fill="url(#b-${uid})"/>`+
    `<circle cx="32" cy="32" r="12.25" fill="none" stroke="url(#g-${uid})" stroke-width="1.5"/>`+
    `<circle cx="32" cy="32" r="4.75" fill="url(#g-${uid})"/>${dots}</svg>`;
}
function logoEl(depts){
  const tpl = document.createElement("template");
  tpl.innerHTML = logoSvg(depts.length, "logo");
  return tpl.content.firstChild;
}
function faviconHref(depts){
  return "data:image/svg+xml," + encodeURIComponent(logoSvg(depts.length, "fav"));
}
let logoKey = null;
function renderBrand(){
  const key = model.ringDepts.map(d=>d.id+":"+d.farbe).join("|");
  if (key===logoKey) return; logoKey = key;
  $("#logo").replaceChildren(logoEl(model.ringDepts));
  { const t = document.createElement("template"); t.innerHTML = logoSvg(model.ringDepts.length, "about"); $("#st-icon").replaceChildren(t.content.firstChild); }
  $("#favicon").href = faviconHref(model.ringDepts);
}

/* ---------- Porträt: Bild aus avatars/, sonst Initialen ---------- */
const BILD = /^avatars\/[a-z0-9-]+\.svg$/;
function portrait(a){
  const badge = () => h("span",{class:"mono-badge","aria-hidden":"true"}, initials(a.name));
  if (a.mensch===true || !BILD.test(str(a.bild))) return badge();
  const img = h("img",{class:"avatar",src:a.bild,alt:"",width:"64",height:"64",decoding:"async"});
  img.addEventListener("error",()=>img.replaceWith(badge()),{once:true});
  return img;
}

/* ---------- Organigramm ---------- */
function card(a, big, lead){
  const human = a.mensch===true, n = arr(a.lektionen).filter(Boolean).length;
  return h("button",{class:"card"+(big?" big":"")+(human?" human":"")+(lead?" lead":""),hue:hueOf(a),type:"button","data-fid":a.id,onclick:()=>openSb(a.id),"aria-label":T(`Steckbrief von ${str(a.name)||"Ohne Namen"} öffnen`,`Open profile of ${str(a.name)||"unnamed"}`)},
    portrait(a),
    h("span",{class:"who"}, lead ? h("span",{class:"lead-tag"},T("Teamleitung","Team lead")) : null, h("strong",{},str(a.name)||T("Ohne Namen","Unnamed")), h("span",{class:"role"},str(a.rolle))),
    h("span",{class:"meta"}, h("span",{},str(a.nr)), h("span",{}, human ? T("Mensch","Human") : `Version ${str(a.version)||"1.0"} · ${n} ${n===1?T("Lektion","lesson"):T("Lektionen","lessons")}`))
  );
}
function deptColumn(d, members, lead){
  return h("div",{class:"branch dept",hue:d.farbe},
    h("div",{class:"dept-tab"}, h("h3",{},D(d.name)||T("Abteilung","Department")), d.beschreibung?h("p",{},D(d.beschreibung)):null),
    lead ? card(lead,false,true) : null,
    members.map(a=>card(a,false)));
}
const kidsOf = a => model.kids.get(a.id)||[];
const deptOrder = id => { const i = model.depts.findIndex(d=>d.id===id); return i<0 ? 999 : i; };
function nodeEl(a, seen){
  seen.add(a.id);
  const ks = kidsOf(a).filter(k=>!seen.has(k.id));
  // Stabsstelle: berichtet direkt, führt kein eigenes Team (z. B. HR-Heidi)
  const staff = ks.filter(k=>k.stab===true && !kidsOf(k).length);
  const rest = ks.filter(k=>!staff.includes(k));
  const leads = rest.filter(k=>kidsOf(k).length);
  const leaves = rest.filter(k=>!leads.includes(k));
  const items = [];   // {order, el}
  for (const l of leads){
    const lk = kidsOf(l).filter(k=>!seen.has(k.id));
    const simple = lk.every(k=>!kidsOf(k).length && k.abteilung===l.abteilung) && model.deptById.has(l.abteilung);
    if (simple){
      seen.add(l.id); lk.forEach(k=>seen.add(k.id));
      items.push({order:deptOrder(l.abteilung), el:deptColumn(model.deptById.get(l.abteilung), lk, l)});
    } else items.push({order:deptOrder(l.abteilung), el:h("div",{class:"branch"}, nodeEl(l,seen))});
  }
  for (const d of model.depts){ const m = leaves.filter(k=>k.abteilung===d.id); if (m.length){ m.forEach(k=>seen.add(k.id)); items.push({order:deptOrder(d.id), el:deptColumn(d,m)}); } }
  const loose = leaves.filter(k=>!seen.has(k.id));
  if (loose.length){ loose.forEach(k=>seen.add(k.id)); items.push({order:1000, el:deptColumn({name:T("Ohne Abteilung","No department"),beschreibung:T("Noch keiner Abteilung zugeordnet","Not assigned to a department yet")},loose)}); }
  staff.forEach(s=>seen.add(s.id));
  items.sort((x,y)=>x.order-y.order);
  const level = h("div",{class:"level"}, h("div",{class:"node"+(staff.length||items.length?" has-kids":"")}, card(a,true)));
  if (staff.length) level.append(h("div",{class:"staff"}, staff.map(s=>h("div",{class:"staff-item"}, h("span",{class:"staff-label"},T("Stabsstelle","Staff unit")), card(s,false)))));
  if (items.length===1 && items[0].el.classList.contains("branch") && !items[0].el.classList.contains("dept")) level.append(items[0].el.firstChild);
  else if (items.length) level.append(h("div",{class:"branches"}, items.map(i=>i.el)));
  return level;
}
function renderChart(){
  const chart = $("#chart");
  const fid = document.activeElement?.dataset?.fid;
  chart.replaceChildren();
  if (!model.team.length){
    chart.append(h("div",{class:"notice"},h("strong",{},T("Noch keine Teammitglieder","No team members yet")),h("span",{},T("Sobald HR-Heidi das erste Teammitglied einstellt, erscheint es hier.","As soon as HR-Heidi hires the first team member, they appear here."))));
    return;
  }
  const seen = new Set(), tree = h("div",{class:"tree"});
  for (const r of model.roots) tree.append(nodeEl(r, seen));
  const unclear = model.team.filter(a=>!seen.has(a.id)).sort(byNr);
  if (unclear.length) tree.append(h("div",{class:"branches unclear"}, deptColumn({name:T("Berichtslinie unklar","Unclear reporting line"),beschreibung:T("Bitte „berichtet an“ prüfen","Please check “reports to”")},unclear)));
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

/* Chronik-Filter: Auswahl bleibt pro Gerät gemerkt */
let chronikFilter = "";
try { chronikFilter = localStorage.getItem("chronikFilter") || ""; } catch(e){}
function setFilter(t){
  chronikFilter = t;
  try { localStorage.setItem("chronikFilter", t); } catch(e){}
  renderChronik();
  $("#filters").querySelector(`[data-typ="${CSS.escape(t)}"]`)?.focus();
}
function renderFilters(){
  const counts = new Map();
  for (const e of state.chronik){ const t = str(e.typ)||"Notiz"; counts.set(t,(counts.get(t)||0)+1); }
  if (chronikFilter && !counts.has(chronikFilter)) chronikFilter = "";
  const chip = (t,label,n) => h("button",{class:"chip",type:"button","data-typ":t,"aria-pressed":String(chronikFilter===t),onclick:()=>setFilter(t)},
    label, h("span",{class:"count"},n));
  $("#filters").replaceChildren(
    chip("",T("Alle","All"),state.chronik.length),
    ...[...counts.keys()].sort((a,b)=>D(a).localeCompare(D(b),LANG)).map(t=>chip(t,D(t),counts.get(t))));
  $("#filters").hidden = counts.size < 2;
}
function renderChronik(){
  const ol = $("#chronik"); ol.replaceChildren();
  renderFilters();
  if (!state.chronik.length){ ol.append(h("li",{},h("span"),h("span",{class:"hint"},T("Noch keine Einträge.","No entries yet.")))); return; }
  const list = chronikFilter ? state.chronik.filter(e=>(str(e.typ)||"Notiz")===chronikFilter) : state.chronik;
  for (const e of list){
    const a = model ? model.byId.get(e.agent) : null;
    ol.append(h("li",{},
      h("time",{datetime:str(e.datum)}, fmtDate(e.datum)),
      h("div",{class:"entry"},
        h("span",{class:"pill",hue:a?hueOf(a):""}, D(str(e.typ)||"Notiz")),
        h("span",{}, a ? h("button",{class:"linkish",type:"button",onclick:()=>openSb(a.id)},str(a.name)) : null, a?" ":"", str(e.text))
      )));
  }
}

/* ---------- Ideen der Teams ---------- */
let ideaFilter = "";
try { ideaFilter = localStorage.getItem("ideaFilter") || ""; } catch(e){}
const STATUS_CLASS = s => /umgesetzt|genehmigt/i.test(s) ? "ok" : /wartet|prüfung|umsetzung/i.test(s) ? "wait" : /abgelehnt/i.test(s) ? "no" : "new";
function renderIdeas(){
  const box = $("#ideas"), bar = $("#idea-filters");
  const ideas = [...state.ideen].sort((a,b)=>ts(b.datum)-ts(a.datum));
  const deptsUsed = model.depts.filter(d=>ideas.some(i=>i.abteilung===d.id));
  const hasAll = ideas.some(i=>!model.deptById.has(i.abteilung));
  if (ideaFilter && ideaFilter!=="_alle" && !deptsUsed.some(d=>d.id===ideaFilter)) ideaFilter = "";
  const chip = (id,label,n) => h("button",{class:"chip",type:"button","data-typ":id,"aria-pressed":String(ideaFilter===id),onclick:()=>{ ideaFilter=id; try{localStorage.setItem("ideaFilter",id)}catch(e){} renderIdeas(); bar.querySelector(`[data-typ="${CSS.escape(id)}"]`)?.focus(); }}, label, h("span",{class:"count"},n));
  bar.replaceChildren(chip("",T("Alle","All"),ideas.length),
    ...(hasAll ? [chip("_alle",T("Teamübergreifend","Cross-team"),ideas.filter(i=>!model.deptById.has(i.abteilung)).length)] : []),
    ...deptsUsed.map(d=>chip(d.id,D(d.name),ideas.filter(i=>i.abteilung===d.id).length)));
  bar.hidden = ideas.length < 2;
  const list = !ideaFilter ? ideas : ideaFilter==="_alle" ? ideas.filter(i=>!model.deptById.has(i.abteilung)) : ideas.filter(i=>i.abteilung===ideaFilter);
  box.replaceChildren();
  if (!list.length){ box.append(h("p",{class:"hint"},T("Noch keine Ideen eingebracht.","No ideas submitted yet."))); return; }
  for (const i of list){
    const d = model.deptById.get(i.abteilung);
    const authors = (Array.isArray(i.von) ? i.von : [i.von]).map(id=>model.byId.get(id)).filter(Boolean);
    const by = [];
    authors.forEach((a,k)=>{ if (k) by.push(k===authors.length-1 ? T(" und "," and ") : ", "); by.push(h("button",{class:"linkish",type:"button",onclick:()=>openSb(a.id)},str(a.name))); });
    box.append(h("article",{class:"idea",hue:d ? d.farbe : ""},
      h("span",{class:"pill",hue:d ? d.farbe : ""}, d ? D(d.name) : T("Teamübergreifend","Cross-team")),
      h("h3",{},str(i.titel)||T("Ohne Titel","Untitled")),
      i.beschreibung ? h("p",{},str(i.beschreibung)) : null,
      i.nutzen ? h("p",{class:"nutzen"},T("Nutzen: ","Benefit: ")+str(i.nutzen)) : null,
      h("div",{class:"idea-meta"},
        h("span",{class:"status "+STATUS_CLASS(str(i.status))}, D(str(i.status)||"Neu")),
        i.art ? h("span",{},"· "+D(i.art)) : null,
        by.length ? h("span",{},T("· von ","· by "), ...by) : null)));
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
      portrait(a),
      h("div",{}, h("h3",{id:"sb-name"},str(a.name)||T("Ohne Namen","Unnamed")), h("p",{},str(a.rolle))),
      h("button",{class:"close",type:"button","aria-label":T("Steckbrief schließen","Close profile"),onclick:()=>dlg.close()},"×")),
    h("div",{class:"sb-strip"},
      a.nr ? h("span",{},T("Nr. ","No. "),h("b",{},str(a.nr))) : null,
      h("span",{},T("Abteilung ","Department "),h("b",{},d?D(d.name):"–")),
      boss ? h("span",{},T("Berichtet an ","Reports to "),h("b",{},str(boss.name))) : (a.berichtetAn ? h("span",{},T("Berichtet an ","Reports to "),h("b",{},T("unbekannt","unknown"))) : h("span",{},h("b",{},T("Oberste Leitung","Top management")))),
      h("span",{},T("Seit ","Since "),h("b",{},fmtDate(a.seit))),
      human ? null : h("span",{},"Version ",h("b",{},str(a.version)||"1.0"))),
    h("div",{class:"sb-body"},
      a.motto ? h("p",{class:"motto"},"„"+str(a.motto)+"“") : null,
      a.persoenlichkeit ? h("div",{},h("h4",{},T("Persönlichkeit","Personality")),h("p",{},str(a.persoenlichkeit))) : null,
      arr(a.aufgaben).length ? h("div",{},h("h4",{},human?T("Aufgaben","Tasks"):T("Übernimmt für dich","Handles for you")),h("ul",{},arr(a.aufgaben).map(t=>h("li",{},str(t))))) : null,
      skills.length ? h("div",{},h("h4",{},T("Fähigkeiten","Skills")),h("div",{class:"skills"},skills.map(s=>{
        const lv = Math.max(0,Math.min(5,Number(s.stufe)||0));
        return h("div",{class:"skill"},h("span",{},str(s.name)),h("span",{class:"dots",role:"img","aria-label":T(`Stufe ${lv} von 5`,`Level ${lv} of 5`)},[1,2,3,4,5].map(i=>h("i",{class:i<=lv?"on":""}))));
      }))) : null,
      human ? null : h("div",{},h("h4",{},`${T("Lektionen","Lessons")} (${lessons.length})`),
        lessons.length ? h("ul",{},lessons.map(l=>h("li",{}, typeof l==="object" ? `${str(l.text)}${l.datum?" ("+fmtDate(l.datum)+")":""}` : str(l))))
                       : h("p",{class:"lessons-empty"},T("Noch keine Lektionen. Sobald du Feedback gibst, steht hier, was daraus gelernt wurde.","No lessons yet. Once you give feedback, what was learned shows up here."))),
      a.datei ? h("div",{},h("h4",{},T("Bauplan","Blueprint")),h("div",{class:"file"},str(a.datei))) : null
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
      renderIdeas();
      const dlg = $("#sb"); if (dlg.open && dirty.has("org")) fillSb(dlg.dataset.id);
    }
  } catch(e){ console.error(e); showBanner(T("Ein Eintrag in der Personalakte ist fehlerhaft. Marco kann ihn prüfen.","An entry in the staff file is broken. Marco can check it.")); }
  dirty.clear();
}
function showBanner(msg){ const b=$("#banner"); b.textContent=msg; b.hidden=false; }
function fail(msg){
  $("#chart").replaceChildren(h("div",{class:"notice"},h("strong",{},T("Das Team lässt sich gerade nicht anzeigen","The team can’t be shown right now")),h("span",{},msg)));
}
function setData(part, docs){
  if (part==="chronik") docs = [...docs].sort((a,b)=>ts(b.datum)-ts(a.datum));
  state[part] = docs; state.got[part] = true;
  invalidate(part==="chronik" ? "chronik" : part==="ideen" ? "ideen" : "org");
}



/* ---------- Kopieren-Knöpfe bei den Befehlen ---------- */
document.addEventListener("click", async e=>{
  const btn = e.target.closest(".cmd .copy"); if (!btn) return;
  const code = btn.parentElement.querySelector("code"), text = code.textContent;
  const done = ok => { btn.textContent = ok ? T("Kopiert","Copied") : T("Markiert – jetzt kopieren","Selected – copy now"); btn.classList.toggle("done", ok); setTimeout(()=>{ btn.textContent=T("Kopieren","Copy"); btn.classList.remove("done"); }, 2000); };
  try { await navigator.clipboard.writeText(text); done(true); }
  catch(err){ const r = document.createRange(); r.selectNodeContents(code); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); done(false); }
});

/* ---------- Aufklappbare Bereiche: Zustand pro Gerät merken ---------- */
(function(){
  const secs = [...document.querySelectorAll("details.sec")];
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("offen") || "null"); } catch(e){}
  if (Array.isArray(saved)) secs.forEach(d=>{ d.open = saved.includes(d.id); });
  const store = () => { try { localStorage.setItem("offen", JSON.stringify(secs.filter(d=>d.open).map(d=>d.id))); } catch(e){} };
  secs.forEach(d=>d.addEventListener("toggle", ()=>{ store(); if (d.id==="organigramm" && d.open) fitChart(); }));
  $("#open-all").addEventListener("click", ()=>{ secs.forEach(d=>d.open=true); store(); });
  $("#close-all").addEventListener("click", ()=>{ secs.forEach(d=>d.open=false); store(); });
  // Sprung per #anker öffnet den Bereich
  const go = () => { const d = location.hash && document.getElementById(location.hash.slice(1)); if (d && d.tagName==="DETAILS") { d.open = true; d.scrollIntoView({block:"start"}); } };
  window.addEventListener("hashchange", go); go();
})();


/* ---------- Einstellungen: Darstellung und Sprache ---------- */
const STATIC_EN = {
  "eyebrow":"Staff file · Family app studio","f1":"Team members","f2":"Departments","f3":"Lessons","f4":"Last change",
  "openall":"Expand all","closeall":"Collapse all",
  "t-org":"Org chart","h-org":"Maintained by Organigramm-Olga",
  "t-guide":"Claude Code commands and tips","h-guide":"Cheat sheet for working on the apps on the Mac",
  "t-work":"How we work","h-work":"Ideas, staffing, team leads meeting",
  "t-ideas":"Team ideas","h-ideas":"Submitted by the team leads · Marco decides",
  "t-chron":"Chronicle","h-chron":"New members, promotions, new lessons",
  "t-brand":"Brand and design","h-brand":"Brand portal: how all apps look",
  "load1":"Loading the team …","load2":"One moment please.",
  "footer":"This page is always up to date: when HR-Heidi hires a new team member or someone learns a new lesson from your feedback, it shows up here by itself. The logo grows with the team: every department is a gold dot in the circle.",
  "st-title":"Settings","st-done":"Done","st-appearance":"Appearance","st-auto":"Automatic","st-light":"Light","st-dark":"Dark",
  "st-autohint":"“Automatic” follows your device’s setting.","st-lang":"Language","st-about":"About","st-name":"The Studio Team",
  "st-about-sub":"Org chart, profiles and chronicle of the AI team","st-part":"Part of the family app studio"
};
const DE_HTML = new Map();
function applyLang(){
  document.documentElement.lang = LANG;
  document.title = T("Studio-Team Organigramm","Studio Team org chart");
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    if (el.dataset.de==null) el.dataset.de = el.textContent;
    el.textContent = LANG==="en" ? (STATIC_EN[el.dataset.i18n] ?? el.dataset.de) : el.dataset.de;
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el=>{
    const k = el.dataset.i18nHtml;
    if (!DE_HTML.has(k)) DE_HTML.set(k, el.innerHTML);
    const tpl = document.querySelector(`template[data-en="${k}"]`);
    el.innerHTML = LANG==="en" && tpl ? tpl.innerHTML : DE_HTML.get(k);
  });
  $("#open-settings").setAttribute("aria-label", T("Einstellungen","Settings"));
  if (model) invalidate("org","chronik","ideen");
}
function storedTheme(){ try { const t = localStorage.getItem("studio-theme"); return t==="light"||t==="dark" ? t : "auto"; } catch(e){ return "auto"; } }
function applyTheme(t){
  const r = document.documentElement;
  if (t==="auto"){ if (window.__studioHost) r.setAttribute("data-theme", window.__studioHost); else r.removeAttribute("data-theme"); }
  else r.setAttribute("data-theme", t);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{
    if (m.dataset.orig==null) m.dataset.orig = m.content;
    m.content = t==="light" ? "#FAF7F2" : t==="dark" ? "#141012" : m.dataset.orig;
  });
}
(function(){
  const dlg = $("#settings");
  const sync = () => {
    $(`#st-theme-${storedTheme()}`).checked = true;
    $(`#st-lang-${LANG}`).checked = true;
  };
  $("#open-settings").addEventListener("click", ()=>{ sync(); try{ dlg.showModal(); }catch(e){ dlg.setAttribute("open",""); } });
  $("#st-done").addEventListener("click", ()=>dlg.close());
  dlg.addEventListener("click", e=>{ if (e.target===dlg) dlg.close(); });
  dlg.querySelectorAll('input[name="st-theme"]').forEach(i=>i.addEventListener("change", ()=>{
    try { if (i.value==="auto") localStorage.removeItem("studio-theme"); else localStorage.setItem("studio-theme", i.value); } catch(e){}
    applyTheme(i.value);
  }));
  dlg.querySelectorAll('input[name="st-lang"]').forEach(i=>i.addEventListener("change", ()=>{
    LANG = i.value==="en" ? "en" : "de";
    try { if (LANG==="de") localStorage.removeItem("studio-lang"); else localStorage.setItem("studio-lang","en"); } catch(e){}
    applyLang();
  }));
  applyTheme(storedTheme());
  applyLang();
})();

/* ---------- Daten: claude.ai-Datenbank, sonst data/studio.json ---------- */
async function connect(){
  let db = null;
  try { db = window.claude?.use ? await window.claude.use("db") : null; } catch(e){ db = null; }
  if (db){
    const onErr = () => showBanner(T("Die Verbindung ist abgerissen. Lade die Seite bitte neu.","The connection dropped. Please reload the page."));
    for (const [part,coll] of [["depts","abteilungen"],["team","team"],["chronik","chronik"],["ideen","ideen"]])
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
    fail(T("Lade die Seite bitte neu. Klappt es dann immer noch nicht, sag Marco Bescheid.","Please reload the page. If it still doesn’t work, let Marco know."));
    return;
  }
  setData("depts", arr(d.abteilungen)); setData("team", arr(d.team)); setData("chronik", arr(d.chronik)); setData("ideen", arr(d.ideen));
}
connect().catch(e=>{ console.error(e); fail(T("Lade die Seite bitte neu. Klappt es dann immer noch nicht, sag Marco Bescheid.","Please reload the page. If it still doesn’t work, let Marco know.")); });
