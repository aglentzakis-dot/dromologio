/* Δρομολόγιο — Διαδρομή και προτάσεις στάσεων. */
/* ---------- Διαδρομή ---------- */
function vRoute(){
  const lim=route.limit??S.settings.detour,B=baseLoc();
  if(!route.from&&!route.fromGeo&&B)route.from=B.label;
  return `<div class="panel pad">
    <label for="rFrom">${T("Από")}${helpBtn("from")}</label>
    <div class="inrow"><input id="rFrom" placeholder="${T("π.χ. Αθήνα")}" value="${esc(route.fromGeo?MYLOC():route.from)}">
    <button class="pickbtn narrow" data-act="fromSheet" aria-label="${T("Επιλογές αφετηρίας")}">▾</button></div>
    <label for="rTo">${T("Προς")}${helpBtn("to")}</label>
    <div class="inrow"><input id="rTo" placeholder="${T("π.χ. Γλυφάδα")}" value="${esc(route.to)}">
    <button class="pickbtn narrow" data-act="pickDest" aria-label="${T("Επιλογές προορισμού")}">▾</button></div>
    <label>${T("Τρόπος διαδρομής")}${helpBtn("mode")}</label>
    <div class="seg" id="r_mode"><button type="button" data-v="short">${T("Συντομότερη")}</button><button type="button" data-v="many">${T("Πιάσε όσες περισσότερες")}</button></div>
    <label class="toggle"><input type="checkbox" id="r_real" ${S.settings.realRoute?"checked":""}>${T("Πραγματικά χιλιόμετρα από τον δρόμο")}</label>
    <label for="rLim">${T("Μέγιστη παράκαμψη")}${helpBtn("detour")}: <b id="limV" style="color:var(--ink)">${fmtKm(lim)}</b></label>
    <input type="range" id="rLim" min="0.5" max="15" step="0.5" value="${lim}">
    <button class="btn amber wide gobtn" data-act="calcRoute">${ic("route",22)}${T("Δείξε διαδρομή και στάσεις")}</button>
    <button class="btn ghost wide" data-act="jobsMap" style="margin-top:8px;border:1.5px solid var(--line)">${ic("map",20)} ${T("Χάρτης με όλες τις δουλειές")}</button>
    <button class="btn ghost wide" data-act="showMe" style="margin-top:8px">${ic("near",20)} ${T("Δες πού βρίσκεσαι στον χάρτη")}</button>
  </div><div id="routeRes">${route.result?routeResultHTML():""}</div>`;
}
function routeStops(A,B,limit){
  if(route.mode==="many")limit=Math.max(limit,8);
  const direct=km(A,B),map=new Map();let noLoc=0;
  S.tasks.filter(isOpen).forEach(x=>{const L=taskLoc(x);if(!L){noLoc++;return}
    const key=L.lat.toFixed(4)+","+L.lng.toFixed(4);if(!map.has(key))map.set(key,{key,loc:L,tasks:[]});map.get(key).tasks.push(x)});
  const stops=[],atDest=[];
  map.forEach(s=>{
    if(km(s.loc,B)<0.2){atDest.push(...s.tasks);return}
    const dA=km(A,s.loc),dB=km(s.loc,B),det=Math.max(0,dA+dB-direct);
    const soon=s.tasks.some(x=>x.end&&new Date(x.end)-Date.now()<86400000);
    if(det<=limit||(soon&&det<=limit*2)){s.detour=det;s.soon=soon;s.pos=dA/((dA+dB)||1);stops.push(s)}
  });
  if(route.mode==="many"&&stops.length>1){
    // σειρά «πλησιέστερου επόμενου», ώστε να μαζεύεις όσες περισσότερες με τα λιγότερα χιλιόμετρα
    const rest=stops.slice(),ord=[];let cur=A;
    while(rest.length){let bi=0,bd=Infinity;
      rest.forEach((s,i)=>{const d=km(cur,s.loc)+km(s.loc,B)*0.25;if(d<bd){bd=d;bi=i}});
      cur=rest[bi].loc;ord.push(rest.splice(bi,1)[0]);}
    return{direct,stops:ord,noLoc,atDest};
  }
  stops.sort((a,b)=>a.pos-b.pos);
  return{direct,stops,noLoc,atDest};
}
const stopTaskBtn=x=>`<button class="stoptask ${taskState(x)==="late"?"late":""}" data-act="editTask" data-id="${x.id}">${esc(x.title)}${x.start||x.end?` <span style="color:var(--muted)">${fmt(x.start||x.end)}</span>`:""}</button>`;
// Πελάτες που χρωστάνε και τυχαίνει να είναι κοντά στη διαδρομή, ακόμα κι αν δεν έχεις ραντεβού μαζί τους
function nearRouteDebts(A,B,stops){
  const pts=[A,...stops.map(s=>s.loc),B];
  const already=new Set();stops.forEach(s=>s.tasks.forEach(t=>{if(t.clientId)already.add(t.clientId)}));
  return S.clients.filter(alive).filter(c=>!already.has(c.id)).map(c=>{
    const L=clientLoc(c);if(!L)return null;
    const m=cMoney(c);if(m.owed<=0.004)return null;
    const d=Math.min(...pts.map(p=>km(p,L)));
    return d<=1.5?{c,m,d}:null;
  }).filter(Boolean).sort((a,b)=>a.d-b.d).slice(0,3);
}
function routeResultHTML(){
  const{A,B}=route.result,limit=route.limit??S.settings.detour;
  const{direct,stops,noLoc,atDest}=routeStops(A,B,limit);
  const sel=stops.filter(s=>!route.off.has(s.key));
  const nearDebts=nearRouteDebts(A,B,stops);
  const pts=[A,...sel.map(s=>s.loc),B];let tot=0;for(let i=1;i<pts.length;i++)tot+=km(pts[i-1],pts[i]);
  const mins=k=>Math.round(k/30*60);
  let h=`<p class="sum">${stops.length?T("Απευθείας περίπου {a}, με {s} περίπου {b}, δηλαδή {c} επιπλέον.",{a:`<b>${fmtKm(direct)}</b>`,s:pl(sel.length,"{n} στάση","{n} στάσεις"),b:`<b>${fmtKm(tot)}</b>`,c:fmtKm(tot-direct)}):T("Καμία άλλη εκκρεμότητα δεν πέφτει στο δρόμο με παράκαμψη έως {k}, δοκίμασε μεγαλύτερη.",{k:fmtKm(limit)})}</p>`;
  let n=0;
  h+=`<div class="panel route"><div class="node"><div class="rail"><div class="pin end">${T("Α")}</div></div><div class="body"><div class="title">${esc(A.label)}</div><div class="meta"><span>${T("Αφετηρία")}</span></div></div></div>`;
  stops.forEach(s=>{
    const off=route.off.has(s.key),names=[...new Set(s.tasks.map(x=>x.clientId&&getClient(x.clientId)?.name).filter(Boolean))];
    const hours=[...new Set(s.tasks.map(x=>x.clientId&&getClient(x.clientId)?.hours).filter(Boolean))];
    if(!off)n++;
    h+=`<div class="node ${off?"off":""}"><div class="rail"><div class="pin">${off?"–":n}</div></div><div class="body">
      <div class="title">${esc(names.length?names.join(", "):s.loc.label)}</div>
      <div class="meta">${names.length?`<span>${esc(s.loc.label)}</span>`:""}<span>+${fmtKm(s.detour)} ${T("παράκαμψη")}</span>${s.soon?`<span class="urgent">${T("Λήγει σύντομα")}</span>`:""}${hours.length?`<span>${T("Ωράριο")}: ${esc(hours.join(", "))}</span>`:""}</div>
      ${s.tasks.map(stopTaskBtn).join("")}
      <button class="stopbtn" data-act="toggleStop" data-key="${s.key}">${off?T("Βάλ' την στη διαδρομή"):T("Παράλειψη στάσης")}</button></div></div>`;
  });
  h+=`<div class="node"><div class="rail"><div class="pin end">${T("Β")}</div></div><div class="body"><div class="title">${esc(B.label)}</div><div class="meta"><span>${T("Προορισμός")}</span></div>${atDest.map(stopTaskBtn).join("")}</div></div></div>`;
  if(nearDebts.length)h+=sec(T("Κοντά στη διαδρομή σου"))+panel(nearDebts.map(({c,m,d})=>`<div class="row" data-act="openClient" data-id="${c.id}" style="align-items:center">
      <span style="color:var(--red)">${ic("shield",20)}</span>
      <div class="grow"><div class="title">${esc(c.name)}</div><div class="meta"><span>${T("σου χρωστάει")} ${money(m.owed)}</span><span>~${fmtKm(d)}</span></div></div></div>`).join(""));
  const ll=p=>p.lat.toFixed(5)+","+p.lng.toFixed(5);
  let url=`https://www.google.com/maps/dir/?api=1&origin=${ll(A)}&destination=${ll(B)}&travelmode=driving`;
  if(sel.length)url+="&waypoints="+encodeURIComponent(sel.slice(0,9).map(s=>ll(s.loc)).join("|"));
  if(stops.length)h=h.replace("</p>",` ${T("Χρόνος περίπου {a} αντί για {b} λεπτά.",{a:mins(tot),b:mins(direct)})}</p>`);
  h=h.replace('<p class="sum">','<p class="sum"><span id="sumEst">').replace("</p>","</span><span id=\"sumReal\"></span></p>");
  setTimeout(()=>refineRoute(A,B,sel),30);
  h+=`<a class="btn amber golink" href="${url}" target="_blank" rel="noopener">${T("Άνοιγμα διαδρομής στον χάρτη")}</a>`;
  if(sel.length>9)h+=`<p class="note">${T("Ο χάρτης δέχεται έως 9 ενδιάμεσες στάσεις, οπότε ανοίγουν οι πρώτες 9.")}</p>`;
  if(noLoc)h+=`<p class="note" style="color:var(--red)">${pl(noLoc,"{n} ανοιχτή εργασία δεν έχει τοποθεσία και δεν μπήκε στον υπολογισμό.","{n} ανοιχτές εργασίες δεν έχουν τοποθεσία και δεν μπήκαν στον υπολογισμό.")}</p>`;
  h+=`<p class="note">${T("Οι αποστάσεις είναι εκτιμήσεις με βάση το κέντρο κάθε περιοχής, εκτός αν έχεις αποθηκεύσει ακριβή θέση.")}</p>`;
  return h;
}
// Πραγματικά χιλιόμετρα και λεπτά από δημόσια υπηρεσία δρομολόγησης, με εφεδρεία την εκτίμηση
const roadCache=new Map();
async function roadRoute(pts){
  if(!S.settings.realRoute||localFile()||!navigator.onLine)return null;
  const key=pts.map(p=>p.lat.toFixed(4)+","+p.lng.toFixed(4)).join(";");
  if(roadCache.has(key))return roadCache.get(key);
  const coords=pts.map(p=>p.lng.toFixed(6)+","+p.lat.toFixed(6)).join(";");
  const ctrl=new AbortController(),tm=setTimeout(()=>ctrl.abort(),8000);
  try{
    const r=await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false&alternatives=false&steps=false`,{signal:ctrl.signal});
    const js=await r.json();
    if(js&&js.routes&&js.routes[0]){
      const out={km:js.routes[0].distance/1000,min:js.routes[0].duration/60};
      roadCache.set(key,out);return out;
    }
  }catch(e){}finally{clearTimeout(tm)}
  roadCache.set(key,null);return null;
}
async function refineRoute(A,B,sel){
  const el=$("#sumReal");if(!el)return;
  el.innerHTML=`<span class="calc">${T("υπολογίζω πραγματικά χιλιόμετρα…")}</span>`;
  const [direct,full]=await Promise.all([roadRoute([A,B]),roadRoute([A,...sel.map(s=>s.loc),B])]);
  const box=$("#sumReal"),est=$("#sumEst");if(!box)return;
  if(!direct||!full){box.textContent="";return}
  const dk=rnd(full.km-direct.km),dm=Math.round(full.min-direct.min);
  box.innerHTML=sel.length
    ? T("Απευθείας {c} σε {d} λεπτά. Με {n} περίπου {a} σε {b} λεπτά, δηλαδή {x} και {y} λεπτά παραπάνω.",
        {c:fmtKm(direct.km),d:Math.round(direct.min),n:pl(sel.length,"{n} στάση","{n} στάσεις"),
         a:fmtKm(full.km),b:Math.round(full.min),x:fmtKm(dk),y:dm})
    : T("Απευθείας {c} σε {d} λεπτά.",{c:fmtKm(direct.km),d:Math.round(direct.min)});
  box.innerHTML+=` <span class="calc">${T("πραγματικός δρόμος")}</span>`;
  if(est)est.style.display="none";
}
const geoCache=new Map();
async function findAnywhere(q){
  q=String(q||"").trim();if(!q)return null;
  const loc=resolvePlace(q);if(loc)return loc;
  const p=parseCoords(q);if(p&&p!=="short")return{lat:p.lat,lng:p.lng,label:q};
  const key=norm(q);if(geoCache.has(key))return geoCache.get(key);
  if(localFile()||!navigator.onLine)return null;
  try{
    const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=gr&accept-language=${LANG}&q=${encodeURIComponent(q)}`);
    const js=await r.json();
    if(js&&js[0]){const out={lat:+js[0].lat,lng:+js[0].lon,label:(js[0].name||q)};geoCache.set(key,out);learnArea(out.label,out.lat,out.lng);return out}
  }catch(e){}
  geoCache.set(key,null);return null;
}
async function calcRoute(silent){
  let A=route.fromGeo||resolvePlace(route.from),B=route.toPlace||resolvePlace(route.to);
  if((!A&&route.from)||(!B&&route.to)){
    if(!silent)toast(T("Ψάχνω τα σημεία…"));
    if(!A&&route.from)A=await findAnywhere(route.from);
    if(!B&&route.to)B=await findAnywhere(route.to);
  }
  if(!A){if(!silent)toast(route.from?T("Δεν βρέθηκε η αφετηρία «{x}». Δοκίμασε πιο συγκεκριμένα, π.χ. «Καλαμάτα κέντρο».",{x:route.from}):T("Γράψε από πού ξεκινάς."));return}
  if(!B){if(!silent)toast(route.to?T("Δεν βρέθηκε ο προορισμός «{x}». Δοκίμασε πιο συγκεκριμένα, π.χ. «Καλαμάτα κέντρο».",{x:route.to}):T("Γράψε πού πηγαίνεις."));return}
  route.result={A,B};route.off=new Set();const el=$("#routeRes");if(el)el.innerHTML=routeResultHTML();
}
function fromSheet(){
  const B=baseLoc(),cur=route.fromGeo?MYLOC():route.from;
  const row=(label,sub,act,attrs="")=>`<div class="row" data-act="${act}" ${attrs} style="align-items:center">
    <span style="color:var(--loc)">${ic(act==="geoFrom"?"near":(label===(B&&B.label)?"home":"pin"),20)}</span>
    <div class="grow"><div class="title">${esc(label)}</div>${sub?`<div class="meta"><span>${esc(sub)}</span></div>`:""}</div>
    ${norm(label)===norm(cur)?'<span class="tick">✓</span>':""}</div>`;
  openSheet({title:T("Από πού ξεκινάς"),cancelLabel:T("Κλείσιμο"),body:
    (B?panel(row(B.label,[B.address,B.area].filter(Boolean).join(", "),"setFrom",`data-from="${esc(B.label)}"`)):"")+
    panel(row(T("Η θέση μου"),T("με τον εντοπισμό του κινητού"),"geoFrom"))+
    (S.areas.length?sec(T("Δικά μου σημεία"))+panel(S.areas.map(a=>row(a.name,[a.address,a.area].filter(Boolean).join(", "),"setFrom",`data-from="${esc(a.name)}"`)).join("")):"")+
    `<div class="twobtn" style="padding:12px 0 0"><button class="btn ghost" data-act="addMyPlace">+ ${T("Νέο σημείο")}</button>
     <button class="btn ghost" data-act="fromTyped">${ic("edit",18)} ${T("Γράφω εγώ")}</button></div>`});
}
function quickTimeSheet(){
  const qt=S.settings.quickTimes;
  const row=(k,label)=>`<div class="pickrow qrow" data-q="${k}" style="cursor:pointer">
      <span>${T(label)}</span>${qt[k]?`<b>${qt[k]}</b><button type="button" class="qedit" data-qedit="${k}" aria-label="${T("Αλλαγή προεπιλογής")}">${ic("clock",16)}</button>`:""}
    </div>`;
  openSheet({title:T("Γρήγορη επιλογή ώρας"),cancelLabel:T("Κλείσιμο"),body:
    panel(row("1h","Σε 1 ώρα")+row("eve","Απόψε")+row("tom","Αύριο")+row("we","Σαββατοκύριακο"))+
    `<p class="note">${T("Πάτα το ρολόι δίπλα σε μια επιλογή για να αλλάξεις τη δική σου προεπιλεγμένη ώρα.")}</p>`});
  $("#shBody").onclick=e=>{
    const ed=e.target.closest("[data-qedit]");
    if(ed){openClock(qt[ed.dataset.qedit],v=>{qt[ed.dataset.qedit]=v;write();quickTimeSheet()});return}
    const row=e.target.closest("[data-q]");if(!row)return;
    applyQuickTime(row.dataset.q);closeSheet();
  };
}
const HELPS={
  from:["Από πού ξεκινάς","Πάτα το βελάκι και διάλεξε την έδρα σου, ένα από τα δικά σου σημεία ή την τρέχουσα θέση σου. Μπορείς και να γράψεις οτιδήποτε, π.χ. «Καλαμάτα» ή μια διεύθυνση, και θα το βρει στον χάρτη."],
  to:["Πού πηγαίνεις","Πάτα το βελάκι για να διαλέξεις από τις ανοιχτές δουλειές σου, από τα δικά σου σημεία ή να γράψεις ελεύθερα έναν προορισμό."],
  mode:["Τρόπος διαδρομής","«Συντομότερη» κρατάει τα λιγότερα χιλιόμετρα. «Πιάσε όσες περισσότερες» ανοίγει την παράκαμψη και βάζει στη σειρά περισσότερες δουλειές, για να τις τελειώσεις με ένα ταξίδι."],
  detour:["Μέγιστη παράκαμψη","Πόσα επιπλέον χιλιόμετρα δέχεσαι για να περάσεις από μια δουλειά. Όσο μεγαλύτερο, τόσο περισσότερες στάσεις προτείνονται."]
};
const helpBtn=k=>`<button type="button" class="qmark" data-act="help" data-h="${k}" aria-label="${T("Τι είναι αυτό;")}">?</button>`;
function destSheet(mode){
  const B=baseLoc(),open=S.tasks.filter(isOpen).sort(byDue);
  const withL=open.filter(x=>taskLoc(x)),noL=open.filter(x=>!taskLoc(x));
  const from=route.fromGeo?MYLOC():(route.from||(B?B.label:""));
  const chip=(lbl,act,extra="")=>`<button class="chip ${norm(lbl)===norm(from)?"on":""}" data-act="${act}" ${extra}>${esc(lbl)}</button>`;
  const startChips=(B?chip(B.label,"setFrom",`data-from="${esc(B.label)}"`):"")+
    S.areas.map(a=>chip(a.name,"setFrom",`data-from="${esc(a.name)}"`)).join("")+
    `<button class="chip ${route.fromGeo?"on":""}" data-act="geoFrom">${T("Η θέση μου")}</button>`+
    `<button class="chip" data-act="fromOther">${T("Άλλο σημείο…")}</button>`;
  const prow=x=>`<div class="row" data-act="destPlace" data-lat="${x.lat}" data-lng="${x.lng}" data-label="${esc(x.label)}" data-i="${x.i??""}" style="align-items:center">
    <span style="color:var(--loc)">${ic(x.home?"home":"pin",20)}</span><div class="grow"><div class="title">${esc(x.label)}</div>
    ${x.sub?`<div class="meta"><span>${esc(x.sub)}</span></div>`:""}</div>${x.home?"":`<span class="note">${T("κράτα πατημένο για διαγραφή")}</span>`}</div>`;
  const places=(B?[{label:B.label,lat:B.lat,lng:B.lng,home:true,sub:B.area||""}]:[])
    .concat(S.areas.map((a,i)=>({label:a.name,lat:a.lat,lng:a.lng,sub:[a.address,a.area].filter(Boolean).join(", "),i})));
  const row=x=>{const c=x.clientId&&getClient(x.clientId),L=taskLoc(x);
    return `<div class="row" data-act="${L?"destTask":"editTask"}" data-id="${x.id}"><span style="color:${L?"var(--loc)":"var(--red)"};margin-top:1px">${ic("pin",20)}</span>
    <div class="grow"><div class="title">${esc(x.title)}</div><div class="meta">${c?`<span>${esc(c.name)}</span>`:""}${L?`<span>${esc(L.label)}</span>`:`<span style="color:var(--red)">${T("Πάτα για να προσθέσεις τοποθεσία")}</span>`}${whenText(x)?`<span>${whenText(x)}</span>`:""}</div></div></div>`};
  openSheet({title:T("Πού πηγαίνεις;"),cancelLabel:T("Κλείσιμο"),body:
    `<label>${T("Ξεκινάς από")}</label><div class="chips" style="padding-bottom:4px">${startChips}</div>
     <label>${T("Τρόπος διαδρομής")}</label>
     <div class="seg" id="d_mode"><button type="button" data-v="short">${T("Συντομότερη")}</button><button type="button" data-v="many">${T("Πιάσε όσες περισσότερες")}</button></div>
     <button class="btn primary wide gobtn" style="margin:14px 0 4px" data-act="otherDest">${ic("search",20)}${T("Άλλος προορισμός, γράφω εγώ")}</button>`+
    sec(T("Ανοιχτές δουλειές"))+(withL.length?panel(withL.map(row).join("")):panel(`<div class="empty">${T("Δεν υπάρχουν ανοιχτές δουλειές με τοποθεσία.")}</div>`))+
    (noL.length?sec(T("Χωρίς τοποθεσία"),"red")+panel(noL.map(row).join("")):"")+
    `<div class="sec-row">${sec(T("Δικά μου σημεία"))}<button class="btn ghost small" style="margin-bottom:8px" data-act="newDestPlace">+ ${T("Νέο σημείο")}</button></div>`+
    panel(places.length?places.map(prow).join(""):`<div class="empty">${T("Δεν έχεις δικά σου σημεία.")}</div>`)});
  segBind("d_mode",route.mode||"short");$("#d_mode")._on=v=>{route.mode=v;write&&0};
  // κράτημα 2 δευτερολέπτων σε δικό μου σημείο = διαγραφή
  let holdT=null;
  $("#shBody").addEventListener("pointerdown",e=>{
    const r=e.target.closest("[data-act=destPlace][data-i]");if(!r||r.dataset.i==="")return;
    holdT=setTimeout(()=>{holdT=null;const i=+r.dataset.i,a=S.areas[i];if(!a)return;
      if(confirm(T("Να διαγραφεί το σημείο «{n}»;",{n:a.name}))){S.areas.splice(i,1);persist();render();destSheet(mode)}},2000);
  });
  ["pointerup","pointercancel","pointermove","scroll"].forEach(ev=>$("#shBody").addEventListener(ev,()=>{clearTimeout(holdT);holdT=null},true));
}

