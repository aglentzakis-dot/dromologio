/* Δρομολόγιο — Χρόνος εργασιών, προβολή, γραμμές λίστας, «Σήμερα». */
/* ---------- Χρόνος εργασιών ---------- */
function taskState(x){if(x.status==="cancelled")return"cancelled";if(x.status==="done")return"done";
  if(x.status==="waiting")return"waiting";if(x.status==="someday")return"someday";if(x.end&&new Date(x.end)<new Date())return"late";return x.status}
const isWaiting=x=>x.status==="waiting";
const isSomeday=x=>x.status==="someday";
function touchesToday(x){
  const sod=new Date();sod.setHours(0,0,0,0);const eod=new Date(sod);eod.setDate(eod.getDate()+1);
  const s=x.start?new Date(x.start):null,e=x.end?new Date(x.end):null;
  if(s&&e)return s<eod&&e>=sod;if(s)return s>=sod&&s<eod;if(e)return e>=sod&&e<eod;return false;
}
const dueTime=x=>x.end?+new Date(x.end):x.start?+new Date(x.start):Infinity;
const rank=x=>isSomeday(x)?2:isWaiting(x)?1:0;
const sortKey=x=>[
  (x.end&&new Date(x.end)<new Date())?0:1, // ό,τι έχει λήξει, πρώτο (και οι προσφορές που πέρασε η ημερομηνία τους)
  x.status==="progress"?0:1,          // ό,τι τρέχει τώρα
  touchesToday(x)?0:1,                // ό,τι είναι για σήμερα
  isWaiting(x)?1:0,                   // οι προσφορές σε αναμονή πάνε μετά· περιμένεις απάντηση, δεν εξαρτάται από σένα
  -(x.priority||2),                   // μέσα σε κάθε ομάδα, υψηλή προτεραιότητα πάνω
  dueTime(x),                         // πιο κοντινή ημερομηνία πρώτα, χωρίς ημερομηνία τελευταία
  x.createdAt||0                      // παλιότερη πρώτα, να τελειώνουν με τη σειρά
];
const byAuto=(a,b)=>{const A=sortKey(a),B=sortKey(b);for(let i=0;i<A.length;i++){if(A[i]!==B[i])return A[i]-B[i]}return 0};
const byDue=(a,b)=>S.settings.manualOrder?(((a.ord??1e9)-(b.ord??1e9))||byAuto(a,b)):byAuto(a,b);
const openOrdered=()=>S.tasks.filter(isOpen).sort(byDue);
const freezeOrder=()=>{const l=openOrdered();l.forEach((x,i)=>{x.ord=i});return l};
const posOf=id=>{const i=openOrdered().findIndex(x=>x.id===id);return i<0?0:i+1};
// ανταλλαγή με τη γειτονική γραμμή που βλέπει ο χρήστης, σε όποια λίστα κι αν είναι
function moveTask(id,dir,el){
  const row=el&&el.closest?el.closest(".row.task"):null;
  let other=null;
  if(row){let n=dir==="up"?row.previousElementSibling:row.nextElementSibling;
    while(n&&!n.classList.contains("task"))n=dir==="up"?n.previousElementSibling:n.nextElementSibling;
    if(n){const b=n.querySelector("[data-act=moveTask]");other=b&&b.dataset.id}}
  const list=freezeOrder();
  if(!other){const i=list.findIndex(x=>x.id===id),j=i+(dir==="up"?-1:1);
    if(j<0||j>=list.length){toast(dir==="up"?T("Είναι ήδη πρώτη."):T("Είναι ήδη τελευταία."));return}
    other=list[j].id}
  const a=S.tasks.find(x=>x.id===id),b=S.tasks.find(x=>x.id===other);
  if(!a||!b)return;const t=a.ord;a.ord=b.ord;b.ord=t;
  S.settings.manualOrder=true;persist();render();
}
function groupIds(el){
  const row=el&&el.closest?el.closest(".row.task"):null,box=row?row.parentElement:null;
  if(!box)return null;
  const ids=[...box.querySelectorAll("[data-act=posTask]")].map(b=>b.dataset.id);
  return ids.length>1?ids:null;
}
function moveTaskTo(id,pos,ids){
  freezeOrder();
  if(ids&&ids.length>1){
    const list=ids.map(i=>S.tasks.find(t=>t.id===i)).filter(Boolean);
    const slots=list.map(t=>t.ord).slice().sort((a,b)=>a-b);
    const i=list.findIndex(t=>t.id===id);if(i<0)return;
    pos=Math.max(1,Math.min(list.length,pos|0));
    const[x]=list.splice(i,1);list.splice(pos-1,0,x);
    list.forEach((t,k)=>{t.ord=slots[k]});
  }else{
    const list=openOrdered(),i=list.findIndex(x=>x.id===id);if(i<0)return;
    pos=Math.max(1,Math.min(list.length,pos|0));
    const[x]=list.splice(i,1);list.splice(pos-1,0,x);
    list.forEach((t,k)=>{t.ord=k});
  }
  S.settings.manualOrder=true;persist();render();toast(T("Πήγε στη θέση {n}.",{n:pos}));
}
function posSheet(id,ids){
  const x=S.tasks.find(y=>y.id===id);if(!x)return;
  const total=ids&&ids.length>1?ids.length:openOrdered().length;
  const cur=ids&&ids.length>1?ids.indexOf(id)+1:posOf(id);
  openSheet({title:T("Θέση στη λίστα"),saveLabel:T("Μετακίνηση"),saveStyle:"amber",
    body:`<p class="note">${esc(x.title)}</p>
    <label for="pos_n">${T("Βάλε τη σε ποια θέση, από 1 έως {n}",{n:total})}</label>
    <input id="pos_n" type="number" inputmode="numeric" min="1" max="${total}" value="${cur}">
    <div class="quick">${[1,2,3].filter(n=>n<=total).map(n=>`<button type="button" data-pos="${n}">${n}</button>`).join("")}
      ${total>3?`<button type="button" data-pos="${total}">${T("τελευταία")}</button>`:""}</div>`,
    onSave:()=>{const v=parseInt(val("pos_n"));if(!v){toast(T("Γράψε αριθμό θέσης."));return false}moveTaskTo(id,v,ids)}});
  $("#shBody").querySelector(".quick").onclick=e=>{const b=e.target.closest("[data-pos]");if(b){$("#pos_n").value=b.dataset.pos;sheetDirty=true}};
}
const remActive=r=>!r.done&&!r.deleted;
const remDue=r=>new Date(r.snoozeUntil||r.when);
const noTime=r=>!r.when;
const isDaily=r=>r.repeat==="day";
const remOver=r=>remActive(r)&&!!r.when&&remDue(r)<=new Date();
const byWhen=(a,b)=>(noTime(a)?Infinity:+remDue(a))-(noTime(b)?Infinity:+remDue(b));

