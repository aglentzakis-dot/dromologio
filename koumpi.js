/* Δρομολόγιο — Το κίτρινο κουμπί (γρήγορες ενέργειες του δρόμου)
   Ίδιο μενού σε όλες τις οθόνες, με μεγάλα γράμματα, για ό,τι κάνεις βιαστικά με το ένα χέρι.
   Από τις Ρυθμίσεις: αν φαίνεται το κουμπί, ποιες ενέργειες έχει και με ποια σειρά.
   Ρυθμίσεις: S.settings.fab = {on:true/false, order:[ids], off:[ids]}
   Φορτώνεται από το index.html ΠΡΙΝ από τον κυρίως κώδικα· χρησιμοποιεί τις κοινές βοηθητικές
   του (S, T, openSheet, entryForm, taskForm κ.λπ.) μόνο όταν πατηθεί κάτι. */

/* ---------- Εμφάνιση ---------- */
(function(){const st=document.createElement("style");st.id="koumpiCss";st.textContent=`
.fbgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fbgrid button{min-height:84px;border:1.5px solid var(--line);border-radius:16px;background:var(--card);color:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px 8px;text-align:center;font-size:17px;font-weight:800;line-height:1.2}
.fbgrid button .fe{font-size:30px;line-height:1}
.fabmini{flex:none;width:44px;height:44px;border-radius:50%;background:var(--accent);color:var(--onaccent);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,.25)}
.fbinfo{background:color-mix(in srgb,var(--accent) 14%,var(--card));border:1.5px solid color-mix(in srgb,var(--accent) 45%,var(--card));border-radius:14px;padding:12px 14px;font-size:15px;line-height:1.45;margin-bottom:12px;display:flex;gap:12px;align-items:flex-start}
.fbwarn{margin-top:8px;font-weight:800;color:var(--red)}
.fbcount{font-size:15px;font-weight:800;margin:4px 2px 8px}
.fbcount.full{color:var(--red)}
.fbkinds{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fbgrid button:active{background:var(--paper)}
.fbgrid button.fin{border-color:color-mix(in srgb,var(--green) 55%,var(--card));background:color-mix(in srgb,var(--green) 9%,var(--card))}
.fbgrid button.fout{border-color:color-mix(in srgb,var(--red) 45%,var(--card));background:color-mix(in srgb,var(--red) 7%,var(--card))}
.fbset{display:block;margin:14px auto 0;border:0;background:none;color:var(--muted);font-size:14px;font-weight:700;text-decoration:underline}
.fblist .fbrow{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line)}
.fblist .fbrow:last-child{border-bottom:0}
.fbrow .fbchk{flex:1;display:flex;align-items:center;gap:12px;border:0;background:none;text-align:left;font-size:17px;font-weight:750;color:var(--ink);padding:6px 0;min-width:0}
.fbrow .fbchk .fe{font-size:24px;width:30px;text-align:center}
.fbrow .fbchk i{flex:none;width:24px;height:24px;border:2px solid var(--line);border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-style:normal;font-size:15px;color:#fff}
.fbrow.on .fbchk i{background:var(--brand);border-color:var(--brand)}
.fbrow:not(.on) .fbchk{color:var(--muted)}
.fbrow .mini[disabled]{opacity:.25}
.fbpick .row{font-size:16.5px}
.fbnext{font-size:17px}.fbnext h3{font-size:21px;margin:0 0 4px}
.fbbig{width:100%;min-height:58px;font-size:18px!important;margin-top:10px}
.fbcam{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:64px;margin-top:12px;font-size:19px;font-weight:850}
`;(document.head||document.documentElement).appendChild(st)})();