/* οριζόντιες μπάρες επιλογών: θυμούνται τη θέση τους, δείχνουν την επιλεγμένη και έχουν δείκτη κύλισης */
const hsPos={};
function initHScroll(){
  document.querySelectorAll(".hs").forEach(w=>{
    const sc=w.querySelector(".chips"),th=w.querySelector(".hs-thumb");
    const upd=()=>{const over=sc.scrollWidth>sc.clientWidth+2;w.classList.toggle("nofl",!over);hsPos[w.id]=sc.scrollLeft;if(!over)return;
      th.style.width=(sc.clientWidth/sc.scrollWidth*100)+"%";th.style.left=(sc.scrollLeft/sc.scrollWidth*100)+"%"};
    sc.scrollLeft=hsPos[w.id]||0;const on=sc.querySelector(".on");
    if(on){if(on.offsetLeft+on.offsetWidth>sc.scrollLeft+sc.clientWidth)sc.scrollLeft=on.offsetLeft+on.offsetWidth-sc.clientWidth+16;
      else if(on.offsetLeft<sc.scrollLeft)sc.scrollLeft=Math.max(0,on.offsetLeft-16)}
    sc.onscroll=upd;upd();
  });
}
window.addEventListener("resize",()=>{document.documentElement.style.setProperty("--hdr",$("header").getBoundingClientRect().height+"px");initHScroll()});
// όσο γράφεις σε φόρμα της σελίδας, το κουμπί καταχώρησης μένει πάνω από το πληκτρολόγιο
function stickFor(box,run,label){
  const bar=$("#stickAdd"),btn=$("#stickBtn");
  if(!box){bar.hidden=true;return}
  btn.innerHTML=label;btn.onclick=()=>{run();$("#r_text")?.focus()};
  updateStickBar();
}
// το κολλητό κουμπί φαίνεται μόνο όταν το κανονικό είναι κρυμμένο πίσω από το πληκτρολόγιο,
// ποτέ μαζί του, ώστε να μη διπλασιάζεται στην οθόνη
function updateStickBar(){
  const bar=$("#stickAdd");if(!bar)return;
  if(view!=="reminders"||!$("#stickBtn").innerHTML||!document.body.classList.contains("typing")){bar.hidden=true;return}
  const real=$("#r_add");
  if(!real){bar.hidden=true;return}
  const r=real.getBoundingClientRect(),vh=(vv?vv.height:innerHeight);
  bar.hidden=(r.top>=0&&r.bottom<=vh&&r.height>0);
}
function bindView(){
  $("#stickAdd").hidden=true;
  if(view==="reminders")bindReminders();
  if(view==="clients")$("#cSearch").oninput=e=>{clientSearch=e.target.value;$("#clientList").innerHTML=clientListHTML()};

  if(view==="route"){
    $("#rFrom").oninput=e=>{route.from=e.target.value;if(e.target.value!==MYLOC())route.fromGeo=null};
    $("#rTo").oninput=e=>{route.to=e.target.value;route.toPlace=null};
    if($("#r_real"))$("#r_real").onchange=e=>{S.settings.realRoute=e.target.checked;write();
      if(route.result)$("#routeRes").innerHTML=routeResultHTML();
      toast(e.target.checked?T("Θα υπολογίζω με πραγματικούς δρόμους όταν υπάρχει σύνδεση."):T("Μόνο εκτίμηση, χωρίς διαδίκτυο."))};
    segBind("r_mode",route.mode||"short");$("#r_mode")._on=v=>{route.mode=v;if(route.result)$("#routeRes").innerHTML=routeResultHTML()};
    $("#rLim").oninput=e=>{route.limit=+e.target.value;$("#limV").textContent=fmtKm(route.limit);if(route.result)$("#routeRes").innerHTML=routeResultHTML()};
  }
}

