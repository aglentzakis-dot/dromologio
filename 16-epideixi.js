/* Δρομολόγιο — Επίδειξη (δοκιμή με παραδείγματα).
   Ανοίγει την εφαρμογή με έτοιμους πελάτες, εργασίες, προσφορές, κινήσεις και υπενθυμίσεις,
   σε ΞΕΧΩΡΙΣΤΗ αποθήκευση (stodromo-demo). Τα πραγματικά δεδομένα (stodromo-v1) δεν αγγίζονται.
   Η επιλογή λειτουργίας διαβάζεται στο 02-glossa-apothikeusi.js, πριν φορτωθούν τα δεδομένα. */

const DEMO_KEY="stodromo-demo",MODE_KEY="stodromo-mode";
const isDemo=()=>{try{return localStorage.getItem(MODE_KEY)==="demo"}catch(e){return false}};

function demoData(){
  const now=Date.now(),day=86400000;
  // ημερομηνία/ώρα σε μορφή πεδίου (τοπική ώρα), με μετατόπιση ημερών και συγκεκριμένη ώρα
  const at=(dd,h,m)=>{const d=new Date(now+dd*day);d.setHours(h,m||0,0,0);return toLocalInput(d)};
  const iso=(dd,h)=>{const d=new Date(now+dd*day);d.setHours(h||10,0,0,0);return d.toISOString()};
  const ms=(dd,h)=>{const d=new Date(now+dd*day);d.setHours(h||10,0,0,0);return +d};
  const C=[
    {id:"dc1",name:"Γιώργος Παπαδόπουλος",street:"Λεωφ. Βουλιαγμένης",number:"112",area:"Γλυφάδα",lat:37.8680,lng:23.7540,mobile:"6900000001",rating:5,notes:"Προτιμά ραντεβού πρωί. Κουδούνι «Παπαδόπουλος», 2ος όροφος."},
    {id:"dc2",name:"Μαρία Κωνσταντίνου",street:"Φορμίωνος",number:"45",area:"Βύρωνας",lat:37.9605,lng:23.7545,mobile:"6900000002",rating:4},
    {id:"dc3",name:"Καφέ «Η Γωνιά»",company:"Γωνιά Ο.Ε.",street:"Κηφισίας",number:"210",area:"Μαρούσι",lat:38.0480,lng:23.8050,phone:"2100000003",rating:4,hours:"08:00–20:00"},
    {id:"dc4",name:"Νίκος Αλεξίου",street:"Αγίας Παρασκευής",number:"8",area:"Χαλάνδρι",lat:38.0215,lng:23.7990,mobile:"6900000004",rating:3},
    {id:"dc5",name:"Ελένη Σταύρου",street:"Θησέως",number:"19",area:"Καλλιθέα",lat:37.9560,lng:23.7030,mobile:"6900000005",rating:5}
  ].map(c=>Object.assign({places:[],photos:[]},c));
  const incl=["Εργασία κατασκευής και εκτέλεσης","Προμήθεια των απαιτούμενων υλικών","Μεταφορά υλικών στον χώρο του έργου","Παράδοση του χώρου καθαρού και ολοκληρωμένου"];
  const excl=["Οικοδομικές εργασίες που δεν αναφέρονται στην προσφορά","Πρόσθετα υλικά που θα απαιτηθούν λόγω απρόβλεπτων συνθηκών","Εργασίες που θα ζητηθούν επιπλέον από τον πελάτη"];
  const offer=(no,client,title,amount,dd,extra)=>Object.assign({no,client,title,amount:String(amount),valid:30,incl,excl,inclExtra:"",exclExtra:"",
    terms:OFFER_TERMS_DEF,date:ms(dd),sentAt:ms(dd,11)},extra||{});
  const X=[
    {id:"dt1",title:"Αλλαγή βρύσης κουζίνας",clientId:"dc2",status:"pending",start:at(0,10,0),end:at(0,11,30),amount:120,priority:3,
      check:[{text:"Εργαλεία",done:true},{text:"Σιλικόνη",done:false},{text:"Νέα βρύση (έχει ο πελάτης)",done:false}]},
    {id:"dt2",title:"Βάψιμο σαλονιού",clientId:"dc1",status:"progress",start:at(-1,8,0),end:at(1,16,0),amount:650,startedAt:ms(-1,8),
      offer:offer(502,"Γιώργος Παπαδόπουλος","Βάψιμο σαλονιού",650,-6,{sharedAt:ms(-6,11)}),
      offers:[offer(501,"Γιώργος Παπαδόπουλος","Βάψιμο σαλονιού και διαδρόμου",820,-9,{sharedAt:ms(-9,12)})]},
    {id:"dt3",title:"Επισκευή ντουλαπιού",clientId:"dc4",status:"pending",start:at(-2,12,0),end:at(-2,13,0),amount:80},
    {id:"dt4",title:"Τοποθέτηση φωτιστικών",clientId:"dc3",status:"waiting",amount:340,waitingSince:ms(-2),
      offer:offer(503,"Καφέ «Η Γωνιά»","Τοποθέτηση 6 φωτιστικών οροφής",340,-2,{savedAt:ms(-2,11)})},
    {id:"dt5",title:"Αυτοψία για πλακάκια μπάνιου",clientId:"dc5",status:"appt",start:at(1,9,30),end:at(1,10,0)},
    {id:"dt6",title:"Έλεγχος υγρασίας τοίχου",clientId:"dc2",status:"inspect",start:at(2,17,0)},
    {id:"dt7",title:"Αλλαγή κλειδαριάς",clientId:"dc4",status:"done",start:at(-5,10,0),doneAt:ms(-5,11),completedOn:iso(-5).slice(0,10),amount:90,warrantyMonths:6},
    {id:"dt8",title:"Συντήρηση θερμοσίφωνα",clientId:"dc1",status:"done",start:at(-12,9,0),doneAt:ms(-12,11),completedOn:iso(-12).slice(0,10),amount:150,paid:true,settled:true},
    {id:"dt9",title:"Ρύθμιση πόρτας (εγγύηση)",clientId:"dc5",status:"done",start:at(-3,15,0),doneAt:ms(-3,16),completedOn:iso(-3).slice(0,10),amount:0,charge:"warranty"},
    {id:"dt10",title:"Πάρε υλικά από την αποθήκη",area:"Κορωπί",lat:37.9000,lng:23.8730,status:"pending",priority:2}
  ].map(x=>Object.assign({who:["me"],priority:2,remindBefore:0,nearAlert:0,check:[],photos:[],warrantyMonths:0,createdAt:ms(-14)},x));
  const L=[
    {id:"dl1",kind:"advance",amount:200,date:iso(-1,9),clientId:"dc1",taskId:"dt2",note:"Βάψιμο σαλονιού"},
    {id:"dl2",kind:"material",amount:95,date:iso(-1,8),clientId:"dc1",taskId:"dt2",note:"Χρώματα και ρολά"},
    {id:"dl3",kind:"payment",amount:150,date:iso(-12,11),clientId:"dc1",taskId:"dt8",note:"Συντήρηση θερμοσίφωνα"},
    {id:"dl4",kind:"fuel",amount:40,date:iso(-4,19),note:"Βενζίνη"},
    {id:"dl5",kind:"payment",amount:50,date:iso(-5,11),clientId:"dc4",taskId:"dt7",note:"Έναντι για κλειδαριά"},
    {id:"dl6",kind:"material",amount:35,date:iso(-5,9),clientId:"dc4",taskId:"dt7",note:"Κλειδαριά"},
    {id:"dl7",kind:"extra",amount:30,date:iso(-7,14),note:"Μικροεπισκευή χωρίς εργασία στο σύστημα"}
  ].map(e=>Object.assign({createdAt:new Date(e.date).getTime()},e));
  const R=[
    {id:"dr1",text:"Να πάρω τηλέφωνο την κυρία Κωνσταντίνου για την υγρασία",when:at(0,18,0),repeat:"none"},
    {id:"dr2",text:"Πληρωμή ενοικίου αποθήκης",when:at(3,9,0),repeat:"month"},
    {id:"dr3",text:"Αλλαγή λαδιών στο βανάκι",when:at(9,9,0),repeat:"none"}
  ].map(r=>Object.assign({remindBefore:0,done:false,deleted:false,createdAt:ms(-3)},r));
  return{clients:C,tasks:X,reminders:R,ledger:L,areas:[],notes:[{id:"dn1",text:"Να παραγγείλω πλακάκια 60×60 για την κ. Σταύρου.",date:iso(-1,20)}],
    settings:{lang:S.settings.lang||"el",installBannerOff:true,offerSeq:503,
      biz:{name:"Μαστορέματα Επίδειξη",afm:"000000000",phone:"6900000000",address:"Αθήνα"}},
    meta:{changes:0,lastBackup:now,lastAuto:now}};
}
function enterDemo(){
  if(!confirm(T("Θα ανοίξει η εφαρμογή με παραδείγματα, για να δεις πώς δουλεύει. Τα δικά σου δεδομένα ΔΕΝ αλλάζουν και θα τα βρεις όπως ήταν όταν βγεις από την επίδειξη. Συνέχεια;")))return;
  try{localStorage.setItem(DEMO_KEY,JSON.stringify(demoData()));localStorage.setItem(MODE_KEY,"demo")}
  catch(e){toast(T("Δεν υπάρχει χώρος στη συσκευή για την επίδειξη."));return}
  location.reload();
}
function exitDemo(){
  if(!confirm(T("Έξοδος από την επίδειξη; Τα παραδείγματα σβήνονται και γυρνάς στα δικά σου δεδομένα.")))return;
  try{localStorage.removeItem(MODE_KEY);localStorage.removeItem(DEMO_KEY);localStorage.removeItem(DKEY)}catch(e){}
  location.reload();
}
// Κάρτα στην αρχική: στην πρώτη χρήση (χωρίς δεδομένα) προτείνει την επίδειξη.
function demoCardHTML(){
  if(isDemo())return "";
  if(S.tasks.length||S.clients.length||S.ledger.length)return "";
  return `<div class="democard"><b>${T("Πρώτη φορά εδώ;")}</b><span>${T("Δες την εφαρμογή γεμάτη με παραδείγματα: πελάτες, εργασίες, προσφορές, ταμείο και διαδρομές. Τα δικά σου δεδομένα δεν επηρεάζονται.")}</span>
    <button class="btn amber" data-act="demoOn">${ic("spark",18)} ${T("Δοκίμασε με παραδείγματα")}</button></div>`;
}
// Κουμπί στις Ρυθμίσεις › Δεδομένα.
function demoSettingsHTML(){
  return `<h3 class="sub">${T("Επίδειξη")}</h3>
    <p class="note">${isDemo()?T("Βρίσκεσαι στην επίδειξη. Ό,τι αλλάξεις εδώ δεν επηρεάζει τα δικά σου δεδομένα."):T("Άνοιξε την εφαρμογή με έτοιμα παραδείγματα για να δεις τι κάνει. Τα δικά σου δεδομένα μένουν ανέγγιχτα.")}</p>
    <button class="btn ${isDemo()?"danger":"ghost"}" data-act="${isDemo()?"demoOff":"demoOn"}" style="width:100%">${isDemo()?T("Έξοδος από την επίδειξη"):ic("spark",18)+" "+T("Δοκίμασε με παραδείγματα")}</button>`;
}
// Σταθερή ένδειξη πάνω πάνω όσο είσαι στην επίδειξη.
function demoBanner(){
  if(!isDemo()||$("#demoBar"))return;
  const d=document.createElement("div");d.id="demoBar";d.className="demobar";
  d.innerHTML=`<span>${ic("spark",16)} ${T("Επίδειξη με παραδείγματα")}</span><button type="button" data-act="demoOff">${T("Έξοδος")}</button>`;
  document.body.appendChild(d);document.body.classList.add("demo");
}
demoBanner();
// η αρχική σχεδιάστηκε πριν φορτωθεί αυτό το αρχείο: ξανασχεδιάζεται για να εμφανιστεί η κάρτα επίδειξης
if(view==="today")render();
