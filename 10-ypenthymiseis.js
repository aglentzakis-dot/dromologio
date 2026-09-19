/* Δρομολόγιο — Υπενθυμίσεις, ήχοι, ειδοποιήσεις. */
/* ---------- Υπενθυμίσεις ---------- */
function nextOccurrence(r){const d=new Date(r.when),now=new Date();
  do{if(r.repeat==="day")d.setDate(d.getDate()+1);else if(r.repeat==="week")d.setDate(d.getDate()+7);else if(r.repeat==="year")d.setFullYear(d.getFullYear()+1);else d.setMonth(d.getMonth()+1)}while(d<=now);return toLocalInput(d)}
function completeReminder(r){r.snoozeUntil=null;r.alerted=false;r.preAlerted=false;if(r.repeat&&r.repeat!=="none")r.when=nextOccurrence(r);else{r.done=true;r.doneAt=Date.now()}}
const soundOpts=sel=>{
  const defName=(customSoundById(S.settings.sound)||{}).name||T((SOUNDS[S.settings.sound]||SOUNDS.chime).name);
  return `<option value="">${T("Προεπιλογή")} (${defName})</option>`+
    allSoundEntries().map(v=>`<option value="${v.id}" ${v.id===sel?"selected":""}>${v.custom?"🎵 ":""}${v.custom?esc(v.name):T(v.name)}</option>`).join("");
};
function soundName(id){
  if(!id){const d=customSoundById(S.settings.sound);return T("Προεπιλογή")+" ("+(d?d.name:T((SOUNDS[S.settings.sound]||SOUNDS.chime).name))+")"}
  const c=customSoundById(id);if(c)return c.name;
  return T((SOUNDS[id]||SOUNDS.chime).name);
}
function soundPickerHTML(fieldId,sel){
  return `<input type="hidden" id="${fieldId}" value="${esc(sel)}">
  <div class="inrow"><button type="button" class="pickbtn" id="${fieldId}Btn"><span>${esc(soundName(sel))}</span><i>▾</i></button>
    <button type="button" class="iconbtn" id="${fieldId}Play" aria-label="${T("Δοκιμή")}">▶</button></div>
  <div class="pickbox" id="${fieldId}Box" hidden data-val="${esc(sel)}">
    <div class="row listedit sndrow ${!sel?"on2":""}" data-sndrow=""><button type="button" class="sndsel" data-sndpick="">${!sel?"✓":"○"}</button>
      <div class="grow title">${esc(soundName(""))}</div><button type="button" class="mini" data-sndplay="">▶</button></div>
    ${allSoundEntries().map(v=>`<div class="row listedit sndrow ${v.id===sel?"on2":""}" data-sndrow="${v.id}"><button type="button" class="sndsel" data-sndpick="${v.id}">${v.id===sel?"✓":"○"}</button>
      <div class="grow title">${v.custom?"🎵 ":""}${v.custom?esc(v.name):T(v.name)}</div><button type="button" class="mini" data-sndplay="${v.id}">▶</button></div>`).join("")}
  </div>`;
}
function bindSoundPicker(fieldId,onPick){
  const btn=$("#"+fieldId+"Btn"),box=$("#"+fieldId+"Box"),play=$("#"+fieldId+"Play");
  if(!btn||!box)return;
  btn.onclick=()=>{box.hidden=!box.hidden};
  play.onclick=()=>playSound(box.dataset.val||undefined,false);
  box.onclick=e=>{
    const pk=e.target.closest("[data-sndpick]"),pl=e.target.closest("[data-sndplay]");
    if(pl){playSound(pl.dataset.sndplay||undefined,false);return}
    if(pk){const v=pk.dataset.sndpick;box.dataset.val=v;
      const hid=$("#"+fieldId);if(hid)hid.value=v;
      btn.querySelector("span").textContent=soundName(v);
      box.querySelectorAll("[data-sndrow]").forEach(r=>r.classList.toggle("on2",r.dataset.sndrow===v));
      box.querySelectorAll("[data-sndpick]").forEach(b=>b.textContent=b.dataset.sndpick===v?"✓":"○");
      box.hidden=true;sheetDirty=true;if(onPick)onPick(v);
    }
  };
}
const repOpts=sel=>Object.entries(REPL()).map(([k,v])=>`<option value="${k}" ${k===sel?"selected":""}>${v}</option>`).join("");
const remOpen=()=>view==="reminders";
function vReminders(){
  const act=S.reminders.filter(remActive),arch=S.reminders.filter(r=>!remActive(r)).length;
  const over=act.filter(remOver).sort(byWhen);
  const daily=act.filter(r=>!remOver(r)&&isDaily(r)).sort(byWhen);
  const noT=act.filter(r=>!remOver(r)&&!isDaily(r)&&noTime(r));
  const next=act.filter(r=>!remOver(r)&&!isDaily(r)&&!noTime(r)).sort(byWhen);
  let h=`<div class="panel pad" id="remForm" style="padding-top:12px">
    <div class="fx-title">${T("Νέα υπενθύμιση")}</div>
    <input id="r_text" autocomplete="off" placeholder="${T("Τι να σου θυμίσω;")}" aria-label="${T("Τι να σου θυμίσω;")}">
    <label for="r_when">${T("Πότε να χτυπήσει")} <span style="font-weight:600;color:var(--muted)">${T("(προαιρετικό)")}</span></label>
    ${dtHTML("r_when","")}
    <button type="button" class="pickbtn" id="r_quickBtn" style="margin-top:2px"><span>${T("Γρήγορη επιλογή ώρας")}</span><i>▾</i></button>
    <div class="two" style="margin-top:12px">
      <div><label for="r_rb">${T("Προειδοποίηση")}</label><select id="r_rb">${REMB.filter(m=>m>=0).map(m=>`<option value="${m}">${rbEarly(m)}</option>`).join("")}</select></div>
      <div><label for="r_rep">${T("Επανάληψη")}</label><select id="r_rep">${repOpts("none")}</select></div></div>
    <label>${T("Ήχος")}</label>${soundPickerHTML("r_snd","")}
    <button class="btn amber wide gobtn" style="margin-top:14px" id="r_add">${ic("bell",20)}${T("Προσθήκη υπενθύμισης")}</button></div>`;
  if(over.length)h+=sec(T("Έληξαν, δεν τις έχεις διαβάσει"),"red")+`<div class="panel overpanel">${over.map(remRow).join("")}</div>`;
  h+=sec(T("Επόμενες, με σειρά ώρας"))+panel(next.length?next.map(remRow).join(""):`<div class="empty">${T("Καμία επόμενη υπενθύμιση. Γράψε μία παραπάνω.")}</div>`);
  if(noT.length)h+=sec(T("Χωρίς ώρα"))+panel(noT.map(remRow).join(""));
  if(daily.length)h+=sec(T("Καθημερινές, σαν ξυπνητήρι"))+panel(daily.map(remRow).join(""));
  h+=`<button class="archlink" data-rem="archive">${ic("archive",20)}<span>${T("Αρχείο: ολοκληρωμένες και διαγραμμένες")}</span><span class="cnt">${arch}</span></button>`;
  return h;
}
function applyQuickTime(q){
  const qt=S.settings.quickTimes,d=new Date();d.setSeconds(0,0);
  const hm=s=>String(s||"09:00").split(":").map(Number);
  if(q==="1h")d.setHours(d.getHours()+1);
  else if(q==="eve"){const[h,m]=hm(qt.eve);d.setHours(h,m);if(d<=new Date())d.setDate(d.getDate()+1)}
  else if(q==="tom"){d.setDate(d.getDate()+1);const[h,m]=hm(qt.tom);d.setHours(h,m)}
  else{d.setDate(d.getDate()+((6-d.getDay()+7)%7||7));const[h,m]=hm(qt.we);d.setHours(h,m)}
  dtSet("r_when",toLocalInput(d));
}
function bindReminders(){
  $("#r_quickBtn").onclick=quickTimeSheet;
  $("#r_add").onclick=()=>{
    const text=val("r_text");let when=dtVal("r_when"),autoDay=false;
    if(!text){toast(T("Γράψε τι να σου θυμίσω."));$("#r_text").focus();return}
    if(!when){const w2=nextTimeOnly("r_when");if(w2){when=w2;autoDay=true}}
    if(when&&new Date(when)<=new Date()&&!confirm(T("Η ώρα που έβαλες έχει ήδη περάσει. Να καταχωρηθεί έτσι;")))return;
    S.reminders.push({id:uid(),text,when,repeat:val("r_rep"),remindBefore:+val("r_rb")||0,sound:val("r_snd")||"",done:false,deleted:false,createdAt:Date.now()});
    persist();render();
    toast(when?T("Θα χτυπήσει σε {rel}{d}",{rel:relTimeText(when),d:autoDay?" ("+fmt(when)+")":""}):T("Μπήκε στη λίστα χωρίς ώρα. Δεν θα χτυπήσει."));
  };
  ["r_text","r_when","r_when_d","r_when_t"].forEach(id=>{const el=$("#"+id);if(el)el.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("#r_add").click()}})});
  stickFor($("#remForm"),()=>$("#r_add").click(),ic("bell",20)+T("Προσθήκη υπενθύμισης"));
  bindSoundPicker("r_snd");
}
function remEditSheet(r){
  openSheet({title:T("Αλλαγή υπενθύμισης"),cancelLabel:T("Άκυρο"),onCancel:null,
    body:`<label for="e_text">${T("Κείμενο")}</label><textarea id="e_text" rows="3">${esc(r.text)}</textarea>
    <label for="e_when">${T("Πότε να χτυπήσει")}</label>${dtHTML("e_when",r.when)}
    <div class="two"><div><label for="e_rb">${T("Προειδοποίηση")}</label><select id="e_rb">${REMB.filter(m=>m>=0).map(m=>`<option value="${m}" ${m===(+r.remindBefore||0)?"selected":""}>${rbEarly(m)}</option>`).join("")}</select></div>
    <div><label for="e_rep">${T("Επανάληψη")}</label><select id="e_rep">${repOpts(r.repeat)}</select></div></div>
    <label>${T("Ήχος")}</label>${soundPickerHTML("e_snd",r.sound||"")}`,
    onSave:()=>{const text=val("e_text");let when=dtVal("e_when");if(!text){toast(T("Γράψε τι να σου θυμίσω."));return false}
      if(!when){const w2=nextTimeOnly("e_when");if(w2)when=w2}
      Object.assign(r,{text,when,repeat:val("e_rep"),remindBefore:+val("e_rb")||0,sound:val("e_snd")||"",snoozeUntil:null,alerted:false,preAlerted:false});persist();render();
      toast(when?T("Θα χτυπήσει σε {rel}.",{rel:relTimeText(when)}):T("Η υπενθύμιση ενημερώθηκε."));},
    onDelete:()=>{r.deleted=true;r.deletedAt=Date.now();persist();render();toast(T("Μεταφέρθηκε στα διαγραμμένα."));},
    deleteMsg:T("Να μεταφερθεί η υπενθύμιση στο αρχείο;")});
  bindSoundPicker("e_snd");
}
function archiveSheet(){
  const done=S.reminders.filter(r=>r.done&&!r.deleted).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const del=S.reminders.filter(r=>r.deleted).sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0));
  const row=r=>`<div class="row arch" style="cursor:default"><div class="grow"><div class="title">${esc(r.text)}</div>
    <div class="meta"><span>${fmt(r.when)}</span>${r.repeat!=="none"?`<span>${REPL()[r.repeat]}</span>`:""}</div></div>
    <button class="mini" data-rem="restore" data-id="${r.id}" title="${T("Επαναφορά στη λίστα")}" aria-label="${T("Επαναφορά στη λίστα")}">↺</button>
    <button class="mini del" data-rem="purge" data-id="${r.id}" title="${T("Οριστική διαγραφή")}" aria-label="${T("Οριστική διαγραφή")}">${ic("trash",18)}</button></div>`;
  const group=(list,title,cls,kind)=>sec(`${title} (${list.length})`,cls)+
    (list.length?panel(list.map(row).join(""))+`<button class="btn danger" data-rem="purgeKind" data-kind="${kind}" style="margin-top:6px;padding-left:0">${T("Άδειασμα φακέλου")}</button>`
      :panel(`<div class="empty">${T("Ο φάκελος είναι άδειος.")}</div>`));
  openSheet({title:T("Αρχείο υπενθυμίσεων"),cancelLabel:T("Πίσω"),onCancel:null,
    body:`<p class="note">${T("Ό,τι ολοκλήρωσες ή διέγραψες μένει εδώ, σε δύο φακέλους, μέχρι να το σβήσεις εσύ.")}</p>`+
      group(done,T("Ολοκληρωμένες"),"","done")+group(del,T("Διαγραμμένες"),"red","del")});
}
function handleRem(act,id,kind){
  const r=S.reminders.find(x=>x.id===id);
  if(act==="archive")return archiveSheet();
  if(act==="purgeKind"){
    const isDel=kind==="del";
    if(!confirm(isDel?T("Να σβηστούν οριστικά όλες οι διαγραμμένες;"):T("Να σβηστούν οριστικά όλες οι ολοκληρωμένες;")))return;
    S.reminders=S.reminders.filter(r=>remActive(r)||(isDel?!r.deleted:!(r.done&&!r.deleted)));persist();render();return archiveSheet()}
  if(!r)return;
  if(act==="edit")return remEditSheet(r);
  if(act==="done"){completeReminder(r);toast(r.done?T("Μεταφέρθηκε στα ολοκληρωμένα."):T("Μετακινήθηκε στην επόμενη φορά."))}
  else if(act==="del"){r.deleted=true;r.deletedAt=Date.now();toast(T("Μεταφέρθηκε στα διαγραμμένα."))}
  else if(act==="restore"){r.done=false;r.deleted=false;r.snoozeUntil=null;r.alerted=true;persist();render();toast(T("Η υπενθύμιση επανήλθε."));return archiveSheet()}
  else if(act==="purge"){if(!confirm(T("Οριστική διαγραφή; Δεν αναιρείται.")))return;S.reminders=S.reminders.filter(x=>x.id!==id);persist();render();return archiveSheet()}
  persist();render();
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-rem]");if(b)handleRem(b.dataset.rem,b.dataset.id,b.dataset.kind)});

