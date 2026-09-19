/* Δρομολόγιο — Αντίγραφο ασφαλείας. */
/* ---------- Αντίγραφο ασφαλείας ---------- */
const ejCfg=()=>({service:S.settings.ejService||EJ_SERVICE,template:S.settings.ejTemplate||EJ_TEMPLATE,key:S.settings.ejKey||EJ_KEY});
const mailReady=()=>{const c=ejCfg();return !!(c.service&&c.template&&c.key)};
function backupStatus(){const m=S.meta;return(m.lastBackup?T("Τελευταίο αντίγραφο: {d}.",{d:fmt(m.lastBackup)}):T("Δεν έχει κρατηθεί ακόμα αντίγραφο από αυτή τη συσκευή."))+" "+T("Αλλαγές από τότε: {n}.",{n:m.changes})}
function markBackup(){S.meta.changes=0;S.meta.lastBackup=new Date().toISOString();write();render();if($("#bkStatus"))$("#bkStatus").textContent=backupStatus()}
const backupPayload=()=>JSON.stringify(Object.assign({efarmogi:"dromologio",ekdosi:2,dimiourgia:new Date().toISOString()},S));
const fileName=ext=>`dromologio-antigrafo-${toLocalInput(new Date()).slice(0,10)}.${ext}`;
function downloadBackup(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([backupPayload()],{type:"application/json"}));
  a.download=fileName("json");document.body.appendChild(a);a.click();a.remove();markBackup();toast(T("Το αρχείο αποθηκεύτηκε στις λήψεις του κινητού."))}
async function sendEmailBackup(silent){
  const s=S.settings;
  if(!mailReady()){if(!silent)toast(T("Η αποστολή στο ταχυδρομείο δεν έχει ενεργοποιηθεί ακόμα στην εφαρμογή."));return false}
  if(!/^\S+@\S+\.\S+$/.test(s.backupEmail)){if(!silent)toast(T("Γράψε σωστό ηλεκτρονικό ταχυδρομείο."));return false}
  const data=backupPayload(),date=new Date().toLocaleString(LOC());
  if(data.length>45000){
    if(!silent)toast(T("Τα δεδομένα ξεπέρασαν το όριο του ταχυδρομείου. Χρησιμοποίησε «Κοινοποίηση» ή «Αποθήκευση αρχείου»."));
    return false;
  }
  try{
    const r=await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({service_id:ejCfg().service,template_id:ejCfg().template,user_id:ejCfg().key,template_params:{user_email:s.backupEmail,to_email:s.backupEmail,
        name:"Δρομολόγιο",time:date,message:data,
        from_name:"Δρομολόγιο",app_name:"Δρομολόγιο",reply_to:"aglentzakis.apps@gmail.com",
        subject:"Δρομολόγιο – Backup δεδομένων",title:"Δρομολόγιο – Backup δεδομένων",
        date,file_name:fileName("json"),backup_data:data}})});
    if(r.ok){markBackup();if(!silent)toast(T("Το αντίγραφο στάλθηκε στο {e}.",{e:s.backupEmail}));return true}
    let why="";try{why=((await r.text())||"").slice(0,120)}catch(e){}
    if(!silent)toast(r.status===413?T("Τα δεδομένα είναι πολλά για αποστολή. Χρησιμοποίησε την κοινοποίηση αρχείου.")
      :r.status===403?T("Το EmailJS απέρριψε το αίτημα. Έλεγξε το δημόσιο κλειδί και ότι επιτρέπονται οι αποστολές από τον φυλλομετρητή.")
      :r.status===400?T("Λάθος κωδικός υπηρεσίας ή προτύπου. {w}",{w:why})
      :T("Η αποστολή απέτυχε, κωδικός σφάλματος {c}. {w}",{c:r.status,w:why}));
  }catch(e){if(!silent)toast(T("Δεν υπάρχει σύνδεση στο διαδίκτυο. Δοκίμασε ξανά ή αποθήκευσε αρχείο."))}
  return false;
}
let autoTimer=null;
function scheduleAuto(){clearTimeout(autoTimer);autoTimer=setTimeout(async()=>{
  const s=S.settings,m=S.meta;if(!s.autoEmail||!s.backupEmail||!mailReady()||m.changes<s.backupEvery||!navigator.onLine)return;
  if(Date.now()-(m.lastAuto||0)<30*60000)return;m.lastAuto=Date.now();write();
  if(await sendEmailBackup(true))toast(T("Στάλθηκε αυτόματα αντίγραφο στο ταχυδρομείο σου."))},4000)}
