/* Δρομολόγιο — Αναδυόμενο φύλλο, ρολόι, επαφές, φόρμα πελάτη. */
/* ---------- Αναδυόμενο φύλλο ---------- */
let sheetCancel=null,sheetDirty=false,sheetHasSave=false,sheetAutoSave=null; // sheetAutoSave: αν υπάρχει, το κλείσιμο αποθηκεύει σιωπηλά αντί να ρωτάει
function freshSheetBody(){
  const old=$("#shBody"),n=old.cloneNode(false);n.id="shBody";old.replaceWith(n);return n;
}
function openSheet({title,body,onSave,onDelete,deleteMsg,onCancel,saveLabel,saveStyle,saveClass="",cancelLabel,fixed="",noFoot=false,overNav=false}){
  $("#shTitle").textContent=title;freshSheetBody().innerHTML=body;$("#shBody").scrollTop=0;
  $("#shFixed").innerHTML=fixed;$("#shFixed").classList.toggle("last",noFoot);
  $("#shClose").hidden=!noFoot;$("#shClose").setAttribute("aria-label",T("Κλείσιμο"));$("#shFoot").style.display=noFoot?"none":"";
  $("#shFoot").innerHTML=`${onDelete?`<button class="btn danger" id="sDel">${T("Διαγραφή")}</button>`:""}<span class="grow"></span>
    <button class="btn ghost" id="sCancel">${cancelLabel||T("Άκυρο")}</button>${onSave?`<button class="btn big ${saveStyle||"primary"} ${saveClass||""}" id="sSave">${saveLabel||T("Αποθήκευση")}</button>`:""}`;
  document.body.classList.remove("typing");
  decorateTime($("#shBody"));decorateTime($("#shFixed"));dtBind($("#shBody"));dtBind($("#shFixed"));
  $("#modal").classList.add("open");
  document.body.classList.toggle("overnav",!!overNav);$("#modal").classList.toggle("overnav",!!overNav);
  if(overNav)render();
  sheetCancel=onCancel||null;sheetDirty=false;sheetHasSave=!!onSave;sheetAutoSave=null;
  $("#sCancel").onclick=cancelSheet;
  if(onSave)$("#sSave").onclick=()=>{const r=onSave();if(r===false)return;if(r!=="replaced")closeSheet()};
  if(onDelete)$("#sDel").onclick=()=>{if(confirm(deleteMsg||T("Να διαγραφεί;"))){const r=onDelete();if(r!=="replaced")closeSheet()}};
}
document.addEventListener("input",e=>{if(e.target.closest&&(e.target.closest("#shBody")||e.target.closest("#shFixed")))sheetDirty=true});
$("#shClose").onclick=()=>cancelSheet();
function unfade(){const a=document.activeElement;
  if(!a||!/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))document.body.classList.remove("typing")}
function closeSheet(){document.body.classList.remove("typing");const wasNav=document.body.classList.contains("overnav");
  document.body.classList.remove("overnav");$("#modal").classList.remove("open","overnav");$("#shFixed").innerHTML="";
  if(wasNav)setTimeout(render,0);sheetCancel=null;sheetDirty=false;sheetHasSave=false;sheetAutoSave=null}
function cancelSheet(){
  if(sheetAutoSave){try{sheetAutoSave()}catch(e){}sheetDirty=false}
  if(sheetHasSave&&sheetDirty&&!confirm(T("Να κλείσει χωρίς να αποθηκευτούν οι αλλαγές;")))return;
  const cb=sheetCancel;closeSheet();if(cb)cb();
}
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal"&&!sheetHasSave)cancelSheet()});
const val=id=>($("#"+id)?.value||"").trim();
// Πεδίο ημέρας και ώρας: ενιαίο ή ξεχωριστά, ώστε το κινητό να δείχνει στρογγυλό ρολόι
const splitFields=()=>S.settings.splitTime||S.settings.clock==="app";
const dLabel=d=>{if(!d)return "—";const x=new Date(d+"T12:00"),n=new Date();
  const opt={day:"numeric",month:"short"};if(x.getFullYear()!==n.getFullYear())opt.year="2-digit";
  return x.toLocaleDateString(LOC(),opt)};