/* ---------- Κατάσταση προβολής ---------- */
let view="today",clientId=null,taskFilter="open",groupByArea=false,clientSearch="",clientSort="work",formRating=0;
let route={from:"",to:"",fromGeo:null,toPlace:null,limit:null,result:null,off:new Set(),mode:"short"};

function render(){
  refreshLists();
  const active=view==="client"?"clients":view;
  const act=S.reminders.filter(r=>remActive(r)&&!isDaily(r)).length,overN=S.reminders.filter(r=>remOver(r)&&!isDaily(r)).length;
  $("#nav").innerHTML=[["today","Αρχική","home"],["tasks","Εργασίες","tasks"],["reminders","Υπενθυμίσεις","bell"],["clients","Πελάτες","clients"],["money","Ταμείο","money"],["route","Διαδρομή","route"]]
    .map(([v,l,i])=>`<button data-act="go" data-view="${v}" class="${active===v?"on":""}">${ic(i)}${v==="reminders"&&act?`<span class="ndot ${overN?"red":""}">${act}</span>`:""}${T(l)}</button>`).join("");
  const anyData=S.clients.length||S.tasks.length||S.reminders.length||S.ledger.length;
  const bkState=!anyData?"ok":(!S.meta.lastBackup&&S.meta.changes>=S.settings.backupEvery)?"bad":S.meta.changes>=S.settings.backupEvery?"warn":"ok";
  const bkBtn=$("#bkBtn");
  if(bkBtn){bkBtn.className="hbtn "+bkState;bkBtn.innerHTML=ic("shield")+'<span class="pipdot"></span>';
    bkBtn.setAttribute("aria-label",T("Αντίγραφο ασφαλείας"));bkBtn.title=backupStatus()}
  $("#gearBtn").innerHTML=ic("gear");
  $("#searchBtn").innerHTML=ic("search");$("#searchBtn").setAttribute("aria-label",T("Αναζήτηση"));$("#gearBtn").setAttribute("aria-label",T("Ρυθμίσεις"));
  $("#langBtn").textContent=LANG==="en"?"🇬🇧":"🇬🇷";$("#langBtn").setAttribute("aria-label",T("Γλώσσα"));
  $("#fab").innerHTML=ic("plus",28);$("#fab").setAttribute("aria-label",T("Προσθήκη"));
  $("#fab").style.display=view==="route"?"none":"flex";
  document.documentElement.style.setProperty("--hdr",$("header").getBoundingClientRect().height+"px");
  document.documentElement.style.setProperty("--navh",$("nav").getBoundingClientRect().height+"px");
  const M=$("#main");
  M.innerHTML=view==="today"?vToday():view==="clients"?vClients():view==="client"?vClient():view==="tasks"?vTasks():view==="reminders"?vReminders():view==="money"?vMoney():vRoute();
  document.body.dataset.view=view;
  updateHeaderTitle();
  bindView();initHScroll();decorateTime(M);dtBind(M);unfade();loadFotoCounts();
  if(view==="client"&&$("#cphogrid")){const c=getClient(clientId);if(c)drawClientPhotos(c)}
  document.querySelectorAll("[data-stars]").forEach(el=>{const c=getClient(el.dataset.stars);if(!c)return;
    bindStars(el,()=>c.rating||0,v=>{c.rating=v;persist();toast(v>=6?T("Κορυφαίος πελάτης 💎"):v?T("Αξιολόγηση: {n} στα 5",{n:v}):T("Η αξιολόγηση καθαρίστηκε."))})});
}
function save(){persist();render();updateWatch()}

