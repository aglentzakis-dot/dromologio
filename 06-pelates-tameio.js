/* Δρομολόγιο — Πελάτες, εργασίες, ταμείο. */
/* ---------- Πελάτες ---------- */
const CSORT=[["work","Με εκκρεμότητες"],["az","Αλφαβητικά"],["money","Περισσότερα χρήματα"],["stars","Καλύτερη αξιολόγηση"]];
function vClients(){return `<button class="filterbar" data-act="filterSheet" data-kind="clients">${ic("filter",18)}<span>${T(CSORT.find(x=>x[0]===clientSort)[1])}</span><i>▾</i></button>
  <div class="inrow" style="margin-bottom:12px"><input class="search" id="cSearch" type="search" placeholder="${T("Αναζήτηση πελάτη")}" value="${esc(clientSearch)}"><button class="contactsbtn small" data-act="importContacts"><span class="cicon">${ic("book",17)}</span>${T("Επαφές")}</button></div><div id="clientList">${clientListHTML()}</div>`}
const clientEarned=c=>cMoney(c).received;
function clientListHTML(){
  if(!S.clients.length)return panel(`<div class="empty">${T("Δεν έχεις πελάτες ακόμα. Πάτα + για να προσθέσεις τον πρώτο ή φέρε πελάτες από τις επαφές σου.")}</div>`);
  const q=norm(clientSearch);
  const list=S.clients.filter(alive).filter(c=>!q||norm([c.name,c.company,c.area,c.mobile,c.phone,c.street].join(" ")).includes(q));
  if(!list.length)return panel(`<div class="empty">${T("Κανένας πελάτης δεν ταιριάζει στην αναζήτηση.")}</div>`);
  const rows=list.map(c=>({c,open:S.tasks.filter(x=>x.clientId===c.id&&isOpen(x)).sort(byDue),earned:clientEarned(c)}));
  const az=(a,b)=>a.c.name.localeCompare(b.c.name,"el");
  let busy=[],rest=[],head="",headRest="";
  if(clientSort==="work"){rows.forEach(r=>(r.open.length?busy:rest).push(r));
    busy.sort((a,b)=>byDue(a.open[0],b.open[0])||b.open.length-a.open.length);rest.sort(az);
    head=T("Με εκκρεμότητες");headRest=busy.length?T("Όλοι οι υπόλοιποι"):T("Πελάτες")}
  else{rest=rows;headRest=T("Πελάτες");
    if(clientSort==="az")rest.sort(az);
    else if(clientSort==="money")rest.sort((a,b)=>b.earned-a.earned||az(a,b));
    else rest.sort((a,b)=>(b.c.rating||0)-(a.c.rating||0)||b.earned-a.earned||az(a,b));}
  const row=({c,open})=>{const tel=c.mobile||c.phone,late=open.some(x=>taskState(x)==="late"),nx=open[0];
    return `<div class="row" data-act="openClient" data-id="${c.id}" style="align-items:center"><div class="avatar ${open.length?"busy":""}">${esc(initials(c.name))}</div>
      <div class="grow"><div class="title">${esc(c.name)}</div><div class="meta">${c.company?`<span>${esc(c.company)}</span>`:""}${c.area?`<span>${esc(c.area)}</span>`:""}
      ${open.length?`<span class="count ${late?"late":""}">${pl(open.length,"{n} ανοιχτή","{n} ανοιχτές")}</span>`:""}</div>
      ${nx?`<div class="meta"><span>${T("Επόμενη")}: ${esc(nx.title)}${dueTime(nx)<Infinity?", "+fmt(nx.end||nx.start):""}</span></div>`:""}
      ${c.rating||clientSort==="stars"?starsHTML(c.rating,null,15,true):""}
      ${clientSort==="money"?`<div class="meta"><span class="count">${money(clientEarned(c))}</span></div>`:""}</div>
      ${tel?`<a class="callbtn" data-act="noop" href="tel:${esc(tel.replace(/\s/g,""))}" aria-label="${T("Κλήση")}">${ic("phone",19)}</a>`:""}</div>`};
  return (busy.length?sec(head)+panel(busy.map(row).join("")):"")+
    (rest.length?sec(headRest)+panel(rest.map(row).join("")):"");
}
function clientAddress(c){return[[c.street,c.number].filter(Boolean).join(" "),c.area,c.zip].filter(Boolean).join(", ")}
function navUrl(c){
  if(c.lat!=null)return`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
  const addr=clientAddress(c);if(c.street&&addr)return`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
  const L=clientLoc(c);return L?`https://www.google.com/maps/dir/?api=1&destination=${L.lat},${L.lng}`:"";
}
function entryRow(e,showClient){
  const c=e.clientId&&getClient(e.clientId);
  return `<div class="row ent ${e.cancelled?"cx":""}" data-act="editEntry" data-id="${e.id}">
    <span class="entic ${isIn(e.kind)?"in":"out"}">${isIn(e.kind)?"+":"−"}</span>
    <div class="grow"><div class="title">${kindName(e.kind)}${e.note?` <span style="font-weight:400;color:var(--muted)">${esc(e.note)}</span>`:""}</div>
    <div class="meta"><span>${fmtDay(e.date)}</span>${showClient&&c?`<span>${esc(c.name)}</span>`:""}${e.cancelled?`<span style="color:var(--red);font-weight:700">${T("ακυρώθηκε")}</span>`:""}</div></div>
    <b class="amt ${isIn(e.kind)?"in":"out"}">${isIn(e.kind)?"":"−"}${money(e.amount)}</b></div>`;
}
function vClient(){
  const c=getClient(clientId);if(!c){view="clients";return vClients()}
  const tasks=S.tasks.filter(x=>alive(x)&&x.clientId===c.id);
  const open=tasks.filter(isOpen).sort(byDue),done=tasks.filter(x=>!isOpen(x)).sort((a,b)=>((b.doneAt||b.cancelledAt||0)-(a.doneAt||a.cancelledAt||0)));
  const M=cMoney(c);
  const tel=(c.mobile||c.phone||"").replace(/\s/g,""),addr=clientAddress(c),L=clientLoc(c),nav=navUrl(c);
  let h=`<button class="back" data-act="go" data-view="clients">‹ ${T("Πελάτες")}</button>
  <div class="cl-name">${esc(c.name)}</div>${c.company?`<p class="today-sub">${esc(c.company)}</p>`:""}
  <div class="actions four">
    <a class="act ${tel?"":"off"}" data-act="noop" href="${tel?"tel:"+esc(tel):"#"}">${ic("phone",20)}${T("Κλήση")}</a>
    <a class="act ${tel?"":"off"}" data-act="noop" href="${tel?"sms:"+esc(tel):"#"}">${ic("msg",20)}${T("Μήνυμα")}</a>
    <a class="act ${nav?"":"off"}" data-act="noop" href="${nav||"#"}" target="_blank" rel="noopener">${ic("route",20)}${T("Πλοήγηση")}</a>
    <button class="act" data-act="editClient" data-id="${c.id}">${ic("edit",20)}${T("Επεξεργασία")}</button>
  </div>
  <div class="panel"><div class="starwrap"><span class="lbl">${T("Πόσο καλός πελάτης")}</span>${starsHTML(c.rating,c.id,26)}</div></div>`;
  h+=sec(T("Οικονομικά"))+panel(
    `${M.offers?`<div class="kv"><span>${T("Προσφορές σε αναμονή")}</span><b>${money(M.offers)}</b></div>`:""}
     ${M.pipeline?`<div class="kv"><span>${T("Εγκεκριμένες, σε εξέλιξη")}</span><b>${money(M.pipeline)}</b></div>`:""}
     <div class="kv"><span>${T("Ολοκληρωμένες δουλειές")}</span><b>${money(M.doneCharges)}</b></div>
     <div class="kv"><span>${T("Εισπράχθηκαν")}</span><b class="money">${money(M.received)}</b></div>
     <div class="kv"><span>${T("Οφείλει τώρα")}</span><b class="${M.owed>0?"owe":"money"}">${money(M.owed)}</b></div>
     ${M.prepaid?`<div class="kv"><span>${T("Προκαταβολές για δουλειές που δεν έκλεισαν")}</span><b class="money">${money(M.prepaid)}</b></div>`:""}
     ${M.spent?`<button class="kv" data-act="clientExpenses" data-id="${c.id}" style="width:100%;text-align:left;border:0;background:none;cursor:pointer"><span>${T("Έξοδα για αυτόν")}</span><b class="owe">${money(M.spent)}</b></button>
     <div class="kv"><span>${T("Καθαρό κέρδος")}</span><b class="money">${money(M.profit)}</b></div>`:""}
     <div class="twobtn"><button class="btn softin" data-act="newEntry" data-client="${c.id}" data-kind="advance">+ ${T("Είσπραξη")}</button>
     <button class="btn softout" data-act="newEntry" data-client="${c.id}" data-kind="material">+ ${T("Έξοδο")}</button></div>`);
  if(M.ent.length){const ents=M.ent.slice().sort(byNewest);
    h+=panel(`<div class="kvhead" style="padding:10px 14px 0;font-size:12.5px;font-weight:700;color:var(--muted)">${T("Τελευταία κίνηση")}</div>`+entryRow(ents[0],false)+
      (ents.length>1?`<button class="btn ghost wide" data-act="clientEntries" data-id="${c.id}" style="margin:4px 14px 12px;width:calc(100% - 28px)">${ic("money",18)} ${T("Όλες οι κινήσεις")} (${ents.length})</button>`:""))}
  const info=[];
  if(addr)info.push([T("Διεύθυνση"),addr]);if(c.floor)info.push([T("Όροφος, κουδούνι"),c.floor]);
  if(c.hours)info.push([T("Ωράριο"),c.hours]);if(c.mobile)info.push([T("Κινητό"),c.mobile]);if(c.phone)info.push([T("Σταθερό"),c.phone]);
  if(c.email)info.push([T("Ηλεκτρονικό ταχυδρομείο"),c.email]);if(c.afm)info.push([T("ΑΦΜ"),c.afm]);
  info.push([T("Θέση στις διαδρομές"),c.lat!=null?T("Ακριβής"):L?T("Κέντρο περιοχής {a}",{a:L.label}):T("Χωρίς θέση")]);
  h+=sec(T("Διευθύνσεις"))+panel(clientAddrList(c).map((pl,k)=>{
      const PL=k===0?clientLoc(c):placeLoc(pl),txt=placeText(pl);
      const nav=PL?`https://www.google.com/maps/dir/?api=1&destination=${PL.lat},${PL.lng}`:(txt?`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(txt)}`:"");
      return `<div class="row" ${k===0?`data-act="editClient" data-id="${c.id}"`:`data-act="editPlace" data-id="${c.id}" data-i="${k-1}"`} style="align-items:center">
        <span style="color:var(--loc)">${ic(k===0?"home":"pin",20)}</span>
        <div class="grow"><div class="title">${esc(pl.label||T("Διεύθυνση"))} ${PL?"":`<span class="tag noloc">${T("Χωρίς θέση")}</span>`}</div>
        <div class="meta"><span>${esc(txt||T("δεν έχει συμπληρωθεί"))}</span>${pl.floor?`<span>${esc(pl.floor)}</span>`:""}</div></div>
        ${nav?`<a class="goto" data-act="noop" href="${nav}" target="_blank" rel="noopener" aria-label="${T("Πλοήγηση")}">${ic("route",19)}</a>`:""}</div>`}).join("")+
      `<div class="twobtn"><button class="btn ghost" data-act="newPlace" data-id="${c.id}">+ ${T("Άλλη διεύθυνση")}</button>
       <button class="btn ghost" data-act="findLoc" data-id="${c.id}">${ic("search",18)} ${T("Βρες θέση")}</button></div>
       <div style="padding:0 14px 14px"><button class="contactsbtn" data-act="syncContact" data-id="${c.id}" style="margin:0"><span class="cicon">${ic("book",19)}</span>${T("Ανανέωση από τις επαφές του κινητού")}</button></div>`);
  h+=panel(fotoBtnHTML("pelatis:"+c.id,c.name));
  if(Array.isArray(c.photos)&&c.photos.length)
    h+=sec(T("Φωτογραφίες"))+`<div class="panel pad"><div class="phogrid" id="cphogrid"></div></div>`;
  h+=sec(T("Στοιχεία"))+panel(info.map(([k,v])=>`<div class="kv"><span>${k}</span><b>${esc(v)}</b></div>`).join(""));
  if(c.notes)h+=sec(T("Σημειώσεις"))+panel(`<div class="notes">${esc(c.notes)}</div>`);
  h+=sec(T("Ανοιχτές εργασίες"))+
    `<button class="btn amber wide gobtn" style="margin:0 0 8px" data-act="newTask" data-client="${c.id}">${ic("plus",20)}${T("Καταχώρηση νέας εργασίας")}</button>`+
    panel(open.length?open.map(x=>taskRow(x,false,false,true)).join(""):`<div class="empty">${T("Καμία ανοιχτή εργασία για αυτόν τον πελάτη.")}</div>`);
  {const no=offersCount(c.id);if(no)h+=`<button class="btn ghost wide" data-act="offerArchive" data-client="${c.id}" style="margin:12px 0 0">${ic("archive",18)} ${T("Προσφορές σε αυτόν τον πελάτη")} (${no})</button>`}
  h+=sec(T("Ιστορικό δουλειών"))+panel(done.length?done.map(x=>`<div class="row" data-act="editTask" data-id="${x.id}">
      <div class="grow"><div class="title">${esc(x.title)}</div>
      <div class="meta"><span>${T("Ολοκληρώθηκε")} ${fmtDay(x.doneAt||x.end||x.start)}</span>${x.amount?`<span>${money(x.amount)}</span>`:""}</div>
      ${x.desc?`<div class="snip">${esc(x.desc.length>140?x.desc.slice(0,140)+"…":x.desc)}</div>`:""}</div>
      ${x.amount?(x.paid?`<button class="minibtn" data-act="unsettle" data-id="${x.id}" title="${T("Αναίρεση εξόφλησης")}">${T("Εξοφλήθηκε")} ✕</button>`:`<button class="minibtn full" data-act="settleTask" data-id="${x.id}">${T("Εξοφλήθηκε")}</button>`):""}</div>`).join(""):`<div class="empty">${T("Δεν υπάρχουν ακόμα ολοκληρωμένες δουλειές.")}</div>`);
  h+=sec(T("Σύνοψη δουλειών"))+panel(
    `<div class="kv"><span>${T("Δουλειές συνολικά")}</span><b>${tasks.length}</b></div>
     <div class="kv"><span>${T("Ανοιχτές")}</span><b>${open.length}</b></div>
     <div class="kv"><span>${T("Ολοκληρωμένες")}</span><b>${done.length}</b></div>`);
  return h;
}