/* ---------- Οι ενέργειες ---------- */
// [id, εικονίδιο, όνομα, χρώμα (in/out/""), αρχικά ενεργή]
// Η σειρά εδώ είναι και η αρχική σειρά του μενού· true = ενεργή από την αρχή (έως 10)
const FB_ACTS=[
  ["pexp","🛒","Προσωπικό έξοδο","out",true],
  ["exp","🧾","Έξοδο δουλειάς","out",true],
  ["pay","💶","Πήρα λεφτά","in",true],
  ["call","📞","Κλήση πελάτη","",true],
  ["rem","🔔","Υπενθύμιση","",true],
  ["note","📝","Σημείωση","",true],
  ["pinc","💰","Προσωπικό έσοδο","in",false],
  ["photo","📷","Φωτογραφία σε εργασία","",false],
  ["next","🧭","Επόμενη δουλειά","",false],
  ["start","▶️","Ξεκίνησα δουλειά","",false],
  ["done","✅","Τελείωσα δουλειά","",false],
  ["fuel","⛽","Καύσιμα","out",false],
  ["equip","🧰","Εξοπλισμός επιχείρησης","out",false],
  ["task","🛠️","Νέα εργασία","",false],
  ["client","👤","Νέος πελάτης","",false],
  ["fixq","📅","Προσωπικά πάγια","",false],
  ["map","🗺️","Χάρτης εργασιών","",false],
  ["goRoute","🛣️","Πού πηγαίνεις;","",false],
  ["goTasks","📋","Εργασίες","",false],
  ["goClients","👥","Πελάτες","",false],
  ["goMoney","🏦","Ταμείο εργασίας","",false],
  ["goPers","👤","Προσωπικά","",false],
  ["goRem","⏰","Όλες οι υπενθυμίσεις","",false],
  ["foto","📐","Φωτομέτρηση","",false],
  ["search","🔍","Αναζήτηση","",false]
];
function fbCfg(){
  let c=S.settings.fab;
  if(!c||typeof c!=="object")c=S.settings.fab={on:true,order:FB_ACTS.map(a=>a[0]),off:FB_ACTS.filter(a=>!a[4]).map(a=>a[0])};
  if(!Array.isArray(c.order))c.order=[];if(!Array.isArray(c.off))c.off=[];
  FB_ACTS.forEach(a=>{if(!c.order.includes(a[0])){c.order.push(a[0]);if(!a[4]&&!c.off.includes(a[0]))c.off.push(a[0])}});
  c.order=c.order.filter(id=>FB_ACTS.some(a=>a[0]===id));
  // πάνω από 10 ενεργές: κλείνουν όσες περισσεύουν από το τέλος
  const on=c.order.filter(id=>!c.off.includes(id));on.slice(FB_MAX).forEach(id=>c.off.push(id));
  return c;
}
const FB_MAX=10; // έως 10, για να χωράνε όλα χωρίς κύλιση
const fbAct=id=>FB_ACTS.find(a=>a[0]===id);
const fbShown=()=>{const c=fbCfg();return c.on!==false};

/* ---------- Το μενού ---------- */
function fbMenu(){
  const c=fbCfg(),ids=c.order.filter(id=>!c.off.includes(id));
  openSheet({title:T("Γρήγορες ενέργειες"),cancelLabel:T("Κλείσιμο"),
    body:(ids.length?`<div class="fbgrid">${ids.map(id=>{const a=fbAct(id);return `<button type="button" class="${a[3]?"f"+a[3]:""}" data-fb="${id}"><span class="fe">${a[1]}</span>${esc(T(a[2]))}</button>`}).join("")}</div>`
      :`<div class="empty">${T("Δεν έχεις διαλέξει καμία ενέργεια.")}</div>`)+
      `<button type="button" class="fbset" data-fbset="1">⚙ ${T("Άλλαξε τι δείχνει εδώ")}</button>`});
  $("#shBody").onclick=e=>{
    if(e.target.closest("[data-fbset]")){fbSetup(fbMenu);return}
    const b=e.target.closest("[data-fb]");if(b)fbRun(b.dataset.fb)};
}
function fbRun(id){
  const back=()=>fbMenu();
  switch(id){
    case"pay":fbPickClient(`💶 ${T("Από ποιον πήρες λεφτά;")}`,c=>{closeSheet();entryForm(null,{kind:"payment",client:c?c.id:""})},back,true,"pay");break;
    case"equip":closeSheet();entryForm(null,{kind:"equipment"});break;
    case"start":fbPickTask(T("Ποια δουλειά ξεκίνησες;"),x=>{closeSheet();fbFire({act:"setStatus",id:x.id,st:"progress"})},back,x=>x.status!=="progress");break;
    case"fixq":case"goPers":{closeSheet();const locked=S.settings.pLock&&S.settings.pLock.on&&!pUnlocked;
      view="money";moneyBook="personal";clientId=null;render();window.scrollTo(0,0);
      if(id==="fixq"){if(locked)toast(T("Γράψε τον κωδικό των Προσωπικών."));else pFixQuick()}break}
    case"goRoute":case"goTasks":case"goClients":case"goMoney":case"goRem":closeSheet();
      if(id==="goMoney")moneyBook="work";
      view={goRoute:"route",goTasks:"tasks",goClients:"clients",goMoney:"money",goRem:"reminders"}[id];clientId=null;if(view==="tasks")taskFilter="open";render();window.scrollTo(0,0);break;
    case"foto":closeSheet();fbFire({act:"openFoto",owner:"*",title:T("Φωτομέτρηση")});break;
    case"exp":fbExpKinds(back);break;
    case"fuel":closeSheet();entryForm(null,{kind:"fuel"});break;
    case"photo":fbPickTask(T("Σε ποια εργασία;"),fbPhoto,back);break;
    case"next":fbNext(null);break;
    case"call":fbPickClient(`📞 ${T("Κλήση πελάτη")}`,null,back,false,"call");break;
    case"done":fbPickTask(T("Ποια δουλειά τελείωσε;"),x=>{closeSheet();fbFire({act:"setStatus",id:x.id,st:"done"})},back);break;
    case"map":closeSheet();openJobsMap();break;
    case"rem":{closeSheet();view="reminders";clientId=null;render();window.scrollTo(0,0);const t=$("#r_text");if(t)setTimeout(()=>t.focus(),60);break}
    case"note":noteEditSheet(null);break;
    case"task":closeSheet();taskForm();break;
    case"client":closeSheet();clientForm();break;
    case"pexp":case"pinc":{const d=id==="pexp"?"out":"in";closeSheet();
      if(S.settings.pLock&&S.settings.pLock.on&&!pUnlocked){view="money";moneyBook="personal";clientId=null;render();window.scrollTo(0,0);toast(T("Γράψε τον κωδικό των Προσωπικών."));break}
      pMigrate();pCatPicker(d,(k,sb)=>pEntryForm(null,d,{kind:k,sub:sb}),back);break}
    case"search":closeSheet();searchSheet();break;
  }
}

