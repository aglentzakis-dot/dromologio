/* Δρομολόγιο — Κουμπιά, πατήματα, «πίσω», πληκτρολόγιο, «θύμισέ μου όταν φτάσω» και εκκίνηση της εφαρμογής. */
/* ---------- Κουμπί προσθήκης ---------- */
function fabAction(){
  if(view==="reminders"){$("#r_text")?.focus();return}
  if(view==="clients")return clientForm();
  if(view==="tasks")return taskForm();
  if(view==="client")return taskForm(null,clientId);
  openSheet({title:T("Προσθήκη"),cancelLabel:T("Κλείσιμο"),body:`<div class="choose">
    <button data-act="newTask">${ic("tasks")}<span>${T("Νέα εργασία")}<small>${T("Με πελάτη ή περιοχή, ώρα και υπενθύμιση")}</small></span></button>
    <button data-act="newClient">${ic("clients")}<span>${T("Νέος πελάτης")}<small>${T("Στοιχεία, διεύθυνση, σημειώσεις")}</small></span></button>
    <button data-act="newRem">${ic("bell")}<span>${T("Απλή υπενθύμιση")}<small>${T("Ένα κείμενο και μια ώρα")}</small></span></button></div>`});
}

/* ---------- Πατήματα ---------- */
document.addEventListener("click",e=>{
  setTimeout(unfade,80);
  const el=e.target.closest("[data-act]");if(!el)return;const a=el.dataset.act,id=el.dataset.id;
  switch(a){
    case"noop":return;
    case"go":{if($("#modal").classList.contains("open"))closeSheet();
      // Το «‹ Πελάτες» κ.λπ. μέσα στη σελίδα λειτουργεί σαν «πίσω»: γυρνά στο ίδιο σημείο της προηγούμενης οθόνης.
      if(el.classList.contains("back")&&navStack.length&&navStack[navStack.length-1].view===el.dataset.view){navBack();break}
      if(el.dataset.view===view&&!clientId){window.scrollTo(0,0);break}
      navPush();view=el.dataset.view;clientId=null;if(view==="tasks")taskFilter="open";render();window.scrollTo(0,0);break}
    case"openClient":navPush();clientId=id;view="client";render();window.scrollTo(0,0);break;
    case"allEntries":allEntriesSheet();break;
    case"demoOn":enterDemo();break;
    case"openIdent":if(el.tagName==="A")e.preventDefault();openIdent(el.dataset.cname||"");break;
    case"tradePick":tradeSheet($("#modal").classList.contains("open")?()=>settingsGroupSheet("work"):null);break;
    case"tradeSkip":S.settings.tradeSkip=true;persist();render();toast(T("Μπορείς να το διαλέξεις όποτε θέλεις από τις Ρυθμίσεις."));break;
    case"demoOff":exitDemo();break;
    case"editClient":clientForm(getClient(id));break;
    case"newPlace":{const c=getClient(id);if(c)clientPlaceForm(c,null,null);break}
    case"editPlace":{const c=getClient(id);if(c)clientPlaceForm(c,+el.dataset.i,null);break}
    case"findLoc":{const c=getClient(id);if(c){toast(T("Αναζήτηση…"));geocodeClientIfNeeded(c)}break}
    case"newClient":clientForm();break;
    case"editTask":{const x=S.tasks.find(y=>y.id===id);if(x)taskForm(x);break}
    case"newTask":taskForm(null,el.dataset.client);break;
    case"statusMenu":{const x=S.tasks.find(y=>y.id===id);if(x)statusSheet(x);break}
    case"setStatus":{const x=S.tasks.find(y=>y.id===id);if(!x)break;
      const st=el.dataset.st,was=x.status,wasWR=x.warrantyReminderId;
      x.status=st;
      if(st==="done"){x.doneAt=Date.now();x.startedAt=x.startedAt||Date.now();if(!x.completedOn)x.completedOn=new Date().toISOString().slice(0,10)}
      if(st==="progress"&&!x.startedAt)x.startedAt=Date.now();
      if(st==="cancelled")x.cancelledAt=Date.now();
      if(st==="waiting")x.waitingSince=Date.now();
      syncWarrantyReminder(x);
      closeSheet();persist();render();
      undoToast(T("«{t}»: {s}",{t:x.title,s:T(STATUS_NAMES[st]||st)}),()=>{x.status=was;x.warrantyReminderId=wasWR;syncWarrantyReminder(x);persist();render();toast(T("Επανήλθε."))});
      break}
    case"toggleWait":{const x=S.tasks.find(y=>y.id===id);if(!x)return;
      if(isWaiting(x)){x.status="pending";toast(T("Επέστρεψε στις ενεργές."))}
      else{x.status="waiting";x.waitingSince=Date.now();toast(T("Μπήκε σε αναμονή απάντησης και πήγε στο τέλος."))}
      persist();render();break}
    case"toggleTask":{const x=S.tasks.find(y=>y.id===id);if(!x)return;
      if(x.status==="done"){x.status="pending";x.doneAt=null}else{x.status="done";x.doneAt=Date.now();toast(T("Η εργασία ολοκληρώθηκε."))}persist();render();break}
    case"markPaid":settleTask(id);break;
    case"filter":taskFilter=el.dataset.f;closeSheet();render();break;
    case"moveTask":moveTask(id,el.dataset.dir,el);break;
    case"posTask":posSheet(id,groupIds(el));break;
    case"autoOrder":S.settings.manualOrder=false;S.tasks.forEach(x=>x.ord=null);persist();closeSheet();render();toast(T("Επέστρεψε η αυτόματη σειρά."));break;
    case"csort":clientSort=el.dataset.s;closeSheet();render();break;
    case"filterSheet":filterSheet(el.dataset.kind);break;
    case"offerArchive":offerArchiveSheet(el.dataset.client||"");break;
    case"toggleGroup":groupByArea=!groupByArea;closeSheet();render();break;
    case"toggleMove":S.settings.showMove=!S.settings.showMove;persist();closeSheet();render();
      toast(S.settings.showMove?T("Εμφανίζονται τα βελάκια σειράς."):T("Κρύφτηκαν τα βελάκια σειράς."));break;
    case"period":moneyPeriod=el.dataset.p;closeSheet();render();break;
    case"exportCsv":exportSheet(el.dataset.id||"");break;
    case"clientEntries":{const c=getClient(id);if(!c)break;
      const list=cMoney(c).ent.slice().sort(byNewest);
      openSheet({title:T("Κινήσεις: {n}",{n:c.name}),cancelLabel:T("Κλείσιμο"),
        body:(list.length?`<div class="twobtn" style="margin-bottom:10px">
            <button class="btn ghost" data-act="sendEntries" data-id="${c.id}">${ic("shareios",17)} ${T("Αποστολή")}</button>
            <button class="btn ghost" data-act="exportCsv" data-id="${c.id}">${ic("archive",17)} ${T("Εξαγωγή")}</button></div>`+panel(list.map(e=>entryRow(e,false)).join("")):`<div class="empty">${T("Δεν υπάρχουν κινήσεις.")}</div>`)});
      break}
    case"clientExpenses":{const c=getClient(id);if(!c)break;
      const list=cEntries(c.id).filter(e=>!isIn(e.kind)).sort(byNewest);
      openSheet({title:T("Έξοδα για {n}",{n:c.name}),cancelLabel:T("Κλείσιμο"),
        body:(list.length?`<div class="twobtn" style="margin-bottom:10px">
            <button class="btn ghost" data-act="sendEntries" data-id="${c.id}">${ic("shareios",17)} ${T("Αποστολή")}</button>
            <button class="btn ghost" data-act="exportCsv" data-id="${c.id}">${ic("archive",17)} ${T("Εξαγωγή")}</button></div>`:"")+
          (list.length?panel(list.map(e=>entryRow(e,false)).join("")):`<div class="empty">${T("Δεν υπάρχουν έξοδα καταχωρημένα.")}</div>`)});
      break}
    case"sendEntries":sendEntriesSheet(id);break;
    case"stats":statsSheet();break;
    case"orphanDebts":{
      const list=orphanOwed().map(o=>o.x);
      openSheet({title:T("Χωρίς πελάτη"),cancelLabel:T("Κλείσιμο"),body:
        `<p class="note">${T("Δουλειές που έχουν ολοκληρωθεί, δεν έχουν πελάτη καταχωρημένο, και δεν έχουν εξοφληθεί.")}</p>`+
        panel(list.map(x=>taskRow(x,false)).join(""))});
      break}
    case"toggleMonth":{const k=el.dataset.mk;if(!moneyOpenMonths)moneyOpenMonths=new Set();
      moneyOpenMonths.has(k)?moneyOpenMonths.delete(k):moneyOpenMonths.add(k);render();break}
    case"explain":{const k=el.dataset.k;
      const X={income:["Έσοδα","Όσα χρήματα μπήκαν στο ταμείο σου μέσα στην περίοδο που βλέπεις. Μετράνε μόνο οι εισπράξεις που έχεις καταχωρίσει, όχι οι τιμές των δουλειών."],
        outgo:["Έξοδα","Ό,τι πλήρωσες: υλικά, καύσιμα, δαπάνες. Μετράνε μόνο όσα έχεις καταχωρίσει στην περίοδο."],
        profit:["Κέρδος","Έσοδα μείον έξοδα, για την περίοδο που βλέπεις."],
        owed:["Σου χρωστάνε","Μόνο δουλειές που έχουν ολοκληρωθεί και δεν πληρώθηκαν ακόμα. Δεν μπαίνουν προσφορές ούτε δουλειές σε εξέλιξη."],
        pipeline:["Σε εκκρεμότητα","Η αξία των δουλειών που σου έχουν εγκριθεί και τρέχουν τώρα. Αναμενόμενο έσοδο, όχι χρέος."],
        offers:["Προσφορές","Η αξία των δουλειών που είναι σε αναμονή απάντησης πελάτη. Δεν είναι σίγουρα ακόμα."]}[k];
      if(!X)break;
      let extra="";
      if(k==="owed"){
        const debts=S.clients.filter(alive).map(c=>({c,m:cMoney(c)})).filter(x=>x.m.owed>0.004).sort((a,b)=>b.m.owed-a.m.owed);
        const orphans=orphanOwed();
        const orphanRow=orphans.length?`<div class="row" data-act="orphanDebts" style="align-items:center">
          <div class="avatar">${ic("edit",18)}</div><div class="grow"><div class="title">${T("Χωρίς πελάτη")}</div>
          <div class="meta"><span>${pl(orphans.length,"{n} εργασία χωρίς πελάτη","{n} εργασίες χωρίς πελάτη")}</span></div></div>
          <b class="amt out">${money(rnd(orphans.reduce((s,o)=>s+o.owe,0)))}</b></div>`:"";
        extra=(debts.length||orphans.length)?sec(T("Ποιοι σου χρωστάνε"))+panel(debts.map(({c,m})=>`<div class="row" data-act="openClient" data-id="${c.id}" style="align-items:center">
          <div class="avatar">${esc(initials(c.name))}</div><div class="grow"><div class="title">${esc(c.name)}</div>
          <div class="meta"><span>${T("Ολοκληρωμένες")} ${money(m.doneCharges)}</span><span>${T("Εισπράχθηκαν")} ${money(m.received)}</span></div></div>
          <b class="amt out">${money(m.owed)}</b></div>`).join("")+orphanRow)
          :`<p class="owedok">✓ ${T("Αυτή τη στιγμή κανείς δεν σου χρωστάει.")}</p>`;
      }
      openSheet({title:T(X[0]),cancelLabel:T("Κατάλαβα"),body:`<p style="font-size:15.5px;line-height:1.5">${T(X[1])}</p>`+extra});
      break}
    case"editKinds":kindsSheet();break;
    case"editTips":tipsSheet(null,null,null);break;
    case"changeMoneyPin":{
      const ml=S.settings.moneyLock||(S.settings.moneyLock={on:false,pin:""});
      const old=prompt(T("Γράψε τον τρέχοντα κωδικό:"));
      if(old!==ml.pin){toast(T("Λάθος κωδικός."));break}
      const nw=(prompt(T("Γράψε τον νέο κωδικό:"))||"").trim();
      if(!nw)break;
      ml.pin=nw;write();toast(T("Ο κωδικός άλλαξε."));
      break}
    case"notesSheet":notesSheet();break;
    case"checkSheet":{const x=S.tasks.find(y=>y.id===id);if(!x)break;
      const dr=readTaskDraft();checkSheet(x,()=>taskForm(x,null,dr));break}
    case"mlockForgot":{
      if(!confirm(T("Αυτό δεν σβήνει τίποτα, μόνο μηδενίζει τον κωδικό και βγάζει το κλείδωμα. Θέλεις να συνεχίσεις;")))break;
      S.settings.moneyLock={on:false,pin:""};moneyUnlocked=true;write();render();
      toast(T("Το κλείδωμα αφαιρέθηκε. Τα δεδομένα σου είναι όλα εκεί."));settingsGroupSheet("work");break}
    case"bizSheet":bizSheet();break;

    case"bin":binSheet();break;
    case"search":searchSheet();break;
    case"newEntry":entryForm(null,{kind:el.dataset.kind,client:el.dataset.client,task:el.dataset.task});break;
    case"settleTask":settleTask(id);break;
    case"unsettleTask":unsettleTask(id);break;
    case"unsettle":unsettleTask(id);break;
    case"editEntry":{const e=S.ledger.find(x=>x.id===id);if(e)entryForm(e);break}
    case"newRem":view="reminders";render();setTimeout(()=>$("#r_text")?.focus(),80);break;
    case"importContacts":importContacts();break;
    case"syncContact":syncContact(id);break;
    case"settings":settingsSheet();break;
    case"settingsGroup":settingsSheet(el.dataset.g);break;
    case"lang":LANG=LANG==="en"?"el":"en";S.settings.lang=LANG;write();applyLook();render();if($("#modal").classList.contains("open")&&!sheetHasSave)closeSheet();break;
    case"look":lookSheet();break;
    case"notifs":notifSheet();break;
    case"install":doInstallSmart();break;
    case"checkUpdate":checkUpdate();break;
    case"feedback":feedbackSheet();break;
    case"managePeople":peopleSheet();break;
    case"placeEdit":placeSheet(el.dataset.kind,el.dataset.i!=null?+el.dataset.i:null);break;
    case"backup":backupSheet();break;
    case"fab":fabAction();break;
    case"pickDest":destSheet(el.dataset.mode);break;
    case"fromTyped":closeSheet();setTimeout(()=>{const f=$("#rFrom");if(f){f.value="";route.from="";route.fromGeo=null;f.focus()}},120);break;
    case"setFrom":{closeSheet();route.fromGeo=null;route.from=el.dataset.from;
      const f=$("#rFrom");if(f)f.value=route.from;
      toast(T("Αφετηρία: {b}.",{b:route.from}));render();break}
    case"fromOther":closeSheet();view="route";render();window.scrollTo(0,0);setTimeout(()=>{const el2=$("#rFrom");if(el2){el2.value="";route.from="";el2.focus()}},120);break;
    case"newDestPlace":placeSheet("place",null);break;
    case"addMyPlace":placeSheet("place",null);break;
    case"destPlace":{route.toPlace={lat:+el.dataset.lat,lng:+el.dataset.lng,label:el.dataset.label};route.to=route.toPlace.label;
      closeSheet();view="route";render();window.scrollTo(0,0);calcRoute(true);
      if(!route.result)toast(T("Γράψε από πού ξεκινάς ή όρισε έδρα στις ρυθμίσεις."));break}
    case"destTask":{const x=S.tasks.find(y=>y.id===id),L=x&&taskLoc(x);if(!L)return;
      route.toPlace={lat:L.lat,lng:L.lng,label:x.title+" ("+L.label+")"};route.to=route.toPlace.label;closeSheet();view="route";render();window.scrollTo(0,0);calcRoute(true);
      if(!route.result)toast(T("Γράψε από πού ξεκινάς ή όρισε έδρα στις ρυθμίσεις."));break}
    case"jobsMap":openJobsMap();break;
    case"openFoto":{
      if(window.FotoMetra&&typeof FotoMetra.open==="function"){
        const own=el.dataset.owner;
        FotoMetra.open(own,el.dataset.title||"");
        if(own!=="*"){
          const back=()=>{document.removeEventListener("visibilitychange",back);
            setTimeout(()=>syncFotoPhotos(own),400)};
          document.addEventListener("visibilitychange",back);
          setTimeout(()=>{document.removeEventListener("visibilitychange",back);syncFotoPhotos(own)},1500);
        }
      }
      else toast(T("Η ΦωτοΜέτρα δεν φόρτωσε. Έλεγξε ότι υπάρχει σύνδεση στο διαδίκτυο και δοκίμασε ξανά."));
      break}
    case"staleSuggest":{const staleCut=Date.now()-10*86400000;
      const list=S.tasks.filter(x=>isOpen(x)&&!x.start&&!x.end&&x.status!=="progress"&&(x.createdAt||0)<staleCut).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
      openSheet({title:T("Παλιές δουλειές χωρίς ημερομηνία"),cancelLabel:T("Κλείσιμο"),
        body:panel(list.map((x,i)=>taskRow(x,true,false,false,i+1)).join(""))+
          `<p class="note">${T("Πάτα μια δουλειά για να της βάλεις ημερομηνία, να τη στείλεις σε «όποτε βρω χρόνο» ή να τη σβήσεις αν δεν χρειάζεται πια.")}</p>`});
      break}
    case"bundleSuggest":{
      const area=el.dataset.area;
      const list=S.tasks.filter(x=>isOpen(x)&&!x.start&&!x.end&&((x.clientId&&getClient(x.clientId)&&getClient(x.clientId).area===area)||x.area===area));
      const first=list.find(taskLoc);if(!first){toast(T("Δεν βρέθηκε τοποθεσία για αυτές τις δουλειές."));break}
      const L=taskLoc(first);
      route.toPlace={lat:L.lat,lng:L.lng,label:first.title+" ("+area+")"};route.to=first.title+" ("+area+")";
      route.mode="many";view="route";render();window.scrollTo(0,0);calcRoute(true);
      break}
    case"help":{const x=HELPS[el.dataset.h];if(x)openSheet({title:T(x[0]),cancelLabel:T("Κατάλαβα"),body:`<p style="font-size:15.5px;line-height:1.55">${T(x[1])}</p>`});break}
    case"fromSheet":fromSheet();break;
    case"allRem":{const act=S.reminders.filter(remActive),over=act.filter(remOver).sort(byWhen),
        daily=act.filter(r=>!remOver(r)&&isDaily(r)).sort(byWhen),
        noT=act.filter(r=>!remOver(r)&&!isDaily(r)&&noTime(r)),
        nx=act.filter(r=>!remOver(r)&&!isDaily(r)&&!noTime(r)).sort(byWhen);
      openSheet({title:T("Όλες οι υπενθυμίσεις"),cancelLabel:T("Κλείσιμο"),body:
        (over.length?sec(T("Έληξαν, δεν τις έχεις διαβάσει"),"red")+`<div class="panel overpanel">${over.map(remRow).join("")}</div>`:"")+
        (nx.length?sec(T("Επόμενες, με σειρά ώρας"))+panel(nx.map(remRow).join("")):"")+
        (noT.length?sec(T("Χωρίς ώρα"))+panel(noT.map(remRow).join("")):"")+
        (daily.length?sec(T("Καθημερινές, σαν ξυπνητήρι"))+panel(daily.map(remRow).join("")):"")+
        `<button class="btn ghost wide" data-act="go" data-view="reminders">${ic("bell",18)} ${T("Άνοιγμα υπενθυμίσεων")}</button>`});
      break}
    case"otherDest":closeSheet();route.toPlace=null;route.to="";view="route";render();window.scrollTo(0,0);
      setTimeout(()=>{const el=$("#rTo");if(el){el.focus();el.select&&el.select()}},120);break;
    case"showMe":getPos(p=>{myPos=p;openMapPicker(p,null,q=>{route.fromGeo={...q,label:MYLOC()};route.from=MYLOC();render();toast(T("Αφετηρία το σημείο που διάλεξες."))})});break;
    case"geoFrom":
      if(route.fromGeo&&baseLoc()){route.fromGeo=null;route.from=baseLoc().label;$("#rFrom").value=route.from;toast(T("Αφετηρία: {b}.",{b:route.from}));break}
      getPos(p=>{route.fromGeo={...p,label:MYLOC()};route.from=MYLOC();$("#rFrom").value=MYLOC();toast(T("Αφετηρία η θέση σου."))});break;
    case"calcRoute":{el.classList.add("busy");setTimeout(()=>el.classList.remove("busy"),260);calcRoute();
      const r=$("#routeRes");if(r&&r.firstChild)setTimeout(()=>r.scrollIntoView({behavior:"smooth",block:"start"}),80);break}
    case"toggleStop":{const k=el.dataset.key;route.off.has(k)?route.off.delete(k):route.off.add(k);$("#routeRes").innerHTML=routeResultHTML();break}
  }
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(identOpen())closeIdent();else if(photoOpen())closePhotoView();else if(jobsMapOpen())closeJobsMap();else if(mapOpen())closeMap();else if($("#modal").classList.contains("open"))cancelSheet()}});
document.addEventListener("visibilitychange",()=>{if(!document.hidden){render();checkDue()}});

