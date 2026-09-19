/* Δρομολόγιο — Αρχείο προσφορών: όλες οι προσφορές (τωρινές και παλιότερες εκδόσεις) από όλες τις εργασίες,
   με αναζήτηση, και οι προσφορές ανά πελάτη. Τίποτα δεν αντιγράφεται: διαβάζει ό,τι υπάρχει ήδη μέσα στις εργασίες
   (x.offer = η τωρινή, x.offers = οι παλιότερες που αντικαταστάθηκαν). */

// Όλες οι προσφορές με αριθμό, η νεότερη πρώτη.
function allOffers(){
  const out=[];
  S.tasks.forEach(x=>{
    (x.offers||[]).forEach(o=>{if(o&&o.no)out.push({x,o,old:true})});
    if(x.offer&&x.offer.no)out.push({x,o:x.offer,old:false});
  });
  const when=r=>r.o.sentAt||r.o.date||0;
  return out.sort((a,b)=>when(b)-when(a)||(+b.o.no||0)-(+a.o.no||0));
}
const offerKey=r=>r.x.id+":"+r.o.no;
function offerById(k){return allOffers().find(r=>offerKey(r)===k)||null}
const offerClientName=r=>{const c=r.x.clientId&&getClient(r.x.clientId);return c?c.name:(r.o.client||T("Ιδιώτης πελάτης"))};

