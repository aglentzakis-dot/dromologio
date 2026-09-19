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
// Διαγραφή προσφοράς (μετά από επιβεβαίωση). Αν σβηστεί η τωρινή, τη θέση της παίρνει η πιο πρόσφατη παλιότερη·
// αν δεν υπάρχει άλλη, η εργασία μένει χωρίς προσφορά (φεύγει και η γραμμή «Προσφορά Αρ. …» από την εργασία).
function deleteOffer(x,o,ask=true){
  if(ask&&!confirm(T("Να σβηστεί οριστικά η προσφορά Αρ. {n} ({t});",{n:o.no,t:o.title||x.title||""})))return false;
  if(o===x.offer){
    if(Array.isArray(x.offers)&&x.offers.length)x.offer=x.offers.pop();
    else{delete x.offer;delete x.offerNo}
  }else if(Array.isArray(x.offers)){const i=x.offers.indexOf(o);if(i>=0)x.offers.splice(i,1)}
  persist();toast(T("Η προσφορά Αρ. {n} σβήστηκε.",{n:o.no}));
  return true;
}
function offerRowHTML(r,showClient=true,canDel=false){
  return `<div class="row" data-coffer="${esc(offerKey(r))}" style="align-items:center">
    <div class="avatar" style="font-size:13px">${esc(String(r.o.no))}</div>
    <div class="grow"><div class="title">${esc(r.o.title||r.x.title||T("Προσφορά"))}</div>
      <div class="meta">${showClient?`<span>${esc(offerClientName(r))}</span>`:""}<span>${offerStateText(r)}</span></div></div>
    <b class="amt">${money(offerAmt(r.o))}</b>${canDel?`<button type="button" class="x bin" data-odel="${esc(offerKey(r))}" aria-label="${T("Διαγραφή")}" style="margin-left:6px">${ic("trash",17)}</button>`:""}</div>`;
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
    box.innerHTML=list.length?panel(list.map(r=>offerRowHTML(r,!cid,true)).join("")):
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
    const del=e.target.closest("[data-odel]");
    if(del){e.stopPropagation();const f=offerById(del.dataset.odel);if(f&&deleteOffer(f.x,f.o)){render();offerArchiveSheet(cid,back,taskId)}return}
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
   Δύο είδη: το ΑΠΟΘΗΚΕΥΜΕΝΟ (για όλες τις προσφορές, όλων των πελατών) και, αν θέλεις,
   ένα ξεχωριστό μόνο για μία προσφορά. Μια προσφορά μπορεί επίσης να βγει χωρίς φόντο.
   Οι εικόνες αποθηκεύονται χωριστά από τα υπόλοιπα δεδομένα (κλειδιά stodromo-wm…), ώστε
   να μη μεγαλώνουν τα αντίγραφα ασφαλείας που στέλνονται με ταχυδρομείο. */
const WM_KEY="stodromo-wm";
const wmStore={},wmImgs={};
const wmKeyOf=o=>o&&o.wmKey?WM_KEY+"-"+o.wmKey:WM_KEY;
function wmEntry(key){
  if(wmStore[key])return wmStore[key];
  let e=null;try{e=JSON.parse(localStorage.getItem(key)||"null")}catch(x){}
  if(!e||typeof e!=="object")e={img:"",op:0.15};
  if(!(e.op>=0.02&&e.op<=1))e.op=0.15;
  return wmStore[key]=e;
}
function wmSaveEntry(key){try{localStorage.setItem(key,JSON.stringify(wmEntry(key)));return true}
  catch(e){toast(T("Η εικόνα είναι πολύ μεγάλη για να αποθηκευτεί. Δοκίμασε μικρότερη."));return false}}
// Ποια εικόνα ισχύει για μια προσφορά (ή καμία).
function wmFor(o){
  if(o&&o.noWm)return null;
  if(o&&o.wmKey){const e=wmEntry(wmKeyOf(o));if(e.img)return{key:wmKeyOf(o),e}}
  const g=wmEntry(WM_KEY);return g.img?{key:WM_KEY,e:g}:null;
}
const wmOn=o=>!!wmFor(o);
// Φορτώνει την εικόνα· η προσφορά περιμένει να είναι έτοιμη πριν σχεδιαστεί.
function wmReady(o){
  const w=wmFor(o);if(!w)return Promise.resolve(null);
  const have=wmImgs[w.key];
  if(have&&have._src===w.e.img&&have.complete)return Promise.resolve(have);
  return new Promise(res=>{const im=new Image();im._src=w.e.img;
    im.onload=()=>{wmImgs[w.key]=im;res(im)};im.onerror=()=>res(null);im.src=w.e.img});
}
function wmDraw(ctx,W,H,o){
  const w=wmFor(o);if(!w)return;const im=wmImgs[w.key];
  if(!im||im._src!==w.e.img||!im.complete)return;
  ctx.save();ctx.globalAlpha=w.e.op;ctx.drawImage(im,0,0,W,H);ctx.restore();
}
let wmCur=null; // η προσφορά που είναι ανοιχτή στη φόρμα
function wmPanelHTML(o){
  wmCur=o||null;
  const own=o&&o.wmKey&&wmEntry(wmKeyOf(o)).img,g=wmEntry(WM_KEY),w=wmFor(o)||(own?{key:wmKeyOf(o),e:wmEntry(wmKeyOf(o))}:g.img?{key:WM_KEY,e:g}:null);
  const pc=w?Math.round(w.e.op*100):15;
  const which=own?`<b style="color:var(--loc)">${T("Ξεχωριστό φόντο μόνο για αυτή την προσφορά.")}</b>`:g.img?`<b style="color:var(--green)">✓ ${T("Αποθηκευμένο φόντο: μπαίνει σε όλες τις προσφορές, σε όλους τους πελάτες.")}</b>`:"";
  return `<div class="ofgroup" id="wm_box">
    <div class="ofhead">${T("Φόντο σελίδας (υδατογράφημα)")}<small>${T("μια εικόνα Α4, π.χ. επιστολόχαρτο ή λογότυπο, που μπαίνει αχνά πίσω από την προσφορά")}</small></div>
    ${w?`<p class="note" style="margin:0 0 8px">${which}</p>
      <div class="wmrow"><img class="wmthumb" src="${w.e.img}" alt="" style="opacity:${o&&o.noWm?.12:Math.max(.25,w.e.op)}">
        <div class="grow"><label for="wm_op" style="margin-top:0">${T("Διαφάνεια")}: <b id="wm_opv">${pc}%</b></label>
        <input type="range" id="wm_op" min="3" max="60" step="1" value="${pc}" style="width:100%" ${o&&o.noWm?"disabled":""}>
        <small class="note">${T("Μικρότερο ποσοστό = πιο αχνό. Πάτα «Δες την προσφορά» για να δεις το αποτέλεσμα.")}</small></div></div>
      ${o?`<label class="toggle" style="margin-top:10px"><input type="checkbox" id="wm_none" ${o.noWm?"checked":""}> ${T("Χωρίς φόντο σε αυτή την προσφορά")}</label>`:""}
      ${own?`<button type="button" class="btn ghost wide" id="wm_mkall" style="margin-top:8px">✓ ${T("Αποθήκευσέ το για όλες τις μελλοντικές προσφορές")}</button>`:""}
      <div class="twobtn" style="padding:0;margin-top:8px"><button type="button" class="btn ghost" id="wm_pick">${T("Άλλαξε εικόνα")}</button>
        <button type="button" class="btn ghost" id="wm_del">${T("Αφαίρεση")}</button></div>`
    :`<button type="button" class="btn ghost wide" id="wm_pick">${ic("plus",18)} ${T("Ανέβασε εικόνα φόντου")}</button>`}
    <input type="file" id="wm_file" accept="image/*" hidden></div>`;
}
function wmRefresh(){const b=$("#wm_box");if(b)b.outerHTML=wmPanelHTML(wmCur)}
// Μικραίνει την εικόνα (έως 1240 εικονοστοιχεία στη μεγάλη πλευρά) για να χωράει στη μνήμη του κινητού,
// και ρωτά αν θα αποθηκευτεί για όλες τις προσφορές ή μόνο για αυτή.
function wmFromFile(file){
  const rd=new FileReader();
  rd.onload=()=>{const im=new Image();
    im.onload=()=>{
      const k=Math.min(1,1240/Math.max(im.width,im.height)),cv=document.createElement("canvas");
      cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);
      cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
      let url=cv.toDataURL("image/webp",0.85);
      if(!/^data:image\/webp/.test(url))url=/png/i.test(file.type)?cv.toDataURL("image/png"):cv.toDataURL("image/jpeg",0.85);
      const o=wmCur;
      const forAll=!o||confirm(T("Να αποθηκευτεί αυτό το φόντο για ΟΛΕΣ τις μελλοντικές προσφορές, σε όλους τους πελάτες;\n\nΟΚ = για όλες τις προσφορές\nΆκυρο = μόνο για αυτή την προσφορά"));
      let key;
      if(forAll){key=WM_KEY;if(o){if(o.wmKey){try{localStorage.removeItem(wmKeyOf(o))}catch(e){}delete o.wmKey}delete o.noWm}}
      else{if(!o.wmKey)o.wmKey=uid();key=wmKeyOf(o);delete o.noWm}
      const e=wmEntry(key),prev=e.img;e.img=url;
      if(!wmSaveEntry(key)){e.img=prev;return}
      if(o)persist();
      wmReady(o).then(wmRefresh);
      toast(forAll?T("Το φόντο αποθηκεύτηκε και θα μπαίνει σε όλες τις προσφορές."):T("Το φόντο μπήκε μόνο σε αυτή την προσφορά."));
    };
    im.onerror=()=>toast(T("Η εικόνα δεν διαβάστηκε."));
    im.src=rd.result;};
  rd.readAsDataURL(file);
}
document.addEventListener("click",e=>{
  if(e.target.closest("#wm_pick")){$("#wm_file").click();return}
  const o=wmCur;
  if(e.target.closest("#wm_mkall")&&o&&o.wmKey){
    const mine=wmEntry(wmKeyOf(o)),g=wmEntry(WM_KEY);
    if(g.img&&!confirm(T("Θα αντικαταστήσει το φόντο που έχεις αποθηκευμένο για όλες τις προσφορές. Συνέχεια;")))return;
    g.img=mine.img;g.op=mine.op;if(!wmSaveEntry(WM_KEY))return;
    try{localStorage.removeItem(wmKeyOf(o))}catch(x){}delete wmStore[wmKeyOf(o)];delete o.wmKey;persist();
    wmReady(o).then(wmRefresh);toast(T("Το φόντο αποθηκεύτηκε και θα μπαίνει σε όλες τις προσφορές."));return}
  if(e.target.closest("#wm_del")){
    const own=o&&o.wmKey;
    if(!confirm(own?T("Να αφαιρεθεί το ξεχωριστό φόντο αυτής της προσφοράς;"):T("Να αφαιρεθεί το αποθηκευμένο φόντο από όλες τις προσφορές;")))return;
    if(own){try{localStorage.removeItem(wmKeyOf(o))}catch(x){}delete wmStore[wmKeyOf(o)];delete o.wmKey;persist()}
    else{const g=wmEntry(WM_KEY);g.img="";wmSaveEntry(WM_KEY)}
    wmRefresh();toast(T("Το φόντο αφαιρέθηκε."))}
});
document.addEventListener("change",e=>{
  if(e.target.id==="wm_file"&&e.target.files&&e.target.files[0]){wmFromFile(e.target.files[0]);return}
  if(e.target.id==="wm_none"&&wmCur){if(e.target.checked)wmCur.noWm=true;else delete wmCur.noWm;persist();wmRefresh()}
});
document.addEventListener("input",e=>{if(e.target.id!=="wm_op")return;
  const w=wmFor(wmCur);if(!w)return;
  w.e.op=Math.max(.03,Math.min(.6,(+e.target.value||15)/100));wmSaveEntry(w.key);
  const v=$("#wm_opv");if(v)v.textContent=Math.round(w.e.op*100)+"%";
  const th=document.querySelector(".wmthumb");if(th)th.style.opacity=Math.max(.25,w.e.op)});