function parseBackup(text){
  let s=String(text||"").trim();const i=s.indexOf("{"),j=s.lastIndexOf("}");if(i<0||j<i)return null;s=s.slice(i,j+1);
  let d;try{d=JSON.parse(s)}catch(e){try{d=JSON.parse(s.replace(/&quot;/g,'"').replace(/&amp;/g,"&").replace(/&#39;/g,"'"))}catch(e2){return null}}
  const find=(o,depth=0)=>{if(!o||typeof o!=="object"||depth>4)return null;
    if(Array.isArray(o.clients)||Array.isArray(o.tasks)||Array.isArray(o.reminders))return o;
    for(const k of Object.keys(o)){let x=o[k];if(typeof x==="string"&&x.trim().startsWith("{")){try{x=JSON.parse(x)}catch(e){x=null}}const r=find(x,depth+1);if(r)return r}return null};
  return find(d);
}
function restoreFrom(text){
  const d=parseBackup(text);if(!d){toast(T("Δεν βρέθηκαν δεδομένα της εφαρμογής σε αυτό το αρχείο."));return}
  const c=(d.clients||[]).length,k=(d.tasks||[]).length,r=(d.reminders||[]).length;
  const hasNow=S.clients.length||S.tasks.length||S.reminders.length;
  if(!confirm(T("Βρέθηκαν {c} πελάτες, {k} εργασίες και {r} υπενθυμίσεις.",{c,k,r})+"\n\n"+(hasNow?T("Θα αντικαταστήσουν τα τωρινά δεδομένα. Συνέχεια;"):T("Να γίνει η επαναφορά;"))))return;
  ["efarmogi","ekdosi","dimiourgia"].forEach(x=>delete d[x]);
  const keepLook=S.settings.look,keepLang=S.settings.lang,hadLook=d.settings&&d.settings.look;
  S=fix(d);if(!hadLook)S.settings.look=keepLook;if(!d.settings||!d.settings.lang)S.settings.lang=keepLang;LANG=S.settings.lang;
  S.meta.changes=0;write();applyLook();closeSheet();view="today";render();toast(T("Τα δεδομένα επαναφέρθηκαν."));
}
// Οθόνη εξαγωγής: διαλέγεις διάστημα και πελάτη, βλέπεις πόσες κινήσεις θα φύγουν
function exportSheet(clientId){
  let per=clientId?"all":moneyPeriod, cid=clientId||"";
  const PER=[["day","Σήμερα"],["week","Τελευταία εβδομάδα"],["month","Τελευταίος μήνας"],
    ["quarter","Τελευταίο τρίμηνο"],["half","Τελευταίο εξάμηνο"],["year","Φέτος"],["all","Όλα"]];
  const cnt=()=>exportRows(per,cid).length-1;
  const paint=()=>{
    $("#exPer").innerHTML=PER.map(([k,l])=>`<button type="button" class="chip ${per===k?"on":""}" data-exp="${k}">${T(l)}</button>`).join("");
    $("#exInfo").textContent=pl(cnt(),"{n} κίνηση θα εξαχθεί","{n} κινήσεις θα εξαχθούν");
  };
  openSheet({title:T("Εξαγωγή στοιχείων"),cancelLabel:T("Άκυρο"),saveLabel:T("Εξαγωγή"),saveStyle:"amber",
    onSave:()=>{doExport(per,cid);return true},
    body:`<label>${T("Διάστημα")}</label><div class="chips" id="exPer"></div>
      <label for="ex_cli" style="margin-top:14px">${T("Πελάτης")}</label>
      <select id="ex_cli"><option value="">${T("Όλοι οι πελάτες")}</option>
        ${S.clients.filter(alive).slice().sort((a,b)=>a.name.localeCompare(b.name,"el")).map(c=>`<option value="${c.id}" ${c.id===cid?"selected":""}>${esc(c.name)}</option>`).join("")}</select>
      <p class="note" id="exInfo" style="margin-top:14px"></p>`});
  paint();
  $("#exPer").onclick=e=>{const b=e.target.closest("[data-exp]");if(!b)return;per=b.dataset.exp;paint()};
  $("#ex_cli").onchange=e=>{cid=e.target.value;paint()};
}
function exportFrom(per){
  const d=new Date();d.setHours(0,0,0,0);
  if(per==="day")return d;
  if(per==="week"){const x=new Date(d);x.setDate(x.getDate()-7);return x}
  if(per==="month"){const x=new Date(d);x.setMonth(x.getMonth()-1);return x}
  if(per==="quarter"){const x=new Date(d);x.setMonth(x.getMonth()-3);return x}
  if(per==="half"){const x=new Date(d);x.setMonth(x.getMonth()-6);return x}
  if(per==="year")return new Date(d.getFullYear(),0,1);
  if(/^\d{4}$/.test(per))return new Date(+per,0,1);
  return null;
}
function exportRows(per,cid){
  const from=exportFrom(per),to=/^\d{4}$/.test(per)?new Date(+per+1,0,1):null;
  const inR=t=>{const x=new Date(t);return(!from||x>=from)&&(!to||x<to)};
  const rows=[[T("Ημερομηνία"),T("Είδος"),T("Έσοδο/Έξοδο"),T("Ποσό"),T("Πελάτης"),T("Εργασία"),T("Σημείωση"),T("Κατάσταση")]];
  S.ledger.filter(alive).filter(e=>inR(e.date)).filter(e=>!cid||e.clientId===cid)
    .sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(e=>{
    const c=getClient(e.clientId),tk=S.tasks.find(x=>x.id===e.taskId);
    rows.push([new Date(e.date).toLocaleDateString("el-GR"),kindName(e.kind),isIn(e.kind)?T("Έσοδο"):T("Έξοδο"),
      String(e.amount).replace(".",","),c?c.name:"",tk?tk.title:"",e.note||"",e.cancelled?T("ακυρώθηκε"):""]);
  });
  return rows;
}
function doExport(per,cid){
  const rows=exportRows(per,cid);
  if(rows.length<2)return toast(T("Δεν υπάρχουν κινήσεις για αυτή την επιλογή."));
  const inSum=rows.slice(1).filter(r=>r[2]===T("Έσοδο")).reduce((s,r)=>s+(+String(r[3]).replace(",","."))||0,0);
  const outSum=rows.slice(1).filter(r=>r[2]===T("Έξοδο")).reduce((s,r)=>s+(+String(r[3]).replace(",","."))||0,0);
  rows.push([]);rows.push([T("Σύνολο εσόδων"),"","",String(rnd(inSum)).replace(".",",")]);
  rows.push([T("Σύνολο εξόδων"),"","",String(rnd(outSum)).replace(".",",")]);
  rows.push([T("Καθαρό"),"","",String(rnd(inSum-outSum)).replace(".",",")]);
  const csv="\uFEFF"+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\r\n");
  const c=cid&&getClient(cid);
  const name=`kiniseis-${c?c.name.replace(/\s+/g,"-"):per}-${toLocalInput(new Date()).slice(0,10)}.csv`;
  const file=new File([csv],name,{type:"text/csv"});
  if(navigator.canShare&&navigator.canShare({files:[file]})){
    navigator.share({files:[file],title:T("Κινήσεις")}).then(()=>toast(T("Στάλθηκε."))).catch(()=>{});
    return;
  }
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=name;
  document.body.appendChild(a);a.click();a.remove();toast(T("Το αρχείο αποθηκεύτηκε στις λήψεις του κινητού."));
}
function exportCsv(){
  const from=periodStart(),inR=t=>!from||new Date(t)>=from;
  const rows=[[T("Ημερομηνία"),T("Είδος"),T("Έσοδο/Έξοδο"),T("Ποσό"),T("Πελάτης"),T("Εργασία"),T("Σημείωση"),T("Κατάσταση")]];
  S.ledger.filter(alive).filter(e=>inR(e.date)).sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(e=>{
    const c=getClient(e.clientId),tk=S.tasks.find(x=>x.id===e.taskId);
    rows.push([new Date(e.date).toLocaleDateString("el-GR"),kindName(e.kind),isIn(e.kind)?T("Έσοδο"):T("Έξοδο"),
      String(e.amount).replace(".",","),c?c.name:"",tk?tk.title:"",e.note||"",e.cancelled?T("ακυρώθηκε"):""]);
  });
  const csv="\uFEFF"+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\r\n");
  const name=`kiniseis-${moneyPeriod}-${toLocalInput(new Date()).slice(0,10)}.csv`;
  const file=new File([csv],name,{type:"text/csv"});
  if(navigator.canShare&&navigator.canShare({files:[file]})){
    navigator.share({files:[file],title:T("Κινήσεις")}).then(()=>toast(T("Στάλθηκε."))).catch(()=>{});
    return;
  }
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=name;
  document.body.appendChild(a);a.click();a.remove();toast(T("Το αρχείο αποθηκεύτηκε στις λήψεις του κινητού."));
}
function backupSheet(){
  const st=S.settings;
  openSheet({title:T("Αντίγραφο ασφαλείας"),cancelLabel:T("Κλείσιμο"),body:`
    <p class="note" id="bkStatus">${backupStatus()}</p>
    <h3 class="sub">${T("Αποστολή στο ταχυδρομείο")}</h3>
    <label for="b_email">${T("Το ηλεκτρονικό σου ταχυδρομείο")}</label><input id="b_email" type="email" value="${esc(st.backupEmail)}" placeholder="${T("η διεύθυνσή σου")}">
    <button class="btn primary wide gobtn" id="b_send" style="margin-top:12px">${ic("shield",20)}${T("Αποστολή τώρα")}</button>
    <label class="toggle" style="margin-top:14px"><input type="checkbox" id="b_auto" ${st.autoEmail?"checked":""}>${T("Αυτόματη αποστολή")}</label>
    <label for="b_every">${T("Κάθε πόσες αλλαγές")}</label><input id="b_every" type="number" min="1" max="500" value="${st.backupEvery}">
    ${mailReady()?"":`<p class="note" style="color:var(--red)">${T("Η αποστολή δεν είναι ενεργή ακόμα. Συμπλήρωσε τα στοιχεία υπηρεσίας παρακάτω, μία φορά.")}</p>`}
    <details class="det" ${mailReady()?"":"open"}><summary>${T("Στοιχεία υπηρεσίας αποστολής (μία φορά)")}</summary>
      <p class="note">${T("Τα ίδια που χρησιμοποιεί η εφαρμογή ψαρέματος: κωδικός υπηρεσίας, κωδικός προτύπου και δημόσιο κλειδί.")}</p>
      <p class="note">${T("Υπηρεσία του Δρομολογίου: {s}. Το Fish IQ μένει στη δική του υπηρεσία.",{s:EJ_SERVICE})}</p>
      <label for="b_srv">${T("Κωδικός υπηρεσίας")}</label><input id="b_srv" value="${esc(st.ejService)}" autocomplete="off" placeholder="${EJ_SERVICE}">
      <label for="b_tpl">${T("Κωδικός προτύπου «Δρομολόγιο»")}</label><input id="b_tpl" value="${esc(st.ejTemplate)}" autocomplete="off" placeholder="template_xxxxxxx">
      <label for="b_key">${T("Δημόσιο κλειδί")}</label><input id="b_key" value="${esc(st.ejKey)}" autocomplete="off" placeholder="public key">
    </details>
    <h3 class="sub">${T("Αρχείο στη συσκευή")}</h3>
    <button class="btn primary wide gobtn" id="b_share" style="margin-top:4px">${ic("msg",20)}${T("Κοινοποίηση σε άλλη εφαρμογή")}</button>
    <button class="btn ghost wide gobtn" id="b_save" style="margin-top:8px;border:1.5px solid var(--line)">${ic("archive",20)}${T("Αποθήκευση αρχείου στο κινητό")}</button>
    <div class="danger-zone">
      <div class="dz-head">⚠ ${T("Επαναφορά δεδομένων")}</div>
      <p class="note">${T("Η επαναφορά σβήνει ό,τι υπάρχει τώρα στην εφαρμογή και βάζει στη θέση του το περιεχόμενο του αντιγράφου. Δεν αναιρείται.")}</p>
      <label class="btn dzbtn filebtn">${T("Επαναφορά από αρχείο")}<input type="file" id="b_imp" hidden></label>
      <details class="det"><summary>${T("Επικόλληση αντιγράφου από το ταχυδρομείο")}</summary>
        <textarea id="b_paste" rows="4"></textarea><button type="button" class="btn dzbtn" id="b_pasteGo">${T("Επαναφορά από το κείμενο")}</button></details>
    </div>`});
  const keep=()=>{st.backupEmail=val("b_email");st.autoEmail=$("#b_auto").checked;st.ejService=val("b_srv");st.ejTemplate=val("b_tpl");st.ejKey=val("b_key");
    const e=parseInt(val("b_every"));if(e>0)st.backupEvery=e;write()};
  ["b_email","b_auto","b_every","b_srv","b_tpl","b_key"].forEach(id=>$("#"+id).addEventListener("change",keep));
  $("#b_send").onclick=async()=>{keep();
    if(!mailReady()){$(".det").open=true;toast(T("Συμπλήρωσε πρώτα τα στοιχεία υπηρεσίας αποστολής."));return}
    const b=$("#b_send");b.disabled=true;b.textContent=T("Αποστολή…");await sendEmailBackup(false);b.disabled=false;b.innerHTML=ic("shield",20)+T("Αποστολή τώρα")};
  $("#b_share").onclick=async()=>{const file=new File([backupPayload()],fileName("txt"),{type:"text/plain"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:T("Αντίγραφο ασφαλείας")});markBackup();toast(T("Το αντίγραφο κοινοποιήθηκε."))}catch(e){if(e.name!=="AbortError")toast(T("Η κοινοποίηση δεν ολοκληρώθηκε."))}}
    else downloadBackup()};
  $("#b_save").onclick=downloadBackup;
  $("#b_imp").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>restoreFrom(rd.result);rd.onerror=()=>toast(T("Το αρχείο δεν διαβάστηκε."));rd.readAsText(f);e.target.value=""};
  $("#b_pasteGo").onclick=()=>restoreFrom(val("b_paste"));
}