/* ---------- Βοηθητικά ---------- */
// Πυροδοτεί μια υπάρχουσα ενέργεια της εφαρμογής (data-act) σαν να πατήθηκε το κουμπί της
function fbFire(d){const b=document.createElement("button");Object.entries(d).forEach(([k,v])=>b.dataset[k]=v);b.hidden=true;document.body.appendChild(b);b.click();b.remove()}
// Ανοιχτές εργασίες: πρώτα όσες είναι σε εξέλιξη, μετά με σειρά ώρας, μετά οι υπόλοιπες
function fbOpenTasks(){
  const t=S.tasks.filter(isOpen);
  const w=x=>x.status==="progress"?0:x.start?1:2;
  return t.sort((a,b)=>w(a)-w(b)||(a.start&&b.start?new Date(a.start)-new Date(b.start):0)||((b.priority||2)-(a.priority||2)));
}
const fbTaskLine=x=>{const c=x.clientId&&getClient(x.clientId),L=taskLoc(x);
  return [x.status==="progress"?"▶ "+T("Σε εξέλιξη"):x.start?fmt(x.start):"",c?c.name:"",L?L.label:""].filter(Boolean).join(" · ")};
function fbPickTask(title,cb,back,filter){
  const list=fbOpenTasks().filter(filter||(()=>true));
  openSheet({title,cancelLabel:T("Πίσω"),onCancel:back||null,
    body:list.length?`<div class="fbpick">${panel(list.map(x=>`<div class="row" data-fbt="${x.id}" style="cursor:pointer"><div class="grow"><div class="title">${esc(x.title)}</div><div class="meta"><span>${esc(fbTaskLine(x))}</span></div></div><span style="color:var(--muted);font-size:22px">›</span></div>`).join(""))}</div>`
      :`<div class="empty">${T("Δεν έχεις ανοιχτές εργασίες.")}</div>`});
  $("#shBody").onclick=e=>{const r=e.target.closest("[data-fbt]");if(!r)return;const x=S.tasks.find(y=>y.id===r.dataset.fbt);if(x)cb(x)};
}
// Φωτογραφία κατευθείαν στην εργασία (ανοίγει την κάμερα)
function fbPhoto(x){
  openSheet({title:`📷 ${esc(x.title)}`,cancelLabel:T("Πίσω"),onCancel:()=>fbRun("photo"),
    body:`<p class="note" style="font-size:15px">${esc(fbTaskLine(x))}</p>
      <label class="btn amber fbcam"><input type="file" id="fb_cam" accept="image/*" capture="environment" hidden>📷 ${T("Τράβηξε φωτογραφία")}</label>
      <label class="btn ghost fbcam" style="border:1.5px solid var(--line);min-height:54px;font-size:16.5px"><input type="file" id="fb_gal" accept="image/*" multiple hidden>🖼️ ${T("Από τη συλλογή")}</label>
      <p class="note" id="fb_n" style="font-size:15px;margin-top:12px">${pl((x.photos||[]).length,"Η εργασία έχει {n} φωτογραφία.","Η εργασία έχει {n} φωτογραφίες.")}</p>`});
  const add=async e=>{const files=[...e.target.files];e.target.value="";if(!files.length)return;
    if(!Array.isArray(x.photos))x.photos=[];
    toast(pl(files.length,"Επεξεργασία {n} φωτογραφίας…","Επεξεργασία {n} φωτογραφιών…"));
    for(const f of files){try{const url=await compressImage(f,1024,.68);const ph={id:uid(),dataUrl:url,label:"",at:Date.now()};x.photos.push(ph);fsSavePhoto(ph,x.title||T("Εργασία"),"perm")}catch(err){toast(T("Μια φωτογραφία δεν φορτώθηκε."))}}
    write();render();const n=$("#fb_n");if(n)n.textContent=pl(x.photos.length,"Η εργασία έχει {n} φωτογραφία.","Η εργασία έχει {n} φωτογραφίες.");
    toast(pl(files.length,"Προστέθηκε {n} φωτογραφία.","Προστέθηκαν {n} φωτογραφίες."))};
  $("#fb_cam").onchange=add;$("#fb_gal").onchange=add;
}
// Επόμενη δουλειά: πλοήγηση, κλήση ή άνοιγμα
function fbNext(x){
  const list=fbOpenTasks();x=x||list[0];
  if(!x){openSheet({title:`🧭 ${T("Επόμενη δουλειά")}`,cancelLabel:T("Πίσω"),onCancel:()=>fbMenu(),body:`<div class="empty">${T("Δεν έχεις ανοιχτές εργασίες.")}</div>`});return}
  const c=x.clientId&&getClient(x.clientId),tel=c&&(c.mobile||c.phone),L=taskLoc(x);
  openSheet({title:`🧭 ${T("Επόμενη δουλειά")}`,cancelLabel:T("Πίσω"),onCancel:()=>fbMenu(),
    body:`<div class="fbnext"><h3>${esc(x.title)}</h3><p class="note" style="font-size:15.5px;margin:0">${esc(fbTaskLine(x))}</p>
      ${L?`<a class="btn amber fbbig" data-act="noop" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${L.lat},${L.lng}">🧭 ${T("Πλοήγηση εκεί")}</a>`:""}
      ${tel?`<a class="btn ghost fbbig" data-act="noop" style="border:1.5px solid var(--line)" href="tel:${esc(String(tel).replace(/\s+/g,""))}">📞 ${T("Κλήση")} ${esc(c.name)}</a>`:""}
      <button type="button" class="btn ghost fbbig" style="border:1.5px solid var(--line)" data-fbopen="1">📂 ${T("Άνοιγμα εργασίας")}</button>
      ${list.length>1?`<button type="button" class="btn ghost fbbig" data-fbother="1">${T("Άλλη δουλειά")} ›</button>`:""}</div>`});
  $("#shBody").onclick=e=>{
    if(e.target.closest("[data-fbopen]")){closeSheet();taskForm(x);return}
    if(e.target.closest("[data-fbother]"))fbPickTask(T("Ποια δουλειά;"),y=>fbNext(y),()=>fbNext(x))};
}
// Επιλογή πελάτη: πρώτα μόνο οι ενεργοί (ανοιχτή δουλειά, χρωστάνε, κίνηση τον τελευταίο μήνα).
// Με την αναζήτηση βρίσκεις και όλους τους άλλους. Χωρίς cb: κλήση στο τηλέφωνό του.
function fbPickClient(title,cb,back,allowNone,mode){
  const act=mode==="pay"?activeClientIds():workClientIds(),openT=workClientIds();
  const all=S.clients.filter(c=>alive(c)&&(cb||c.mobile||c.phone));
  const owed=c=>{try{return cMoney(c).owed||0}catch(_){return 0}};
  const rank=c=>(openT.has(c.id)?2:0)+(owed(c)>0.004?1:0);
  openSheet({title,cancelLabel:T("Πίσω"),onCancel:back||null,
    body:`<input id="fb_q" placeholder="${T("Αναζήτηση σε όλους τους πελάτες")}" autocomplete="off" style="font-size:17px">
      <div id="fb_cl" class="fbpick" style="margin-top:10px"></div>
      ${allowNone?`<button type="button" class="btn ghost fbbig" data-fbnone="1" style="border:1.5px solid var(--line)">${T("Χωρίς πελάτη")}</button>`:""}`});
  const row=c=>{const tel=c.mobile||c.phone,o=owed(c);
    const meta=[openT.has(c.id)?`🛠️ ${T("ανοιχτή δουλειά")}`:"",o>0.004?`<b style="color:var(--red)">${T("χρωστάει {a}",{a:money(o)})}</b>`:"",!cb&&tel?esc(tel):""].filter(Boolean).map(x=>`<span>${x}</span>`).join("");
    return cb?`<div class="row" data-fbc="${c.id}" style="cursor:pointer"><div class="grow"><div class="title">${esc(c.name)}</div><div class="meta">${meta}</div></div><span style="color:var(--muted);font-size:22px">›</span></div>`
      :`<a class="row" data-act="noop" href="tel:${esc(String(tel).replace(/\s+/g,""))}" style="text-decoration:none;color:inherit"><div class="grow"><div class="title">${esc(c.name)}</div><div class="meta">${meta}</div></div><span style="font-size:22px">📞</span></a>`};
  const paint=()=>{const q=norm(val("fb_q"));
    let l;
    if(q)l=all.filter(c=>norm(c.name).includes(q)||String(c.mobile||c.phone||"").replace(/\s/g,"").includes(q.replace(/\s/g,""))).slice(0,40);
    else l=all.filter(c=>act.has(c.id)).sort((a,b)=>rank(b)-rank(a)||a.name.localeCompare(b.name,LOC()));
    $("#fb_cl").innerHTML=(q?"":`<div class="psub" style="margin-top:0">${mode==="pay"?T("Χρωστάνε ή έχουν δουλειά σε εξέλιξη"):T("Με δουλειά σε εξέλιξη")}</div>`)+
      (l.length?panel(l.map(row).join("")):`<div class="empty">${q?T("Δεν βρέθηκε πελάτης."):mode==="pay"?T("Κανένας πελάτης δεν σου χρωστάει ούτε έχει δουλειά σε εξέλιξη."):T("Κανένας πελάτης με δουλειά σε εξέλιξη αυτή την περίοδο.")}</div>`)+
      (q?"":`<p class="note" style="font-size:14px;margin-top:8px">${T("Για κάποιον άλλον, γράψε το όνομά του στην αναζήτηση.")}</p>`)};
  paint();$("#fb_q").oninput=paint;
  $("#shBody").onclick=e=>{
    if(e.target.closest("[data-fbnone]")){cb(null);return}
    const r=e.target.closest("[data-fbc]");if(r&&cb){const c=getClient(r.dataset.fbc);if(c)cb(c)}};
}
// Έξοδο δουλειάς: διαλέγεις είδος με μεγάλα κουμπιά (υλικά, καύσιμα, εξοπλισμός επιχείρησης κ.λπ.)
function fbExpKinds(back){
  const EM={material:"🧱",wages:"👷",payout:"🤝",fuel:"⛽",parts:"🔩",equipment:"🧰",expense:"🧾"};
  const ks=kinds().filter(k=>k.dir==="out");
  openSheet({title:`🧾 ${T("Τι έξοδο;")}`,cancelLabel:T("Πίσω"),onCancel:back||null,
    body:`<div class="fbgrid">${ks.map(k=>`<button type="button" class="fout" data-fbk2="${k.id}"><span class="fe">${EM[k.id]||"🧾"}</span>${esc(T(k.name))}</button>`).join("")}</div>
      <button type="button" class="btn ghost fbbig" data-fbked="1" style="border:1.5px solid var(--line)">✎ ${T("Σειρά, ονόματα και νέα είδη")}</button>
      <p class="note" style="font-size:14.5px;margin-top:10px">${T("Είναι η ίδια λίστα με τα «Είδη κινήσεων» του Ταμείου: ό,τι αλλάζεις εδώ αλλάζει παντού, και το αντίστροφο.")}</p>`});
  $("#shBody").onclick=e=>{
    if(e.target.closest("[data-fbked]")){kindsSheet(()=>fbExpKinds(back));return}
    const b=e.target.closest("[data-fbk2]");if(!b)return;closeSheet();entryForm(null,{kind:b.dataset.fbk2})};
}

/* ---------- Ρύθμιση: τι δείχνει και με ποια σειρά ---------- */
function fbSetup(back){
  const c=fbCfg();
  openSheet({title:`⚙ ${T("Το κίτρινο κουμπί")}`,cancelLabel:back?T("Πίσω"):T("Κλείσιμο"),onCancel:back||null,body:`<div id="fbS"></div>`});
  const paint=()=>{
    const onN=c.order.filter(id=>!c.off.includes(id)).length;
    $("#fbS").innerHTML=`<div class="fbinfo"><span class="fabmini">${ic("plus",24)}</span><div>${T("Το κίτρινο κουμπί κάτω δεξιά είναι για άμεση χρήση: γρήγορη πρόσβαση σε όσα κάνεις συχνά στη δουλειά, με δύο πατήματα, από όποια οθόνη κι αν είσαι. Π.χ. είσπραξη, έξοδο, φωτογραφία σε εργασία, κλήση πελάτη, επόμενη δουλειά.")}
        <div class="fbwarn">⚠ ${T("Μην το χρησιμοποιείς την ώρα που οδηγείς. Σταμάτα πρώτα με ασφάλεια.")}</div></div></div>
      <label class="toggle" style="font-size:16.5px"><input type="checkbox" id="fb_on" ${c.on!==false?"checked":""}>${T("Να φαίνεται το κίτρινο κουμπί κάτω δεξιά")}</label>
      <p class="note" style="font-size:14.5px;margin:6px 2px 4px">${T("Πάτα για να το βάλεις ή να το βγάλεις από το μενού. Με ▲▼ αλλάζεις σειρά.")}</p>
      <div class="fbcount ${onN>=FB_MAX?"full":""}">${T("Επιλεγμένες {n} από {m}",{n:onN,m:FB_MAX})}${onN>=FB_MAX?" · "+T("για νέα, βγάλε πρώτα μία"):""}</div>`+
      `<div class="fblist">${panel(c.order.map((id,i)=>{const a=fbAct(id),on=!c.off.includes(id);return `<div class="fbrow ${on?"on":""}">
        <button type="button" class="fbchk" data-fbk="${id}"><i>${on?"✓":""}</i><span class="fe">${a[1]}</span><span>${esc(T(a[2]))}</span></button>
        <button type="button" class="mini" data-fbu="${i}" ${i?"":"disabled"} aria-label="${T("Πιο πάνω")}">▲</button>
        <button type="button" class="mini" data-fbd="${i}" ${i<c.order.length-1?"":"disabled"} aria-label="${T("Πιο κάτω")}">▼</button></div>`}).join(""))}</div>
      <p class="note" style="font-size:14px;margin-top:10px">${T("Εκτός από ενέργειες, μπορείς να βάλεις και συντομεύσεις για να πηγαίνεις κατευθείαν σε μια οθόνη: Εργασίες, Πελάτες, Ταμείο, Προσωπικά, Διαδρομή.")}</p>
      <button type="button" class="btn ghost wide" data-fbreset="1" style="width:100%;margin-top:10px;border:1.5px solid var(--line)">↺ ${T("Επαναφορά αρχικών")}</button>`;
    $("#fb_on").onchange=e=>{c.on=e.target.checked;write();render();toast(c.on?T("Το κίτρινο κουμπί φαίνεται."):T("Το κίτρινο κουμπί κρύφτηκε. Το ξαναβάζεις από τις Ρυθμίσεις."))};
  };
  paint();
  $("#fbS").onclick=e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.fbk){const id=b.dataset.fbk;
      if(c.off.includes(id)){if(c.order.filter(x=>!c.off.includes(x)).length>=FB_MAX){toast(T("Μέχρι {m} επιλογές, για να χωράνε χωρίς κύλιση. Βγάλε πρώτα μία.",{m:FB_MAX}));return}c.off=c.off.filter(x=>x!==id)}
      else c.off=c.off.concat(id);write();paint();return}
    const sw=(i,j)=>{[c.order[i],c.order[j]]=[c.order[j],c.order[i]];write();paint()};
    if(b.dataset.fbu!=null){const i=+b.dataset.fbu;if(i>0)sw(i,i-1);return}
    if(b.dataset.fbd!=null){const i=+b.dataset.fbd;if(i<c.order.length-1)sw(i,i+1);return}
    if(b.dataset.fbreset){if(!confirm(T("Να γυρίσει το μενού στις αρχικές επιλογές;")))return;Object.assign(c,{order:FB_ACTS.map(a=>a[0]),off:FB_ACTS.filter(a=>!a[4]).map(a=>a[0])});write();paint()}};
}
