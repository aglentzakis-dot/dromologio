/* Δρομολόγιο — Προσωπικά οικονομικά (χωριστό αρχείο για εύκολη διόρθωση)
   Εδώ είναι ΟΛΑ τα προσωπικά: κατηγορίες, κινήσεις, πάγια, γρήγορη λίστα,
   προϋπολογισμός, αναφορές, PDF, και η εμφάνισή τους (CSS στην αρχή).
   Φορτώνεται από το index.html ΠΡΙΝ από τον κυρίως κώδικα και χρησιμοποιεί
   τις κοινές βοηθητικές του (S, T, openSheet, money, κ.λπ.) μόνο όταν καλούνται.
   Τα δεδομένα: S.personal (κινήσεις), S.pfixed (πάγια), S.settings.pkinds,
   S.settings.pbudget, S.settings.pqHide. Δεν μετράνε ποτέ στην Εργασία. */

/* ---------- Εμφάνιση ---------- */
(function(){const st=document.createElement("style");st.id="prosopikaCss";st.textContent=`
:root{--pfaint:color-mix(in srgb,var(--muted) 50%,var(--card))}
.ptitle{font-size:20px;font-weight:850;margin:0 2px 8px}
.psum .sumcard span{display:flex;align-items:center;justify-content:center;gap:6px}
.pdot{width:11px;height:11px;border-radius:50%;display:inline-block}.pdot.g{background:var(--green)}.pdot.r{background:var(--red)}.pdot.b{background:#2468B5}
.kv.pbig span{font-weight:850}.kv.pbig b{font-size:20px}
.pbudget{display:flex;align-items:center;gap:10px;padding:4px 14px 10px}.pbtrack{flex:1;height:14px;background:var(--line);border-radius:8px;overflow:hidden}.pbtrack i{display:block;height:100%;border-radius:8px}
.pcta{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:1.5px dashed var(--line);background:var(--card);border-radius:14px;padding:12px 14px;margin:14px 0 4px;font-size:22px;color:var(--ink)}
.pcta span{flex:1;font-size:14px}.pcta b{display:block}.pcta small{display:block;color:var(--muted);font-size:12.5px}
.pem{font-size:20px;width:28px;text-align:center;flex:none}
.pfix .pst{font-weight:700}.pfix.late .pst{color:var(--red)}.pfix.soon .pst{color:#B36B00}.pfix.paid .pst{color:var(--green)}
.fixcard{padding:10px 12px;border-bottom:1px solid var(--line);cursor:pointer}
.fixcard:last-child{border-bottom:0}
.fc1{display:flex;align-items:center;gap:8px}.fc1 .fcn{flex:1;min-width:0;font-size:15.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fc1 .fca{font-size:15.5px;white-space:nowrap}
.fc2{display:flex;align-items:center;gap:8px;margin-top:6px;padding-left:36px}.fc2 .fcm{flex:1;min-width:0;font-size:12.5px;color:var(--muted);line-height:1.35}
.fixcard .pst{font-weight:750}.fixcard.late .pst{color:var(--red)}.fixcard.soon .pst{color:#B36B00}.fixcard.paid .pst{color:var(--green)}
.qseg button.on.out{background:var(--red);color:#fff}.qseg button.on.in{background:var(--green);color:#fff}
.qhead{display:flex;justify-content:space-between;align-items:center;border-radius:12px;padding:10px 14px;margin:10px 0 8px;font-weight:800}
.qhead.out{background:color-mix(in srgb,var(--red) 10%,var(--card));color:var(--red)}.qhead.in{background:color-mix(in srgb,var(--green) 10%,var(--card));color:var(--green)}
.qhead b{font-size:18px}
.pqedit{width:100%;border:1.5px dashed var(--line)}.pqedit.on{border-style:solid;border-color:var(--brand);color:var(--brand)}
.pqrow.qe{grid-template-columns:34px minmax(0,1fr) auto}.pqrow.qe.off .qn{text-decoration:line-through;opacity:.5}
.qeye{border:0;background:none;font-size:18px;padding:4px}.qbtns{display:flex;gap:4px}.qbtns .mini[disabled]{opacity:.3}
.qadd{padding:8px 12px}.qadd input{margin:0;font-size:14px;padding:8px 10px}
.pqrow{grid-template-columns:minmax(0,1fr) 88px 56px 22px!important}
.pqrow.qe{grid-template-columns:34px minmax(0,1fr) auto!important}.pqrow.qoff{grid-template-columns:minmax(0,1fr) auto 34px!important;opacity:.55}
.qarr{display:flex;flex-direction:column;gap:2px}.qarr button{border:0;background:none;color:var(--muted);font-size:10px;line-height:1;padding:3px 2px;border-radius:4px}
.qarr button:active{background:var(--line)}.qarr button[disabled]{opacity:.2}
.qcat{display:flex;align-items:center;justify-content:space-between}.qplus{border:1.5px solid var(--line);background:var(--card);color:var(--brand);border-radius:50%;width:26px;height:26px;font-weight:900;font-size:15px;line-height:1;padding:0}
.qhidn{display:block;width:100%;border:0;border-top:1px dashed var(--line);background:none;color:var(--muted);font-weight:750;font-size:12.5px;padding:8px 12px;text-align:left}
.qoffl{font-size:11.5px;color:var(--muted);font-weight:700}
.pcta.pmain{border-style:solid;border-color:var(--brand);background:color-mix(in srgb,var(--brand) 6%,var(--card))}
.pqrow{display:grid;grid-template-columns:minmax(0,1fr) 96px 62px;gap:8px;align-items:center;padding:6px 12px;border-bottom:1px solid var(--line)}
.pqrow .qn{font-weight:700;font-size:14.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis}
.pqrow.has .qn{color:var(--ink)}.pqrow.has{background:color-mix(in srgb,var(--green) 7%,transparent)}
.pqrow .qa{margin:0}.pqrow .qa input{padding:8px 6px 8px 28px!important;font-size:15px}.pqrow select{margin:0;padding:8px 4px;font-size:14px}
.psub{font-size:12.5px;font-weight:800;color:var(--muted);margin:10px 2px 6px;text-transform:uppercase;letter-spacing:.3px}
.pstop{flex:none;width:22px;height:22px;padding:0;border-radius:50%;border:0;background:none;color:var(--pfaint);font-size:11px;font-weight:700;line-height:22px;margin-left:2px;opacity:.8}.pstop:active{background:var(--line)}
.slrow{display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid var(--line)}
.slrow .slpick{flex:1;text-align:left;border:0;background:none;padding:8px 4px;font-weight:750;font-size:15px;color:var(--ink)}
.slrow .mini[disabled]{opacity:.3}
.pok{color:var(--green);font-weight:900;font-size:20px;margin-right:6px}
.prep{display:grid;grid-template-columns:minmax(0,1fr) 64px 64px 60px;gap:6px;align-items:center;padding:8px 14px;border-bottom:1px solid var(--line);font-size:13.5px}
.prep b{text-align:right}.prep .pm{color:var(--muted);font-weight:700}.prep em{font-style:normal;text-align:right;font-weight:800;font-size:12px}
.prep em.up{color:var(--red)}.prep em.down{color:var(--green)}
.prep.head{font-size:12px;color:var(--muted);font-weight:800}.prep.head b{font-size:12px}.prep.tot{font-weight:850;border-bottom:0}
.pcatgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pcatgrid button{display:flex;flex-direction:column;align-items:center;gap:4px;border:1.5px solid var(--line);background:var(--card);border-radius:14px;padding:10px 4px;font-weight:750;font-size:12.5px;color:var(--ink);text-align:center}
.pcatgrid button span{font-size:24px}
.pcatgrid button{position:relative}.pcatgrid.sorting button{border-style:dashed}
.pcmv{display:flex;gap:6px;margin-top:4px;font-style:normal}.pcmv b{display:inline-flex;align-items:center;justify-content:center;width:30px;height:26px;border-radius:8px;background:var(--brand);color:var(--onbrand);font-size:12px}
.pcmv b.dis{opacity:.25;pointer-events:none}
.pcsort{width:100%;margin-top:10px;border:1.5px dashed var(--line)}.pcsort.on{border-style:solid;border-color:var(--brand);color:var(--brand)}.pcatgrid button.on{border-color:var(--brand);background:color-mix(in srgb,var(--brand) 10%,var(--card))}.pcatgrid button.add{border-style:dashed;color:var(--muted)}
.pkedit{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-bottom:1px solid var(--line)}
.pkedit .pke{width:52px;text-align:center;font-size:20px;margin:0;padding:6px 2px}
.bookswitch{display:flex;justify-content:flex-end;gap:4px;margin:0 0 8px}
.bookswitch button{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:16px;padding:5px 11px;font-size:12.5px;font-weight:750}
.bookswitch button.on{background:var(--brand);color:var(--onbrand);border-color:var(--brand)}
.prow{display:grid;grid-template-columns:minmax(90px,38%) 1fr auto 34px;align-items:center;gap:8px;width:100%;border:0;border-bottom:1px solid var(--line);background:none;padding:9px 14px;text-align:left;color:var(--ink);cursor:pointer}
.prow .pname{font-weight:700;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.prow .pbar{height:9px;background:color-mix(in srgb,var(--red) 12%,transparent);border-radius:6px;overflow:hidden}
.prow .pbar i{display:block;height:100%;background:var(--red);border-radius:6px;opacity:.75}
.prow b{font-size:13.5px}.prow small{color:var(--muted);font-weight:700;text-align:right}
.pkgrid{display:flex;flex-wrap:wrap;gap:7px}
.pkgrid button{border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:18px;padding:7px 12px;font-weight:700;font-size:13.5px}
.pkgrid button.on.out{background:var(--red);border-color:var(--red);color:#fff}
.pkgrid button.on.in{background:var(--green);border-color:var(--green);color:#fff}
.pkgrid button.add{border-style:dashed;color:var(--muted)}
.pqrow .qn{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.pqrow.pressing{background:color-mix(in srgb,var(--red) 12%,var(--card));transition:background .9s}
.pqrow.qask{display:flex!important;flex-wrap:wrap;gap:8px;background:color-mix(in srgb,var(--red) 8%,var(--card))}
.pqrow.qask .qn{color:var(--ink);white-space:normal;flex-basis:100%}
.qaskb{display:flex;gap:6px;justify-content:flex-end;width:100%}.qaskb .btn{padding:7px 10px;font-size:13px;white-space:nowrap}
.pcatgrid button.pressing,.pickrow.pressing{background:color-mix(in srgb,var(--red) 14%,var(--card));transition:background .9s}
.pcatgrid button,.pickrow{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.pcask{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 12px;margin:0 0 10px;border-radius:12px;background:color-mix(in srgb,var(--red) 9%,var(--card))}
.pickbox .pcask{margin:0;border-radius:0;border-bottom:1px solid var(--line)}
.pcask span{flex:1 1 100%;font-weight:800}.pcask small{display:block;font-weight:650;color:var(--muted);margin-top:2px}
.pbookdef{display:flex;align-items:center;gap:8px;justify-content:center;margin:12px 0 0;font-size:12.5px;color:var(--muted);font-weight:700}
.pqrow.qoff{opacity:.45}.pqrow.qoff .qn,.pqrow.qoff .qeye{color:var(--pfaint)}
.qhidn,.qoffl{color:var(--pfaint)!important;font-weight:600!important;font-style:italic}
.qhidn{font-size:12px!important;border-top-color:color-mix(in srgb,var(--line) 60%,transparent)!important}
.pcback{border:0;background:none;color:var(--brand);font-weight:800;font-size:14.5px;padding:4px 2px 10px}
.pcsubs{max-height:none!important}
.pwipe{display:block;margin:14px auto 0;border:0;background:none;color:var(--pfaint);font-size:12.5px;font-weight:650;text-decoration:underline}
`;(document.head||document.documentElement).appendChild(st)})();