function dtHTML(id,value,extra=""){
  const v=value||"";
  if(!splitFields())return `<input type="datetime-local" id="${id}" value="${esc(v)}" ${extra}>`;
  const d=v.slice(0,10),t=v.slice(11,16);
  if(S.settings.clock==="native"){
    return `<div class="two" style="gap:8px"><input type="date" id="${id}_d" value="${esc(d)}" ${extra}><input type="time" id="${id}_t" value="${esc(t)}" ${extra}></div>`;
  }
  return `<div class="dtrow" id="${id}_row">
    <label class="dtf"><span class="dic">${ic("today",18)}</span><span class="dtx2"><i>${T("Ημέρα")}</i><b id="${id}_dv">${esc(dLabel(d))}</b></span>
      <input type="date" id="${id}_d" value="${esc(d)}" ${extra}></label>
    <button type="button" class="dtf" data-clockfor="${id}"><span class="dic">${ic("clock",18)}</span><span class="dtx2"><i>${T("Ώρα")}</i><b id="${id}_tv">${t?esc(t):"—"}</b></span></button>
    <input type="time" id="${id}_t" value="${esc(t)}" class="hidefield">
    <button type="button" class="dtclr" data-clearfor="${id}" aria-label="${T("Καθαρισμός")}">✕</button>
  </div>`;
}
// ενημέρωση ετικετών και σύνδεση με το στρογγυλό ρολόι
function dtBind(root){
  (root||document).querySelectorAll(".dtrow").forEach(row=>{
    if(row.dataset.b)return;row.dataset.b="1";
    const id=row.id.replace(/_row$/,""),di=$("#"+id+"_d"),ti=$("#"+id+"_t");
    const paint=()=>{const dv=$("#"+id+"_dv"),tv=$("#"+id+"_tv");
      if(dv)dv.textContent=dLabel(di.value);
      if(tv)tv.textContent=ti.value||"—";
      row.classList.toggle("has",!!di.value)};
    di.addEventListener("change",()=>{if(di.value&&!ti.value)ti.value="09:00";paint();
      ti.dispatchEvent(new Event("change",{bubbles:true}))});
    row.querySelector("[data-clockfor]").onclick=()=>{
      if(S.settings.clock==="native"){try{ti.showPicker()}catch(e){ti.focus()}return}
      openClock(ti.value,v=>{ti.value=v;if(!di.value)di.value=new Date().toISOString().slice(0,10);paint();
        ti.dispatchEvent(new Event("change",{bubbles:true}))});
    };
    row.querySelector("[data-clearfor]").onclick=()=>{di.value="";ti.value="";paint();
      ti.dispatchEvent(new Event("change",{bubbles:true}))};
    ti.addEventListener("change",paint);
    paint();
  });
}
function nextTimeOnly(id){
  if(!splitFields())return "";
  const d=val(id+"_d"),t=val(id+"_t");
  if(d||!t)return "";
  const [h,m]=t.split(":").map(Number);
  const cand=new Date();cand.setSeconds(0,0);cand.setHours(h,m,0,0);
  if(cand<=new Date())cand.setDate(cand.getDate()+1);
  return toLocalInput(cand);
}
// «σε 5 ώρες», «σε 2 μέρες και 3 ώρες», «σε 20 λεπτά»
function relTimeText(target){
  let mins=Math.max(0,Math.round((new Date(target)-Date.now())/60000));
  const days=Math.floor(mins/1440);mins%=1440;
  const hours=Math.floor(mins/60);const rem=mins%60;
  const parts=[];
  if(days)parts.push(pl(days,"{n} μέρα","{n} μέρες"));
  if(hours)parts.push(pl(hours,"{n} ώρα","{n} ώρες"));
  if(!days&&!hours)parts.push(pl(rem,"{n} λεπτό","{n} λεπτά"));
  return parts.join(" "+T("και")+" ");
}
function dtVal(id){
  if(!splitFields())return val(id);
  const d=val(id+"_d"),t=val(id+"_t");
  if(!d)return "";
  return d+"T"+(t||"09:00");
}
function dtSet(id,v){
  if(!splitFields()){const el=$("#"+id);if(el)el.value=v||"";return}
  const a=$("#"+id+"_d"),b=$("#"+id+"_t");
  if(a)a.value=(v||"").slice(0,10);if(b)b.value=(v||"").slice(11,16);
  const dv=$("#"+id+"_dv"),tv=$("#"+id+"_tv");
  if(dv)dv.textContent=dLabel((v||"").slice(0,10));
  if(tv)tv.textContent=(v||"").slice(11,16)||"—";
}
// κάθε πεδίο ημερομηνίας/ώρας αποκτά μεγάλο στρογγυλό ρολόι που ανοίγει τον επιλογέα
/* ---------- Στρογγυλό ρολόι (δικό μας, ίδιο παντού) ---------- */
let clV={h:9,m:0},clStage="h",clCb=null;
function clDraw(){
  const dial=$("#clDial"),R=135,cx=135,cy=135;
  let html=`<svg viewBox="0 0 270 270"><circle cx="135" cy="135" r="4" fill="var(--brand)"/>`;
  const sel=clStage==="h"?clV.h:clV.m;
  const ang=clStage==="h"?((clV.h%12)/12)*360:(clV.m/60)*360;
  const rr=clStage==="h"&&(clV.h===0||clV.h>12)?76:108;
  const x=cx+rr*Math.sin(ang*Math.PI/180),y=cy-rr*Math.cos(ang*Math.PI/180);
  html+=`<line x1="135" y1="135" x2="${x}" y2="${y}" stroke="var(--brand)" stroke-width="3"/>
    <circle cx="${x}" cy="${y}" r="21" fill="var(--brand)" opacity=".18"/></svg>`;
  const put=(v,label,r,cls)=>{const a=((clStage==="h"?(v%12)/12:(v/60))*360)*Math.PI/180;
    const px=cx+r*Math.sin(a),py=cy-r*Math.cos(a);
    return `<div class="cn ${cls} ${v===sel?"sel":""}" style="left:${px}px;top:${py}px" data-cv="${v}">${label}</div>`};
  if(clStage==="h"){
    for(let i=1;i<=12;i++)html+=put(i,i,108,"");
    for(let i=13;i<=23;i++)html+=put(i,i,76,"inner");
    html+=put(0,"00",76,"inner");
  }else{
    for(let i=0;i<60;i+=5)html+=put(i,String(i).padStart(2,"0"),108,"");
  }
  dial.innerHTML=html;
  $("#clH").textContent=pad(clV.h);$("#clM").textContent=pad(clV.m);
  $("#clH").classList.toggle("on",clStage==="h");$("#clM").classList.toggle("on",clStage==="m");
}
function clFromPoint(e){
  const d=$("#clDial").getBoundingClientRect();
  const dx=e.clientX-(d.left+d.width/2),dy=e.clientY-(d.top+d.height/2);
  let a=Math.atan2(dx,-dy)*180/Math.PI;if(a<0)a+=360;
  const r=Math.hypot(dx,dy);
  if(clStage==="h"){
    let h=Math.round(a/30)%12;
    const inner=r<d.width*0.33;
    if(inner){h=h===0?0:h+12;if(h===24)h=0}else if(h===0)h=12;
    clV.h=h;
  }else{
    clV.m=Math.round(a/6)%60;
  }
  clDraw();
}
function openClock(value,cb){
  const now=new Date();
  const v=String(value||"").match(/(\d{1,2}):(\d{2})/);
  clV={h:v?+v[1]:now.getHours(),m:v?+v[2]:now.getMinutes()};
  clStage="h";clCb=cb;
  $("#clNow").textContent=T("Τώρα");$("#clCancel").textContent=T("Άκυρο");$("#clOk").textContent=T("Εντάξει");
  $("#clockDlg").classList.add("open");clDraw();
}
function closeClock(){$("#clockDlg").classList.remove("open");clCb=null}
$("#clH").onclick=()=>{clStage="h";clDraw()};
$("#clM").onclick=()=>{clStage="m";clDraw()};
$("#clNow").onclick=()=>{const n=new Date();clV={h:n.getHours(),m:n.getMinutes()};clDraw()};
$("#clCancel").onclick=closeClock;
$("#clOk").onclick=()=>{const cb=clCb,val=pad(clV.h)+":"+pad(clV.m);closeClock();if(cb)cb(val)};
(()=>{const d=$("#clDial");let down=false;
  d.addEventListener("pointerdown",e=>{down=true;d.setPointerCapture(e.pointerId);clFromPoint(e)});
  d.addEventListener("pointermove",e=>{if(down)clFromPoint(e)});
  d.addEventListener("pointerup",e=>{down=false;if(clStage==="h"){clStage="m";clDraw()}});
})();
$("#clockDlg").addEventListener("click",e=>{if(e.target.id==="clockDlg")closeClock()});