/* ---------- Μνήμη πλοήγησης: το «πίσω» γυρνά στην προηγούμενη οθόνη, στο ίδιο ύψος που ήσουν ---------- */
const navStack=[];
function navPush(){navStack.push({view,clientId,taskFilter,y:window.scrollY});if(navStack.length>40)navStack.shift()}
function navBack(){
  const s=navStack.pop();if(!s)return false;
  view=s.view;clientId=s.clientId;if(s.taskFilter)taskFilter=s.taskFilter;render();
  // δύο φορές: μία αμέσως και μία αφού «κάτσει» η σελίδα (εικόνες, γραμματοσειρές)
  requestAnimationFrame(()=>window.scrollTo(0,s.y));setTimeout(()=>window.scrollTo(0,s.y),120);
  return true;
}
/* ---------- Κουμπί «πίσω» του κινητού ---------- */
// Το Chrome προσπερνά εγγραφές ιστορικού που μπήκαν χωρίς άγγιγμα, γι' αυτό τις προσθέτουμε όταν αγγίζεις την οθόνη.
const BUF=3;let depth=0,leaving=false;
history.replaceState({g:0},"");
function topUp(){if(leaving||$("#exitDlg").classList.contains("open"))return;while(depth<BUF){depth++;history.pushState({g:depth},"")}}
["pointerdown","keydown"].forEach(ev=>document.addEventListener(ev,topUp,true));
window.addEventListener("popstate",e=>{
  depth=e.state&&typeof e.state.g==="number"?e.state.g:0;
  if(leaving)return;
  if(exitTried)return;   // δεύτερο πάτημα: αφήνουμε το Chrome να κάνει τη δουλειά του
  if($("#exitDlg").classList.contains("open")){$("#exitDlg").classList.remove("open");return}
  if(identOpen()){closeIdent();return}
  if(photoOpen()){closePhotoView();return}
  if(jobsMapOpen()){closeJobsMap();return}
  if(mapOpen()){closeMap();return}
  if($("#alert").classList.contains("open"))return;
  if($("#modal").classList.contains("open")){cancelSheet();return}
  if(navBack())return;
  if(view==="client"){view="clients";clientId=null;render();return}
  if(view!=="today"){view="today";clientId=null;render();window.scrollTo(0,0);return}
  $("#exitT").textContent=T("Έξοδος από την εφαρμογή;");$("#exitS").textContent=T("Τα δεδομένα σου μένουν αποθηκευμένα.");
  $("#exitNo").textContent=T("Όχι");$("#exitYes").textContent=T("Ναι, έξοδος");$("#exitDlg").classList.add("open");
});
$("#exitNo").onclick=()=>{$("#exitDlg").classList.remove("open");topUp()};
let exitTried=false;
$("#exitYes").onclick=()=>{
  exitTried=true;leaving=true;$("#exitDlg").classList.remove("open");
  // 1) Αν η εφαρμογή άνοιξε από εμάς (εγκατεστημένη ή νέα καρτέλα), κλείνει κανονικά.
  try{window.close()}catch(e){}
  // 2) Αλλιώς γυρνάμε πίσω από όλες τις δικές μας εγγραφές, ώστε το επόμενο «πίσω»
  //    να βγάζει έξω από τη σελίδα, χωρίς να ξαναρωτήσει.
  const d=depth;
  setTimeout(()=>{try{history.go(-(d+1))}catch(e){}},30);
  setTimeout(()=>{
    leaving=false;               // ο φρουρός φεύγει, αλλά το exitTried μένει: δεν ξαναρωτάει
    if(!document.hidden)toast(T("Πάτα άλλη μια φορά «πίσω» για να βγεις, ή το κουμπί αρχικής οθόνης."));
  },900);
};