/* ---------- Γραμμές λίστας ---------- */
function whenText(x){
  if(!x.start&&!x.end)return"";
  const f=t=>new Date(t).toLocaleString(LOC(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
  const hm=t=>new Date(t).toLocaleTimeString(LOC(),{hour:"2-digit",minute:"2-digit"});
  if(x.start&&x.end){
    const sd=new Date(x.start),ed=new Date(x.end);
    if(+sd===+ed)return f(x.start);
    return sd.toDateString()===ed.toDateString()?f(x.start)+" – "+hm(x.end):f(x.start)+" → "+f(x.end);
  }
  return x.start?f(x.start):T("έως")+" "+f(x.end);
}
// Σειρά με βάση τη ροή μιας δουλειάς: ραντεβού → έλεγχος → προσφορά → εκτέλεση· το «Ολοκληρώθηκε» τελευταίο.
const STATUS_ORDER=["appt","inspect","waiting","pending","progress","cancelled","done"];
const STATUS_NAMES={appt:"Ραντεβού",inspect:"Έλεγχος",pending:"Εκκρεμεί",progress:"Σε εξέλιξη",done:"Ολοκληρώθηκε",waiting:"Προσφορά, αναμονή απάντησης",someday:"Όποτε βρω χρόνο",cancelled:"Ακυρώθηκε"};
const STATUS_ICON={appt:"◷",inspect:"⌕",pending:"•",progress:"▶",waiting:"€",someday:"~",done:"✓",cancelled:"✕"};
const STATUS_DESC={appt:"έχεις κλείσει ραντεβού με τον πελάτη",inspect:"αυτοψία ή έλεγχος στον χώρο",pending:"εγκρίθηκε, δεν έχει ξεκινήσει ακόμα",progress:"η δουλειά τρέχει τώρα",waiting:"της έχεις δώσει τιμή, περιμένεις να την εγκρίνει ο πελάτης",someday:"χωρίς βιασύνη",done:"τελείωσε",cancelled:"δεν θα γίνει"};
const statusOptions=sel=>STATUS_ORDER.map(k=>`<option value="${k}" ${k===sel?"selected":""}>${T(STATUS_NAMES[k])}</option>`).join("");
function statusSheet(x){
  const opt=st=>`<button class="optrow ${x.status===st?"on":""}" data-act="setStatus" data-id="${x.id}" data-st="${st}">
    <span class="stdot ${st}">${STATUS_ICON[st]}</span><span class="grow"><b>${T(STATUS_NAMES[st])}</b><small>${T(STATUS_DESC[st])}</small></span>${x.status===st?'<span class="tick">✓</span>':""}</button>`;
  openSheet({title:esc(x.title),cancelLabel:T("Κλείσιμο"),body:
    panel(STATUS_ORDER.map(opt).join(""))+
    `<button class="btn ghost wide" data-act="editTask" data-id="${x.id}">${ic("edit",18)} ${T("Άνοιγμα εργασίας")}</button>`});
}
function taskRow(x,showClient=true,showMove=false,showMoney=false,rowNum=null){
  const c=x.clientId&&getClient(x.clientId),L=taskLoc(x),st=taskState(x);
  const tags={appt:"Ραντεβού",inspect:"Έλεγχος",late:"Εκπρόθεσμη",progress:"Σε εξέλιξη",done:"Ολοκληρώθηκε",cancelled:"Ακυρώθηκε",waiting:"Προσφορά, αναμονή απάντησης",someday:"Όποτε βρω χρόνο"};
  const m=[];
  if(showClient&&c)m.push(esc(c.name));
  if(L)m.push(esc(L.label));
  const w=whenText(x);if(w)m.push(w);
  if(x.ownLoc)m.push(`<span class="nearbadge">${T("δική της διεύθυνση")}</span>`);
  if(x.nearAlert)m.push(`<span class="nearbadge">${T("Όταν πλησιάσω")}</span>`);
  const got=taskPaid(x),amt=+x.amount||0;
  const chips=[];
  if(tags[st])chips.push(`<span class="tag ${st}">${T(tags[st])}</span>`);
  if(!L&&isOpen(x))chips.push(`<span class="tag noloc">${T("Χωρίς τοποθεσία")}</span>`);
  if(x.charge==="free"||x.charge==="warranty")chips.push(`<span class="tag amt0">${T(x.charge==="free"?"Χωρίς χρέωση":"Εγγύηση")}</span>`);
  if(amt)chips.push(`<span class="tag ${x.paid?"paid":st==="done"?"owe":got>0?"progress":"amt0"}">${money(amt)}${x.paid?" ✓":got>0?" · "+T("έλαβα")+" "+money(got):""}</span>`);
  return `<div class="row task p${x.priority||2} ${st}" data-act="editTask" data-id="${x.id}">
    <button class="check st ${x.status}" data-act="statusMenu" data-id="${x.id}" aria-label="${T("Κατάσταση")}">${
      x.status==="done"?"✓":x.status==="progress"?"▶":x.status==="waiting"?"?":x.status==="cancelled"?"✕":x.status==="someday"?"~":""}</button>
    <div class="grow">
      <div class="title">${x.priority==3?`<span class="hi" title="${T("Υψηλή προτεραιότητα")}">!</span> `:""}${esc(x.title)} ${whoHTML(x.who)}</div>
      ${m.length?`<div class="meta1">${m.join(" · ")}</div>`:""}
      ${chips.length?`<div class="chiprow">${chips.join("")}</div>`:""}
      ${showMoney&&amt?`<div class="chiprow">
        <button class="minibtn in" data-act="newEntry" data-kind="payment" data-client="${x.clientId||""}" data-task="${x.id}">+ ${T("Είσπραξη")}</button>
        ${x.paid?"":`<button class="minibtn full" data-act="settleTask" data-id="${x.id}">${T("Εξοφλήθηκε")}</button>`}
        ${amt-got>0.004?`<span class="owe-mini">${T("υπόλοιπο")} ${money(amt-got)}</span>`:""}</div>`:""}
    </div>

    ${L&&isOpen(x)?`<button class="goto" data-act="destTask" data-id="${x.id}" aria-label="${T("Πήγαινε εκεί")}">${ic("pin",19)}</button>`:""}
    ${isOpen(x)&&showMove&&S.settings.showMove?`<span class="rcol">
      <button class="mv" data-act="moveTask" data-id="${x.id}" data-dir="up" aria-label="${T("Πιο πάνω")}">▲</button>
      <button class="posn" data-act="posTask" data-id="${x.id}" aria-label="${T("Θέση στη λίστα")}">${rowNum!=null?rowNum:posOf(x.id)}</button>
      <button class="mv" data-act="moveTask" data-id="${x.id}" data-dir="down" aria-label="${T("Πιο κάτω")}">▼</button></span>`:""}</div>`;
}
function remRow(r){
  const over=remOver(r);
  return `<div class="row rem ${over?"over":""}">
    ${over?"":`<button class="check" data-rem="done" data-id="${r.id}" aria-label="${T("Έγινε")}"></button>`}
    <div class="grow" data-rem="edit" data-id="${r.id}"><div class="title">${esc(r.text)}</div>
    <div class="meta"><span>${noTime(r)?T("Χωρίς ώρα"):(over?T("Έληξε")+" ":"")+fmt(remDue(r))}</span>${r.repeat!=="none"?`<span>${REPL()[r.repeat]}</span>`:""}${r.remindBefore>0?`<span>${rbLabel(r.remindBefore)}</span>`:""}</div></div>
    ${over?`<button class="readbtn" data-rem="done" data-id="${r.id}">${remDoneLabel(r)}</button>`:""}
    <button class="x bin" data-rem="del" data-id="${r.id}" aria-label="${T("Στον κάδο")}" title="${T("Στον κάδο")}">${ic("trash",20)}</button></div>`;
}

/* ---------- Σήμερα ---------- */
function vToday(){return (typeof demoCardHTML==="function"?demoCardHTML():"")+vTodayMain()}
function vTodayMain(){
  const now=new Date(),open=S.tasks.filter(isOpen);
  const waiting=open.filter(isWaiting).sort(byDue);
  const someday=open.filter(isSomeday).sort(byDue);
  const act2=open.filter(x=>!isWaiting(x)&&!isSomeday(x));
  const late=act2.filter(x=>taskState(x)==="late").sort(byDue);
  const prog=act2.filter(x=>x.status==="progress"&&!late.includes(x));
  const today=act2.filter(x=>!late.includes(x)&&!prog.includes(x)&&touchesToday(x)).sort(byDue);
  const urgent=act2.filter(x=>(x.priority||2)===3&&!late.includes(x)&&!prog.includes(x)&&!today.includes(x)).sort(byDue);
  const soon=act2.filter(x=>!late.includes(x)&&!prog.includes(x)&&!today.includes(x)&&!urgent.includes(x)&&dueTime(x)<Infinity).sort(byDue);
  const noDate=act2.filter(x=>!x.start&&!x.end&&x.status!=="progress"&&!urgent.includes(x)&&!soon.includes(x))
    .sort((a,b)=>S.settings.manualOrder?byDue(a,b):((b.priority||2)-(a.priority||2)||(a.createdAt||0)-(b.createdAt||0)));
  const overR=S.reminders.filter(remOver).sort(byWhen);
  const actR=S.reminders.filter(r=>remActive(r)&&!remOver(r)).sort((a,b)=>(isDaily(a)-isDaily(b))||byWhen(a,b));
  const next=actR.slice(0,3);
  let h=`<div class="today-date">${cap(now.toLocaleDateString(LOC(),{weekday:"long",day:"numeric",month:"long"}))}</div>
  <p class="today-sub">${open.length?pl(open.length,"{n} ανοιχτή εργασία","{n} ανοιχτές εργασίες"):T("Καμία ανοιχτή εργασία")}</p>`;
  if(overR.length)h+=sec(T("Έληξαν, δεν τις έχεις διαβάσει"),"red")+`<div class="panel overpanel">${overR.map(remRow).join("")}</div>`;
  h+=`<div class="ctarow">
    <button class="cta2" data-act="pickDest" data-mode="go">${ic("route",26)}<b>${T("Πού πηγαίνεις;")}</b><small>${T("δες τι πιάνεις στο δρόμο")}</small></button>
    <button class="cta2" data-act="jobsMap">${ic("map",26)}<b>${T("Χάρτης δουλειών")}</b><small>${T("πινέζες και παλιότερες μέρες")}</small></button></div>`;
  if(localFile())h+=`<div class="banner warnbar"><span><b>${T("Τρέχει ως τοπικό αρχείο.")}</b> ${T("Η τοποθεσία, οι επαφές και η μόνιμη αποθήκευση δεν δουλεύουν έτσι. Ανέβασε την εφαρμογή στο διαδίκτυο και άνοιξέ τη από τη διεύθυνσή της.")}</span></div>`;
  const hasData=S.clients.length||S.tasks.length||S.reminders.length;
  if(hasData&&S.meta.changes>=S.settings.backupEvery)h+=`<div class="banner"><span>${S.meta.lastBackup?pl(S.meta.changes,"{n} αλλαγή από το τελευταίο αντίγραφο ασφαλείας.","{n} αλλαγές από το τελευταίο αντίγραφο ασφαλείας."):T("Δεν έχεις κρατήσει ακόμα αντίγραφο ασφαλείας.")}</span><button class="btn amber small" data-act="backup">${T("Αντίγραφο τώρα")}</button></div>`;
  if(late.length)h+=sec(T("Εκπρόθεσμες"),"red")+panel(late.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""));
  if(prog.length)h+=sec(T("Σε εξέλιξη"))+panel(prog.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""));
  if(today.length)h+=sec(T("Σήμερα"))+panel(today.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""));
  if(urgent.length)h+=sec(T("Επείγοντα"),"red")+panel(urgent.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""));
  if(soon.length)h+=sec(T("Προσεχώς"))+panel(soon.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""));
  const bundleGroups=new Map();
  noDate.forEach(x=>{
    const c=x.clientId&&getClient(x.clientId),area=(c&&c.area)||x.area;
    if(!area)return;
    if(!bundleGroups.has(area))bundleGroups.set(area,[]);
    bundleGroups.get(area).push(x);
  });
  const suggestions=[...bundleGroups.entries()].filter(([,list])=>list.length>=2);
  // δουλειές χωρίς ημερομηνία που κάθονται πάνω από 10 μέρες: πρόταση να μπουν σε πρόγραμμα ή σε «όποτε βρω χρόνο»
  const staleCut=Date.now()-10*86400000;
  const stale=noDate.filter(x=>(x.createdAt||0)<staleCut);
  const sugRows=[];
  suggestions.forEach(([area,list])=>sugRows.push(
    `<div class="row" data-act="bundleSuggest" data-area="${esc(area)}" style="align-items:center">
      <span style="color:var(--loc)">${ic("route",22)}</span>
      <div class="grow"><div class="title">${esc(area)}</div>
      <div class="meta"><span>${pl(list.length,"{n} δουλειά χωρίς ημερομηνία — θες να τις δεις μαζί στη διαδρομή;","{n} δουλειές χωρίς ημερομηνία — θες να τις δεις μαζί στη διαδρομή;",{n:list.length})}</span></div></div>
      <span style="color:var(--muted);font-size:20px">›</span></div>`));
  if(stale.length)sugRows.push(
    `<div class="row" data-act="staleSuggest" style="align-items:center">
      <span style="color:var(--muted)">${ic("today",22)}</span>
      <div class="grow"><div class="title">${pl(stale.length,"{n} δουλειά είναι εδώ και πάνω από 10 μέρες χωρίς ημερομηνία","{n} δουλειές είναι εδώ και πάνω από 10 μέρες χωρίς ημερομηνία",{n:stale.length})}</div>
      <div class="meta"><span>${T("Θες να τις δεις και να βάλεις ημερομηνία ή να τις πας σε «όποτε βρω χρόνο»;")}</span></div></div>
      <span style="color:var(--muted);font-size:20px">›</span></div>`);
  if(sugRows.length)h+=sec(T("Προτάσεις"))+panel(sugRows.join(""));
  if(noDate.length)h+=sec(T("Χωρίς ημερομηνία"))+panel(noDate.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""));
  if(!late.length&&!today.length&&!prog.length&&!noDate.length&&!urgent.length&&!soon.length)h+=sec(T("Σήμερα"))+panel(`<div class="empty">${T("Τίποτα για σήμερα. Πάτα + για νέα εργασία, πελάτη ή υπενθύμιση.")}</div>`);
  if(waiting.length)h+=sec(T("Προσφορές σε αναμονή απάντησης"))+panel(waiting.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""));
  if(someday.length)h+=sec(T("Όποτε βρω χρόνο"))+panel(someday.map((x,i)=>taskRow(x,true,true,false,i+1)).join(""));
  const soonW=S.tasks.filter(x=>alive(x)&&x.status==="done").map(x=>({x,u:warrantyUntil(x)}))
    .filter(o=>o.u&&o.u>now&&o.u-now<30*86400000).sort((a,b)=>a.u-b.u);
  if(soonW.length)h+=sec(T("Λήγουν εγγυήσεις σύντομα"))+panel(soonW.map(({x,u})=>{const c=x.clientId&&getClient(x.clientId);
    return `<div class="row" data-act="editTask" data-id="${x.id}"><span style="color:var(--loc)">${ic("shield",20)}</span>
      <div class="grow"><div class="title">${esc(x.title)}</div><div class="meta">${c?`<span>${esc(c.name)}</span>`:""}<span>${T("έως {d}",{d:fmtShort(u)})}</span></div></div></div>`}).join(""));
  h+=`<div class="sec-row">${sec(T("Επόμενες υπενθυμίσεις"))}${actR.length>3?`<button class="btn ghost small" style="margin-bottom:8px" data-act="allRem">${T("Δες όλες")} (${actR.length})</button>`:""}</div>`
    +panel(next.length?next.map(remRow).join(""):`<div class="empty">${T("Καμία υπενθύμιση. Πάτα το κουδούνι στην κάτω μπάρα για να προσθέσεις.")}</div>`);
  return h;
}