function filterSheet(kind){
  const TF=[["open","Ανοιχτές"],["today","Σήμερα"],["late","Εκπρόθεσμες"],["waiting","Προσφορές"],["noloc","Χωρίς τοποθεσία"],["done","Ολοκληρωμένες"],["cancelled","Ακυρωμένες"],["all","Όλες"]];
  const cnt=k=>S.tasks.filter(alive).filter(x=>k==="open"?isOpen(x):k==="today"?isOpen(x)&&touchesToday(x):k==="late"?taskState(x)==="late":k==="waiting"?isWaiting(x):k==="someday"?isSomeday(x):k==="noloc"?isOpen(x)&&!taskLoc(x):k==="cancelled"?x.status==="cancelled":k==="done"?x.status==="done":true).length;
  let title,body;
  if(kind==="tasks"){
    title=T("Εμφάνιση εργασιών");
    body=panel(TF.map(([k,l])=>`<button class="optrow ${taskFilter===k?"on":""}" data-act="filter" data-f="${k}">${T(l)}<span class="n">${cnt(k)}</span>${taskFilter===k?'<span class="tick">✓</span>':""}</button>`+
        (k==="waiting"?`<button class="optrow" data-act="offerArchive" style="padding-left:30px;color:var(--muted)">${ic("archive",18)}${T("Αρχείο προσφορών")}<span class="n">${offersCount()}</span></button>`:"")).join(""))+
      `<button class="optrow" style="margin-top:10px;border:1px solid var(--line);border-radius:12px" data-act="toggleMove">${ic("tasks",18)}${T("Κουμπιά αλλαγής σειράς")}<span class="tick">${S.settings.showMove?"✓":""}</span></button>`+
      `<button class="optrow" style="margin-top:10px;border:1px solid var(--line);border-radius:12px" data-act="toggleGroup">${ic("filter",18)}${T("Ομαδοποίηση ανά περιοχή")}<span class="tick">${groupByArea?"✓":""}</span></button>`+
      (S.settings.manualOrder?`<button class="optrow" style="margin-top:10px;border:1px solid var(--line);border-radius:12px" data-act="autoOrder">${ic("tasks",18)}${T("Επαναφορά αυτόματης σειράς (κατά ώρα)")}</button>`:"");
  }else if(kind==="clients"){
    title=T("Ταξινόμηση πελατών");
    body=panel(CSORT.map(([k,l])=>`<button class="optrow ${clientSort===k?"on":""}" data-act="csort" data-s="${k}">${T(l)}${clientSort===k?'<span class="tick">✓</span>':""}</button>`).join(""));
  }else{
    title=T("Περίοδος");
    const years=moneyDataYears();
    body=panel(PERIODS.map(([k,l])=>`<button class="optrow ${moneyPeriod===k?"on":""}" data-act="period" data-p="${k}">${T(l)}${moneyPeriod===k?'<span class="tick">✓</span>':""}</button>`).join(""))+
      (years.length?sec(T("Συγκεκριμένη χρονιά"))+panel(years.map(y=>`<button class="optrow ${moneyPeriod===String(y)?"on":""}" data-act="period" data-p="${y}">${y}${moneyPeriod===String(y)?'<span class="tick">✓</span>':""}</button>`).join("")):"");
  }
  openSheet({title,cancelLabel:T("Κλείσιμο"),body});
}