/* ---------- Εργασίες ---------- */
function vTasks(){
  const F=[["open","Ανοιχτές"],["today","Σήμερα"],["late","Εκπρόθεσμες"],["waiting","Προσφορές"],["noloc","Χωρίς τοποθεσία"],["done","Ολοκληρωμένες"],["cancelled","Ακυρωμένες"],["all","Όλες"]];
  const list=S.tasks.filter(alive).filter(x=>taskFilter==="open"?isOpen(x):taskFilter==="today"?isOpen(x)&&touchesToday(x):taskFilter==="late"?taskState(x)==="late":taskFilter==="waiting"?isWaiting(x):taskFilter==="someday"?isSomeday(x):taskFilter==="noloc"?isOpen(x)&&!taskLoc(x):taskFilter==="cancelled"?x.status==="cancelled":taskFilter==="done"?x.status==="done":true)
    .sort(taskFilter==="done"?(a,b)=>(b.doneAt||0)-(a.doneAt||0):byDue);
  let h=`<button class="filterbar" data-act="filterSheet" data-kind="tasks">${ic("filter",18)}<span>${T(F.find(x=>x[0]===taskFilter)[1])}</span><i>▾</i><b class="fcnt">${list.length}</b></button>`;
  if(taskFilter==="waiting"||taskFilter==="all")h+=`<button class="btn ghost wide" data-act="offerArchive" style="margin:0 0 10px">${ic("archive",18)} ${T("Αρχείο προσφορών")} (${offersCount()})</button>`;
  if(!list.length)return h+panel(`<div class="empty">${S.tasks.length?T("Καμία εργασία σε αυτή την προβολή."):T("Δεν έχεις εργασίες ακόμα. Πάτα + για να προσθέσεις.")}</div>`);
  if(groupByArea){
    const g=new Map();list.forEach(x=>{const L=taskLoc(x),k=L?L.label:T("Χωρίς τοποθεσία");if(!g.has(k))g.set(k,[]);g.get(k).push(x)});
    [...g.entries()].sort((a,b)=>b[1].length-a[1].length).forEach(([k,ts])=>{h+=sec(`${esc(k)} (${ts.length})`)+panel(ts.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""))});
  }else h+=panel(list.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""));
  return h;
}