/* ---------- Πληκτρολόγιο: κρατάμε ορατά τα κουμπιά του φύλλου ---------- */
const vv=window.visualViewport;
function fitViewport(){
  const R=document.documentElement.style;
  R.setProperty("--vvh",(vv?vv.height:window.innerHeight)+"px");
  const m=$("#modal");
  if(vv&&m.classList.contains("open")){m.style.height=vv.height+"px";m.style.top=vv.offsetTop+"px";m.style.bottom="auto"}
  else{m.style.height="";m.style.top="";m.style.bottom=""}
  setTimeout(updateStickBar,60);setTimeout(updateKbBar,60);
}
// «Επόμενο»: πηδάει στο επόμενο πεδίο μέσα στο ίδιο αναδυόμενο, χωρίς να κλείνει το πληκτρολόγιο
function kbFields(){
  const scope=$("#shBody");if(!scope)return[];
  return[...scope.querySelectorAll("input,textarea")].filter(el=>
    el.type!=="hidden"&&el.type!=="checkbox"&&el.type!=="radio"&&!el.disabled&&!el.readOnly&&el.offsetParent!==null);
}
let kbCurrent=null;
document.addEventListener("focusin",e=>{
  const t=e.target;
  if(t&&t.closest&&t.closest("#shBody")&&/^(INPUT|TEXTAREA)$/.test(t.tagName)&&t.type!=="hidden"&&t.type!=="checkbox"&&t.type!=="radio"&&!t.readOnly)kbCurrent=t;
});
function updateKbBar(){
  const bar=$("#kbBar");if(!bar)return;
  const modalOpen=$("#modal").classList.contains("open");
  const inField=modalOpen&&kbCurrent&&document.contains(kbCurrent)&&kbCurrent===document.activeElement;
  bar.hidden=!inField;
  if(inField){
    const f=kbFields(),i=f.indexOf(kbCurrent);
    $("#kbNext").innerHTML=(i>=0&&i<f.length-1)?(T("Επόμενο")+" →"):T("Έτοιμο");
    // δεν κάθεται ποτέ πάνω από τα κουμπιά Αποθήκευση/Άκυρο του φύλλου
    const fx=$("#shFoot");
    bar.style.bottom=(fx&&fx.offsetHeight?fx.offsetHeight:0)+"px";
  }
}
function focusNextField(){
  const f=kbFields(),i=f.indexOf(kbCurrent);
  const next=f[i+1];
  if(next){kbCurrent=next;next.focus();try{next.select&&next.select()}catch(e){}}
  else if(kbCurrent)kbCurrent.blur();
}
$("#kbNext").onmousedown=e=>e.preventDefault(); // δεν κλέβει την εστίαση πριν προλάβει να τρέξει το click
$("#kbNext").onclick=focusNextField;
document.addEventListener("focusout",()=>setTimeout(()=>{const a=document.activeElement;
  if(!a||!/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)){document.body.classList.remove("typing");updateStickBar();updateKbBar()}},60));