function decorateTime(root){
  if(!root)return;
  root.querySelectorAll("input[type=datetime-local],input[type=date],input[type=time]").forEach(el=>{
    if(el.dataset.tf)return;
    if(el.closest(".dtrow")){el.dataset.tf="1";return}
    el.dataset.tf="1";
    const w=document.createElement("span");w.className="tf";el.parentNode.insertBefore(w,el);w.appendChild(el);
    const b=document.createElement("button");b.type="button";b.className="tfbtn";b.tabIndex=-1;
    b.setAttribute("aria-label",T("Άνοιγμα ημερολογίου"));b.innerHTML=ic("clock",22);
    b.onclick=()=>{
      if(el.type==="time"&&S.settings.clock!=="native"){
        openClock(el.value,v=>{el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))});
        return;
      }
      try{el.showPicker()}catch(e){el.focus()}
    };w.appendChild(b);
    if(el.type==="time"&&S.settings.clock!=="native"){
      el.readOnly=true;
      el.addEventListener("focus",ev=>{ev.target.blur();b.click()});
      el.addEventListener("click",()=>b.click());
    }
  });
}
function segBind(id,v){const el=$("#"+id);const set=x=>{el.dataset.v=x;el.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.v==x))};
  el.onclick=e=>{const b=e.target.closest("button");if(b){set(b.dataset.v);sheetDirty=true;if(el._on)el._on(b.dataset.v)}};set(v);el._set=set}