/* ---------- Ειδοποιήσεις όσο η εφαρμογή είναι ανοιχτή ---------- */
let alertQ=[],alertShown=null,lastOver=-1;
const queued=id=>alertQ.some(a=>a.id===id)||alertShown?.id===id;
const taskAlertAt=x=>x.snoozeUntil?new Date(x.snoozeUntil):new Date(+new Date(x.start)-Math.max(0,x.remindBefore||0)*60000);
function checkDue(){
  const now=new Date(),oc=S.reminders.filter(remOver).length;
  if(oc!==lastOver){lastOver=oc;if(!$("#modal").classList.contains("open"))render()}
  S.reminders.forEach(r=>{
    if(!remActive(r)||noTime(r)||queued(r.id))return;
    const due=+remDue(r),rb=Math.max(0,r.remindBefore||0);
    if(rb&&!r.preAlerted&&!r.alerted&&Date.now()>=due-rb*60000&&Date.now()<due)alertQ.push({type:"rem",id:r.id,pre:true});
    else if(remOver(r)&&!r.alerted)alertQ.push({type:"rem",id:r.id});
  });
  S.tasks.forEach(x=>{if(isOpen(x)&&x.start&&x.remindBefore>=0&&!x.startNotified&&taskAlertAt(x)<=now&&!queued(x.id))alertQ.push({type:"task",id:x.id})});
  if(!alertShown)showNextAlert();
}
/* ---------- Ήχοι ---------- */
const SOUNDS={
  chime:{name:"Καμπανάκι",notes:[[880,0,.5],[1320,.16,.6]]},
  bell:{name:"Κουδούνι",notes:[[1568,0,.9],[1046,.1,.9]]},
  soft:{name:"Απαλό",notes:[[523,0,.5],[659,.2,.5],[784,.4,.6]]},
  alert:{name:"Έντονο",notes:[[440,0,.18],[440,.22,.18],[440,.44,.18],[660,.66,.4]]},
  deep:{name:"Βαθύ",notes:[[196,0,.7],[147,.25,.8]]},
  alarm:{name:"Ξυπνητήρι (επίμονο)",notes:[[880,0,.28],[660,.3,.28],[880,.6,.28],[660,.9,.28],[880,1.2,.35]],loop:1.7},
  none:{name:"Χωρίς ήχο",notes:[]}
};
let AC=null,loopT=null,audioEl=null;
const customSoundById=id=>(S.settings.customSounds||[]).find(c=>c.id===id);
function allSoundEntries(){
  return Object.entries(SOUNDS).map(([id,v])=>({id,name:v.name,custom:false}))
    .concat((S.settings.customSounds||[]).map(c=>({id:c.id,name:c.name,custom:true,persistent:c.persistent})));
}
function stopSound(){
  if(loopT){clearInterval(loopT);loopT=null}
  if(audioEl){try{audioEl.pause();audioEl.currentTime=0}catch(e){}}
}
function playSound(kind,repeatFor){
  stopSound();
  const key=kind||S.settings.sound;
  const custom=customSoundById(key);
  if(custom){
    try{
      audioEl=audioEl||new Audio();
      audioEl.src=custom.dataUrl;audioEl.currentTime=0;audioEl.loop=false;
      audioEl.play().catch(()=>{});
      if(custom.persistent&&repeatFor!==false){
        audioEl.loop=true;
        const until=Date.now()+(typeof repeatFor==="number"?repeatFor:45000);
        loopT=setInterval(()=>{if(Date.now()>until||!$("#alert").classList.contains("open"))stopSound()},500);
      }
    }catch(e){}
    return;
  }
  const s=SOUNDS[key]||SOUNDS.chime;if(!s.notes.length)return;
  if(s.loop&&repeatFor!==false){
    const until=Date.now()+(typeof repeatFor==="number"?repeatFor:45000);
    playOnce(s);loopT=setInterval(()=>{if(Date.now()>until||!$("#alert").classList.contains("open"))stopSound();else playOnce(s)},s.loop*1000);
    return;
  }
  playOnce(s);
}
function playOnce(s){
  try{
    AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
    s.notes.forEach(([f,t,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type="sine";o.frequency.value=f;
      o.connect(g);g.connect(AC.destination);const t0=AC.currentTime+t;
      g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.25,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+d);
      o.start(t0);o.stop(t0+d+.05)});
  }catch(e){}
}
const beep=()=>playSound();
/* ---------- Ειδοποιήσεις κινητού ---------- */
const canNotify=()=>"Notification" in window;
let swReg=null;
let newSW=null;
async function initSW(){
  if(!("serviceWorker" in navigator)||localFile()||!window.isSecureContext)return null;
  try{
    swReg=await navigator.serviceWorker.getRegistration();
    if(!swReg)swReg=await navigator.serviceWorker.register("sw.js",{updateViaCache:"none"});
    await navigator.serviceWorker.ready;
    swReg.addEventListener("updatefound",()=>{
      const w=swReg.installing;if(!w)return;
      w.addEventListener("statechange",()=>{if(w.state==="installed"&&navigator.serviceWorker.controller){newSW=w;showUpdateBar()}});
    });
    try{swReg.update()}catch(e){}
    return swReg;
  }catch(e){return null}
}