/* ---------- Προσωπικά οικονομικά: ίδιος μηχανισμός με το Ταμείο, εντελώς χωριστά δεδομένα ---------- */
// S.personal: κινήσεις {id,dir,kind,sub,amount,date,note} · S.pfixed: πάγιες υποχρεώσεις · S.settings.pbudget: μηνιαίος στόχος
const DEF_PKINDS=[
  ["salary","💼","Μισθός","in",[]],["rentin","🏘️","Ενοίκιο που εισπράττω","in",[]],["pension","👴","Σύνταξη","in",[]],
  ["allow","🎁","Επίδομα","in",[]],["fromwork","🔧","Από τη δουλειά","in",[]],["pocket","💶","Χαρτζιλίκι","in",[]],["pinother","➕","Άλλα έσοδα","in",[]],
  ["home","🏠","Σπίτι, λογαριασμοί","out",["ΔΕΗ","Νερό","Τηλέφωνο","Internet","Ενοίκιο σπιτιού","Κοινόχρηστα","Θέρμανση"]],
  ["car","🚗","Αυτοκίνητο","out",["Σέρβις","Ασφάλεια","Τέλη κυκλοφορίας","Διόδια","Πάρκινγκ","Πλύσιμο"]],
  ["market","🛒","Σούπερ μάρκετ","out",["Σούπερ μάρκετ","Λαϊκή","Φούρνος","Κρεοπωλείο"]],
  ["food","🍽️","Φαγητό","out",["Φαγητό έξω","Παραγγελία","Καφές"]],
  ["fun","🍺","Διασκέδαση","out",["Ποτά","Τσιγάρα","Έξοδος","Σινεμά"]],
  ["family","👨‍👩‍👧","Οικογένεια","out",["Παιδιά","Σχολείο","Φροντιστήριο","Δώρα"]],
  ["loans","💳","Δάνεια, δόσεις","out",["Στεγαστικό","Καταναλωτικό","Δόση αυτοκινήτου","Πιστωτική κάρτα"]],
  ["shop","🛍️","Αγορές","out",["Ρούχα","Παπούτσια","Ηλεκτρονικά","Για το σπίτι"]],
  ["fuel","⛽","Καύσιμα","out",["Βενζίνη","Πετρέλαιο","Υγραέριο"]],
  ["health","🩺","Υγεία","out",["Γιατρός","Φάρμακα","Οδοντίατρος","Ασφάλεια υγείας"]],
  ["subs","📱","Συνδρομές","out",["Netflix","ChatGPT","Spotify","Κινητό","Γυμναστήριο"]],
  ["other","📦","Άλλο","out",[]]
].map(([id,emoji,name,dir,subs])=>({id,emoji,name,dir,subs}));
// παλιές κατηγορίες (15.3) → νέες, για όσους είχαν ήδη περάσει κινήσεις
const PK_OLD={market:["market",""],smoke:["fun","Τσιγάρα"],drinks:["fun","Ποτά"],eatout:["food","Φαγητό έξω"],pfuel:["fuel",""],bills:["home",""],
  home:["home","Ενοίκιο σπιτιού"],insur:["car","Ασφάλεια"],clothes:["shop","Ρούχα"],kids:["family","Παιδιά"],gifts:["family","Δώρα"],poutother:["other",""]};
function pMigrate(){
  if(S.settings.pkV>=3)return;
  if(S.settings.pkV===2&&Array.isArray(S.settings.pkinds)){ // 16.3: «Χαρτζιλίκι» και «Άλλα έσοδα»
    const ks=S.settings.pkinds,o=ks.find(k=>k.id==="pinother");
    if(o&&o.name==="Άλλο έσοδο")o.name="Άλλα έσοδα";
    if(!ks.some(k=>k.id==="pocket")){const i=o?ks.indexOf(o):ks.length;ks.splice(i,0,{id:"pocket",emoji:"💶",name:"Χαρτζιλίκι",dir:"in",subs:[]})}
    S.settings.pkV=3;write();return}
  const old=S.settings.pkinds;
  const fresh=DEF_PKINDS.map(k=>Object.assign({},k,{subs:k.subs.slice()}));
  if(Array.isArray(old))old.forEach(k=>{if(!fresh.some(f=>f.id===k.id)&&!PK_OLD[k.id])fresh.push({id:k.id,emoji:"📦",name:k.name,dir:k.dir,subs:[]})});
  (S.personal||[]).forEach(e=>{const m=PK_OLD[e.kind];if(m){e.kind=m[0];if(m[1]&&!e.sub)e.sub=m[1]}});
  S.settings.pkinds=fresh;S.settings.pkV=3;write();
}
let moneyBook="work";
// Τι δείχνει το Ταμείο όταν ανοίγεις την εφαρμογή (ρύθμιση): "work" ή "personal"
const pDefBook=()=>S.settings.defaultBook==="personal"?"personal":"work";
// Κράτημα ~1 δευτερόλεπτο πάνω σε ένα στοιχείο (sel μέσα στο box). Επιστρέφει recent(): true λίγο μετά το κράτημα,
// ώστε το κλικ που ακολουθεί το άφημα του δαχτύλου να αγνοείται.
function pLongPress(box,sel,fire,skip){
  let t=null,x=0,y=0,row=null,at=0;
  const stop=()=>{clearTimeout(t);t=null;if(row){row.classList.remove("pressing");row=null}};
  box.addEventListener("pointerdown",e=>{const r=e.target.closest(sel);if(!r||!box.contains(r)||(skip&&e.target.closest(skip)))return;
    stop();row=r;x=e.clientX;y=e.clientY;r.classList.add("pressing");
    t=setTimeout(()=>{stop();at=Date.now();try{navigator.vibrate&&navigator.vibrate(30)}catch(_){}fire(r)},900)});
  box.addEventListener("pointermove",e=>{if(t&&(Math.abs(e.clientX-x)>10||Math.abs(e.clientY-y)>10))stop()});
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>box.addEventListener(ev,stop));
  box.addEventListener("contextmenu",e=>{if(e.target.closest(sel))e.preventDefault()});
  return{recent:()=>Date.now()-at<450};
}
// Ξεκίνημα: το Ταμείο ανοίγει στην προεπιλογή και οι υπενθυμίσεις των πάγιων συγχρονίζονται
function pStartup(){
  moneyBook=pDefBook();
  (S.pfixed||[]).forEach(f=>{if(f.remind)syncFixReminder(f)});
}
// Υπενθύμιση πάγιου που πληρώθηκε ήδη αυτόν τον μήνα: δεν φαίνεται στις λίστες μέχρι να έρθει η ώρα της
const pFixOfRem=r=>(S.pfixed||[]).find(f=>f.remId===r.id);
function pRemHidden(r){const f=pFixOfRem(r);return !!f&&f.paid===ymKey(new Date())&&remDue(r)>new Date()}
// Ολοκλήρωση υπενθύμισης πάγιου από τις Υπενθυμίσεις = «Πληρώθηκε» / «Εισπράχθηκε»
function pRemDone(r){const f=pFixOfRem(r);if(!f)return false;
  if(f.paid!==ymKey(new Date()))pFixPay(f);else{syncFixReminder(f);persist();render()}
  return true}
// Κλείνει την ειδοποίηση του κινητού και το παράθυρο ειδοποίησης μιας υπενθύμισης
function pCloseAlert(id){
  try{alertQ=alertQ.filter(a=>a.id!==id)}catch(_){}
  try{navigator.serviceWorker&&navigator.serviceWorker.getRegistration().then(g=>g&&g.getNotifications&&g.getNotifications({tag:id}).then(ns=>ns.forEach(n=>n.close()))).catch(()=>{})}catch(_){}
}
let pf={dir:"all",kinds:[]};
const pkinds=()=>S.settings.pkinds||DEF_PKINDS;
const pKind=id=>pkinds().find(k=>k.id===id)||DEF_PKINDS.find(k=>k.id===id)||{id,emoji:"📦",name:"Άλλο",dir:"out",subs:[]};
const pKName=id=>{const k=pKind(id);return (k.emoji?k.emoji+" ":"")+T(k.name)};
const pIn=e=>e.dir==="in";
const ymKey=d=>{const x=new Date(d);return x.getFullYear()+"-"+pad(x.getMonth()+1)};
const monthShort=d=>{const n=monthName(d);return n.length>5?n.slice(0,3)+".":n};
const monthName=d=>{try{return cap(new Intl.DateTimeFormat(LOC(),{month:"long",year:"numeric"}).formatToParts(new Date(d)).find(x=>x.type==="month").value)}catch(e){return cap(new Date(d).toLocaleDateString(LOC(),{month:"long"}))}};
function bookSwitchHTML(){
  return `<div class="bookswitch"><button type="button" class="${moneyBook==="work"?"on":""}" data-act="book" data-v="work">${ic("tasks",15)} ${T("Εργασία")}</button><button type="button" class="${moneyBook==="personal"?"on":""}" data-act="book" data-v="personal">👤 ${T("Προσωπικά")}</button></div>`;
}
function pPass(e,skip){
  if(skip!=="dir"&&pf.dir!=="all"&&e.dir!==pf.dir)return false;
  if(skip!=="kind"&&pf.kinds.length&&!pf.kinds.includes(e.kind))return false;
  return true;
}
const pSum=(list,dir)=>rnd(list.filter(e=>e.dir===dir).reduce((a,e)=>a+e.amount,0));
const pMonthEnt=d=>{const k=ymKey(d);return(S.personal||[]).filter(e=>ymKey(e.date)===k)};
// Πάγιες: κατάσταση για τον τρέχοντα μήνα
function fixState(f){
  const now=new Date(),k=ymKey(now),inc=f.dir==="in";
  const nx=new Date(now.getFullYear(),now.getMonth()+1,Math.min(+f.day||1,new Date(now.getFullYear(),now.getMonth()+2,0).getDate()));
  if(f.paid===k)return{st:"paid",label:(inc?T("Εισπράχθηκε"):T("Πληρώθηκε"))+" · "+T("ξαναμπαίνει {d}",{d:nx.toLocaleDateString(LOC(),{day:"numeric",month:"short"})})};
  const day=Math.min(+f.day||1,new Date(now.getFullYear(),now.getMonth()+1,0).getDate());
  const due=new Date(now.getFullYear(),now.getMonth(),day),t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const days=Math.round((due-t0)/864e5);
  if(days===1)return{st:"soon",label:inc?T("Έρχεται αύριο"):T("Λήγει αύριο")};
  if(days<0)return{st:"late",label:inc?T("Έπρεπε να έρθει στις {d}",{d:day+"/"+(now.getMonth()+1)}):T("Έληξε στις {d}",{d:day+"/"+(now.getMonth()+1)})};
  if(days===0)return{st:"soon",label:inc?T("Έρχεται σήμερα"):T("Λήγει σήμερα")};
  return{st:days<=5?"soon":"wait",label:inc?T("Έρχεται σε {n} μέρες",{n:days}):T("Λήγει σε {n} μέρες",{n:days})};
}
function fixRowHTML(f){const s=fixState(f),inc=f.dir==="in";
  return `<div class="fixcard ${s.st}" data-act="pFixEdit" data-id="${f.id}">
    <div class="fc1"><span class="pem">${esc(pKind(f.kind).emoji||"📅")}</span><b class="fcn">${esc(f.name)}</b><b class="fca" style="color:${inc?"var(--green)":"var(--ink)"}">${inc?"+":""}${money(+f.amount||0)}</b></div>
    <div class="fc2"><span class="fcm">${T("κάθε {d} του μήνα",{d:f.day})}${f.remind?" · 🔔":""}<br><span class="pst">${s.label}</span></span>
      ${s.st==="paid"?`<span class="pok">✓</span>`:`<button class="btn softin small" data-act="pFixPay" data-id="${f.id}">${inc?T("Εισπράχθηκε"):T("Πληρώθηκε")}</button>`}
      <button class="x pstop" data-act="pFixStop" data-id="${f.id}" aria-label="${T("Διακοπή")}" title="${T("Διακοπή")}">✕</button></div></div>`}