if(vv){vv.addEventListener("resize",fitViewport);vv.addEventListener("scroll",fitViewport)}
window.addEventListener("resize",fitViewport);
document.addEventListener("focusin",e=>{
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)){document.body.classList.add("typing");[80,250,500].forEach(t=>{setTimeout(updateStickBar,t);setTimeout(updateKbBar,t)})}
  if(!$("#modal").classList.contains("open"))return;
  fitViewport();
  const el=e.target;
  if(el&&el.closest&&el.closest("#shBody"))setTimeout(()=>el.scrollIntoView({block:"center",behavior:"smooth"}),280);
});
// στις κανονικές προβολές: το πεδίο που γράφεις ανεβαίνει πάνω από το πληκτρολόγιο
function keepVisible(el){
  if(!el||!el.getBoundingClientRect)return;
  fitViewport();
  const r=el.getBoundingClientRect(),vh=(vv?vv.height:innerHeight),hdr=$("header").getBoundingClientRect().height+8;
  if(r.bottom>vh-14||r.top<hdr)el.scrollIntoView({block:"center",behavior:"smooth"});
}
document.addEventListener("focusin",e=>{
  const el=e.target;
  if(!el||!el.closest||!el.closest("main"))return;
  if(!/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))return;
  [180,420,700].forEach(t=>setTimeout(()=>keepVisible(el),t));
});
const _openSheet=openSheet,_closeSheet=closeSheet;
openSheet=function(o){_openSheet(o);fitViewport()};
closeSheet=function(){_closeSheet();fitViewport()};

