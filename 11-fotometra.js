/* Δρομολόγιο — Σύνδεση με τη ΦωτοΜέτρα, ενημερώσεις, εγκατάσταση. */
// ---------- Σύνδεση με τη ΦωτοΜέτρα (ανοίγει απομακρυσμένα, τίποτα δεν αντιγράφεται εδώ) ----------
function fotoBtnHTML(owner,title,label){
  return `<button class="fotocta" data-act="openFoto" data-owner="${esc(owner)}" data-title="${esc(title||"")}">
    <span class="fic">${ic("measure",26)}</span>
    <span class="ftx"><b>${T(label||"Φωτογραφίες με μετρήσεις")}</b><small>${T("άνοιγμα ΦωτοΜέτρα")}</small></span>
    <span class="fmcnt" data-fm-owner="${esc(owner)}"></span></button>`;
}
// Μετά το κλείσιμο της ΦωτοΜέτρα: ό,τι φωτογραφία έχει φτιαχτεί εκεί αποθηκεύεται
// και εδώ, ως απλή εικόνα (όχι επεξεργάσιμη), δίπλα στις υπόλοιπες φωτογραφίες.
function fotoTarget(owner){
  if(owner.startsWith("pelatis:"))return S.clients.find(c=>c.id===owner.slice(8));
  if(owner.startsWith("ergasia:"))return S.tasks.find(t=>t.id===owner.slice(8));
  return null;
}
async function urlToDataUrl(u){
  if(!u)return null;
  if(String(u).startsWith("data:"))return u;
  const r=await fetch(u);const bl=await r.blob();
  return await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(bl)});
}
function shrinkDataUrl(dataUrl,maxDim,q){
  return new Promise((res,rej)=>{const img=new Image();
    img.onload=()=>{let w=img.width,h=img.height;const sc=Math.min(1,maxDim/Math.max(w,h));
      w=Math.max(1,Math.round(w*sc));h=Math.max(1,Math.round(h*sc));
      const cv=document.createElement("canvas");cv.width=w;cv.height=h;
      cv.getContext("2d").drawImage(img,0,0,w,h);res(cv.toDataURL("image/jpeg",q))};
    img.onerror=()=>rej(new Error("img"));img.src=dataUrl});
}
// Θέλουμε την ΤΕΛΙΚΗ εικόνα, με τις μετρήσεις και τις σημειώσεις πάνω της,
// όχι τη γυμνή φωτογραφία. Δοκιμάζουμε με σειρά προτεραιότητας ό,τι δίνει η ΦωτοΜέτρα.
async function fotoFlatSource(rec){
  // 1) συναρτήσεις που επιστρέφουν την «ψημένη» εικόνα
  for(const fn of ["flat","flatten","render","export","image","full","composite"]){
    if(typeof FotoMetra[fn]==="function"){
      try{const v=await Promise.resolve(FotoMetra[fn](rec));if(v)return v}catch(e){}
    }
  }
  // 2) πεδία μέσα στην ίδια την εγγραφή
  for(const k of ["flatUrl","flat","composite","annotated","rendered","exportUrl","full","image","png","jpeg","dataUrl","url"]){
    if(rec&&rec[k])return rec[k];
  }
  // 3) τελευταία επιλογή: η μικρογραφία (μπορεί να είναι χωρίς μετρήσεις)
  if(typeof FotoMetra.thumb==="function"){try{return await Promise.resolve(FotoMetra.thumb(rec))}catch(e){}}
  return null;
}
async function syncFotoPhotos(owner){
  if(!window.FotoMetra||typeof FotoMetra.list!=="function")return 0;
  const tgt=fotoTarget(owner);if(!tgt)return 0;
  if(!Array.isArray(tgt.photos))tgt.photos=[];
  let recs=[];
  try{recs=await Promise.resolve(FotoMetra.list(owner))||[]}catch(e){return 0}
  const have=new Set(tgt.photos.map(p=>p.fmId).filter(Boolean));
  let added=0;
  for(const rec of recs){
    const rid=String(rec&&(rec.id||rec.key||rec.name)||"");
    if(!rid||have.has(rid))continue;
    try{
      const src=await fotoFlatSource(rec);
      const raw=await urlToDataUrl(src);if(!raw)continue;
      const small=await shrinkDataUrl(raw,1024,.7);
      tgt.photos.push({id:uid(),fmId:rid,dataUrl:small,label:"",at:Date.now(),fromFoto:true});
      added++;
    }catch(e){}
  }
  if(added){write();render();toast(pl(added,"Αποθηκεύτηκε {n} φωτογραφία από τη ΦωτοΜέτρα.","Αποθηκεύτηκαν {n} φωτογραφίες από τη ΦωτοΜέτρα."))}
  return added;
}
function loadFotoCounts(){
  if(!window.FotoMetra||typeof FotoMetra.count!=="function")return;
  document.querySelectorAll("[data-fm-owner]").forEach(el=>{
    const owner=el.dataset.fmOwner;
    Promise.resolve(FotoMetra.count(owner)).then(n=>{if(n)el.textContent=" ("+n+")"}).catch(()=>{});
  });
}
function showInstallBar(){
  if(standalone()||localFile()||S.settings.installBannerOff||$("#instBar"))return;
  const d=document.createElement("div");d.className="instbar";d.id="instBar";
  d.innerHTML=`<span>${ic("plus",18)} ${T("Βάλε το Δρομολόγιο στην αρχική οθόνη σου")}</span>
    <button class="btn amber small" id="instGo">${T("Εγκατάσταση")}</button>
    <button class="x" id="instX" aria-label="${T("Κλείσιμο")}">✕</button>`;
  document.body.appendChild(d);
  $("#instGo").onclick=()=>{doInstallSmart()};
  $("#instX").onclick=()=>{S.settings.installBannerOff=true;write();d.remove()};
}
function showUpdateBar(ver){
  if($("#updBar"))return;
  const d=document.createElement("div");d.className="updbar";d.id="updBar";
  d.innerHTML=`<span>${ver?T("Βρέθηκε η έκδοση {v}.",{v:ver}):T("Υπάρχει νεότερη έκδοση της εφαρμογής.")}</span><button class="btn amber small" id="updGo">${T("Ανανέωση τώρα")}</button>`;
  document.body.appendChild(d);
  $("#updGo").onclick=()=>hardReload();
}
async function hardReload(){
  toast(T("Φέρνω τη νεότερη έκδοση…"));
  try{if(newSW)newSW.postMessage({type:"skipWaiting"})}catch(e){}
  try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}catch(e){}
  try{const r=await navigator.serviceWorker.getRegistration();if(r)await r.unregister()}catch(e){}
  const u=location.origin+location.pathname+"?v="+Date.now();
  setTimeout(()=>location.replace(u),350);
}
let lastCheck=0;
async function checkUpdate(silent){
  if(localFile()){if(!silent)toast(T("Τρέχει ως αρχείο. Κατέβασε το νέο αρχείο για να ενημερωθεί."));return}
  if(silent){
    const now=Date.now();if(now-lastCheck<60000)return;lastCheck=now; // όχι έλεγχος σε κάθε ανοιγοκλείσιμο, το πολύ μία φορά το λεπτό
  }
  if(!silent)toast(T("Έλεγχος για νεότερη έκδοση…"));
  try{
    const r=await fetch(location.pathname+"?probe="+Date.now(),{cache:"no-store"});
    const t=await r.text();
    const m=t.match(/APP_VERSION="([^"]+)"/);
    if(m&&m[1]!==APP_VERSION){showUpdateBar(m[1]);return}
    if(!silent)toast(T("Έχεις την τελευταία έκδοση ({v}).",{v:APP_VERSION}));
  }catch(e){if(!silent)toast(T("Ο έλεγχος χρειάζεται σύνδεση στο διαδίκτυο."))}
}
// Στις εγκατεστημένες εφαρμογές ο έλεγχος δεν ξεκινάει πάντα μόνος του·
// το ξαναζητάμε κάθε φορά που η εφαρμογή ξαναέρχεται μπροστά.
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkUpdate(true)});
window.addEventListener("focus",()=>checkUpdate(true));
window.addEventListener("pageshow",()=>checkUpdate(true));
async function askNotify(){
  if(!canNotify()){toast(T("Η συσκευή δεν υποστηρίζει ειδοποιήσεις."));return false}
  if(localFile()){toast(T("Οι ειδοποιήσεις δεν λειτουργούν όταν η εφαρμογή τρέχει ως αρχείο. Άνοιξέ τη από τη διεύθυνσή της."));return false}
  const before=Notification.permission;
  let p=before;
  if(p==="default"){try{p=await Notification.requestPermission()}catch(e){}}
  if(p!=="granted"){
    toast(before==="default"&&p==="denied"
      ? T("Το Chrome απέρριψε αυτόματα το αίτημα. Πάτα το εικονίδιο αριστερά από τη διεύθυνση → Άδειες → Ειδοποιήσεις → Να επιτρέπεται, και ξαναδοκίμασε.")
      : p==="denied" ? T("Οι ειδοποιήσεις είναι μπλοκαρισμένες για αυτή τη σελίδα. Πάτα το εικονίδιο αριστερά από τη διεύθυνση, «Άδειες», και επίτρεψε τις ειδοποιήσεις.")
      : T("Δεν δόθηκε άδεια για ειδοποιήσεις."));
    return false;
  }
  await initSW();
  S.settings.notify=true;write();return true;
}
const NICON="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" rx="8" fill="#F2B632"/><path d="M18 6c-3.3 0-6 2.5-6 5.6 0 4.2 6 10.4 6 10.4s6-6.2 6-10.4C24 8.5 21.3 6 18 6z" fill="#C8412B"/></svg>');
async function phoneNotify(title,body,tag){
  if(!S.settings.notify||!canNotify()||Notification.permission!=="granted")return false;
  const opts={body,tag:tag||"dromologio",renotify:true,requireInteraction:true,icon:NICON,badge:NICON,vibrate:[200,100,200]};
  // Στο Android το Chrome δέχεται ειδοποιήσεις μόνο μέσω service worker
  try{
    if(!swReg)await initSW();
    if(swReg&&swReg.showNotification){await swReg.showNotification(title,opts);return true}
  }catch(e){}
  try{const n=new Notification(title,opts);n.onclick=()=>{window.focus();n.close()};return true}catch(e){return false}
}
function showNextAlert(){
  const a=alertQ.shift();if(!a){$("#alert").classList.remove("open");alertShown=null;return}
  let title,sub,kind;
  if(a.type==="debt"){const c=getClient(a.id);if(!c)return showNextAlert();
    const m=cMoney(c);
    kind=a.dist!=null?T("Είσαι {d} από τον πελάτη",{d:distTxt(a.dist)}):T("Είσαι κοντά σε πελάτη");
    title=T("{n} σου χρωστάει {a}",{n:c.name,a:money(m.owed)});
    sub=[clientLoc(c)?clientLoc(c).label:"",T("Ολοκληρωμένες {a}, εισπράχθηκαν {b}",{a:money(m.doneCharges),b:money(m.received)})].filter(Boolean).join(" · ")}
  else if(a.type==="near"){const x=S.tasks.find(y=>y.id===a.id);if(!x||!isOpen(x))return showNextAlert();
    const L=taskLoc(x),c=x.clientId&&getClient(x.clientId);
    kind=a.dist!=null?T("Είσαι {d} από αυτή τη δουλειά",{d:distTxt(a.dist)}):T("Είσαι κοντά σε δουλειά");
    title=x.title;sub=[c?c.name:"",L?L.label:""].filter(Boolean).join(" · ")}
  else if(a.type==="rem"){const r=S.reminders.find(x=>x.id===a.id);if(!r||!remActive(r))return showNextAlert();
    const mins=Math.round((+remDue(r)-Date.now())/60000);
    kind=a.pre?(mins>=60?T("Σε {n} ώρες",{n:Math.round(mins/60)}):T("Σε {n} λεπτά",{n:Math.max(1,mins)})):T("Υπενθύμιση");title=r.text;sub=fmt(r.when)}
  else{const x=S.tasks.find(y=>y.id===a.id);if(!x)return showNextAlert();const c=x.clientId&&getClient(x.clientId);
    const mins=Math.round((new Date(x.start)-Date.now())/60000);kind=mins>1?T("Η εργασία ξεκινάει σε {n} λεπτά",{n:mins}):T("Ώρα να ξεκινήσει αυτή η δουλειά");title=x.title;
    sub=[fmt(x.start),c?c.name:"",taskLoc(x)?.label||""].filter(Boolean).join(" · ")}
  alertShown=a;
  $("#alertBody").innerHTML=`<div class="al-kind">${kind}</div><div class="al-title">${esc(title)}</div><div class="al-sub">${esc(sub)}</div>
    <div class="al-btns remb">${a.type==="debt"
      ?`<button class="btn amber big keepbtn" data-al="callc">${ic("phone",20)} ${T("Πάρ' τον τηλέφωνο")}</button>
        <div class="al-snooze">
          <button class="btn ghost small" data-al="openc">${T("Άνοιγμα καρτέλας")}</button>
          <button class="btn ghost small" data-al="keep">${T("Όχι τώρα")}</button>
          <button class="btn ghost small" data-al="mute">${T("Όχι ξανά σήμερα")}</button></div>`
      :a.type==="near"
      ?`<button class="btn amber big keepbtn" data-al="nav">${ic("route",20)} ${T("Πλοήγηση εκεί")}</button>
        <div class="al-snooze">
          <button class="btn ghost small" data-al="startjob">${T("Ξεκίνησα τη δουλειά")}</button>
          <button class="btn ghost small" data-al="keep">${T("Όχι τώρα")}</button>
          <button class="btn ghost small" data-al="mute">${T("Όχι ξανά σήμερα")}</button></div>`
      :a.type==="rem"
      ?`<button class="btn amber big keepbtn" data-al="done">${ic("done",20)} ${remDoneLabel(S.reminders.find(z=>z.id===a.id))}</button>
        <div class="al-snooze">
          <button class="btn ghost small" data-al="snz10">${T("+10 λεπτά")}</button>
          <button class="btn ghost small" data-al="snz30">${T("+30 λεπτά")}</button>
          <button class="btn ghost small" data-al="snz60">${T("+1 ώρα")}</button></div>
        <div class="al-small"><button class="btn ghost small" data-al="keep">${T("Άσ' τη ανοιχτή")}</button>
        <button class="btn danger small" data-al="del">${ic("trash",16)} ${T("Στον κάδο")}</button></div>`
      :`<button class="btn amber big keepbtn" data-al="start">${ic("done",20)} ${T("Ξεκίνησα")}</button>
        <div class="al-snooze">
          <button class="btn ghost small" data-al="snooze">${T("Σε 10 λεπτά")}</button>
          <button class="btn ghost small" data-al="nav">${T("Πλοήγηση εκεί")}</button>
          <button class="btn ghost small" data-al="ok">${T("Το είδα")}</button></div>
        <div class="al-small"><button class="btn danger small" data-al="cancel">${T("Ακυρώθηκε η δουλειά")}</button></div>`}</div>`;
  $("#alertBody").classList.toggle("urgentbox",a.type==="rem"&&!a.pre);
  $("#alert").classList.add("open");
  playSound(a.type==="rem"?(S.reminders.find(z=>z.id===a.id)||{}).sound||undefined:undefined);
  if(S.settings.vibrate&&navigator.vibrate)navigator.vibrate([250,120,250]);
  if(document.hidden)phoneNotify((kind?kind+": ":"")+title,sub,a.id);
}
$("#alert").addEventListener("click",e=>{
  const b=e.target.closest("[data-al]");if(!b||!alertShown)return;const a=alertShown,act=b.dataset.al;
  if(a.type==="debt"){const c=getClient(a.id);stopSound();alertShown=null;
    if(act==="openc"){clientId=a.id;view="client";render();window.scrollTo(0,0)}
    else if(act==="callc"){const tel=c&&(c.mobile||c.phone);
      if(tel)location.href="tel:"+String(tel).replace(/\s+/g,"");
      else{toast(T("Δεν έχει καταχωρημένο τηλέφωνο."));clientId=a.id;view="client";render()}}
    else if(act==="mute"){if(c){c.debtMute=Date.now()+12*3600000;write()}toast(T("Δεν θα ξαναχτυπήσει σήμερα γι' αυτόν."))}
    showNextAlert();return}
  const x=a.type==="rem"?S.reminders.find(r=>r.id===a.id):S.tasks.find(y=>y.id===a.id);
  if(x){
    if(a.type==="near"){
      if(act==="nav"){const L=taskLoc(x);
        if(L)window.open("https://www.google.com/maps/dir/?api=1&destination="+L.lat+","+L.lng,"_blank","noopener");
        else toast(T("Η δουλειά δεν έχει τοποθεσία."))}
      else if(act==="startjob"){x.status="progress";x.startedAt=x.startedAt||Date.now();toast(T("Η δουλειά σημειώθηκε ως «Σε εξέλιξη»."))}
      else if(act==="mute"){x.nearMute=Date.now()+12*3600000;toast(T("Δεν θα ξαναχτυπήσει σήμερα γι' αυτή."))}
    }else if(a.type==="rem"){
      if(act==="snz10"||act==="snz30"||act==="snz60"){
        const mins=act==="snz10"?10:act==="snz30"?30:60;
        x.when=toLocalInput(new Date(Date.now()+mins*60000));x.alerted=false;x.preAlerted=false;x.snoozeUntil=null;
        toast(T("Θα ξαναχτυπήσει σε {n}.",{n:act==="snz60"?T("1 ώρα"):T("{m} λεπτά",{m:mins})}));
      }
      else if(act==="keep"){if(a.pre){x.preAlerted=true;toast(T("Θα ξαναχτυπήσει την ώρα της."))}else{x.alerted=true;toast(T("Μένει κόκκινη στη λίστα μέχρι να την κλείσεις."))}}
      else if(act==="del"){
        const rep2=x.repeat&&x.repeat!=="none";
        const msg=rep2
          ? T("Προσοχή: αυτή είναι επαναλαμβανόμενη υπενθύμιση ({r}). Αν πάει στον κάδο, ΣΤΑΜΑΤΑΕΙ για πάντα και δεν θα ξαναχτυπήσει.\n\nΑν θέλεις απλώς να κλείσεις τη σημερινή, πάτα «Άκυρο» και μετά «{d}».\n\nΝα πάει στον κάδο;",{r:REPL()[x.repeat],d:remDoneLabel(x)})
          : T("Να πάει στον κάδο η υπενθύμιση «{t}»;",{t:x.text});
        if(!confirm(msg))return;
        x.deleted=true;x.deletedAt=Date.now();
        toast(rep2?T("Σταμάτησε. Μπορείς να την επαναφέρεις από τον κάδο."):T("Μεταφέρθηκε στα διαγραμμένα."))}
      else if(act==="done"){completeReminder(x);
        toast(x.done?T("Μεταφέρθηκε στα ολοκληρωμένα."):T("Έγινε. Θα ξαναχτυπήσει την επόμενη φορά."))}
    }else{
      if(act==="snooze"){x.snoozeUntil=new Date(Date.now()+600000).toISOString();toast(T("Θα ξαναχτυπήσει σε 10 λεπτά."))}
      else if(act==="nav"){const L=taskLoc(x);
        if(L)window.open("https://www.google.com/maps/dir/?api=1&destination="+L.lat+","+L.lng,"_blank","noopener");
        else toast(T("Η δουλειά δεν έχει τοποθεσία."))}
      else{x.startNotified=true;x.snoozeUntil=null;
        if(act==="start"){x.status="progress";x.startedAt=x.startedAt||Date.now();toast(T("Η δουλειά σημειώθηκε ως «Σε εξέλιξη»."))}
        if(act==="cancel"){if(!confirm(T("Να σημειωθεί η δουλειά ως ακυρωμένη;")))return;
          x.status="cancelled";x.cancelledAt=Date.now();toast(T("Η εργασία σημειώθηκε ως ακυρωμένη."))}}
    }}
  stopSound();alertShown=null;persist();render();showNextAlert();
});