function vPersonal(){
  pMigrate();
  const[from,to]=periodRange();
  const inRange=t=>{const x=new Date(t);return(!from||x>=from)&&(!to||x<to)};
  const ent=(S.personal||[]).filter(e=>inRange(e.date)).sort(byNewest);
  const inc=pSum(ent,"in"),out=pSum(ent,"out");
  let h=bookSwitchHTML()+`<div class="ptitle">👤 ${T("Προσωπικά")}</div>
  <button class="filterbar" data-act="filterSheet" data-kind="money">${ic("filter",18)}<span>${periodLabel(moneyPeriod)}</span><i>▾</i></button>
  <div class="sum3 psum">
    <div class="sumcard"><span><i class="pdot g"></i>${T("Έσοδα")}</span><b class="in">${money0(inc)}</b></div>
    <div class="sumcard"><span><i class="pdot r"></i>${T("Έξοδα")}</span><b class="out">${money0(out)}</b></div>
    <div class="sumcard"><span><i class="pdot b"></i>${T("Υπόλοιπο")}</span><b style="color:${inc-out<0?"var(--red)":"#2468B5"}">${money0(rnd(inc-out))}</b></div>
  </div>
  <div class="twobtn" style="padding:10px 0 0"><button class="btn softin" data-act="pNew" data-dir="in">+ ${T("Έσοδο")}</button>
  <button class="btn softout" data-act="pNew" data-dir="out">+ ${T("Έξοδο")}</button></div>`;
  // Καθαρή εικόνα του τρέχοντος μήνα
  const now=new Date(),mE=pMonthEnt(now),mIn=pSum(mE,"in"),mOut=pSum(mE,"out");
  const fx=(S.pfixed||[]);fx.forEach(f=>{if(!f.dir)f.dir="out"});
  const unpaid=rnd(fx.filter(f=>f.dir!=="in"&&fixState(f).st!=="paid").reduce((a,f)=>a+(+f.amount||0),0));
  const expIn=rnd(fx.filter(f=>f.dir==="in"&&fixState(f).st!=="paid").reduce((a,f)=>a+(+f.amount||0),0));
  const left=rnd(mIn+expIn-mOut-unpaid);
  h+=sec(`🧮 ${T("Καθαρή εικόνα")} · ${monthName(now)}`)+panel(`<div class="kv"><span>${T("Έσοδα του μήνα")}</span><b class="money">${money(mIn)}</b></div>
    ${expIn>0.004?`<div class="kv"><span>${T("Πάγια έσοδα που περιμένεις ακόμα")}</span><b class="money">+ ${money(expIn)}</b></div>`:""}
    <div class="kv"><span>${T("Έξοδα που έγιναν")}</span><b class="owe">− ${money(mOut)}</b></div>
    <div class="kv"><span>${T("Πάγια που δεν πληρώθηκαν ακόμα")}</span><b class="owe">− ${money(unpaid)}</b></div>
    <div class="kv pbig"><span>${T("Σου μένουν πραγματικά")}</span><b style="color:${left<0?"var(--red)":"var(--green)"}">${money(left)}</b></div>`);
  // Προϋπολογισμός
  const bud=+S.settings.pbudget||0;
  if(bud>0){const pc=Math.round(mOut/bud*1000)/10,col=pc>=100?"var(--red)":pc>=80?"#D98A00":"var(--green)";
    h+=`<div class="sec-row">${sec(`🎯 ${T("Προϋπολογισμός")}`)}<button class="btn ghost small" style="margin-bottom:8px" data-act="pBudget">${ic("edit",15)} ${T("Αλλαγή")}</button></div>`+panel(`<div class="kv"><span>${T("Μηνιαίος στόχος")}</span><b>${money(bud)}</b></div>
      <div class="kv"><span>${T("Δαπανήθηκαν")}</span><b>${money(mOut)}</b></div>
      <div class="pbudget"><div class="pbtrack"><i style="width:${Math.min(100,pc)}%;background:${col}"></i></div><b style="color:${col}">${pc.toLocaleString(LOC())}%</b></div>
      <div class="kv"><span>${bud-mOut>=0?T("Υπόλοιπο διαθέσιμου προϋπολογισμού"):T("Ξεπέρασες τον στόχο κατά")}</span><b style="color:${col}">${money(Math.abs(rnd(bud-mOut)))}</b></div>`);}
  else h+=`<button class="pcta" data-act="pBudget">🎯 <span><b>${T("Βάλε μηνιαίο προϋπολογισμό")}</b><small>${T("Πόσα θέλεις να ξοδεύεις τον μήνα· βλέπεις πόσα σου μένουν")}</small></span> ›</button>`;
  // Πάγια κάθε μήνα: έξοδα και έσοδα που ξαναμπαίνουν μόνα τους, με ορατό ✕ για διακοπή
  const fxOut=fx.filter(f=>f.dir!=="in").sort((a,b)=>(+a.day||0)-(+b.day||0)),fxIn=fx.filter(f=>f.dir==="in").sort((a,b)=>(+a.day||0)-(+b.day||0));
  h+=`<div class="sec-row">${sec(`📅 ${T("Πάγια κάθε μήνα")}`)}</div>
    <button class="pcta pmain" data-act="pFixQuick" style="margin:0 0 10px">📝 <span><b>${T("Πέρασε ή άλλαξε τα πάγια")}</b><small>${T("Όλα σε μία οθόνη: γράφεις ποσό και μέρα δίπλα σε όσα ισχύουν")}</small></span> ›</button>`;
  if(fx.length){
    if(fxOut.length)h+=`<div class="psub">${T("Πάγια έξοδα")} · ${money(rnd(fxOut.reduce((a,f)=>a+(+f.amount||0),0)))} ${T("τον μήνα")}</div>`+panel(fxOut.map(fixRowHTML).join(""));
    if(fxIn.length)h+=`<div class="psub">${T("Πάγια έσοδα")} · ${money(rnd(fxIn.reduce((a,f)=>a+(+f.amount||0),0)))} ${T("τον μήνα")}</div>`+panel(fxIn.map(fixRowHTML).join(""));
    h+=`<p class="note" style="margin:6px 2px 0">${T("Κάθε μήνα ξαναμπαίνουν αυτόματα. Αν σταματήσεις κάτι (π.χ. ακύρωσες μια συνδρομή), πάτα το ✕ δίπλα του και φεύγει αμέσως.")}</p>`;
  }else h+=panel(`<div class="empty">${T("Πρόσθεσε ό,τι πληρώνεις ή εισπράττεις κάθε μήνα (ΔΕΗ, Internet, Netflix, δόσεις, μισθός, ενοίκιο) για να ξαναμπαίνει μόνο του και να σου θυμίζει.")}</div>`);
  // Πού πάνε τα χρήματα (περίοδος)
  const m=new Map();ent.filter(e=>!pIn(e)).forEach(e=>m.set(e.kind,(m.get(e.kind)||0)+e.amount));
  const rows=[...m.entries()].sort((a,b)=>b[1]-a[1]);
  if(rows.length){const mx=rows[0][1];
    h+=sec(T("Πού πάνε τα προσωπικά χρήματα"))+panel(rows.map(([k,v])=>`<button type="button" class="prow" data-act="pCat" data-k="${k}">
      <span class="pname">${esc(pKName(k))}</span><span class="pbar"><i style="width:${Math.max(4,Math.round(v/mx*100))}%"></i></span>
      <b>${money0(v)}</b><small>${out?Math.round(v/out*100):0}%</small></button>`).join(""));}
  // Αναφορές: αυτός ο μήνας σε σύγκριση με τον προηγούμενο
  const prev=new Date(now.getFullYear(),now.getMonth()-1,15),pE=pMonthEnt(prev);
  const cm=new Map(),pm=new Map();mE.filter(e=>!pIn(e)).forEach(e=>cm.set(e.kind,(cm.get(e.kind)||0)+e.amount));pE.filter(e=>!pIn(e)).forEach(e=>pm.set(e.kind,(pm.get(e.kind)||0)+e.amount));
  const ks=[...new Set([...cm.keys(),...pm.keys()])].sort((a,b)=>(cm.get(b)||0)-(cm.get(a)||0));
  if(ks.length){const tc=pSum(mE,"out"),tp=pSum(pE,"out");
    const diff=(a,b)=>{const d=rnd(a-b);return d>0.004?`<em class="up">▲ ${money0(d)}</em>`:d<-0.004?`<em class="down">▼ ${money0(-d)}</em>`:`<em>=</em>`};
    h+=sec(`📊 ${T("Αναφορές")} · ${monthName(now)} ${T("σε σύγκριση με")} ${monthName(prev)}`)+panel(`<div class="prep head"><span>${T("Πού πήγαν τα χρήματά μου;")}</span><b>${monthShort(now)}</b><b>${monthShort(prev)}</b><span></span></div>`+
      ks.map(k=>`<div class="prep"><span>${esc(pKName(k))}</span><b>${money0(cm.get(k)||0)}</b><b class="pm">${money0(pm.get(k)||0)}</b>${diff(cm.get(k)||0,pm.get(k)||0)}</div>`).join("")+
      `<div class="prep tot"><span>${T("Σύνολο")}</span><b>${money0(tc)}</b><b class="pm">${money0(tp)}</b>${diff(tc,tp)}</div>`);}
  // Κινήσεις με φίλτρα
  const list=ent.filter(e=>pPass(e));
  const active=pf.dir!=="all"||pf.kinds.length;
  h+=`<div class="sec-row">${sec(T("Κινήσεις")+` (${list.length}${list.length!==ent.length?"/"+ent.length:""})`)}<button class="btn ghost small" style="margin-bottom:8px" data-act="pKinds">${ic("edit",15)} ${T("Κατηγορίες")}</button></div>
    <div class="seg cefseg">${[["all","Όλες"],["in","Έσοδα"],["out","Έξοδα"]].map(([k,l])=>`<button type="button" class="${pf.dir===k?"on":""}" data-act="pDir" data-v="${k}">${T(l)}</button>`).join("")}</div>
    <div class="tfrow"><button class="tfchip ${pf.kinds.length?"on":""}" data-act="pPick">${ic("filter",15)}<span>${esc(multiLbl(pf.kinds,k=>pKName(k),T("Όλες οι κατηγορίες")))}</span> ▾</button>
    ${active?`<button class="tfchip clr" data-act="pClear">✕ ${T("Καθάρισμα")}</button>`:""}</div>
    ${list.length?`<div class="twobtn" style="margin:2px 0 8px"><button class="btn ghost" data-act="pPdf" style="border:1.5px solid var(--line)">${ic("archive",17)} ${T("Λήψη PDF")}</button>
      <button class="btn ghost" data-act="pPdfSend" style="border:1.5px solid var(--line)">${ic("shareios",17)} ${T("Αποστολή")}</button></div>
      <p class="note" style="margin:-2px 2px 8px">${T("Το PDF έχει ό,τι βλέπεις από κάτω: την περίοδο, έσοδα ή έξοδα και τις κατηγορίες που διάλεξες.")}</p>`:""}`;
  if(active){const li=pSum(list,"in"),lo=pSum(list,"out");
    h+=`<p class="note" style="margin:0 2px 8px">${T("Με το φίλτρο")}: ${li?T("έσοδα")+" "+money(li):""}${li&&lo?" · ":""}${lo?T("έξοδα")+" "+money(lo):""}${!li&&!lo?"—":""}</p>`}
  h+=list.length?panel(list.map(e=>`<div class="row ent" data-act="pEdit" data-id="${e.id}">
      <span class="pem">${esc(pKind(e.kind).emoji||"•")}</span>
      <div class="grow"><div class="title">${esc(T(pKind(e.kind).name))}${e.sub?` · ${esc(e.sub)}`:""}${e.note?` <span style="font-weight:400;color:var(--muted)">${esc(e.note)}</span>`:""}</div>
      <div class="meta"><span>${fmtDay(e.date)}</span>${e.fixId?`<span>📅 ${T("πάγιο")}</span>`:""}</div></div>
      <b class="amt ${pIn(e)?"in":"out"}">${pIn(e)?"+":"−"}${money(e.amount)}</b></div>`).join(""))
    :panel(`<div class="empty">${ent.length?T("Καμία κίνηση με αυτά τα φίλτρα."):T("Δεν έχεις προσωπικές κινήσεις σε αυτό το διάστημα. Πάτα «+ Έξοδο» ή «+ Έσοδο».")}</div>`);
  if((S.personal||[]).length)h+=`<button type="button" class="pwipe" data-act="pWipe">🗑 ${T("Διαγραφή όλων των κινήσεων ενός μήνα")}</button>`;
  h+=`<label class="pbookdef"><input type="checkbox" data-pbdef="1" ${pDefBook()==="personal"?"checked":""}> ${T("Το Ταμείο να ανοίγει στα Προσωπικά")}</label>`;
  h+=`<p class="note" style="margin:10px 2px 0">${T("Τα προσωπικά είναι εντελώς χωριστά από την εργασία: δεν μετράνε στο Ταμείο, στους πελάτες ή στο κέρδος.")}</p>`;
  return h;
}
// Επιλογή κατηγορίας και υποκατηγορίας σε αναδυόμενο παράθυρο (κοινό για κινήσεις και πάγια)
function pCatPicker(dir,cb,back,sort){
  const ks=pkinds().filter(k=>k.dir===dir);
  openSheet({title:dir==="in"?T("Κατηγορία εσόδου"):T("Κατηγορία εξόδου"),cancelLabel:back?T("Πίσω"):T("Άκυρο"),onCancel:back||null,
    body:`<div id="pcMain"><div id="pcAsk"></div><div class="pcatgrid ${sort?"sorting":""}">${ks.map((k,i)=>`<button type="button" data-pc="${k.id}"><span>${esc(k.emoji||"📦")}</span>${esc(T(k.name))}
        ${sort?`<i class="pcmv"><b data-pcl="${k.id}" class="${i?"":"dis"}">◀</b><b data-pcr="${k.id}" class="${i<ks.length-1?"":"dis"}">▶</b></i>`:""}</button>`).join("")}
      ${sort?"":`<button type="button" class="add" data-pcadd="1"><span>＋</span>${T("Νέα κατηγορία")}</button>`}</div>
      <button type="button" class="btn ghost wide pcsort ${sort?"on":""}" data-pcsort="1">${sort?"✓ "+T("Τέλος ταξινόμησης"):"⇅ "+T("Αλλαγή σειράς εικονιδίων")}</button>
      ${sort?"":`<p class="note" style="margin:8px 2px 0">${T("Κράτα πατημένο ένα εικονίδιο για ένα δευτερόλεπτο για να το σβήσεις.")}</p>`}</div>
      <div id="pcSubs"></div>`});
  let cur=null,askSub=null;
  const subs=k=>{const kk=pKind(k);cur=k;
    if(!(kk.subs||[]).length){cb(k,"");return}
    $("#pcMain").hidden=true;
    $("#pcSubs").innerHTML=`<button type="button" class="pcback" data-pcback="1">‹ ${T("Όλες οι κατηγορίες")}</button><div class="pickbox pcsubs"><div class="picksec">${esc(kk.emoji||"")} ${esc(T(kk.name))} · ${T("υποκατηγορία")}</div>
      <button type="button" class="pickrow" data-ps="">${T("Χωρίς υποκατηγορία")}</button>`+
      (kk.subs||[]).map(s=>askSub===s?`<div class="pcask"><span>${T("Να σβηστεί το «{n}»;",{n:esc(s)})}</span><button type="button" class="btn softout small" data-psdel="${esc(s)}">🗑 ${T("Διαγραφή")}</button><button type="button" class="btn ghost small" data-pcno="1">${T("Άκυρο")}</button></div>`
        :`<button type="button" class="pickrow" data-ps="${esc(s)}">${esc(s)}</button>`).join("")+
      `<button type="button" class="pickrow editrow" data-psadd="1">＋ ${T("Νέα υποκατηγορία")}</button><button type="button" class="pickrow editrow" data-psedit="1">✎ ${T("Σειρά και διαγραφή επιλογών")}</button></div>
      <p class="note" style="margin:8px 2px 0">${T("Κράτα πατημένη μια επιλογή για ένα δευτερόλεπτο για να τη σβήσεις.")}</p>`;
    const sb=$("#shBody");sb.scrollTop=0;if(sb.parentElement)sb.parentElement.scrollTop=0};
  const move=(id,d)=>{const all=S.settings.pkinds,same=all.filter(k=>k.dir===dir),i=same.findIndex(k=>k.id===id),j=i+d;if(j<0||j>=same.length)return;
    const a=all.indexOf(same[i]),b=all.indexOf(same[j]);[all[a],all[b]]=[all[b],all[a]];write();pCatPicker(dir,cb,back,true)};
  const askCat=id=>{const k=pKind(id),n=(S.personal||[]).filter(e=>e.kind===id).length;
    $("#pcAsk").innerHTML=id?`<div class="pcask"><span>${T("Να σβηστεί η κατηγορία «{n}»;",{n:esc(T(k.name))})}${n?`<small>${T("Οι {n} κινήσεις της μένουν.",{n})}</small>`:""}</span>
      <button type="button" class="btn softout small" data-pcdel="${id}">🗑 ${T("Διαγραφή")}</button><button type="button" class="btn ghost small" data-pcno="1">${T("Άκυρο")}</button></div>`:"";
    $("#shBody").querySelectorAll("[data-pc]").forEach(b=>b.classList.toggle("on",b.dataset.pc===id))};
  const lp=sort?{recent:()=>false}:pLongPress($("#shBody"),"[data-pc],[data-ps]",el=>{
    if(el.dataset.pc){askCat(el.dataset.pc);const sb=$("#shBody");sb.scrollTop=0;return}
    if(el.dataset.ps){askSub=el.dataset.ps;subs(cur)}});
  $("#shBody").onclick=e=>{
    if(lp.recent())return;
    if(e.target.closest("[data-pcno]")){if(askSub!==null){askSub=null;subs(cur)}else askCat(null);return}
    const cd=e.target.closest("[data-pcdel]");if(cd){const all=S.settings.pkinds,i=all.findIndex(k=>k.id===cd.dataset.pcdel);if(i<0)return;
      const [k]=all.splice(i,1);write();render();pCatPicker(dir,cb,back);
      undoToast(T("Η κατηγορία «{n}» σβήστηκε.",{n:T(k.name)}),()=>{all.splice(i,0,k);write();render();if($("#pcMain"))pCatPicker(dir,cb,back)});return}
    const sd=e.target.closest("[data-psdel]");if(sd){const kk=pKind(cur),v=sd.dataset.psdel,i=(kk.subs||[]).indexOf(v);askSub=null;
      if(i>=0){kk.subs.splice(i,1);write()}subs(cur);if(!(kk.subs||[]).length){$("#pcSubs").innerHTML="";$("#pcMain").hidden=false;cur=null}
      undoToast(T("Το «{n}» σβήστηκε.",{n:v}),()=>{if(i>=0){kk.subs.splice(i,0,v);write()}});return}
    if(e.target.closest("[data-pcsort]")){pCatPicker(dir,cb,back,!sort);return}
    const l=e.target.closest("[data-pcl]");if(l){e.stopPropagation();move(l.dataset.pcl,-1);return}
    const r=e.target.closest("[data-pcr]");if(r){e.stopPropagation();move(r.dataset.pcr,1);return}
    if(e.target.closest("[data-pcback]")){$("#pcSubs").innerHTML="";$("#pcMain").hidden=false;cur=null;askSub=null;return}
    if(sort)return;
    if(e.target.closest("[data-pcadd]")){const n=(prompt(T("Όνομα νέας κατηγορίας"))||"").trim();if(!n)return;
      const k={id:uid(),emoji:"📦",name:n,dir,subs:[]};S.settings.pkinds.push(k);write();cb(k.id,"");return}
    const c=e.target.closest("[data-pc]");if(c){subs(c.dataset.pc);return}
    if(e.target.closest("[data-psedit]")){const k=cur;subListSheet(k,name=>cb(k,name),()=>pCatPicker(dir,cb,back));return}
    if(e.target.closest("[data-psadd]")){const n=(prompt(T("Όνομα νέας υποκατηγορίας"))||"").trim();if(!n)return;
      const kk=pKind(cur);kk.subs=(kk.subs||[]).concat(n);write();cb(cur,n);return}
    const s=e.target.closest("[data-ps]");if(s&&cur){cb(cur,s.dataset.ps)}};
}
function pEntryForm(e,dir0,draft){
  pMigrate();
  const isNew=!e;const base=e||{dir:dir0||"out",kind:null,sub:"",amount:"",date:new Date().toISOString(),note:""};
  const v=Object.assign({},base,draft||{});
  const reopen=d=>pEntryForm(e,dir0,d);
  const read=()=>({dir:v.dir,kind:v.kind,sub:v.sub,amount:val("p_amount"),date:val("p_date"),note:val("p_note"),mkFix:!!($("#p_fix")&&$("#p_fix").checked)});
  openSheet({title:isNew?(v.dir==="in"?T("Νέο προσωπικό έσοδο"):T("Νέο προσωπικό έξοδο")):T("Προσωπική κίνηση"),
    saveLabel:isNew?T("Καταχώρηση"):T("Αποθήκευση"),saveStyle:isNew?"amber":"primary",cancelLabel:T("Άκυρο"),
    body:`<div class="seg dirseg" id="p_dir"><button type="button" data-v="in" class="${v.dir==="in"?"on":""}">${T("Έσοδο")}</button><button type="button" data-v="out" class="${v.dir==="out"?"on":""}">${T("Έξοδο")}</button></div>
      <label>${T("Κατηγορία")}</label>
      <button type="button" class="pickbtn" id="p_cat"><span>${v.kind?esc(pKName(v.kind))+(v.sub?" · "+esc(v.sub):""):T("Διάλεξε κατηγορία")}</span><i>▾</i></button>
      <label for="p_amount">${T("Ποσό")}</label>
      <span class="curr"><b>€</b><input id="p_amount" inputmode="decimal" placeholder="0,00" value="${esc(v.amount===""?"":String(v.amount))}" autocomplete="off"></span>
      <label for="p_date">${T("Ημερομηνία")}</label><input type="date" id="p_date" value="${(v.date&&v.date.length===10?v.date:new Date(v.date).toISOString().slice(0,10))}">
      <label for="p_note">${T("Σημείωση")} <span style="font-weight:600;color:var(--muted)">${T("(προαιρετικό)")}</span></label>
      <input id="p_note" value="${esc(v.note||"")}" autocomplete="off">
      ${isNew||!e.fixId?`<label class="toggle" style="margin-top:14px"><input type="checkbox" id="p_fix" ${v.mkFix?"checked":""}>📅 ${v.dir==="in"?T("Είναι πάγιο έσοδο, κάθε μήνα"):T("Είναι πάγιο έξοδο, κάθε μήνα")}</label>
      <p class="note">${T("Μπαίνει και στα πάγια: ξαναβγαίνει κάθε μήνα την ίδια μέρα, με υπενθύμιση. Αυτός ο μήνας μετράει ήδη ως πληρωμένος.")}</p>`:`<p class="note">📅 ${T("Αυτή η κίνηση είναι από πάγιο.")}</p>`}`,
    onSave:()=>{
      const raw=numStr(val("p_amount"));
      if(raw===""||isNaN(+raw)||+raw<=0){toast(T("Γράψε ποσό."));$("#p_amount").focus();return false}
      if(!v.kind){toast(T("Διάλεξε κατηγορία."));return false}
      const d={dir:v.dir,kind:v.kind,sub:v.sub||"",amount:+raw,date:new Date(val("p_date")||Date.now()).toISOString(),note:val("p_note")};
      let tgt=e;if(isNew){d.id=uid();d.createdAt=Date.now();S.personal.push(d);tgt=d}else Object.assign(e,d);
      if($("#p_fix")&&$("#p_fix").checked&&!tgt.fixId){
        const dt=new Date(d.date),name=d.sub||T(pKind(d.kind).name);
        const ex=(S.pfixed||[]).find(f=>(f.dir||"out")===d.dir&&f.kind===d.kind&&norm(f.name)===norm(name));
        const f=ex||{id:uid(),dir:d.dir,name,kind:d.kind,remind:d.dir==="out",before:3};
        f.amount=d.amount;f.day=dt.getDate();if(ymKey(dt)===ymKey(new Date()))f.paid=ymKey(dt);
        if(!ex)S.pfixed.push(f);syncFixReminder(f);tgt.fixId=f.id;
        persist();render();toast(T("Καταχωρήθηκε και μπήκε στα πάγια κάθε μήνα."));return}
      persist();render();toast(isNew?T("Καταχωρήθηκε."):T("Οι αλλαγές αποθηκεύτηκαν."))},
    onDelete:isNew?null:()=>{const i=S.personal.indexOf(e);if(i<0)return;S.personal.splice(i,1);persist();render();
      undoToast(T("Η κίνηση διαγράφηκε."),()=>{S.personal.splice(i,0,e);persist();render()})},
    deleteMsg:T("Να διαγραφεί η κίνηση;")});
  $("#p_dir").onclick=ev=>{const b=ev.target.closest("[data-v]");if(!b||b.dataset.v===v.dir)return;const d=read();d.dir=b.dataset.v;d.kind=null;d.sub="";reopen(d)};
  $("#p_cat").onclick=()=>{const d=read();pCatPicker(v.dir,(k,s)=>{d.kind=k;d.sub=s;reopen(d)},()=>reopen(d))};
}
function pKindsSheet(){
  pMigrate();
  const ks=S.settings.pkinds;
  const used=id=>(S.personal||[]).some(e=>e.kind===id);
  const grp=d=>ks.map((k,i)=>k.dir!==d?"":`<div class="pkedit">
      <input class="pke" value="${esc(k.emoji||"")}" data-pke="${i}" maxlength="4" aria-label="${T("Εικονίδιο")}">
      <div class="grow"><input value="${esc(T(k.name))}" data-pkn="${i}" style="margin:0 0 6px">
      ${d==="out"||(k.subs||[]).length?`<input value="${esc((k.subs||[]).join(", "))}" data-pks="${i}" placeholder="${T("Υποκατηγορίες, χωρισμένες με κόμμα")}" style="margin:0;font-size:13.5px">`:""}</div>
      <button class="x bin" data-pkdel="${i}" aria-label="${T("Διαγραφή")}">${ic("trash",18)}</button></div>`).join("");
  openSheet({title:T("Προσωπικές κατηγορίες"),cancelLabel:T("Κλείσιμο"),
    body:`<p class="note">${T("Άλλαξε εικονίδιο, όνομα και υποκατηγορίες (χωρισμένες με κόμμα, π.χ. Netflix, ChatGPT). Σβήσε ό,τι δεν χρειάζεσαι ή πρόσθεσε δικές σου.")}</p>
      ${sec(T("Έσοδα"))}${panel(grp("in"))}${sec(T("Έξοδα"))}${panel(grp("out"))}
      <div class="inrow" style="margin-top:12px"><input id="pk_new" placeholder="${T("Νέα κατηγορία")}" autocomplete="off">
      <select id="pk_dir" style="width:auto"><option value="out">${T("Έξοδο")}</option><option value="in">${T("Έσοδο")}</option></select>
      <button class="btn amber" id="pk_add">${T("Προσθήκη")}</button></div>`});
  $("#shBody").addEventListener("change",e=>{
    const n=e.target.closest("[data-pkn]");if(n){const v=n.value.trim();if(v){ks[+n.dataset.pkn].name=v;write();render()}return}
    const m=e.target.closest("[data-pke]");if(m){ks[+m.dataset.pke].emoji=m.value.trim();write();render();return}
    const s=e.target.closest("[data-pks]");if(s){ks[+s.dataset.pks].subs=s.value.split(",").map(x=>x.trim()).filter(Boolean);write();render()}});
  $("#shBody").addEventListener("click",e=>{const d=e.target.closest("[data-pkdel]");if(!d)return;const i=+d.dataset.pkdel;
    if(used(ks[i].id)&&!confirm(T("Υπάρχουν κινήσεις σε αυτή την κατηγορία. Θα μείνουν, αλλά θα φαίνονται ως «Άλλο». Να σβηστεί;")))return;
    ks.splice(i,1);write();render();pKindsSheet()});
  $("#pk_add").onclick=()=>{const n=val("pk_new");if(!n){toast(T("Γράψε όνομα."));return}ks.push({id:uid(),emoji:"📦",name:n,dir:val("pk_dir"),subs:[]});write();render();pKindsSheet()};
}
function pPickSheet(){
  const[from,to]=periodRange();const inRange=t=>{const x=new Date(t);return(!from||x>=from)&&(!to||x<to)};
  const base=(S.personal||[]).filter(e=>inRange(e.date)&&pPass(e,"kind"));
  const m=new Map();base.forEach(e=>m.set(e.kind,(m.get(e.kind)||0)+1));
  const ids=[...new Set([...m.keys(),...pkinds().filter(k=>pf.dir==="all"||k.dir===pf.dir).map(k=>k.id)])];
  const sel=new Set(pf.kinds);
  const paint=()=>{$("#shBody").innerHTML=`<p class="note" style="margin:0 2px 8px">${T("Διάλεξε όσα θέλεις μαζί και πάτα «Εφαρμογή».")}</p>`+
    panel(chkRow("data-pkm","",T("Όλες οι κατηγορίες"),base.length,!sel.size)+ids.map(id=>{const k=pKind(id);return chkRow("data-pkm",id,esc(pKName(id)),m.get(id)||0,sel.has(id),sgn(k.dir))}).join(""))};
  openSheet({title:T("Ποιες κατηγορίες;"),body:"",saveLabel:T("Εφαρμογή"),cancelLabel:T("Άκυρο"),onSave:()=>{pf.kinds=[...sel];render()}});
  paint();
  $("#shBody").onclick=e=>{const b=e.target.closest("[data-pkm]");if(!b)return;const v=b.dataset.pkm;if(!v)sel.clear();else if(sel.has(v))sel.delete(v);else sel.add(v);paint()};
}
// Ανάλυση μιας κατηγορίας ανά υποκατηγορία (αναδυόμενο)
function pCatSheet(k){
  const[from,to]=periodRange();const inRange=t=>{const x=new Date(t);return(!from||x>=from)&&(!to||x<to)};
  const es=(S.personal||[]).filter(e=>e.kind===k&&inRange(e.date));
  const tot=pSum(es,"out")+pSum(es,"in");
  const m=new Map();es.forEach(e=>{const s=e.sub||T("Χωρίς υποκατηγορία");m.set(s,(m.get(s)||0)+e.amount)});
  const rows=[...m.entries()].sort((a,b)=>b[1]-a[1]);const mx=rows.length?rows[0][1]:1;
  openSheet({title:pKName(k),cancelLabel:T("Κλείσιμο"),
    body:`<p class="note">${periodLabel(moneyPeriod)} · ${T("Σύνολο")} <b>${money(tot)}</b></p>`+panel(rows.map(([s,v])=>`<div class="prow" style="cursor:default"><span class="pname">${esc(s)}</span><span class="pbar"><i style="width:${Math.max(4,Math.round(v/mx*100))}%"></i></span><b>${money0(v)}</b><small>${tot?Math.round(v/tot*100):0}%</small></div>`).join(""))+
      `<button class="btn ghost wide" data-act="pOnly" data-k="${k}" style="width:100%;margin-top:10px;border:1.5px solid var(--line)">${T("Δες τις κινήσεις")}</button>`});
}
// PDF προσωπικών: ό,τι βλέπεις με την περίοδο και τα φίλτρα· λήψη ή αποστολή
async function pPdf(share){
  if(!proGate("statement"))return;
  const[from,to]=periodRange();const inRange=t=>{const x=new Date(t);return(!from||x>=from)&&(!to||x<to)};
  const list=(S.personal||[]).filter(e=>inRange(e.date)&&pPass(e)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(!list.length){toast(T("Δεν υπάρχουν κινήσεις για PDF."));return}
  const inS=pSum(list,"in"),outS=pSum(list,"out");
  const f=[periodLabel(moneyPeriod),pf.dir!=="all"?(pf.dir==="in"?T("Έσοδα"):T("Έξοδα")):"",pf.kinds.map(k=>T(pKind(k).name)).join(", ")].filter(Boolean).join(" · ");
  await ensureLogo();
  const cv=statementCanvas({name:T("Προσωπικά οικονομικά")},list,inS,outS,f,T("Περίοδος και φίλτρα"),
    {headLbl:T("Κατάσταση"),isIn:pIn,label:e=>T(pKind(e.kind).name)+(e.sub?" · "+e.sub:"")+(e.note?" — "+e.note:"")});
  const name="prosopika-"+toLocalInput(new Date()).slice(0,10)+".pdf";
  fsSave("export",name,canvasToPdfBlob(cv),"perm");
  downloadCanvasPdf(cv,name,!!share);
}
function pBudgetSheet(){
  openSheet({title:`🎯 ${T("Μηνιαίος προϋπολογισμός")}`,saveLabel:T("Αποθήκευση"),cancelLabel:T("Άκυρο"),
    body:`<p class="note">${T("Πόσα θέλεις να ξοδεύεις το πολύ κάθε μήνα (όλα τα προσωπικά έξοδα μαζί). Άφησέ το κενό για να μη φαίνεται.")}</p>
      <span class="curr"><b>€</b><input id="pb_amt" inputmode="decimal" placeholder="2.000" value="${S.settings.pbudget?esc(String(S.settings.pbudget)):""}"></span>`,
    onSave:()=>{const r=numStr(val("pb_amt"));if(r==="x"||(r!==""&&isNaN(+r))){toast(T("Γράψε ποσό."));return false}S.settings.pbudget=r===""?0:+r;persist();render()}});
}
// Πάγιες υποχρεώσεις με υπενθύμιση (δημιουργεί μηνιαία υπενθύμιση στις Υπενθυμίσεις)
function fixNextDue(f){const now=new Date();let d=new Date(now.getFullYear(),now.getMonth(),Math.min(+f.day||1,28),10,0);
  if(f.paid===ymKey(now)||d<now)d=new Date(now.getFullYear(),now.getMonth()+1,Math.min(+f.day||1,28),10,0);return d}
function syncFixReminder(f){
  const r=f.remId&&S.reminders.find(x=>x.id===f.remId);
  if(!f.remind){if(r){r.deleted=true;pCloseAlert(r.id)}f.remId=null;return}
  const due=fixNextDue(f),when=new Date(due);when.setDate(when.getDate()-(+f.before||0));
  if(when<new Date()){const n=new Date();n.setMinutes(0,0,0);n.setHours(n.getHours()+1);if(n<due)when.setTime(n.getTime())}
  const text=(f.dir==="in"?T("Είσπραξη: {n} — {a}",{n:f.name,a:money(+f.amount||0)}):T("Πληρωμή: {n} — {a}",{n:f.name,a:money(+f.amount||0)}));
  if(r){const nw=toLocalInput(when);
    if(r.when!==nw||r.snoozeUntil||r.done){r.alerted=false;r.preAlerted=false;r.snoozeUntil=null;pCloseAlert(r.id)}
    r.text=text;r.when=nw;r.repeat="month";r.deleted=false;r.done=false}
  else{const nr={id:uid(),text,when:toLocalInput(when),repeat:"month",remindBefore:0,sound:"",done:false,deleted:false,createdAt:Date.now()};S.reminders.push(nr);f.remId=nr.id}
}
// Λίστα επιλογών (υποκατηγορίες) μιας κατηγορίας: διαλέγεις, προσθέτεις, σβήνεις, αλλάζεις σειρά
function subListSheet(kindId,onPick,back){
  if(!S.settings.pkinds)S.settings.pkinds=DEF_PKINDS.map(k=>Object.assign({},k,{subs:k.subs.slice()}));
  const k=S.settings.pkinds.find(x=>x.id===kindId);if(!k)return;
  if(!Array.isArray(k.subs))k.subs=[];
  openSheet({title:`${k.emoji||""} ${T(k.name)}`,cancelLabel:T("Πίσω"),onCancel:back||null,body:`<div id="slBox"></div>`});
  const paint=()=>{
    $("#slBox").innerHTML=`<p class="note" style="margin:0 2px 8px">${T("Πάτα μια επιλογή για να τη διαλέξεις. Με ▲▼ αλλάζεις σειρά, με τον κάδο τη σβήνεις.")}</p>`+
      panel(k.subs.length?k.subs.map((s,i)=>`<div class="slrow"><button type="button" class="slpick" data-slp="${i}">${esc(s)}</button>
        <button type="button" class="mini" data-slu="${i}" ${i?"":"disabled"} aria-label="${T("Πιο πάνω")}">▲</button>
        <button type="button" class="mini" data-sld="${i}" ${i<k.subs.length-1?"":"disabled"} aria-label="${T("Πιο κάτω")}">▼</button>
        <button type="button" class="mini del" data-slx="${i}" aria-label="${T("Διαγραφή")}">${ic("trash",16)}</button></div>`).join("")
        :`<div class="empty">${T("Δεν έχεις επιλογές ακόμα. Πρόσθεσε από κάτω.")}</div>`)+
      `<div class="inrow" style="margin-top:10px"><input id="sl_new" placeholder="${T("Νέα επιλογή, π.χ. Netflix")}" autocomplete="off"><button type="button" class="btn amber" id="sl_add">${T("Προσθήκη")}</button></div>`;
    $("#sl_add").onclick=()=>{const v=val("sl_new");if(!v)return;if(!k.subs.some(x=>norm(x)===norm(v)))k.subs.push(v);write();paint();$("#sl_new").focus()};
    $("#sl_new").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();$("#sl_add").click()}};
  };
  paint();
  $("#slBox").onclick=e=>{const b=e.target.closest("button");if(!b||b.id==="sl_add")return;
    if(b.dataset.slp!=null){onPick(k.subs[+b.dataset.slp]);return}
    const sw=(i,j)=>{[k.subs[i],k.subs[j]]=[k.subs[j],k.subs[i]];write();paint()};
    if(b.dataset.slu!=null){const i=+b.dataset.slu;if(i>0)sw(i,i-1);return}
    if(b.dataset.sld!=null){const i=+b.dataset.sld;if(i<k.subs.length-1)sw(i,i+1);return}
    if(b.dataset.slx!=null){const i=+b.dataset.slx;if(confirm(T("Να σβηστεί η επιλογή «{n}» από τη λίστα;",{n:k.subs[i]}))){k.subs.splice(i,1);write();paint()}}};
}
function pFixForm(f0,draft){
  pMigrate();
  const isNew=!f0;
  const v=Object.assign({dir:"out",name:"",amount:"",day:new Date().getDate(),kind:"home",remind:true,before:3},f0||{},draft||{});
  if(!pkinds().some(k=>k.id===v.kind&&k.dir===v.dir))v.kind=(pkinds().find(k=>k.dir===v.dir)||{}).id;
  const read=()=>({dir:v.dir,name:val("fx_name"),amount:val("fx_amt"),day:+val("fx_day"),kind:val("fx_kind"),remind:$("#fx_rem").checked,before:+val("fx_bef")});
  const reopen=d=>pFixForm(f0,d);
  const inc=v.dir==="in";
  openSheet({title:isNew?`📅 ${inc?T("Νέο πάγιο έσοδο"):T("Νέα πάγια υποχρέωση")}`:`📅 ${esc(v.name)}`,saveLabel:isNew?T("Προσθήκη"):T("Αποθήκευση"),saveStyle:isNew?"amber":"primary",cancelLabel:T("Άκυρο"),
    body:`<div class="seg dirseg" id="fx_dir"><button type="button" data-v="out" class="${inc?"":"on"}">${T("Έξοδο")}</button><button type="button" data-v="in" class="${inc?"on":""}">${T("Έσοδο")}</button></div>
      <label>${T("Κατηγορία")}</label><select id="fx_kind">${pkinds().filter(k=>k.dir===v.dir).map(k=>`<option value="${k.id}" ${k.id===v.kind?"selected":""}>${esc(pKName(k.id))}</option>`).join("")}</select>
      <label for="fx_name">${inc?T("Τι εισπράττεις"):T("Τι πληρώνεις")}</label>
      <div class="inrow"><input id="fx_name" value="${esc(v.name)}" placeholder="${inc?T("π.χ. Μισθός, ενοίκιο διαμερίσματος"):T("π.χ. ΔΕΗ, Internet, Netflix, δόση αυτοκινήτου")}" autocomplete="off">
        <button type="button" class="pickbtn narrow" id="fx_list" aria-label="${T("Επιλογές της κατηγορίας")}">▾</button></div>
      <label for="fx_amt">${T("Ποσό κάθε μήνα")}</label><span class="curr"><b>€</b><input id="fx_amt" inputmode="decimal" placeholder="0,00" value="${esc(String(v.amount))}"></span>
      <label for="fx_day">${inc?T("Μέρα του μήνα που έρχεται"):T("Μέρα του μήνα που λήγει")}</label><select id="fx_day">${Array.from({length:31},(_,i)=>`<option value="${i+1}" ${+v.day===i+1?"selected":""}>${i+1}</option>`).join("")}</select>
      <label class="toggle"><input type="checkbox" id="fx_rem" ${v.remind?"checked":""}>🔔 ${inc?T("Υπενθύμιση να το ελέγξεις"):T("Υπενθύμιση πριν τη λήξη")}</label>
      <label for="fx_bef">${T("Πόσες μέρες πριν")}</label><select id="fx_bef">${[0,1,2,3,5,7].map(n=>`<option value="${n}" ${+v.before===n?"selected":""}>${n?T("{n} μέρες πριν",{n}):T("Την ίδια μέρα")}</option>`).join("")}</select>
      <p class="note">${inc?T("Με το «Εισπράχθηκε» μπαίνει αυτόματα στα έσοδα. Κάθε μήνα ξαναμπαίνει μόνο του μέχρι να το σταματήσεις με το ✕."):T("Με το «Πληρώθηκε» μπαίνει αυτόματα στα έξοδα. Κάθε μήνα ξαναμπαίνει μόνο του μέχρι να το σταματήσεις με το ✕.")}</p>`,
    onSave:()=>{
      const d=read();if(!d.name){toast(inc?T("Γράψε τι εισπράττεις."):T("Γράψε τι πληρώνεις."));return false}
      const r=numStr(d.amount);if(r===""||isNaN(+r)){toast(T("Γράψε ποσό."));return false}
      d.amount=+r;
      let t=f0;if(isNew){t=Object.assign({id:uid()},d);S.pfixed.push(t)}else Object.assign(t,d);
      syncFixReminder(t);persist();render();toast(isNew?T("Προστέθηκε."):T("Οι αλλαγές αποθηκεύτηκαν."))},
    onDelete:isNew?null:()=>{pFixStop(f0,true)},
    deleteMsg:T("Να σταματήσει και να φύγει από τα πάγια; Όσες πληρωμές έγιναν μένουν στις κινήσεις.")});
  $("#fx_dir").onclick=ev=>{const b=ev.target.closest("[data-v]");if(!b||b.dataset.v===v.dir)return;const d=read();d.dir=b.dataset.v;d.kind=null;reopen(d)};
  $("#fx_list").onclick=()=>{const d=read();subListSheet(d.kind,name=>{d.name=name;reopen(d)},()=>reopen(d))};
}
// Γρήγορη λίστα παγίων: έξοδα και έσοδα σε χωριστές καρτέλες, ποσό και μέρα δίπλα σε κάθε επιλογή.
// Με «Επεξεργασία λίστας» προσθέτεις, σβήνεις, αλλάζεις σειρά και κρύβεις όσα δεν χρησιμοποιείς ποτέ.
function pFixQuick(){
  pMigrate();
  const fx=S.pfixed||(S.pfixed=[]);
  if(!Array.isArray(S.settings.pqHide))S.settings.pqHide=[];
  const hid=new Set(S.settings.pqHide);
  const keyOf=(dir,kind,name)=>dir+"|"+kind+"|"+norm(name);
  const find=(dir,kind,name)=>fx.find(f=>(f.dir||"out")===dir&&f.kind===kind&&norm(f.name)===norm(name));
  const vals={};fx.forEach(f=>{vals[keyOf(f.dir||"out",f.kind,f.name)]={amt:String(f.amount),day:String(f.day||"")}});
  let mode="out",edit=false,ask=null;const showHid=new Set();
  const itemsOf=(k,dir)=>{const base=(k.subs||[]).length?k.subs.slice():[T(k.name)];
    fx.forEach(f=>{if((f.dir||"out")===dir&&f.kind===k.id&&!base.some(n=>norm(n)===norm(f.name)))base.push(f.name)});return base};
  const ensureSubs=(k,dir)=>{if(!(k.subs||[]).length){k.subs=[T(k.name)]}return k.subs};
  const dayOpts=sel=>`<option value="">—</option>`+Array.from({length:31},(_,i)=>`<option value="${i+1}" ${+sel===i+1?"selected":""}>${i+1}</option>`).join("");
  openSheet({title:`📝 ${T("Γρήγορη λίστα παγίων")}`,saveLabel:T("Αποθήκευση"),cancelLabel:T("Άκυρο"),body:`<div id="qBox"></div>`,
    onSave:()=>{
      let add=0,upd=0,del=0;const today=new Date().getDate();
      for(const dir of["out","in"])for(const k of pkinds().filter(k=>k.dir===dir))for(const name of itemsOf(k,dir)){
        const v=vals[keyOf(dir,k.id,name)]||{amt:"",day:""},f=find(dir,k.id,name);
        const raw=numStr((v.amt||"").trim());
        if(raw==="x"||(raw!==""&&isNaN(+raw))){toast(T("Λάθος ποσό στο «{n}».",{n:name}));return false}
        const amt=raw===""?0:+raw,day=+v.day||0;
        if(amt>0){
          if(f){if(+f.amount!==amt||(day&&+f.day!==day)){f.amount=amt;if(day)f.day=day;syncFixReminder(f);upd++}}
          else{const t={id:uid(),dir,name,amount:amt,day:day||today,kind:k.id,remind:dir==="out",before:3};fx.push(t);syncFixReminder(t);add++}
        }else if(f){f.remind=false;syncFixReminder(f);fx.splice(fx.indexOf(f),1);del++}
      }
      S.settings.pqHide=[...hid];persist();render();
      toast(add||upd||del?[add?T("{n} νέα",{n:add}):"",upd?T("{n} άλλαξαν",{n:upd}):"",del?T("{n} σταμάτησαν",{n:del}):""].filter(Boolean).join(" · "):T("Οι αλλαγές αποθηκεύτηκαν."))}});
  const paint=()=>{
    const ks=pkinds().filter(k=>k.dir===mode);
    const tot=ks.reduce((a,k)=>a+itemsOf(k,mode).reduce((b,n)=>b+(+numStr((vals[keyOf(mode,k.id,n)]||{}).amt||"")||0),0),0);
    let h=`<div class="seg qseg"><button type="button" data-qm="out" class="${mode==="out"?"on out":""}">🔴 ${T("Πάγια έξοδα")}</button><button type="button" data-qm="in" class="${mode==="in"?"on in":""}">🟢 ${T("Πάγια έσοδα")}</button></div>
      <div class="qhead ${mode}"><span>${mode==="out"?T("Σύνολο πάγιων εξόδων"):T("Σύνολο πάγιων εσόδων")}</span><b>${money(rnd(tot))}</b></div>
      <button type="button" class="btn ghost wide pqedit ${edit?"on":""}" data-qe="1">${edit?"✓ "+T("Τέλος επεξεργασίας"):"🚫 "+T("Απόκρυψη και διαγραφή")}</button>
      <p class="note" style="margin:6px 2px 10px">${edit?T("Με το 👁 κρύβεις ό,τι δεν χρησιμοποιείς και με τον κάδο το σβήνεις εντελώς."):T("Γράψε ποσό και μέρα δίπλα σε όσα ισχύουν. Με ▲▼ αλλάζεις σειρά, με το ＋ δίπλα στον τίτλο προσθέτεις.")+" "+T("Για απόκρυψη ή διαγραφή κράτα πατημένο το όνομα για ένα δευτερόλεπτο.")}</p>`;
    let shown=0;
    ks.forEach(k=>{
      const items=itemsOf(k,mode);
      const isHid=n=>hid.has(keyOf(mode,k.id,n))&&!(+numStr((vals[keyOf(mode,k.id,n)]||{}).amt||"")>0);
      const hidN=items.filter(isHid).length;
      const vis=edit||showHid.has(k.id)?items:items.filter(n=>!isHid(n));
      if(!vis.length&&!edit&&!hidN)return;shown+=vis.length;
      const subs=k.subs||[];
      h+=`<div class="psub qcat"><span>${esc(k.emoji||"")} ${esc(T(k.name))}</span><button type="button" class="qplus" data-qplus="${k.id}" aria-label="${T("Πρόσθεσε στο «{n}»",{n:T(k.name)})}">＋</button></div>`+panel(vis.map(name=>{
        const key=keyOf(mode,k.id,name),v=vals[key]||{amt:"",day:""},off=hid.has(key),si=subs.findIndex(n=>norm(n)===norm(name));
        const arrows=`<span class="qarr"><button type="button" data-qu="${k.id}|${esc(name)}" ${si>0?"":"disabled"} aria-label="${T("Πιο πάνω")}">▲</button><button type="button" data-qd="${k.id}|${esc(name)}" ${si>=0&&si<subs.length-1?"":"disabled"} aria-label="${T("Πιο κάτω")}">▼</button></span>`;
        if(edit)return `<div class="pqrow qe ${off?"off":""}"><button type="button" class="qeye" data-qh="${esc(key)}" aria-label="${T("Εμφάνιση")}">${off?"🚫":"👁"}</button><span class="qn">${esc(name)}</span>
          <span class="qbtns">${arrows}<button type="button" class="mini del" data-qx="${k.id}|${esc(name)}" aria-label="${T("Διαγραφή")}">${ic("trash",15)}</button></span></div>`;
        if(ask===key){const has=+numStr(v.amt||"")>0;return `<div class="pqrow qask"><span class="qn">${T("Τι να γίνει με το «{n}»;",{n:esc(name)})}</span>
          <span class="qaskb">${has?"":`<button type="button" class="btn ghost small" data-qh="${esc(key)}" data-qok="1">${off?"👁 "+T("Εμφάνιση"):"🚫 "+T("Απόκρυψη")}</button>`}<button type="button" class="btn softout small" data-qx="${k.id}|${esc(name)}" data-qok="1">🗑 ${T("Διαγραφή")}</button><button type="button" class="btn ghost small" data-qno="1">${T("Άκυρο")}</button></span></div>`}
        if(off&&isHid(name))return `<div class="pqrow qoff" data-lp="${esc(key)}"><span class="qn">${esc(name)}</span><span class="qoffl">${T("κρυμμένο")}</span><button type="button" class="qeye" data-qh="${esc(key)}" aria-label="${T("Εμφάνιση")}">👁</button></div>`;
        return `<div class="pqrow ${+numStr(v.amt||"")>0?"has":""}" data-lp="${esc(key)}"><span class="qn">${esc(name)}</span>
          <span class="curr qa"><b>€</b><input inputmode="decimal" placeholder="0" data-qa="${esc(key)}" value="${esc(v.amt||"")}"></span>
          <select data-qdy="${esc(key)}" aria-label="${T("Μέρα λήξης")}">${dayOpts(v.day)}</select>${arrows}</div>`}).join("")+
        (!edit&&hidN?`<button type="button" class="qhidn" data-qsh="${k.id}">${showHid.has(k.id)?"▲ "+T("Απόκρυψη των κρυμμένων"):"🚫 "+pl(hidN,"{n} κρυμμένο · εμφάνιση","{n} κρυμμένα · εμφάνιση")}</button>`:""));
    });
    if(!shown&&!edit)h+=panel(`<div class="empty">${T("Όλα είναι κρυμμένα. Πάτα «Επεξεργασία λίστας» για να εμφανίσεις όσα χρειάζεσαι.")}</div>`);
    $("#qBox").innerHTML=h;
  };
  paint();
  const box=$("#qBox");
  box.addEventListener("input",e=>{const a=e.target.closest("[data-qa]");if(!a)return;const k=a.dataset.qa;vals[k]=Object.assign(vals[k]||{},{amt:a.value});a.closest(".pqrow").classList.toggle("has",+numStr(a.value)>0);sheetDirty=true;
    const t=[...box.querySelectorAll("[data-qa]")].reduce((x,i)=>x+(+numStr(i.value||"")||0),0),hb=box.querySelector(".qhead b");if(hb)hb.textContent=money(rnd(t))});
  box.addEventListener("change",e=>{const d=e.target.closest("[data-qdy]");if(!d)return;const k=d.dataset.qdy;vals[k]=Object.assign(vals[k]||{},{day:d.value});sheetDirty=true});
  box.addEventListener("keydown",e=>{const n=e.target.closest("[data-qnew]");if(n&&e.key==="Enter"){e.preventDefault();box.querySelector(`[data-qadd="${n.dataset.qnew}"]`).click()}});
  // κράτημα ~1 δευτερόλεπτο πάνω στο όνομα: βγαίνει «Απόκρυψη» ή «Διαγραφή»
  const lp=pLongPress(box,"[data-lp]",r=>{if(edit)return;ask=r.dataset.lp;paint()},"input,select,button");
  box.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(lp.recent())return;
    if(b.dataset.qno){ask=null;paint();return}
    if(b.dataset.qm){mode=b.dataset.qm;ask=null;paint();return}
    if(b.dataset.qe){edit=!edit;ask=null;paint();return}
    if(b.dataset.qh){ask=null;const k=b.dataset.qh;if(hid.has(k))hid.delete(k);else hid.add(k);S.settings.pqHide=[...hid];write();paint();return}
    const kk=id=>S.settings.pkinds.find(x=>x.id===id);
    if(b.dataset.qu||b.dataset.qd){const raw=b.dataset.qu||b.dataset.qd,id=raw.split("|")[0],name=raw.slice(id.length+1),k=kk(id),subs=ensureSubs(k,mode);
      const i=subs.findIndex(n=>norm(n)===norm(name)),st=b.dataset.qu?-1:1;let j=i+st;
      // πηδάει πάνω από όσα είναι κρυμμένα, ώστε η μετακίνηση να φαίνεται αμέσως
      if(!edit&&!showHid.has(id))while(j>=0&&j<subs.length&&hid.has(keyOf(mode,id,subs[j]))&&!(+numStr((vals[keyOf(mode,id,subs[j])]||{}).amt||"")>0))j+=st;
      if(i<0||j<0||j>=subs.length)return;const[x]=subs.splice(i,1);subs.splice(j,0,x);write();paint();return}
    if(b.dataset.qsh){const id=b.dataset.qsh;if(showHid.has(id))showHid.delete(id);else showHid.add(id);paint();return}
    if(b.dataset.qplus){const id=b.dataset.qplus,k=kk(id),v=(prompt(T("Τι να προστεθεί στο «{n}»;",{n:T(k.name)}))||"").trim();if(!v)return;
      const subs=ensureSubs(k,mode);if(!subs.some(n=>norm(n)===norm(v)))subs.push(v);hid.delete(keyOf(mode,id,v));S.settings.pqHide=[...hid];write();paint();
      setTimeout(()=>{const inp=box.querySelector(`[data-qa="${CSS.escape(keyOf(mode,id,v))}"]`);if(inp)inp.focus()},40);return}
    if(b.dataset.qx){const id=b.dataset.qx.split("|")[0],name=b.dataset.qx.slice(id.length+1),k=kk(id);
      if(find(mode,id,name)&&!confirm(T("Το «{n}» είναι ήδη στα πάγια σου. Να σβηστεί από τη λίστα και να σταματήσει;",{n:name})))return;
      if(!b.dataset.qok&&!confirm(T("Να σβηστεί η επιλογή «{n}» από τη λίστα;",{n:name})))return;
      ask=null;const ky=keyOf(mode,id,name);delete vals[ky];hid.delete(ky);S.settings.pqHide=[...hid];
      const subs=ensureSubs(k,mode),i=subs.findIndex(n=>norm(n)===norm(name));if(i>=0)subs.splice(i,1);
      const f=find(mode,id,name);if(f){delete vals[keyOf(mode,id,name)]}
      write();paint();return}
    if(b.dataset.qadd){const id=b.dataset.qadd,inp=box.querySelector(`[data-qnew="${id}"]`),v=(inp.value||"").trim();if(!v)return;
      const k=kk(id),subs=ensureSubs(k,mode);if(!subs.some(n=>norm(n)===norm(v)))subs.push(v);hid.delete(keyOf(mode,id,v));write();paint();
      setTimeout(()=>{const n=box.querySelector(`[data-qnew="${id}"]`);if(n)n.focus()},30);return}
  });
}
// Διαγραφή όλων των εσόδων ή όλων των εξόδων ενός μήνα, με επιβεβαίωση και αναίρεση
function pWipeSheet(mk){
  const all=S.personal||[];
  const months=[...new Set([ymKey(new Date()),...all.map(e=>ymKey(e.date))])].sort().reverse();
  mk=mk||months[0];
  const mName=k=>{const[y,m]=k.split("-");return monthName(new Date(+y,+m-1,15))+" "+y};
  const ofDir=d=>all.filter(e=>ymKey(e.date)===mk&&e.dir===d);
  const btn=(d,lbl)=>{const l=ofDir(d);return `<button type="button" class="btn ${d==="in"?"softin":"softout"} wide" data-pw="${d}" ${l.length?"":"disabled"} style="width:100%;margin-top:10px">🗑 ${lbl}<br><small style="font-weight:700">${l.length?pl(l.length,"{n} κίνηση","{n} κινήσεις")+" · "+money(pSum(l,d)):T("Δεν υπάρχουν")}</small></button>`};
  openSheet({title:`🗑 ${T("Διαγραφή μήνα")}`,cancelLabel:T("Κλείσιμο"),
    body:`<label for="pw_m">${T("Μήνας")}</label><select id="pw_m">${months.map(k=>`<option value="${k}" ${k===mk?"selected":""}>${esc(mName(k))}</option>`).join("")}</select>
      ${btn("in",T("Διαγραφή όλων των εσόδων του μήνα"))}${btn("out",T("Διαγραφή όλων των εξόδων του μήνα"))}
      <p class="note" style="margin-top:12px">${T("Σβήνονται μόνο οι κινήσεις. Τα πάγια μένουν και ξαναμπαίνουν κανονικά τον επόμενο μήνα.")}</p>`});
  $("#pw_m").onchange=()=>pWipeSheet(val("pw_m"));
  $("#shBody").onclick=e=>{const b=e.target.closest("[data-pw]");if(!b||b.disabled)return;const d=b.dataset.pw,l=ofDir(d);if(!l.length)return;
    const msg=d==="in"?T("Να διαγραφούν ΟΛΑ τα έσοδα του μήνα {m}; ({n} κινήσεις, {a})",{m:mName(mk),n:l.length,a:money(pSum(l,d))})
      :T("Να διαγραφούν ΟΛΑ τα έξοδα του μήνα {m}; ({n} κινήσεις, {a})",{m:mName(mk),n:l.length,a:money(pSum(l,d))});
    if(!confirm(msg))return;
    const before=S.personal.slice(),fx=(S.pfixed||[]).filter(f=>f.paid===mk&&l.some(e=>e.fixId===f.id));
    S.personal=S.personal.filter(e=>!l.includes(e));fx.forEach(f=>{f.paid="";syncFixReminder(f)});
    persist();closeSheet();render();
    undoToast(d==="in"?T("Διαγράφηκαν {n} έσοδα.",{n:l.length}):T("Διαγράφηκαν {n} έξοδα.",{n:l.length}),
      ()=>{S.personal=before;fx.forEach(f=>{f.paid=mk;syncFixReminder(f)});persist();render()})};
}
function pFixStop(f,noAsk){
  if(!noAsk&&!confirm(T("Να σταματήσει το «{n}»; Φεύγει αμέσως από τα πάγια και από τις υπενθυμίσεις. Όσες πληρωμές έγιναν μένουν στις κινήσεις.",{n:f.name})))return;
  const i=S.pfixed.indexOf(f);if(i<0)return;
  const wasRem=f.remind;f.remind=false;syncFixReminder(f);S.pfixed.splice(i,1);persist();render();
  undoToast(T("Το «{n}» σταμάτησε.",{n:f.name}),()=>{S.pfixed.splice(i,0,f);f.remind=wasRem;syncFixReminder(f);persist();render()});
}
function pFixPay(f){
  const inc=f.dir==="in";
  const e={id:uid(),dir:inc?"in":"out",kind:f.kind||(inc?"pinother":"other"),sub:f.name,amount:+f.amount||0,date:new Date().toISOString(),note:"",fixId:f.id,createdAt:Date.now()};
  S.personal.push(e);const was=f.paid;f.paid=ymKey(new Date());syncFixReminder(f);persist();render();
  undoToast(inc?T("«{n}» εισπράχθηκε και μπήκε στα έσοδα.",{n:f.name}):T("«{n}» πληρώθηκε και μπήκε στα έξοδα.",{n:f.name}),()=>{const i=S.personal.indexOf(e);if(i>=0)S.personal.splice(i,1);f.paid=was;syncFixReminder(f);persist();render()});
}