/* ---------- Ταμείο ---------- */
let moneyPeriod="month";
const PERIODS=[["month","Αυτόν τον μήνα"],["quarter","Τελευταίο τρίμηνο"],["half","Τελευταίο εξάμηνο"],["year","Φέτος"],["all","Όλα"]];
function moneyDataYears(){
  const ys=new Set();
  S.ledger.filter(alive).forEach(e=>{if(e.date)ys.add(new Date(e.date).getFullYear())});
  S.tasks.filter(alive).forEach(x=>{if(x.doneAt)ys.add(new Date(x.doneAt).getFullYear())});
  const cur=new Date().getFullYear();ys.delete(cur);
  return[...ys].sort((a,b)=>b-a);
}
function periodLabel(k){
  const f=PERIODS.find(x=>x[0]===k);if(f)return T(f[1]);
  if(/^\d{4}$/.test(k))return k;
  return T(PERIODS[0][1]);
}
function periodRange(){
  const d=new Date();d.setHours(0,0,0,0);
  if(moneyPeriod==="month"){const s=new Date(d);s.setDate(1);return[s,null]}
  if(moneyPeriod==="quarter"){const s=new Date(d);s.setMonth(s.getMonth()-3);return[s,null]}
  if(moneyPeriod==="half"){const s=new Date(d);s.setMonth(s.getMonth()-6);return[s,null]}
  if(moneyPeriod==="year"){return[new Date(d.getFullYear(),0,1),null]}
  if(/^\d{4}$/.test(moneyPeriod)){const y=+moneyPeriod;return[new Date(y,0,1),new Date(y+1,0,1)]}
  return[null,null];
}
function periodStart(){return periodRange()[0]}
let moneyUnlocked=false;
function moneyLockHTML(){
  return `<div class="lockwrap">
    <div class="lockicon">${ic("shield",34)}</div>
    <h2 style="margin:14px 0 4px">${T("Το Ταμείο είναι κλειδωμένο")}</h2>
    <p class="note" style="text-align:center">${T("Γράψε τον κωδικό για να το ανοίξεις.")}</p>
    <input id="lock_pin" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="••••" class="lockinput">
    <button class="btn amber wide" id="lock_go" style="max-width:280px;margin-top:14px">${T("Άνοιγμα")}</button>
    <p class="note" style="text-align:center;max-width:290px;margin-top:20px">${T("Ξέχασες τον κωδικό; Ρυθμίσεις → Στοιχεία και ρυθμίσεις → Ταμείο.")}</p>
  </div>`;
}
function bindMoneyLock(){
  const go=()=>{
    if(val("lock_pin")===S.settings.moneyLock.pin){moneyUnlocked=true;render()}
    else{toast(T("Λάθος κωδικός."));$("#lock_pin").value="";$("#lock_pin").focus()}
  };
  $("#lock_go").onclick=go;
  $("#lock_pin").addEventListener("keydown",e=>{if(e.key==="Enter")go()});
  setTimeout(()=>$("#lock_pin")?.focus(),80);
  }