/* ---------- «Θύμισέ μου όταν φτάσω κοντά» ---------- */
let watchId=null,myPos=null;
const nearTasks=()=>S.tasks.filter(x=>isOpen(x)&&x.nearAlert>0&&taskLoc(x));
function updateWatch(){
  const want=(nearTasks().length>0||S.settings.debtAlert)&&navigator.geolocation&&window.isSecureContext&&!geoBlockedByFrame();
  if(want&&watchId==null){
    watchId=navigator.geolocation.watchPosition(p=>{
      myPos={lat:p.coords.latitude,lng:p.coords.longitude};checkNear();
    },()=>{},{enableHighAccuracy:false,maximumAge:60000,timeout:30000});
  }else if(!want&&watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null}
}
function debtNear(){
  if(!myPos||!S.settings.debtAlert)return;
  S.clients.filter(alive).forEach(c=>{
    const L=clientLoc(c);if(!L)return;
    const m=cMoney(c);if(m.owed<=0.004)return;
    const d=km(myPos,L)/1.3*1000;
    if(d<=(S.settings.debtRadius||1000)){
      if(c.debtMute&&c.debtMute>Date.now())return;
      if(c.debtFired&&Date.now()-c.debtFired<6*3600000)return;
      c.debtFired=Date.now();write();
      const title=T("{n} σου χρωστάει {a}",{n:c.name,a:money(m.owed)});
      if(S.settings.vibrate&&navigator.vibrate)navigator.vibrate([180,90,180]);
      phoneNotify(title,T("Είσαι κοντά του τώρα."),"debt-"+c.id);
      alertQ.push({type:"debt",id:c.id,dist:Math.round(d)});if(!alertShown)showNextAlert();
    }else if(c.debtFired&&d>(S.settings.debtRadius||1000)*1.6){c.debtFired=0;write()}
  });
}
function checkNear(){
  debtNear();
  if(!myPos)return;
  nearTasks().forEach(x=>{
    const L=taskLoc(x),d=km(myPos,L)/1.3*1000; // πραγματική ευθεία απόσταση σε μέτρα
    if(d<=x.nearAlert){
      if(x.nearMute&&x.nearMute>Date.now())return;
      if(x.nearFired&&Date.now()-x.nearFired<2*3600000)return;
      x.nearFired=Date.now();write();
      const c=x.clientId&&getClient(x.clientId);
      const title=T("Είσαι κοντά: {a}",{a:L.label});
      const body=x.title+(c?" — "+c.name:"");
      if(S.settings.vibrate&&navigator.vibrate)navigator.vibrate([200,100,200,100,300]);
      phoneNotify(title,body,"near-"+x.id);
      alertQ.push({type:"near",id:x.id,dist:Math.round(d)});if(!alertShown)showNextAlert();
    }else if(x.nearFired&&d>x.nearAlert*1.6){x.nearFired=0;write()}
  });
}
setInterval(()=>{updateWatch();checkNear()},45000);