// Τι έγινε με το έγγραφο: προωθήθηκε (κοινοποίηση ή σημείωση), μόνο αποθηκεύτηκε, ή είναι πρόχειρη.
function offerSendText(o,long){
  const f=t=>{const d=new Date(t);return d.toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"})+(long?", "+d.toLocaleTimeString(LOC(),{hour:"2-digit",minute:"2-digit"}):"")};
  if(o.sharedAt)return o.sharedManual?T("Δόθηκε στον πελάτη {d}",{d:f(o.sharedAt)}):T("Προωθήθηκε ως συνημμένο {d}",{d:f(o.sharedAt)});
  if(o.savedAt)return T("Μόνο αποθήκευση PDF {d} · δεν προωθήθηκε",{d:f(o.savedAt)});
  if(o.sentAt)return T("Κλείδωσε {d} · δεν ξέρουμε αν προωθήθηκε",{d:f(o.sentAt)});
  return T("Πρόχειρη, δεν έχει βγει PDF");
}
// Σύντομη περιγραφή της κατάστασης μιας προσφοράς.
function offerStateText(r){
  const o=r.o,x=r.x,bits=[];
  bits.push(offerSendText(o));
  if(r.old)bits.push(T("παλιότερη έκδοση"));
  else if(x.trashed)bits.push(T("η εργασία είναι στον κάδο"));
  else if(x.status==="waiting"){if(o.sentAt&&offerUntil(o)<new Date())bits.push(T("έληξε"));else bits.push(T("περιμένει απάντηση"))}
  else if(x.status==="cancelled")bits.push(T("Ακυρώθηκε"));
  else bits.push(T("εγκρίθηκε"));
  return bits.join(" · ");
}
function offerRowHTML(r,showClient=true){
  return `<div class="row" data-coffer="${esc(offerKey(r))}" style="align-items:center">
    <div class="avatar" style="font-size:13px">${esc(String(r.o.no))}</div>
    <div class="grow"><div class="title">${esc(r.o.title||r.x.title||T("Προσφορά"))}</div>
      <div class="meta">${showClient?`<span>${esc(offerClientName(r))}</span>`:""}<span>${offerStateText(r)}</span></div></div>
    <b class="amt">${money(offerAmt(r.o))}</b></div>`;
}

// Μέσα στη φόρμα προσφοράς: οι προσφορές από ΑΛΛΕΣ εργασίες του ίδιου πελάτη.
function clientOffersHTML(x){
  if(!x||!x.clientId)return "";
  const list=allOffers().filter(r=>r.x.clientId===x.clientId&&r.x.id!==x.id);
  if(!list.length)return "";
  const c=getClient(x.clientId);
  return sec(T("Άλλες προσφορές στον {c}",{c:esc(c?c.name:"")}))+panel(list.slice(0,15).map(r=>offerRowHTML(r,false)).join(""))+
    `<p class="note" style="margin-top:6px">${T("Πάτα μια προσφορά για να τη δεις ή να τη στείλεις ξανά.")}</p>`;
}

// Το αρχείο προσφορών (όλων ή ενός πελάτη).
let offerArchQ="";
function offerArchiveSheet(cid,back,taskId){
  const c=cid&&getClient(cid);
  const base=allOffers().filter(r=>(!cid||r.x.clientId===cid)&&(!taskId||r.x.id===taskId));
  const draw=()=>{
    const q=norm(offerArchQ);
    const list=base.filter(r=>!q||norm([r.o.no,r.o.title,r.x.title,offerClientName(r),r.o.addr].join(" ")).includes(q));
    const box=$("#oa_list");if(!box)return;
    box.innerHTML=list.length?panel(list.map(r=>offerRowHTML(r,!cid)).join("")):
      panel(`<div class="empty">${base.length?T("Καμία προσφορά δεν ταιριάζει στην αναζήτηση."):T("Δεν υπάρχουν ακόμα προσφορές.")}</div>`);
    const n=$("#oa_n");if(n)n.textContent=list.length;
  };
  const sent=base.filter(r=>r.o.sharedAt),total=base.filter(r=>r.o.sentAt&&!r.old).reduce((s,r)=>s+offerAmt(r.o),0);
  openSheet({title:c?T("Προσφορές στον {c}",{c:c.name}):T("Αρχείο προσφορών"),cancelLabel:back?T("Πίσω"):T("Κλείσιμο"),onCancel:back||null,
    body:`<p class="note">${T("Όλες οι προσφορές που έχεις φτιάξει, και οι παλιότερες εκδόσεις τους. Πάτα μία για να τη δεις, να τη στείλεις ξανά ή να την κατεβάσεις.")}</p>
      ${panel(`<div class="kv"><span>${T("Προσφορές")}</span><b id="oa_n">${base.length}</b></div>
        <div class="kv"><span>${T("Προωθήθηκαν στον πελάτη")}</span><b>${sent.length}</b></div>
        <div class="kv"><span>${T("Αξία κλειδωμένων (τωρινές εκδόσεις)")}</span><b class="money">${money(total)}</b></div>`)}
      <input class="search" id="oa_q" type="search" placeholder="${T("Αναζήτηση: αριθμός, πελάτης, εργασία")}" value="${esc(offerArchQ)}" style="margin:12px 0 10px">
      <div id="oa_list"></div>`});
  draw();
  $("#oa_q").oninput=e=>{offerArchQ=e.target.value;draw()};
  $("#shBody").addEventListener("click",e=>{
    const r=e.target.closest("[data-coffer]");if(!r)return;
    const f=offerById(r.dataset.coffer);if(!f)return;
    // Πρόχειρη τωρινή προσφορά: ανοίγει για συμπλήρωση· όλες οι άλλες ανοίγουν για προβολή/αποστολή.
    if(!f.old&&!f.o.sentAt&&!f.x.trashed)offerSheet(f.x,()=>offerArchiveSheet(cid,back,taskId));
    else showOffer(f.x,f.o);
  });
}
// Για το κουμπί «Παλιές προσφορές» μέσα στην εργασία: όλες του πελάτη, ή αν δεν έχει πελάτη, όσες έχει η ίδια η εργασία.
const oldOffersCount=x=>x.clientId?offersCount(x.clientId):(x.offers||[]).length+(x.offer&&x.offer.no?1:0);
const offersCount=cid=>allOffers().filter(r=>!cid||r.x.clientId===cid).length;

/* ---------- Υδατογράφημα (φόντο σελίδας Α4 πίσω από την προσφορά) ----------
   Αποθηκεύεται χωριστά από τα υπόλοιπα δεδομένα (κλειδί stodromo-wm), ώστε η εικόνα να μη
   μεγαλώνει τα αντίγραφα ασφαλείας που στέλνονται με ταχυδρομείο. */
const WM_KEY="stodromo-wm";
let wmCache=null,wmImg=null,wmLoading=null;
function wmGet(){
  if(wmCache)return wmCache;
  try{wmCache=JSON.parse(localStorage.getItem(WM_KEY)||"null")}catch(e){wmCache=null}
  if(!wmCache||typeof wmCache!=="object")wmCache={img:"",op:0.15};
  if(!(wmCache.op>=0.02&&wmCache.op<=1))wmCache.op=0.15;
  return wmCache;
}
function wmSave(){try{localStorage.setItem(WM_KEY,JSON.stringify(wmGet()));return true}
  catch(e){toast(T("Η εικόνα είναι πολύ μεγάλη για να αποθηκευτεί. Δοκίμασε μικρότερη."));return false}}
// Φορτώνει την εικόνα μία φορά· η προσφορά περιμένει να είναι έτοιμη πριν σχεδιαστεί.
function wmReady(){
  const w=wmGet();
  if(!w.img){wmImg=null;return Promise.resolve(null)}
  if(wmImg&&wmImg._src===w.img&&wmImg.complete)return Promise.resolve(wmImg);
  if(wmLoading&&wmLoading._src===w.img)return wmLoading;
  const im=new Image();im._src=w.img;
  wmLoading=new Promise(res=>{im.onload=()=>{wmImg=im;res(im)};im.onerror=()=>{wmImg=null;res(null)}});
  wmLoading._src=w.img;im.src=w.img;return wmLoading;
}
// Σχεδιάζει το φόντο σε όλη τη σελίδα, με τη διαφάνεια που έχεις ορίσει.
function wmDraw(ctx,W,H){
  const w=wmGet();if(!w.img||!wmImg||wmImg._src!==w.img||!wmImg.complete)return;
  ctx.save();ctx.globalAlpha=w.op;ctx.drawImage(wmImg,0,0,W,H);ctx.restore();
}
const wmOn=()=>!!wmGet().img;
function wmPanelHTML(){
  const w=wmGet(),pc=Math.round(w.op*100);
  return `<div class="ofgroup" id="wm_box">
    <div class="ofhead">${T("Φόντο σελίδας (υδατογράφημα)")}<small>${T("μια εικόνα Α4, π.χ. επιστολόχαρτο ή λογότυπο, που μπαίνει αχνά πίσω από την προσφορά")}</small></div>
    ${w.img?`<div class="wmrow"><img class="wmthumb" src="${w.img}" alt="" style="opacity:${Math.max(.25,w.op)}">
        <div class="grow"><label for="wm_op" style="margin-top:0">${T("Διαφάνεια")}: <b id="wm_opv">${pc}%</b></label>
        <input type="range" id="wm_op" min="3" max="60" step="1" value="${pc}" style="width:100%">
        <small class="note">${T("Μικρότερο ποσοστό = πιο αχνό. Πάτα «Δες την προσφορά» για να δεις το αποτέλεσμα.")}</small></div></div>
      <div class="twobtn" style="padding:0;margin-top:8px"><button type="button" class="btn ghost" id="wm_pick">${T("Άλλαξε εικόνα")}</button>
        <button type="button" class="btn ghost" id="wm_del">${T("Αφαίρεση")}</button></div>`
    :`<button type="button" class="btn ghost wide" id="wm_pick">${ic("plus",18)} ${T("Ανέβασε εικόνα φόντου")}</button>`}
    <input type="file" id="wm_file" accept="image/*" hidden></div>`;
}
function wmRefresh(){const b=$("#wm_box");if(b)b.outerHTML=wmPanelHTML()}
// Μικραίνει την εικόνα (έως 1240 εικονοστοιχεία στη μεγάλη πλευρά) για να χωράει στη μνήμη του κινητού.
function wmFromFile(file){
  const rd=new FileReader();
  rd.onload=()=>{const im=new Image();
    im.onload=()=>{
      const k=Math.min(1,1240/Math.max(im.width,im.height)),cv=document.createElement("canvas");
      cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);
      cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
      let url=cv.toDataURL("image/webp",0.85);
      if(!/^data:image\/webp/.test(url))url=/png/i.test(file.type)?cv.toDataURL("image/png"):cv.toDataURL("image/jpeg",0.85);
      const w=wmGet(),prev=w.img;w.img=url;
      if(!wmSave()){w.img=prev;return}
      wmReady().then(wmRefresh);toast(T("Το φόντο αποθηκεύτηκε. Θα μπαίνει σε κάθε προσφορά."));
    };
    im.onerror=()=>toast(T("Η εικόνα δεν διαβάστηκε."));
    im.src=rd.result;};
  rd.readAsDataURL(file);
}
document.addEventListener("click",e=>{
  if(e.target.closest("#wm_pick")){$("#wm_file").click();return}
  if(e.target.closest("#wm_del")){if(!confirm(T("Να αφαιρεθεί το φόντο από τις προσφορές;")))return;
    const w=wmGet();w.img="";wmSave();wmImg=null;wmRefresh();toast(T("Το φόντο αφαιρέθηκε."))}
});
document.addEventListener("change",e=>{if(e.target.id==="wm_file"&&e.target.files&&e.target.files[0])wmFromFile(e.target.files[0])});
document.addEventListener("input",e=>{if(e.target.id!=="wm_op")return;
  const w=wmGet();w.op=Math.max(.03,Math.min(.6,(+e.target.value||15)/100));wmSave();
  const v=$("#wm_opv");if(v)v.textContent=Math.round(w.op*100)+"%";
  const th=document.querySelector(".wmthumb");if(th)th.style.opacity=Math.max(.25,w.op)});