function vMoney(){
  if(S.settings.moneyLock&&S.settings.moneyLock.on&&!moneyUnlocked){
    setTimeout(bindMoneyLock,0);
    return moneyLockHTML();
  }
  const[from,to]=periodRange();
  const inRange=t=>{const x=new Date(t);return(!from||x>=from)&&(!to||x<to)};
  const ent=S.ledger.filter(alive).filter(e=>inRange(e.date)).sort(byNewest);
  const live=ent.filter(e=>!e.cancelled);
  const income=live.filter(e=>isIn(e.kind)).reduce((s,e)=>s+e.amount,0);
  const outgo=live.filter(e=>!isIn(e.kind)).reduce((s,e)=>s+e.amount,0);
  const cm=S.clients.filter(alive).map(c=>({c,m:cMoney(c)}));
  const debts=cm.filter(x=>x.m.owed>0.004).sort((a,b)=>b.m.owed-a.m.owed);
  const all=moneyBuckets(S.tasks.filter(x=>alive(x)&&x.status!=="cancelled"),S.ledger.filter(alive));
  const orphans=orphanOwed();
  // Η οφειλή αθροίζεται πελάτη-πελάτη, ποτέ σε ένα ενιαίο υπόλοιπο· αλλιώς μια προκαταβολή
  // σε έναν πελάτη θα μπορούσε να «σβήσει» λογιστικά την οφειλή ενός εντελώς άλλου.
  const owed=rnd(cm.reduce((s,x)=>s+x.m.owed,0)+orphans.reduce((s,o)=>s+o.owe,0));
  let h=`<button class="filterbar" data-act="filterSheet" data-kind="money">${ic("filter",18)}<span>${periodLabel(moneyPeriod)}</span><i>▾</i></button>
  <div class="sum3">
    <button class="sumcard" data-act="explain" data-k="income"><span>${T("Έσοδα")}</span><b class="in">${money0(income)}</b></button>
    <button class="sumcard" data-act="explain" data-k="outgo"><span>${T("Έξοδα")}</span><b class="out">${money0(outgo)}</b></button>
    <button class="sumcard" data-act="explain" data-k="profit"><span>${T("Κέρδος")}</span><b>${money0(income-outgo)}</b></button>
  </div>
  <div class="sum3">
    <button class="sumcard" data-act="explain" data-k="owed"><span>${T("Σου χρωστάνε")}</span><b class="out">${money0(owed)}</b></button>
    <button class="sumcard" data-act="explain" data-k="pipeline"><span>${T("Σε εκκρεμότητα")}</span><b>${money0(all.pipeline)}</b></button>
    <button class="sumcard" data-act="explain" data-k="offers"><span>${T("Προσφορές")}</span><b>${money0(all.offers)}</b></button>
  </div>
  <div class="twobtn" style="padding:10px 0 0"><button class="btn softin" data-act="newEntry" data-kind="payment">+ ${T("Έσοδο")}</button>
  <button class="btn softout" data-act="newEntry" data-kind="expense">+ ${T("Έξοδο")}</button></div>`;
  h+=sec(T("Τελευταίοι 6 μήνες"))+panel(`<div class="chartlegend"><span><i class="dot in"></i>${T("Έσοδα")}</span><span><i class="dot out"></i>${T("Έξοδα")}</span></div>${monthlyChartHTML()}`);
  h+=`<button class="btn ghost wide" data-act="stats" style="margin:0 0 4px">${ic("bars",18)} ${T("Στατιστικά πελατών και περιοχών")}</button>`;
  const orphanRow=orphans.length?`<div class="row" data-act="orphanDebts" style="align-items:center">
      <div class="avatar">${ic("edit",18)}</div><div class="grow"><div class="title">${T("Χωρίς πελάτη")}</div>
      <div class="meta"><span>${pl(orphans.length,"{n} εργασία χωρίς πελάτη","{n} εργασίες χωρίς πελάτη")}</span></div></div>
      <b class="amt out">${money(rnd(orphans.reduce((s,o)=>s+o.owe,0)))}</b></div>`:"";
  h+=(debts.length||orphans.length)?sec(T("Σου χρωστάνε"))+panel(debts.map(({c,m})=>`<div class="row" data-act="openClient" data-id="${c.id}" style="align-items:center">
      <div class="avatar">${esc(initials(c.name))}</div><div class="grow"><div class="title">${esc(c.name)}</div>
      <div class="meta"><span>${T("Ολοκληρωμένες")} ${money(m.doneCharges)}</span><span>${T("Εισπράχθηκαν")} ${money(m.received)}</span></div></div>
      <b class="amt out">${money(m.owed)}</b></div>`).join("")+orphanRow)
    :`<div class="owednone">${sec(T("Σου χρωστάνε"))}<small>✓ ${T("κανείς δεν σου χρωστάει")}</small></div>`;
  h+=`<div class="sec-row">${sec(T("Κινήσεις"))}<button class="btn ghost small" style="margin-bottom:8px" data-act="exportCsv">${ic("archive",16)} ${T("Εξαγωγή")}</button></div>`;
  // Φαίνονται οι 10 πιο πρόσφατες· όλες μαζί (ανά μήνα) σε αναδυόμενο παράθυρο.
  const entS=ent.slice().sort(byNewest);
  h+=entS.length?panel(entS.slice(0,10).map(e=>entryRow(e,true)).join("")+
      (entS.length>10?`<button class="btn ghost" data-act="allEntries" style="margin:4px 14px 12px;width:calc(100% - 28px)">${ic("money",18)} ${T("Όλες οι κινήσεις της περιόδου")} (${entS.length})</button>`:"")):
    panel(`<div class="empty">${T("Καμία κίνηση σε αυτή την περίοδο.")}</div>`);
  return h;
}
function monthlyChartHTML(){
  const now=new Date(),months=[];
  for(let i=5;i>=0;i--)months.push(new Date(now.getFullYear(),now.getMonth()-i,1));
  const data=months.map(d=>{
    const y=d.getFullYear(),m=d.getMonth();
    const ent=S.ledger.filter(e=>alive(e)&&!e.cancelled).filter(e=>{const x=new Date(e.date);return x.getFullYear()===y&&x.getMonth()===m});
    return{label:cap(d.toLocaleDateString(LOC(),{month:"short"})),
      inc:ent.filter(e=>isIn(e.kind)).reduce((s,e)=>s+e.amount,0),
      out:ent.filter(e=>!isIn(e.kind)).reduce((s,e)=>s+e.amount,0)};
  });
  const max=Math.max(1,...data.map(d=>Math.max(d.inc,d.out)));
  return `<div class="chart6">${data.map(d=>`<div class="chart6-col" title="${esc(d.label)}: ${T("Έσοδα")} ${money(d.inc)}, ${T("Έξοδα")} ${money(d.out)}">
    <div class="chart6-bars">
      <div class="chart6-bar in" style="height:${Math.max(d.inc?3:0,d.inc/max*100)}%"></div>
      <div class="chart6-bar out" style="height:${Math.max(d.out?3:0,d.out/max*100)}%"></div>
    </div>
    <span class="chart6-lbl">${d.label}</span></div>`).join("")}</div>`;
}
// Δουλειές χωρίς χρέωση / λόγω εγγύησης: εμφανίζονται στα στατιστικά μόνο αν υπάρχουν.
function freeStatsHTML(){
  const fr=S.tasks.filter(x=>alive(x)&&(x.charge==="free"||x.charge==="warranty")).sort((a,b)=>(b.doneAt||b.createdAt||0)-(a.doneAt||a.createdAt||0));
  if(!fr.length)return "";
  const nF=fr.filter(x=>x.charge==="free").length,nW=fr.length-nF,cost=fr.reduce((s,x)=>s+taskSpent(x),0);
  return sec(T("Δουλειές χωρίς χρέωση"))+panel(
    (nF?`<div class="kv"><span>${T("Χωρίς χρέωση")}</span><b>${nF}</b></div>`:"")+
    (nW?`<div class="kv"><span>${T("Χωρίς κόστος λόγω εγγύησης")}</span><b>${nW}</b></div>`:"")+
    (cost>0.004?`<div class="kv"><span>${T("Έξοδα που έγιναν για αυτές")}</span><b class="owe">${money(cost)}</b></div>`:"")+
    fr.slice(0,20).map(x=>{const c=x.clientId&&getClient(x.clientId);return `<div class="row" data-act="editTask" data-id="${x.id}" style="align-items:center">
      <div class="grow"><div class="title">${esc(x.title)}</div><div class="meta">${c?`<span>${esc(c.name)}</span>`:""}<span>${T(x.charge==="free"?"Χωρίς χρέωση":"Εγγύηση")}</span>${x.doneAt?`<span>${fmtDay(x.doneAt)}</span>`:""}</div></div></div>`}).join(""));
}
function statsSheet(){
  const cm=S.clients.filter(alive).map(c=>({c,m:cMoney(c)})).filter(x=>x.m.received>0.004).sort((a,b)=>b.m.received-a.m.received).slice(0,8);
  const areaMap=new Map();
  S.tasks.filter(x=>alive(x)&&x.status==="done").forEach(x=>{
    const c=x.clientId&&getClient(x.clientId);
    const area=(c&&c.area)||x.area||T("Άγνωστη περιοχή");
    const got=taskPaid(x),sp=taskSpent(x);
    const cur=areaMap.get(area)||{received:0,profit:0,count:0};
    cur.received+=got;cur.profit+=(got-sp);cur.count++;areaMap.set(area,cur);
  });
  const areas=[...areaMap.entries()].map(([area,v])=>({area,...v})).filter(a=>a.profit>0.004).sort((a,b)=>b.profit-a.profit).slice(0,8);
  const maxC=Math.max(1,...cm.map(x=>x.m.received)),maxA=Math.max(1,...areas.map(a=>a.profit));
  const barRow=(label,val,max,sub)=>`<div class="statrow"><div class="statlbl">${esc(label)}</div>
    <div class="statbar"><div class="statbar-fill" style="width:${Math.max(4,val/max*100)}%"></div></div>
    <b class="statval">${money0(val)}</b></div>${sub?`<div class="statsub">${esc(sub)}</div>`:""}`;
  openSheet({title:T("Στατιστικά"),cancelLabel:T("Κλείσιμο"),body:
    sec(T("Κορυφαίοι πελάτες"))+(cm.length?panel(cm.map(({c,m})=>barRow(c.name,m.received,maxC)).join("")):`<div class="empty">${T("Δεν έχεις ακόμα εισπράξεις.")}</div>`)+
    sec(T("Πιο κερδοφόρες περιοχές"))+(areas.length?panel(areas.map(a=>barRow(a.area,a.profit,maxA,pl(a.count,"{n} δουλειά","{n} δουλειές"))).join("")):`<div class="empty">${T("Δεν έχεις ακόμα ολοκληρωμένες δουλειές με κέρδος.")}</div>`)+freeStatsHTML()});
}
let moneyOpenMonths=null;
function monthKey(d){const x=new Date(d);return x.getFullYear()+"-"+pad(x.getMonth()+1)}
function monthLabel(k){const[y,m]=k.split("-");return cap(new Date(+y,+m-1,1).toLocaleDateString(LOC(),{month:"long",year:"numeric"}))}
function moneyPeriodEntries(){const[from,to]=periodRange();
  return S.ledger.filter(alive).filter(e=>{const x=new Date(e.date);return(!from||x>=from)&&(!to||x<to)})}
