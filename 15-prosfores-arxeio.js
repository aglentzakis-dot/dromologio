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

// Σύντομη περιγραφή της κατάστασης μιας προσφοράς.
function offerStateText(r){
  const o=r.o,x=r.x,bits=[];
  if(o.sentAt)bits.push(T("Στάλθηκε {d}",{d:new Date(o.sentAt).toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"})}));
  else bits.push(T("Πρόχειρη, δεν στάλθηκε"));
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
function offerArchiveSheet(cid){
  const c=cid&&getClient(cid);
  const base=allOffers().filter(r=>!cid||r.x.clientId===cid);
  const draw=()=>{
    const q=norm(offerArchQ);
    const list=base.filter(r=>!q||norm([r.o.no,r.o.title,r.x.title,offerClientName(r),r.o.addr].join(" ")).includes(q));
    const box=$("#oa_list");if(!box)return;
    box.innerHTML=list.length?panel(list.map(r=>offerRowHTML(r,!cid)).join("")):
      panel(`<div class="empty">${base.length?T("Καμία προσφορά δεν ταιριάζει στην αναζήτηση."):T("Δεν υπάρχουν ακόμα προσφορές.")}</div>`);
    const n=$("#oa_n");if(n)n.textContent=list.length;
  };
  const sent=base.filter(r=>r.o.sentAt),total=sent.filter(r=>!r.old).reduce((s,r)=>s+offerAmt(r.o),0);
  openSheet({title:c?T("Προσφορές στον {c}",{c:c.name}):T("Αρχείο προσφορών"),cancelLabel:T("Κλείσιμο"),
    body:`<p class="note">${T("Όλες οι προσφορές που έχεις φτιάξει, και οι παλιότερες εκδόσεις τους. Πάτα μία για να τη δεις, να τη στείλεις ξανά ή να την κατεβάσεις.")}</p>
      ${panel(`<div class="kv"><span>${T("Προσφορές")}</span><b id="oa_n">${base.length}</b></div>
        <div class="kv"><span>${T("Σταλμένες")}</span><b>${sent.length}</b></div>
        <div class="kv"><span>${T("Αξία σταλμένων (τωρινές εκδόσεις)")}</span><b class="money">${money(total)}</b></div>`)}
      <input class="search" id="oa_q" type="search" placeholder="${T("Αναζήτηση: αριθμός, πελάτης, εργασία")}" value="${esc(offerArchQ)}" style="margin:12px 0 10px">
      <div id="oa_list"></div>`});
  draw();
  $("#oa_q").oninput=e=>{offerArchQ=e.target.value;draw()};
  $("#shBody").addEventListener("click",e=>{
    const r=e.target.closest("[data-coffer]");if(!r)return;
    const f=offerById(r.dataset.coffer);if(!f)return;
    // Πρόχειρη τωρινή προσφορά: ανοίγει για συμπλήρωση· όλες οι άλλες ανοίγουν για προβολή/αποστολή.
    if(!f.old&&!f.o.sentAt&&!f.x.trashed)offerSheet(f.x,()=>offerArchiveSheet(cid));
    else showOffer(f.x,f.o);
  });
}
const offersCount=cid=>allOffers().filter(r=>!cid||r.x.clientId===cid).length;
