/* Δρομολόγιο — Γλώσσα, αποθήκευση στη συσκευή, εμφάνιση. */
/* ---------- Γλώσσα ---------- */
let LANG="el";
function T(s,v){let r=(LANG==="en"&&EN[s])||s;if(r.includes("|"))r=r.split("|")[0];if(v)for(const k in v)r=r.split("{"+k+"}").join(v[k]);return r}
const pl=(n,one,many)=>T(n===1?one:many,{n});
const LOC=()=>LANG==="en"?"en-GB":"el-GR";
const fmt=s=>s?new Date(s).toLocaleString(LOC(),{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"";
const fmtDay=s=>{if(!s)return "";const d=new Date(s);
  const wd=d.toLocaleDateString(LOC(),{weekday:"short"}).replace(".","").slice(0,2);
  return wd+"."+d.toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"})};
const fmtKm=n=>Math.max(0,n).toLocaleString(LOC(),{maximumFractionDigits:1})+" "+T("χλμ.");
const money0=n=>Number(n||0).toLocaleString(LOC(),{style:"currency",currency:"EUR",maximumFractionDigits:0});
const money=n=>Number(n||0).toLocaleString(LOC(),{style:"currency",currency:"EUR"});
const REPL=()=>({none:T("Μία φορά"),day:T("Κάθε μέρα"),week:T("Κάθε εβδομάδα"),month:T("Κάθε μήνα"),year:T("Κάθε χρόνο")});
const beforeText=m=>m<60?T("{n} λεπτά νωρίτερα",{n:m}):m<1440?pl(m/60,"{n} ώρα νωρίτερα","{n} ώρες νωρίτερα"):T("24 ώρες νωρίτερα");
const rbLabel=m=>m<0?T("Χωρίς ειδοποίηση"):m===0?T("Στην ώρα έναρξης"):beforeText(m);
function warrantyUntil(x){
  if(!x.warrantyMonths||!x.completedOn)return null;
  const d=new Date(x.completedOn+"T00:00:00");if(isNaN(d))return null;
  d.setMonth(d.getMonth()+(+x.warrantyMonths||0));return d;
}
// φροντίζει μόνη της την υπενθύμιση πριν λήξει η εγγύηση μιας δουλειάς
function syncWarrantyReminder(x){
  const drop=()=>{if(x.warrantyReminderId){const r=S.reminders.find(y=>y.id===x.warrantyReminderId);if(r){r.deleted=true;r.deletedAt=Date.now()}x.warrantyReminderId=null}};
  const end=warrantyUntil(x);
  if(x.status!=="done"||!end){drop();return}
  const when=new Date(end);when.setDate(when.getDate()-7);
  if(when<new Date()){drop();return}
  const iso=toLocalInput(when);
  const c=x.clientId&&getClient(x.clientId);
  const text=T("Λήγει η εγγύηση: {t}",{t:x.title})+(c?" — "+c.name:"");
  let r=x.warrantyReminderId&&S.reminders.find(y=>y.id===x.warrantyReminderId);
  if(r&&!r.deleted){r.when=iso;r.text=text}
  else{r={id:uid(),text,when:iso,repeat:"none",remindBefore:0,done:false,deleted:false,createdAt:Date.now()};S.reminders.push(r);x.warrantyReminderId=r.id}
}
const fmtShort=d=>d.toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"});
const remDoneLabel=r=>r&&r.repeat&&r.repeat!=="none"?T("Έγινε, μέχρι την επόμενη φορά"):T("Έγινε, τελείωσε");
const rbEarly=m=>m===0?T("Μόνο στην ώρα της"):beforeText(m);
const MYLOC=()=>T("Η θέση μου");
const distTxt=m=>m<950?T("{n} μέτρα",{n:Math.max(50,Math.round(m/50)*50)}):T("{n} χλμ.",{n:(m/1000).toFixed(1).replace(".",",")});

/* ---------- Αποθήκευση στη συσκευή ---------- */
// Στην επίδειξη (16-epideixi.js) διαβάζουμε/γράφουμε σε ξεχωριστή αποθήκευση· τα πραγματικά δεδομένα μένουν ανέγγιχτα.
const DEMO_MODE=(()=>{try{return localStorage.getItem("stodromo-mode")==="demo"}catch(e){return false}})();
const KEY=DEMO_MODE?"stodromo-demo":"stodromo-v1";const DKEY=DEMO_MODE?"stodromo-draft-demo":"stodromo-draft";let memCopy=null;
function saveDraft(kind,data){try{localStorage.setItem(DKEY,JSON.stringify({kind,data,at:Date.now()}))}catch(e){}}
function clearDraft(){try{localStorage.removeItem(DKEY)}catch(e){}}
function getDraft(){try{const x=JSON.parse(localStorage.getItem(DKEY)||"null");
  if(!x||Date.now()-x.at>3*86400000)return null;return x}catch(e){return null}}
function load(){try{const s=localStorage.getItem(KEY);if(s)return JSON.parse(s)}catch(e){}return memCopy}
function write(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){memCopy=JSON.parse(JSON.stringify(S))}}
function persist(){S.meta.changes=(S.meta.changes||0)+1;write();scheduleAuto()}
const DEF_KINDS=[{id:"advance",name:"Προκαταβολή",dir:"in"},{id:"payment",name:"Εξόφληση",dir:"in"},{id:"extra",name:"Άλλο έσοδο",dir:"in"},
  {id:"material",name:"Υλικά",dir:"out"},{id:"wages",name:"Μεροκάματα",dir:"out"},{id:"payout",name:"Πληρωμή",dir:"out"},
  {id:"fuel",name:"Καύσιμα",dir:"out"},{id:"parts",name:"Ανταλλακτικά",dir:"out"},{id:"expense",name:"Δαπάνη",dir:"out"}];
// Τι παίρνω μαζί: προεπιλεγμένη λίστα, την αλλάζει ο χρήστης όπως θέλει
const DEF_CHECK=["Εργαλεία","Ταινία","Σακούλες","Σκάλα","Μπαλαντέζα","Βίδες και ούπα","Σιλικόνη","Γάντια","Καθάρισμα μετά"];
const DEF_NOTES_IN=["Προκαταβολή","Εξόφληση","Έναντι","Προμήθεια εργασίας"];
const DEF_NOTES_OUT=["Υλικά","Μεροκάματα","Καύσιμα","Διόδια","Μεταφορικά","Εργατικά","Ανταλλακτικά"];
function fix(d){
  d=d&&typeof d==="object"?d:{};
  ["clients","tasks","reminders","areas"].forEach(k=>{if(!Array.isArray(d[k]))d[k]=[]});
  d.settings=Object.assign({installBannerOff:false,clock:"app",realRoute:true,showMove:false,debtAlert:true,debtRadius:1000,splitTime:false,manualOrder:false,ejService:"",ejTemplate:"",ejKey:"",sound:"chime",vibrate:true,notify:false,people:[],detour:3,backupEvery:10,backupEmail:"",autoEmail:true,lang:"el",base:null},d.settings||{});
  if(!Array.isArray(d.settings.kinds)||!d.settings.kinds.length)d.settings.kinds=DEF_KINDS.map(k=>Object.assign({},k));
  if(!d.settings.kindsV4){
    const ks=d.settings.kinds;
    if(!ks.some(k=>k.dir==="out"&&norm(k.name)===norm("Υλικά")))ks.unshift({id:"material",name:"Υλικά",dir:"out"});
    d.settings.kindsV4=true;
  }
  if(!d.settings.kindsV3){
    // Η «Πληρωμή» φεύγει από τα έσοδα (γίνεται «Εξόφληση») και μπαίνει στα έξοδα, μαζί με τα μεροκάματα
    const ks=d.settings.kinds;
    ks.forEach(k=>{if(k.dir==="in"&&/^πληρωμή$/i.test(String(k.name).trim()))k.name="Εξόφληση"});
    const has=n=>ks.some(k=>norm(k.name)===norm(n));
    if(!has("Μεροκάματα"))ks.push({id:"wages",name:"Μεροκάματα",dir:"out"});
    if(!ks.some(k=>k.dir==="out"&&norm(k.name)===norm("Πληρωμή")))ks.push({id:"payout",name:"Πληρωμή",dir:"out"});
    if(!has("Ανταλλακτικά"))ks.push({id:"parts",name:"Ανταλλακτικά",dir:"out"});
    d.settings.kindsV3=true;
  }
  d.settings.kinds.forEach(k=>{if(!k.id)k.id=uid();if(k.dir!=="out")k.dir=k.dir==="in"?"in":"in"});
  if(!Array.isArray(d.settings.noteTipsIn)||!d.settings.noteTipsIn.length)d.settings.noteTipsIn=DEF_NOTES_IN.slice();
  if(!Array.isArray(d.settings.noteTipsOut)||!d.settings.noteTipsOut.length)
    d.settings.noteTipsOut=(Array.isArray(d.settings.noteTips)&&d.settings.noteTips.length?d.settings.noteTips.slice():DEF_NOTES_OUT.slice());
  if(!d.settings.noteTipsCleaned){
    // ο πρώτος χωρισμός εσόδων/εξόδων είχε αντιγράψει και έσοδα μέσα στα έξοδα κατά λάθος· καθάρισμα μία φορά
    const bad=new Set(DEF_NOTES_IN.map(t=>t.trim().toLowerCase()));
    d.settings.noteTipsOut=d.settings.noteTipsOut.filter(t=>!bad.has(String(t).trim().toLowerCase()));
    if(!d.settings.noteTipsOut.length)d.settings.noteTipsOut=DEF_NOTES_OUT.slice();
    d.settings.noteTipsCleaned=true;
  }
  d.settings.look=Object.assign({bg:"art",bgOpacity:0.1,icon:true,customBg:"",customIcon:"",preset:"classic",brand:"",accent:"",paper:"",ink:"",zoom:1,title:""},d.settings.look||{});
  d.meta=Object.assign({changes:0,lastBackup:null,lastAuto:0},d.meta||{});
  d.clients.forEach(c=>{if(!c.id)c.id=uid();if(!c.name)c.name="—";c.rating=+c.rating||0;
    if(!Array.isArray(c.places))c.places=[];
    c.places.forEach(pl=>{if(!pl.id)pl.id=uid()})});
  if(!d.settings.people||!d.settings.people.length)d.settings.people=[{id:"me",name:"Εγώ",color:"#2468B5",on:true}];
  const OLDC={"#2468b5":"#7FA8D9","#c8412b":"#E8A49C","#2e7d5b":"#8FC7AE","#8a4fbf":"#C0A8DE","#d97706":"#EBC27D","#0e7490":"#8FC4CC","#be185d":"#E3A8C4","#4b5563":"#AEB6C2","#7c3aed":"#C0A8DE","#047857":"#9DD0C7"};
  d.settings.people.forEach(p=>{if(!p.id)p.id=uid();if(p.on===undefined)p.on=true;
    const k=String(p.color||"").toLowerCase();if(OLDC[k])p.color=OLDC[k]});
  d.tasks.forEach(x=>{if(!x.id)x.id=uid();if(!Array.isArray(x.who))x.who=[d.settings.people[0].id];if(x.nearAlert==null)x.nearAlert=0;if(!x.status)x.status="pending";if(x.remindBefore==null)x.remindBefore=x.notifyStart===false?-1:0;if(!x.priority)x.priority=2});
  d.reminders.forEach(r=>{if(!r.id)r.id=uid();r.done=!!r.done;r.deleted=!!r.deleted;if(!r.repeat)r.repeat="none";r.remindBefore=REMB.includes(+r.remindBefore)&&+r.remindBefore>=0?+r.remindBefore:0});
  d.areas=d.areas.filter(a=>a&&a.name&&a.lat!=null);
  if(!Array.isArray(d.ledger))d.ledger=[];
  if(!Array.isArray(d.notes))d.notes=[];
  d.notes.forEach(n=>{if(!n.id)n.id=uid()});
  if(!Array.isArray(d.learned))d.learned=[];
  if(!Array.isArray(d.settings.customSounds))d.settings.customSounds=[];
  d.settings.customSounds.forEach(c=>{if(!c.id)c.id=uid();c.persistent=!!c.persistent});
  if(!d.settings.quickTimes)d.settings.quickTimes={eve:"20:00",tom:"09:00",we:"10:00"};
  if(!d.settings.biz)d.settings.biz={name:"",afm:"",phone:"",address:""};
  if(!Array.isArray(d.settings.taskTips)||!d.settings.taskTips.length)d.settings.taskTips=["Ραντεβού","Προσφορά","Έλεγχος"];
  if(!Array.isArray(d.settings.checkTpl)||!d.settings.checkTpl.length)d.settings.checkTpl=DEF_CHECK.slice();
  d.tasks.forEach(t=>{if(!Array.isArray(t.check))t.check=[]});
  if(!d.settings.trashDays)d.settings.trashDays=30;
  if(!d.settings.moneyLock)d.settings.moneyLock={on:false,pin:""};
  d.tasks.forEach(t=>{if(t.status==="someday")t.status="pending"});
  if(!d.settings.biz)d.settings.biz={name:"",afm:"",phone:"",address:""};
  if(d.settings.jmShowOwed===undefined)d.settings.jmShowOwed=true;
  if(!d.settings.receiptSeq)d.settings.receiptSeq=0;
  d.tasks.forEach(x=>{if(x.warrantyMonths==null)x.warrantyMonths=0;if(!Array.isArray(x.photos))x.photos=[]});
  d.learned=d.learned.filter(a=>a&&a.name&&a.lat!=null);
  d.tasks.forEach(x=>{
    if(x.paid&&+x.amount>0&&!x.settled){
      d.ledger.push({id:uid(),kind:"payment",amount:+x.amount,date:new Date(x.paidAt||x.doneAt||x.createdAt||Date.now()).toISOString(),
        clientId:x.clientId||null,taskId:x.id,note:x.title||""});
      x.settled=true;
    }
  });
  d.ledger.forEach(e=>{if(!e.id)e.id=uid();e.amount=+e.amount||0;if(!e.date)e.date=new Date().toISOString();if(!e.createdAt)e.createdAt=new Date(e.date).getTime()||0});
  return d;
}
let S=fix(load());LANG=S.settings.lang||"el";
// Η ένδειξη «εξοφλημένη» βγαίνει πάντα από τις πραγματικές εισπράξεις
/* (ο έλεγχος πληρωμένων εργασιών κατά την εκκίνηση μεταφέρθηκε στο τέλος του 14-patimata-ekkinisi.js) */

/* ---------- Εμφάνιση ---------- */
const PRESETS={
  classic:{name:"Κλασικό",brand:"#17324D",accent:"#F2B632",paper:"#EDF1F2",card:"#FFFFFF",ink:"#17324D",muted:"#5E7185",line:"#D6DEE3"},
  dark:{name:"Σκούρο",brand:"#0F1D2B",accent:"#F2B632",paper:"#0B131B",card:"#152230",ink:"#E6EDF3",muted:"#93A5B6",line:"#2A3B4D"},
  forest:{name:"Δάσος",brand:"#1E4D3A",accent:"#E9B949",paper:"#EDF3EF",card:"#FFFFFF",ink:"#16372A",muted:"#5B7266",line:"#D2DED6"},
  sea:{name:"Θάλασσα",brand:"#0B4F6C",accent:"#4FD1C5",paper:"#EAF3F6",card:"#FFFFFF",ink:"#0C3446",muted:"#557483",line:"#CFE0E7"},
  sunset:{name:"Δειλινό",brand:"#5A2A3C",accent:"#F29E4C",paper:"#F6EFEC",card:"#FFFFFF",ink:"#3B1E28",muted:"#7A5F67",line:"#E7D7D2"}
};
function lum(hex){const n=parseInt(String(hex).replace("#",""),16);if(isNaN(n))return .5;const f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4};return .2126*f(n>>16&255)+.7152*f(n>>8&255)+.0722*f(n&255)}
function lookVals(){const L=S.settings.look,P=PRESETS[L.preset]||PRESETS.classic;
  const v={brand:L.brand||P.brand,accent:L.accent||P.accent,paper:L.paper||P.paper,ink:L.ink||P.ink,card:P.card,muted:P.muted,line:P.line};
  if(lum(v.paper)<.12&&lum(v.card)>.5){const D=PRESETS.dark;v.card=D.card;v.muted=D.muted;v.line=D.line}
  if(lum(v.paper)>.5&&lum(v.card)<.2){const C=PRESETS.classic;v.card=C.card;v.muted=C.muted;v.line=C.line}
  return v}
const VT={today:"Αρχική",tasks:"Εργασίες",reminders:"Υπενθυμίσεις",clients:"Πελάτες",client:"Πελάτης",money:"Ταμείο",route:"Διαδρομή"};
function updateHeaderTitle(){
  const app=(S.settings.look&&S.settings.look.title)||T("Δρομολόγιο");
  const at=$("#appTitle"),ag=$("#appTag");
  if(at)at.textContent=T(VT[view]||"Αρχική");
  if(ag)ag.textContent=app;
  document.title=app+" · "+T(VT[view]||"Αρχική");
}
function applyLook(){
  const v=lookVals(),R=document.documentElement.style,L=S.settings.look;
  Object.entries(v).forEach(([k,x])=>R.setProperty("--"+k,x));
  R.setProperty("--onbrand",lum(v.brand)>.45?"#10202E":"#FFFFFF");
  R.setProperty("--onaccent",lum(v.accent)>.35?"#10202E":"#FFFFFF");
  R.setProperty("--z",L.zoom||1);R.colorScheme=lum(v.card)<.3?"dark":"light";
  $('meta[name=theme-color]').content=v.brand;
  document.documentElement.lang=LANG;
  updateHeaderTitle();
  const iconSrc=L.icon===false?"":(L.customIcon||IMG_ICON);
  const im=$("#appIcon");im.style.display=iconSrc?"":"none";if(iconSrc)im.src=iconSrc;
  if(iconSrc){$("#favIcon").href=iconSrc;$("#favIcon2").href=iconSrc}
  const bgSrc=L.bg==="none"?"":(L.customBg||IMG_BG);
  document.body.style.setProperty("--bgimg",bgSrc?`url("${bgSrc}")`:"none");
  document.body.classList.toggle("hasbg",!!bgSrc);
  document.body.style.setProperty("--bgop",String(L.bgOpacity??0.1));
}