function allEntriesSheet(){
  const ent=moneyPeriodEntries().slice().sort(byNewest),groups=new Map();
  ent.forEach(e=>{const k=monthKey(e.date);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e)});
  openSheet({title:T("Κινήσεις")+" · "+periodLabel(moneyPeriod),cancelLabel:T("Κλείσιμο"),
    body:[...groups.entries()].map(([k,list])=>{const sum=list.reduce((s,e)=>s+(isIn(e.kind)?e.amount:-e.amount),0);
      return `<div class="sec-row">${sec(monthLabel(k)+" · "+pl(list.length,"{n} κίνηση","{n} κινήσεις"))}<b class="msum ${sum>=0?"in":"out"}" style="margin-bottom:8px">${sum>=0?"+":"−"}${money0(Math.abs(sum))}</b></div>`+
        panel(list.map(e=>entryRow(e,true)).join(""))}).join("")||panel(`<div class="empty">${T("Καμία κίνηση σε αυτή την περίοδο.")}</div>`)});
}
function moneyEntriesHTML(ent){
  if(!ent.length)return panel(`<div class="empty">${T("Καμία κίνηση σε αυτή την περίοδο.")}</div>`);
  const groups=new Map();
  ent.forEach(e=>{const k=monthKey(e.date);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e)});
  if(groups.size<=1)return panel(ent.map(e=>entryRow(e,true)).join(""));
  if(!moneyOpenMonths)moneyOpenMonths=new Set([[...groups.keys()][0]]);
  return[...groups.entries()].map(([k,list])=>{
    const open=moneyOpenMonths.has(k);
    const sum=list.reduce((s,e)=>s+(isIn(e.kind)?e.amount:-e.amount),0);
    return `<button class="monthhead" data-act="toggleMonth" data-mk="${k}"><b>${monthLabel(k)}</b>
        <span class="mcnt">${pl(list.length,"{n} κίνηση","{n} κινήσεις")}</span>
        <span class="msum ${sum>=0?"in":"out"}">${sum>=0?"+":"−"}${money0(Math.abs(sum))}</span>
        <i class="mchev">${open?"▾":"▸"}</i></button>`+
      (open?panel(list.map(e=>entryRow(e,true)).join("")):"");
  }).join("");
}
function entryForm(e,preset){
  const isNew=!e;
  const ptask=preset&&preset.task?S.tasks.find(x=>x.id===preset.task):null;
  const presetKind=(preset&&preset.kind)||"payment";
  e=e||{kind:presetKind,clientId:(preset&&preset.client)||(ptask&&ptask.clientId)||"",date:new Date().toISOString(),
    taskId:ptask?ptask.id:null,note:ptask?ptask.title:"",amount:""};
  let dir=getKind(e.kind).dir;
  const rest=ptask?Math.max(0,rnd((+ptask.amount||0)-taskPaid(ptask))):0;
  const settle=!!(preset&&preset.settle);
  const opts=S.clients.filter(alive).sort((a,b)=>a.name.localeCompare(b.name,"el")).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");
  const back=preset&&preset.back;
  const kindList=d=>kinds().filter(k=>k.dir===d);
  const pickRow=(id,name,cur)=>`<button type="button" class="pickrow ${id===cur?"on":""}" data-kpick="${id}">${esc(name)}${id===cur?'<span class="tick">✓</span>':""}</button>`;
  openSheet({title:isNew?(settle?T("Είσπραξη και εξόφληση"):T("Νέα κίνηση")):T("Επεξεργασία κίνησης"),
    saveLabel:isNew?T("Καταχώρηση"):T("Αποθήκευση"),saveStyle:isNew?"amber":"primary",
    saveClass:isNew?"pulseSave":"",
    cancelLabel:back?T("Πίσω"):T("Άκυρο"),onCancel:back||null,
    body:`<div class="seg dirseg" id="e_dir"><button type="button" data-v="in">${T("Έσοδο")}</button><button type="button" data-v="out">${T("Έξοδο")}</button></div>
    <label for="e_note">${T("Τι ήταν;")}</label>
    <div class="inrow"><input id="e_note" value="${esc(e.note)}" placeholder="${T("π.χ. Τσιμέντο, προκαταβολή…")}" autocomplete="off">
      <button type="button" class="pickbtn narrow" id="e_kindBtn" aria-label="${T("Κατηγορία")}"></button></div>
    <div class="pickbox" id="e_kindBox" hidden></div>
    <label for="e_amount">${T("Ποσό")}</label>
    <span class="curr"><b>€</b><input id="e_amount" inputmode="decimal" placeholder="0,00" value="${isNew?"":(e.amount??"")}" autocomplete="off"></span>
    ${isNew&&rest>0?`<div class="quick"><button type="button" id="e_all">${T("Όλο το υπόλοιπο")} ${money(rest)}</button>
      <button type="button" id="e_zero">${T("Μηδέν, δεν πήρα χρήματα")}</button></div>`:""}
    <label for="e_date">${T("Ημερομηνία")}</label><input type="date" id="e_date" value="${new Date(e.date).toISOString().slice(0,10)}">
    <label for="e_client">${T("Πελάτης")}</label><select id="e_client"><option value="">${T("Χωρίς πελάτη")}</option>${opts}</select>
    ${e.taskId&&S.tasks.find(x=>x.id===e.taskId)?`<p class="note">${T("Συνδέεται με την εργασία")}: ${esc(S.tasks.find(x=>x.id===e.taskId).title)}</p>`:""}
    <label class="toggle"><input type="checkbox" id="e_cx" ${e.cancelled?"checked":""}>${T("Ακυρώθηκε, δεν μετράει στα σύνολα")}</label>`,
    onSave:()=>{
      const raw=val("e_amount").replace(",",".");
      if(raw===""||isNaN(+raw)||+raw<0){toast(T("Γράψε ποσό. Μπορεί να είναι και 0."));$("#e_amount").focus();return false}
      const d={kind:e.kind,amount:+raw,date:new Date(val("e_date")||Date.now()).toISOString(),clientId:val("e_client")||null,note:val("e_note"),
        taskId:e.taskId||null,cancelled:$("#e_cx").checked};
      if(isNew){d.id=uid();d.createdAt=Date.now();S.ledger.push(d)}else Object.assign(e,d);
      // αν καλύφθηκε η τιμή της εργασίας, σημειώνεται εξοφλημένη
      const tk=S.tasks.find(x=>x.id===d.taskId);
      if(tk){const got=taskPaid(tk),amt=+tk.amount||0;
        if(amt>0&&got+0.004>=amt){tk.paid=true;tk.paidAt=Date.now()}else tk.paid=false}
      persist();render();toast(isNew?T("Η κίνηση καταχωρήθηκε."):T("Οι αλλαγές αποθηκεύτηκαν."));
      if(back){back();return"replaced"}
    },
    onDelete:isNew?null:()=>{trash(e,kindName(e.kind)+" "+money(e.amount));
      const tk=S.tasks.find(x=>x.id===e.taskId);if(tk){const amt=+tk.amount||0;tk.paid=amt>0&&taskPaid(tk)+0.004>=amt}
      if(back){back();return"replaced"}},deleteMsg:T("Να πάει η κίνηση στον κάδο;")});
  const tipsFor=()=>dir==="in"?S.settings.noteTipsIn:S.settings.noteTipsOut;
  const drawKind=()=>{
    const list=kindList(dir),tips=tipsFor();
    if(!list.some(k=>k.id===e.kind))e.kind=(list[0]||{}).id||e.kind;
    const btn=$("#e_kindBtn");btn.className="pickbtn narrow "+(dir==="in"?"in":"out");
    btn.innerHTML="▾";btn.title=T(getKind(e.kind).name);
    $("#e_kindBox").innerHTML=
      `<div class="picksec">${T("Κατηγορία")}</div>`+
      (list.map(x=>pickRow(x.id,T(x.name),e.kind)).join("")||`<p class="note">${T("Δεν έχεις είδη εδώ.")}</p>`)+
      `<button type="button" class="pickrow editrow" data-editkinds="1">${ic("edit",16)} ${T("Επεξεργασία ειδών")}</button>`+
      (tips.length?`<div class="picksec">${T("Γρήγορη σημείωση")}</div>`+tips.map(t=>`<button type="button" class="pickrow" data-tip="${esc(T(t))}">${esc(T(t))}</button>`).join(""):"")+
      `<button type="button" class="pickrow editrow" data-edittips="1">${ic("edit",16)} ${T("Επεξεργασία προτάσεων")} (${dir==="in"?T("έσοδα"):T("έξοδα")})</button>`;
    $("#e_dir").querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.v===dir));
  };
  $("#e_dir").onclick=ev=>{const b=ev.target.closest("[data-v]");if(!b)return;dir=b.dataset.v;drawKind();sheetDirty=true};
  $("#e_kindBtn").onclick=()=>{const x=$("#e_kindBox");x.hidden=!x.hidden};
  $("#e_kindBox").onclick=ev=>{
    if(ev.target.closest("[data-editkinds]")){const cur={e,preset};kindsSheet(()=>entryForm(cur.e.id?cur.e:null,cur.preset));return}
    if(ev.target.closest("[data-edittips]")){const cur={e,preset,dir};tipsSheet(cur.dir,null,()=>entryForm(cur.e.id?cur.e:null,cur.preset));return}
    const t=ev.target.closest("[data-tip]");
    if(t){$("#e_note").value=t.dataset.tip;$("#e_kindBox").hidden=true;sheetDirty=true;return}
    const b=ev.target.closest("[data-kpick]");if(!b)return;
    e.kind=b.dataset.kpick;$("#e_kindBox").hidden=true;
    const ni=$("#e_note");if(!ni.value.trim())ni.value=T(getKind(e.kind).name);
    drawKind();sheetDirty=true};
  drawKind();
  $("#e_client").value=e.clientId||"";
  if($("#e_all"))$("#e_all").onclick=()=>{$("#e_amount").value=String(rest).replace(".",",");sheetDirty=true};
  if($("#e_zero"))$("#e_zero").onclick=()=>{$("#e_amount").value="0";sheetDirty=true};
  if(!isNew){let t=null;const auto=()=>{clearTimeout(t);t=setTimeout(()=>{
    const raw=val("e_amount").replace(",",".");if(raw===""||isNaN(+raw)||+raw<0)return;
    Object.assign(e,{kind:e.kind,amount:+raw,date:new Date(val("e_date")||Date.now()).toISOString(),
      clientId:val("e_client")||null,note:val("e_note"),cancelled:$("#e_cx").checked});
    const tk=S.tasks.find(x=>x.id===e.taskId);if(tk){const amt=+tk.amount||0;tk.paid=amt>0&&taskPaid(tk)+0.004>=amt}
    write()},600)};
    $("#shBody").addEventListener("input",auto);$("#shBody").addEventListener("change",auto)}
}