document.addEventListener("change",e=>{const c=e.target.closest("[data-pbdef]");if(!c)return;
  S.settings.defaultBook=c.checked?"personal":"work";write();
  toast(c.checked?T("Το Ταμείο θα ανοίγει στα Προσωπικά."):T("Το Ταμείο θα ανοίγει στην Εργασία."))});
/* ---------- Κουμπιά (data-act) των Προσωπικών ----------
   Καλείται από τον κεντρικό χειριστή κλικ του index.html· επιστρέφει true
   όταν η ενέργεια ανήκει εδώ. */
function pAct(a,el,id,e){
  switch(a){
    case"book":moneyBook=el.dataset.v;render();window.scrollTo(0,0);break;
    case"pNew":{const d=el.dataset.dir;pMigrate();pCatPicker(d,(k,sb)=>pEntryForm(null,d,{kind:k,sub:sb}),null);break}
    case"pEdit":{const e=(S.personal||[]).find(x=>x.id===id);if(e)pEntryForm(e);break}
    case"pKinds":pKindsSheet();break;
    case"pDir":pf.dir=el.dataset.v;render();break;
    case"pPick":pPickSheet();break;
    case"pPdf":pPdf(false);break;
    case"pPdfSend":pPdf(true);break;
    case"pClear":pf={dir:"all",kinds:[]};render();break;
    case"pCat":pCatSheet(el.dataset.k);break;
    case"pBudget":pBudgetSheet();break;
    case"pFixNew":pFixForm(null,{dir:el.dataset.dir||"out"});break;
    case"pFixQuick":pFixQuick();break;
    case"pFixStop":{e.stopPropagation();const f=(S.pfixed||[]).find(x=>x.id===id);if(f)pFixStop(f);break}
    case"pFixEdit":{const f=(S.pfixed||[]).find(x=>x.id===id);if(f)pFixForm(f);break}
    case"pFixPay":{e.stopPropagation();const f=(S.pfixed||[]).find(x=>x.id===id);if(f)pFixPay(f);break}
    case"pWipe":pWipeSheet();break;
    case"pOnly":closeSheet();pf={dir:"all",kinds:[el.dataset.k]};render();{const t=document.querySelector(".cefseg");if(t)t.scrollIntoView({block:"start",behavior:"smooth"})}break;
    default:return false;
  }
  return true;
}