/* ---------- Επαφές τηλεφώνου ---------- */
const canContacts=()=>"contacts" in navigator&&"select" in navigator.contacts;
async function pickContacts(multiple){
  if(localFile()){toast(T("Οι επαφές δεν ανοίγουν όταν η εφαρμογή τρέχει ως αρχείο από τις Λήψεις. Ανέβασέ τη στο διαδίκτυο."));return null}
  if(!canContacts()){toast(inFrame()?T("Μέσα στην προεπισκόπηση οι επαφές δεν ανοίγουν. Άνοιξε την εφαρμογή από τη σελίδα της στο Chrome."):T("Οι επαφές ανοίγουν από το Chrome του κινητού, όταν η εφαρμογή είναι ανεβασμένη στο διαδίκτυο."));return null}
  const props=["name","tel","email"];
  try{const av=await navigator.contacts.getProperties();if(av.includes("address"))props.push("address")}catch(e){}
  toast(multiple?T("Διάλεξε επαφές και πάτα «Ολοκληρώθηκε» πάνω δεξιά."):T("Διάλεξε την επαφή και πάτα «Ολοκληρώθηκε» πάνω δεξιά."));
  try{const r=await navigator.contacts.select(props,{multiple});return r&&r.length?r:null}catch(e){toast(T("Δεν δόθηκε πρόσβαση στις επαφές."));return null}
}
const digits=s=>String(s||"").replace(/[^\d+]/g,"").replace(/^(\+|00)30/,"");
// «Λεωφόρος Κηφισίας 4» -> οδός + αριθμός· ο αριθμός είναι πάντα η τελευταία «λέξη» αν είναι αριθμός
function splitStreetNumber(street){
  const m=String(street||"").trim().match(/^(.*\S)[,]?\s+(\d{1,4}[Α-Ωα-ωA-Za-z]?)$/);
  return m?{street:m[1].trim(),number:m[2].trim()}:{street:String(street||"").trim(),number:""};
}
// «Αθήνα 115 26» ή «Αθήνα, 11526» -> περιοχή + ΤΚ (ελληνικός ΤΚ: 5 ψηφία, με ή χωρίς κενό στη μέση)
function splitAreaZip(text){
  const m=String(text||"").trim().match(/^(.*?)[,]?\s*(\d{3}\s?\d{2})\s*$/);
  return m?{area:m[1].trim(),zip:m[2].replace(/\s+/g,"")}:{area:String(text||"").trim(),zip:""};
}
function contactToClient(ct){
  const d={name:((ct.name||[])[0]||"").trim(),email:((ct.email||[])[0]||"").trim(),mobile:"",phone:""};
  (ct.tel||[]).forEach(p=>{const n=digits(p);if(!n)return;if(/^69/.test(n)){if(!d.mobile)d.mobile=p.trim()}else if(!d.phone)d.phone=p.trim()});
  const addrs=(ct.address||[]).map(a=>{
    const lines=(a.addressLine||[]).map(x=>String(x||"").trim()).filter(Boolean);
    const firstLine=lines[0]||"";
    let{street,number}=splitStreetNumber(firstLine);
    let area=(a.dependentLocality||a.city||a.region||"").trim();
    let zip=(a.postalCode||"").trim();
    if(!area&&!zip){
      // δεν υπήρχαν χωριστά πεδία από την επαφή· ψάξε περιοχή/ΤΚ στις υπόλοιπες γραμμές ή μετά το κόμμα της ίδιας γραμμής
      let rest=lines.length>1?lines.slice(1).join(" "):"";
      if(!rest&&firstLine.includes(",")){
        const parts=firstLine.split(",");
        rest=parts.slice(1).join(",").trim();
        if(rest){const sn=splitStreetNumber(parts[0]);street=sn.street;number=sn.number}
      }
      if(rest){const az=splitAreaZip(rest);area=az.area;zip=az.zip}
    }
    return{street,number,area,zip,label:(a.type||"").toString().trim()};
  }).filter(a=>a.street||a.area||a.zip);
  if(addrs[0]){d.street=addrs[0].street;d.number=addrs[0].number;d.area=addrs[0].area;d.zip=addrs[0].zip}
  d._extra=addrs.slice(1);
  return d;
}
// οι υπόλοιπες διευθύνσεις της επαφής γίνονται ξεχωριστές διευθύνσεις του πελάτη
function mergeExtraAddrs(c,extra){
  if(!extra||!extra.length)return 0;
  if(!Array.isArray(c.places))c.places=[];
  let n=0;
  extra.forEach((a,i)=>{
    const same=c.places.some(pl=>norm(pl.street)===norm(a.street)&&norm(pl.area)===norm(a.area));
    if(same)return;
    c.places.push({id:uid(),label:a.label||T("Διεύθυνση {n}",{n:c.places.length+2}),street:a.street,number:a.number||"",area:a.area,zip:a.zip,floor:"",lat:null,lng:null});
    n++;
  });
  return n;
}
async function importContacts(){
  const list=await pickContacts(true);if(!list)return;let added=0,skipped=0;
  list.forEach(ct=>{const d=contactToClient(ct);if(!d.name&&!d.mobile&&!d.phone)return;const tel=digits(d.mobile||d.phone);
    if(S.clients.some(c=>(tel&&(digits(c.mobile)===tel||digits(c.phone)===tel))||(d.name&&norm(c.name)===norm(d.name)))){skipped++;return}
    const extra=d._extra;delete d._extra;
    const nc=Object.assign({id:uid(),createdAt:Date.now(),company:"",street:"",number:"",area:"",zip:"",floor:"",hours:"",afm:"",notes:"",lat:null,lng:null,places:[]},d,{name:d.name||d.mobile||d.phone});
    mergeExtraAddrs(nc,extra);S.clients.push(nc);geocodeClientIfNeeded(nc,true);added++});
  save();toast(pl(added,"Προστέθηκε {n} πελάτης.","Προστέθηκαν {n} πελάτες.")+(skipped?" "+pl(skipped,"{n} υπήρχε ήδη.","{n} υπήρχαν ήδη."):""));
}
async function syncContact(id){
  const c=getClient(id);if(!c)return;const r=await pickContacts(false);if(!r)return;const d=contactToClient(r[0]);
  const L={name:"Όνομα",mobile:"Κινητό",phone:"Σταθερό",email:"Ηλεκτρονικό ταχυδρομείο",street:"Οδός",number:"Αριθμός",area:"Περιοχή",zip:"ΤΚ"};
  const ch=Object.keys(L).filter(k=>d[k]&&d[k]!==(c[k]||""));
  const extraNew=(d._extra||[]).filter(a=>!(c.places||[]).some(pl=>norm(pl.street)===norm(a.street)&&norm(pl.area)===norm(a.area)));
  if(!ch.length&&!extraNew.length){toast(T("Τα στοιχεία είναι ήδη ίδια με την επαφή."));return}
  const lines=ch.map(k=>`${T(L[k])}: ${c[k]||"—"} → ${d[k]}`)
    .concat(extraNew.map(a=>T("Νέα διεύθυνση")+": "+[a.street,a.area,a.zip].filter(Boolean).join(", ")));
  if(!confirm(T("Θα αλλάξουν:")+"\n"+lines.join("\n")+"\n\n"+T("Συνέχεια;")))return;
  ch.forEach(k=>c[k]=d[k]);
  if(ch.some(k=>["street","area","zip"].includes(k))){c.lat=null;c.lng=null}
  const extra=mergeExtraAddrs(c,d._extra);
  save();geocodeClientIfNeeded(c,true);
  toast(T("Ενημερώθηκαν {n} στοιχεία από την επαφή.",{n:ch.length})+(extra?" "+pl(extra,"Μπήκε {n} ακόμα διεύθυνση.","Μπήκαν {n} ακόμα διευθύνσεις."):""));
}