function bizSheet(){
  const b=S.settings.biz||(S.settings.biz={name:"",afm:"",phone:"",address:""});
  openSheet({title:T("Στοιχεία επιχείρησης"),cancelLabel:T("Πίσω"),onCancel:()=>settingsSheet("work"),
    saveLabel:T("Αποθήκευση"),
    body:`<p class="note">${T("Εμφανίζονται στην κορυφή κάθε ψηφιακής απόδειξης που στέλνεις.")}</p>
    <label for="biz_name">${T("Επωνυμία")}</label><input id="biz_name" value="${esc(b.name)}" placeholder="${T("π.χ. Γλεντζάκης Τεχνικές Εργασίες")}">
    <label for="biz_afm">${T("ΑΦΜ")}</label><input id="biz_afm" inputmode="numeric" value="${esc(b.afm)}">
    <label for="biz_phone">${T("Τηλέφωνο")}</label><input id="biz_phone" type="tel" value="${esc(b.phone)}">
    <label for="biz_address">${T("Διεύθυνση")}</label><input id="biz_address" value="${esc(b.address)}">`,
    onSave:()=>{b.name=val("biz_name");b.afm=val("biz_afm");b.phone=val("biz_phone");b.address=val("biz_address");
      write();toast(T("Τα στοιχεία αποθηκεύτηκαν."));settingsSheet("work")}});
}
function taskTipsSheet(back){
  const tips=S.settings.taskTips;
  openSheet({title:T("Προτάσεις τίτλου εργασίας"),cancelLabel:back?T("Πίσω"):T("Κλείσιμο"),onCancel:back||null,
    body:panel(tips.map((t,i)=>`<div class="row listedit" style="align-items:center">
        <div class="grow title">${esc(T(t))}</div>
        <button class="mv" data-tipmv2="${i}" data-dir="up">▲</button><button class="mv" data-tipmv2="${i}" data-dir="down">▼</button>
        <button class="x bin" data-tipdel2="${i}" aria-label="${T("Διαγραφή")}">${ic("trash",18)}</button></div>`).join("")||`<div class="empty">${T("Δεν έχεις προτάσεις ακόμα.")}</div>`)+
      `<div class="inrow" style="margin-top:10px"><input id="tip2_new" placeholder="${T("Νέα πρόταση, π.χ. Ραντεβού")}"><button class="btn ghost" id="tip2_add">${T("Προσθήκη")}</button></div>`});
  $("#shBody").onclick=e=>{
    const m=e.target.closest("[data-tipmv2]"),d=e.target.closest("[data-tipdel2]");
    if(m){const i=+m.dataset.tipmv2,j=i+(m.dataset.dir==="up"?-1:1);if(j<0||j>=tips.length)return;[tips[i],tips[j]]=[tips[j],tips[i]];write();taskTipsSheet(back);return}
    if(d){const i=+d.dataset.tipdel2;if(!confirm(T("Να σβηστεί;")))return;tips.splice(i,1);write();taskTipsSheet(back)}
  };
  $("#tip2_add").onclick=()=>{const v=val("tip2_new");if(!v)return;tips.push(v);write();taskTipsSheet(back)};
}
function compressImage(file,maxDim,quality){
  return new Promise((resolve,reject)=>{
    const rd=new FileReader();
    rd.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width,h=img.height;const scale=Math.min(1,maxDim/Math.max(w,h));
        w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));
        const cv=document.createElement("canvas");cv.width=w;cv.height=h;
        cv.getContext("2d").drawImage(img,0,0,w,h);
        resolve(cv.toDataURL("image/jpeg",quality));
      };
      img.onerror=()=>reject(new Error("img"));img.src=rd.result;
    };
    rd.onerror=()=>reject(new Error("read"));rd.readAsDataURL(file);
  });
}
const PHLBL={before:"Πριν",after:"Μετά"};
function drawTaskPhotos(x){
  const box=$("#phogrid");if(!box)return;
  if(!Array.isArray(x.photos))x.photos=[];
  box.innerHTML=x.photos.map((ph,i)=>`<button type="button" class="phothumb" data-ph="${i}">
      <img src="${ph.dataUrl}" alt="">${ph.label?`<span class="pholbl">${T(PHLBL[ph.label]||"")}</span>`:""}</button>`).join("")+
    `<label class="phoadd"><input type="file" id="pho_file" accept="image/*" multiple hidden>${ic("plus",22)}</label>`;
  $("#pho_file").onchange=async e=>{
    const files=[...e.target.files];e.target.value="";if(!files.length)return;
    toast(pl(files.length,"Επεξεργασία {n} φωτογραφίας…","Επεξεργασία {n} φωτογραφιών…"));
    for(const f of files){
      try{const url=await compressImage(f,1024,.68);x.photos.push({id:uid(),dataUrl:url,label:"",at:Date.now()})}
      catch(err){toast(T("Μια φωτογραφία δεν φορτώθηκε."))}
    }
    write();drawTaskPhotos(x);toast(pl(files.length,"Προστέθηκε {n} φωτογραφία.","Προστέθηκαν {n} φωτογραφίες."));
  };
  box.querySelectorAll("[data-ph]").forEach(b=>b.onclick=()=>openPhotoView(x,+b.dataset.ph));
}
function drawClientPhotos(c){
  const box=$("#cphogrid");if(!box)return;
  if(!Array.isArray(c.photos))c.photos=[];
  box.innerHTML=c.photos.map((ph,i)=>`<button type="button" class="phothumb" data-cph="${i}">
      <img src="${ph.dataUrl}" alt="">${ph.fromFoto?`<span class="pholbl">${T("με μετρήσεις")}</span>`:""}</button>`).join("")+
    `<label class="phoadd"><input type="file" id="cpho_file" accept="image/*" multiple hidden>${ic("plus",22)}</label>`;
  $("#cpho_file").onchange=async e=>{
    const files=[...e.target.files];e.target.value="";if(!files.length)return;
    for(const f of files){try{const url=await compressImage(f,1024,.68);c.photos.push({id:uid(),dataUrl:url,label:"",at:Date.now()})}catch(err){}}
    write();drawClientPhotos(c);toast(pl(files.length,"Προστέθηκε {n} φωτογραφία.","Προστέθηκαν {n} φωτογραφίες."));
  };
  box.querySelectorAll("[data-cph]").forEach(b=>b.onclick=()=>openClientPhoto(c,+b.dataset.cph));
}
function openClientPhoto(c,i){
  const ph=c.photos[i];if(!ph)return;
  $("#phImg").src=ph.dataUrl;$("#phT").textContent=c.name;
  $("#phBot").innerHTML=`<span class="grow"></span><button class="btn danger" id="cph_del">${ic("trash",18)} ${T("Διαγραφή")}</button>`;
  $("#cph_del").onclick=()=>{if(!confirm(T("Να διαγραφεί η φωτογραφία;")))return;
    c.photos.splice(i,1);write();closePhotoView();render();toast(T("Διαγράφηκε."))};
  $("#photoDlg").classList.add("open");
}
function openPhotoView(x,i){
  const ph=x.photos[i];if(!ph)return;
  $("#phImg").src=ph.dataUrl;$("#phT").textContent=x.title;
  $("#phBot").innerHTML=`<div class="seg" id="ph_lbl" style="flex:1">
      <button type="button" data-v="">${T("Καμία")}</button>
      <button type="button" data-v="before">${T("Πριν")}</button>
      <button type="button" data-v="after">${T("Μετά")}</button></div>
    <button class="btn danger" id="ph_del" aria-label="${T("Διαγραφή")}">${ic("trash",18)}</button>`;
  segBind("ph_lbl",ph.label||"");
  $("#ph_lbl")._on=v=>{ph.label=v;write();drawTaskPhotos(x)};
  $("#ph_del").onclick=()=>{if(!confirm(T("Να διαγραφεί η φωτογραφία;")))return;
    x.photos.splice(i,1);write();closePhotoView();drawTaskPhotos(x)};
  $("#photoDlg").classList.add("open");
}
const photoOpen=()=>$("#photoDlg").classList.contains("open");
function closePhotoView(){$("#photoDlg").classList.remove("open")}
$("#phX").onclick=closePhotoView;
$("#photoDlg").addEventListener("click",e=>{if(e.target.id==="photoDlg")closePhotoView()});