function offerDraft(){
  const d=getDraft();if(!d||d.kind!=="task"||!d.data)return;
  const t=d.data.title||T("χωρίς τίτλο");
  const ex=d.data._editId?S.tasks.find(x=>x.id===d.data._editId&&alive(x)):null;
  const msg=ex?T("Είχες ανοιχτή την εργασία «{t}» με αλλαγές που δεν αποθηκεύτηκαν. Να συνεχίσεις;",{t:t})
             :T("Είχες ξεκινήσει μια εργασία («{t}») και δεν αποθηκεύτηκε. Να συνεχίσεις;",{t:t});
  if(confirm(msg))taskForm(ex||null,null,d.data);
  else clearDraft();
}
// Οι επαναλαμβανόμενες που έχασαν την ώρα τους (κλειστή εφαρμογή) πάνε στην επόμενη φορά, σαν ξυπνητήρι
S.reminders.forEach(r=>{if(remActive(r)&&r.repeat&&r.repeat!=="none"&&r.when&&Date.now()-new Date(r.when)>12*3600000){
  r.when=nextOccurrence(r);r.alerted=false;r.preAlerted=false;r.snoozeUntil=null}});
write();
purgeOldTrash();
applyLook();render();checkDue();fitViewport();updateWatch();setTimeout(offerDraft,700);setTimeout(showInstallBar,900);
initSW();
setInterval(checkDue,15000);
setInterval(unfade,2000);
setTimeout(()=>{if(syncTaskPaid()){write();render()}},0);