/* ---------- Φόρμα πελάτη ---------- */
function clientForm(c,opts={}){
  const isNew=!c;c=c||{};
  const f=(id,label,extra="")=>`<label for="f_${id}">${T(label)}</label><input id="f_${id}" value="${esc(c[id])}" ${extra}>`;
  openSheet({title:isNew?T("Νέος πελάτης"):T("Επεξεργασία πελάτη"),cancelLabel:opts.onCancel?T("Πίσω"):T("Άκυρο"),onCancel:opts.onCancel,
    saveLabel:isNew?T("Καταχώρηση"):T("Αποθήκευση"),saveStyle:isNew?"amber":"primary",
    body:`<button type="button" class="contactsbtn" id="fromContacts"><span class="cicon">${ic("book",19)}</span>${T("Συμπλήρωση από τις επαφές")}</button>
    <div class="hintbar" id="afterContacts" hidden>${ic("spark",18)}<span>${T("Έλεγξε τα στοιχεία και πάτα «Καταχώρηση» κάτω δεξιά για να αποθηκευτεί ο πελάτης.")}</span></div>`+
    f("name","Ονοματεπώνυμο",'autocomplete="off"')+f("company","Επωνυμία επιχείρησης")+
    `<div class="two"><div>${f("mobile","Κινητό",'type="tel"')}</div><div>${f("phone","Σταθερό",'type="tel"')}</div></div>`+
    f("email","Ηλεκτρονικό ταχυδρομείο",'type="email"')+
    `<div class="two"><div>${f("street","Οδός")}</div><div>${f("number","Αριθμός")}</div></div>
     <div class="two"><div>${f("area","Περιοχή",'list="areaList" autocomplete="off"')}</div><div>${f("zip","ΤΚ",'inputmode="numeric"')}</div></div>
     <label>${T("Θέση για τις διαδρομές")}</label>${lwHTML({showAddr:false})}`+
    f("floor","Όροφος, κουδούνι")+f("hours","Ωράριο ή πότε βρίσκεται",`placeholder="${T("π.χ. Δευτέρα έως Παρασκευή, 9:00 έως 17:00")}"`)+
    f("afm","ΑΦΜ",'inputmode="numeric"')+
    `<label>${T("Αξιολόγηση πελάτη")}</label><div class="panel"><div class="starwrap"><span class="lbl">${T("Πόσο καλός πελάτης")}</span><div id="f_stars">${starsHTML(c.rating,null,26)}</div></div></div>`+
    `<label for="f_notes">${T("Σημειώσεις")}</label><textarea id="f_notes" rows="4" placeholder="${T("Κωδικός εισόδου, στάθμευση, προτιμήσεις…")}">${esc(c.notes)}</textarea>`,
    onSave:()=>{
      const name=val("f_name");if(!name){toast(T("Γράψε όνομα πελάτη."));$("#f_name").focus();return false}
      const d={name,rating:formRating};["company","mobile","phone","email","street","number","area","zip","floor","hours","afm","notes"].forEach(k=>d[k]=val("f_"+k));
      d.lat=LW.loc?LW.loc.lat:null;d.lng=LW.loc?LW.loc.lng:null;
      if(!LW.loc&&!findArea(d.area)){LW.attempted=true;LW.upd()}
      if(!LW.loc&&!findArea(d.area)&&!confirm(T("Ο πελάτης δεν έχει τοποθεσία και οι δουλειές του δεν θα μπαίνουν στις διαδρομές. Να αποθηκευτεί έτσι;")))return false;
      if(isNew){d.id=uid();d.createdAt=Date.now();d.places=[];S.clients.push(d);geocodeClientIfNeeded(d,true);toast(T("Ο πελάτης προστέθηκε."));
        if(opts.onDone){persist();render();opts.onDone(d);return"replaced"}clientId=d.id;view="client"}
      else{const had=!!clientLoc(c);Object.assign(c,d);
        const n=S.tasks.filter(x=>x.clientId===c.id&&isOpen(x)).length;
        toast(!had&&clientLoc(c)&&n?pl(n,"Η τοποθεσία μπήκε και σε {n} ανοιχτή εργασία του.","Η τοποθεσία μπήκε και στις {n} ανοιχτές εργασίες του."):T("Οι αλλαγές αποθηκεύτηκαν."));
        geocodeClientIfNeeded(c,true);
        if(opts.onDone){persist();render();opts.onDone(c);return"replaced"}}
      save();
    },
    onDelete:isNew?null:()=>{view="clients";trashClient(c)},
    deleteMsg:T("Να πάει ο πελάτης στον κάδο; Οι εργασίες του μένουν και επιστρέφουν μαζί του.")});
  formRating=+c.rating||0;bindStars($("#f_stars").firstElementChild,()=>formRating,v=>{formRating=v;sheetDirty=true});
  lwBind({loc:c.lat!=null?{lat:c.lat,lng:c.lng}:null,addr:()=>[[val("f_street"),val("f_number")].filter(Boolean).join(" "),val("f_area"),val("f_zip")].filter(Boolean).join(", "),area:()=>val("f_area")});
  const splitFromStreet=()=>{const v=val("f_street");if(!/[,]|\d{3}\s?\d{2}/.test(v))return;
    const d=splitAddress(v);if(!d)return;
    if(d.street)$("#f_street").value=d.street;
    if(d.area&&!val("f_area"))$("#f_area").value=d.area;
    if(d.zip&&!val("f_zip"))$("#f_zip").value=d.zip;
    sheetDirty=true;LW.upd();toast(T("Η διεύθυνση χωρίστηκε σε οδό, περιοχή και ΤΚ."))};
  $("#f_street").addEventListener("paste",()=>setTimeout(splitFromStreet,60));
  $("#f_street").addEventListener("blur",splitFromStreet);
  $("#fromContacts").onclick=async()=>{
    const r=await pickContacts(false);if(!r)return;const d=contactToClient(r[0]);
    if(!isNew&&d._extra&&d._extra.length){const n=mergeExtraAddrs(c,d._extra);if(n){persist();toast(pl(n,"Μπήκε {n} ακόμα διεύθυνση.","Μπήκαν {n} ακόμα διευθύνσεις."))}}
    Object.entries(d).forEach(([k,v])=>{if(k!=="_extra"&&v&&$("#f_"+k))$("#f_"+k).value=v});
    sheetDirty=true;LW.upd();$("#afterContacts").hidden=false;$("#sSave").classList.add("pulse");
    toast(T("Τα στοιχεία συμπληρώθηκαν. Έλεγξέ τα και πάτα «Καταχώρηση» κάτω δεξιά."));
  };
}


// Μικρό αναδυόμενο παράθυρο επιλογής, πάνω από το ανοιχτό φύλλο (δεν το κλείνει).
function choicePopup(title,opts,cur,cb){
  const old=$("#choicePop");if(old)old.remove();
  const d=document.createElement("div");d.id="choicePop";d.className="choicepop";
  d.innerHTML=`<div class="choicebox zm" role="dialog" aria-modal="true"><div class="al-title" style="margin-bottom:8px">${esc(title)}</div>
    ${opts.map(o=>`<button type="button" class="optrow ${o.v===cur?"on":""}" data-v="${esc(o.v)}"><span class="grow"><b>${esc(o.label)}</b>${o.sub?`<small style="display:block;font-weight:500;color:var(--muted);font-size:12.5px">${esc(o.sub)}</small>`:""}</span>${o.v===cur?'<span class="tick">✓</span>':""}</button>`).join("")}
    <button type="button" class="btn ghost wide" data-x="1" style="margin-top:10px">${T("Άκυρο")}</button></div>`;
  document.body.appendChild(d);
  d.onclick=e=>{const b=e.target.closest("[data-v]");
    if(b){d.remove();cb(b.dataset.v);return}
    if(e.target===d||e.target.closest("[data-x]"))d.remove()};
}