function tipsListHTML(list,dd){
  return panel(list.map((t,i)=>`<div class="row listedit" style="align-items:center">
      <button class="grow" data-tip="${i}" data-tipdir="${dd}" style="text-align:left;background:none;border:0;font-weight:700;font-size:15.5px;color:var(--ink)">${esc(T(t))}</button>
      <button class="mv" data-tipmv="${i}" data-tipdir="${dd}" data-mvdir="up">▲</button><button class="mv" data-tipmv="${i}" data-tipdir="${dd}" data-mvdir="down">▼</button>
      <button class="x bin" data-tipdel="${i}" data-tipdir="${dd}" aria-label="${T("Διαγραφή")}">${ic("trash",18)}</button></div>`).join("")||`<div class="empty">${T("Δεν έχεις έτοιμες σημειώσεις.")}</div>`)+
    `<div class="inrow" style="margin:8px 0 4px"><input id="tip_new_${dd}" placeholder="${T("Νέα έτοιμη σημείωση")}"><button class="btn ghost" data-tipadd="${dd}">${T("Προσθήκη")}</button></div>`;
}
function tipsSheet(dir,pick,back){
  const solo=dir==="in"||dir==="out";
  openSheet({title:solo?T(dir==="in"?"Προτάσεις εσόδων":"Προτάσεις εξόδων"):T("Έτοιμες σημειώσεις"),cancelLabel:back?T("Πίσω"):T("Κλείσιμο"),onCancel:back||null,
    body:solo?tipsListHTML(dir==="in"?S.settings.noteTipsIn:S.settings.noteTipsOut,dir):
      sec(T("Έσοδα"))+tipsListHTML(S.settings.noteTipsIn,"in")+sec(T("Έξοδα"))+tipsListHTML(S.settings.noteTipsOut,"out")});
  $("#shBody").onclick=e=>{
    const p=e.target.closest("[data-tip]"),m=e.target.closest("[data-tipmv]"),d=e.target.closest("[data-tipdel]"),a=e.target.closest("[data-tipadd]");
    if(p){const tips=p.dataset.tipdir==="in"?S.settings.noteTipsIn:S.settings.noteTipsOut;const t=T(tips[+p.dataset.tip]);closeSheet();if(pick)pick(t);if(back)back();return}
    if(m){const tips=m.dataset.tipdir==="in"?S.settings.noteTipsIn:S.settings.noteTipsOut;const i=+m.dataset.tipmv,j=i+(m.dataset.mvdir==="up"?-1:1);
      if(j<0||j>=tips.length)return;[tips[i],tips[j]]=[tips[j],tips[i]];write();tipsSheet(dir,pick,back);return}
    if(d){const tips=d.dataset.tipdir==="in"?S.settings.noteTipsIn:S.settings.noteTipsOut;const i=+d.dataset.tipdel;if(!confirm(T("Να σβηστεί;")))return;tips.splice(i,1);write();tipsSheet(dir,pick,back);return}
    if(a){const tips=a.dataset.tipadd==="in"?S.settings.noteTipsIn:S.settings.noteTipsOut;const v=val("tip_new_"+a.dataset.tipadd);if(!v)return;tips.push(v);write();tipsSheet(dir,pick,back)}
  };
}
// Είδη που χρησιμοποιεί η ίδια η εφαρμογή (εξόφληση, προκαταβολή κ.λπ.): δεν σβήνονται και δεν αλλάζουν κατεύθυνση.
const KIND_LOCKED=new Set(["advance","payment","extra","material"]);
function kindsSheet(back){
  const ks=kinds();
  const used=k=>S.ledger.filter(en=>en.kind===k.id).length;
  openSheet({title:T("Είδη κινήσεων"),cancelLabel:T("Πίσω"),onCancel:back||null,
    body:`<div class="inrow" style="margin-bottom:10px"><input id="k_new" placeholder="${T("Νέο είδος, π.χ. Υλικά")}" autocomplete="off"><button class="btn amber" id="k_add">${T("Προσθήκη")}</button></div>
      <p class="note">${T("Άλλαξε ονόματα, σειρά και αν είναι έσοδο ή έξοδο. Το νέο μπαίνει ως έξοδο, πάτα «Έσοδο/Έξοδο» για να το αλλάξεις.")}</p>
      <p class="note">${T("🔒 = βασικό είδος που χρησιμοποιεί η εφαρμογή στους υπολογισμούς, δεν σβήνεται. Ο αριθμός δείχνει σε πόσες κινήσεις χρησιμοποιείται ένα είδος· όσο χρησιμοποιείται, δεν σβήνεται.")}</p>`+
      panel(ks.map((k,i)=>`<div class="kindrow">
        <input class="kname" data-i="${i}" value="${esc(k.name)}" autocomplete="off">
        <div class="kindacts">
          <button class="dirbtn ${k.dir}" ${KIND_LOCKED.has(k.id)?"disabled":`data-kdir="${i}"`}>${k.dir==="in"?T("Έσοδο"):T("Έξοδο")}</button>
          <span class="grow"></span>
          <button class="mv" data-kmv="${i}" data-dir="up">▲</button><button class="mv" data-kmv="${i}" data-dir="down">▼</button>
          ${KIND_LOCKED.has(k.id)?`<span class="klock" title="${T("Βασικό είδος της εφαρμογής, δεν σβήνεται")}">🔒</span>`
            :used(k)?`<span class="klock" title="${T("Χρησιμοποιείται σε κινήσεις, δεν σβήνεται")}">${used(k)}</span>`
            :ks.length>2?`<button class="x bin" data-kdel="${i}" aria-label="${T("Διαγραφή")}">${ic("trash",18)}</button>`:""}
        </div></div>`).join(""))+
      ""});
  $("#shBody").addEventListener("change",e=>{const n=e.target.closest(".kname");if(n){ks[+n.dataset.i].name=n.value.trim()||T("Κίνηση");write();render()}});
  $("#shBody").addEventListener("click",e=>{
    const d=e.target.closest("[data-kdir]"),m=e.target.closest("[data-kmv]"),x=e.target.closest("[data-kdel]");
    if(d){const k=ks[+d.dataset.kdir];k.dir=k.dir==="in"?"out":"in";write();render();kindsSheet(back);return}
    if(m){const i=+m.dataset.kmv,j=i+(m.dataset.dir==="up"?-1:1);if(j<0||j>=ks.length)return;[ks[i],ks[j]]=[ks[j],ks[i]];write();kindsSheet(back);return}
    if(x){const i=+x.dataset.kdel,k=ks[i];
      if(S.ledger.some(en=>en.kind===k.id)){toast(T("Υπάρχουν κινήσεις με αυτό το είδος. Άλλαξε πρώτα το όνομά του."));return}
      if(!confirm(T("Να σβηστεί το είδος;")))return;ks.splice(i,1);write();kindsSheet(back)}
  });
  $("#k_add").onclick=()=>{const v=val("k_new");if(!v)return;
    if(ks.some(k=>norm(k.name)===norm(v)))return toast(T("Υπάρχει ήδη είδος με αυτό το όνομα."));
    ks.push({id:uid(),name:v,dir:"out"});write();kindsSheet(back);
    setTimeout(()=>toast(T("Προστέθηκε: {n}",{n:v})),60)};
  $("#k_new").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("#k_add").click()}});
}

