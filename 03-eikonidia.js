/* Δρομολόγιο — Εικονίδια. */
/* ---------- Εικονίδια ---------- */
const ICONS={
done:'<path d="M20 6L9 17l-5-5"/>',
today:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
bars:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
clients:'<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M16 4a4 4 0 010 8M22 21c0-3-2-5-4-5.5"/>',
tasks:'<path d="M10 6h11M10 12h11M10 18h11M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
route:'<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 000-7H8a3.5 3.5 0 010-7h7.5"/>',
bell:'<path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0"/>',
gear:'<path d="M10.3 2.6h3.4l.4 2.3 2 .8 1.9-1.3 2.4 2.4-1.3 1.9.8 2 2.3.4v3.4l-2.3.4-.8 2 1.3 1.9-2.4 2.4-1.9-1.3-2 .8-.4 2.3h-3.4l-.4-2.3-2-.8-1.9 1.3-2.4-2.4 1.3-1.9-.8-2-2.3-.4v-3.4l2.3-.4.8-2L3.5 6.8l2.4-2.4 1.9 1.3 2-.8z"/><circle cx="12" cy="12" r="3"/>',
money:'<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="2.8"/><path d="M6 6V4.5h12M5 10.5h.01M19 14.5h.01"/>',
filter:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
shield:'<path d="M12 2.5l8 3.2v5.6c0 4.6-3.2 8.6-8 10.2-4.8-1.6-8-5.6-8-10.2V5.7z"/><path d="M8.6 12.2l2.4 2.4 4.4-4.6"/>',
person:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5"/>',
near:'<circle cx="12" cy="12" r="2.6"/><path d="M7.8 7.8a6 6 0 000 8.4M16.2 16.2a6 6 0 000-8.4M4.6 4.6a10.5 10.5 0 000 14.8M19.4 19.4a10.5 10.5 0 000-14.8"/>',
bolt:'<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
hourglass:'<path d="M7 3h10M7 21h10M8 3c0 4 4 5 4 7s-4 3-4 7M16 3c0 4-4 5-4 7s4 3 4 7"/>',
ask:'<path d="M20.5 14.5a2 2 0 01-2 2H8l-4 3.5V5a2 2 0 012-2h12.5a2 2 0 012 2z"/><path d="M9.7 8.2a2.4 2.4 0 014.6.9c0 1.6-2.3 1.9-2.3 3.4M12 14.6h.01"/>',
shareios:'<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>',
measure:'<rect x="3" y="4" width="18" height="7" rx="1.6"/><path d="M6.5 4v2.8M10 4v2.8M13.5 4v2.8M17 4v2.8"/><rect x="4" y="14.5" width="13" height="6.5" rx="1.8"/><circle cx="10.5" cy="17.8" r="2.1"/><path d="M8.5 14.5l1-1.6h2l1 1.6"/>',
sound:'<path d="M11 5L6.5 9H3v6h3.5L11 19z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/>',
phone:'<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/>',
msg:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
pin:'<path d="M12 22s7-6.5 7-12a7 7 0 00-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
book:'<path d="M5 3h13a1 1 0 011 1v16a1 1 0 01-1 1H5z"/><circle cx="12" cy="10" r="2.6"/><path d="M8 16.5c.7-1.6 2.2-2.5 4-2.5s3.3.9 4 2.5M3 7h3M3 12h3M3 17h3"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5.4l3.4 2"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
spark:'<path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.4l-1.8-4.9L5 9.7l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
archive:'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
trash:'<path d="M4 6h16M9.5 6V4h5v2M6.5 6l1 14h9l1-14"/><path d="M10 10v7M14 10v7"/>',
home:'<path d="M3 11l9-7 9 7M5 10v10h14V10"/>'
};
const STAR='<svg width="S" height="S" viewBox="0 0 24 24" fill="F" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9z"/></svg>';
const starSvg=(on,sz)=>STAR.replace(/S"/g,sz+'"').replace("F",on?"currentColor":"none");
const diamSvg=(on,sz)=>`<svg width="${sz}" height="${sz}" viewBox="0 0 24 24">
  <path d="M6 3h12l4 6-10 12L2 9z" fill="${on?"currentColor":"none"}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  <g fill="none" stroke="${on?"#fff":"currentColor"}" stroke-opacity="${on?.95:.5}" stroke-width="1.25" stroke-linejoin="round"><path d="M2 9h20M8.6 9L12 20.4M15.4 9L12 20.4M6 3.2l2.6 5.8M18 3.2l-2.6 5.8"/></g></svg>`;
function starsHTML(v,id,size=22,ro=false){v=+v||0;
  return `<div class="stars ${size>22?"big":""} ${ro?"ro":""}" ${id?`data-stars="${id}"`:""}>`+
    [1,2,3,4,5].map(i=>{const on=v>=6||i<=v;return `<button type="button" class="${on?"on":""}" data-v="${i}" ${ro?"tabindex=-1":`aria-label="${i}"`}>${starSvg(on,size)}</button>`}).join("")+
    `<button type="button" class="diam ${v>=6?"on":""}" data-v="6" ${ro?"tabindex=-1":`aria-label="${T("Κορυφαίος πελάτης")}" title="${T("Κορυφαίος πελάτης")}"`}>${diamSvg(v>=6,size)}</button>`+
    (ro?"":`<button type="button" class="x" data-v="0" aria-label="${T("Καθαρισμός")}" style="width:28px">✕</button>`)+`</div>`}
function bindStars(el,get,set){
  el.onclick=e=>{const b=e.target.closest("button[data-v]");if(!b)return;
    const v=+b.dataset.v===get()?0:+b.dataset.v,sz=el.classList.contains("big")?26:22;set(v);
    el.querySelectorAll("button[data-v]").forEach(x=>{const i=+x.dataset.v;if(!i)return;
      const on=i===6?v>=6:i<=v&&v<6||i<=5&&v>=6;
      x.classList.toggle("on",on);x.innerHTML=i===6?diamSvg(v>=6,sz):starSvg(on,sz)})};
}
const ic=(n,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const PINSVG='<svg viewBox="0 0 24 24" width="38" height="38"><path d="M12 22.5s7.5-6.8 7.5-12.5a7.5 7.5 0 00-15 0c0 5.7 7.5 12.5 7.5 12.5z" fill="#C8412B" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="10" r="2.8" fill="#fff"/></svg>';

const getClient=id=>S.clients.find(c=>c.id===id);
const alive=x=>!x.trashed;
let undoT=null;
function undoToast(msg,undo){
  const bar=$("#undoBar");bar.querySelector("span").textContent=msg;bar.querySelector("button").textContent=T("Αναίρεση");
  bar.hidden=false;clearTimeout(undoT);undoT=setTimeout(()=>{bar.hidden=true},7000);
  bar.querySelector("button").onclick=()=>{bar.hidden=true;clearTimeout(undoT);undo()};
}
const isTask=o=>o&&o.status!==undefined&&o.title!==undefined;
function trashTask(x){trash(x,x.title)}
function sendEntriesSheet(clientId){
  const c=getClient(clientId);if(!c)return;
  const all=cEntries(c.id);
  const excluded=new Set(); // αφαιρεμένα ΜΟΝΟ από αυτή την αποστολή, όχι από την εφαρμογή
  const compose=()=>{
    const list=all.filter(e=>!excluded.has(e.id));
    const inSum=rnd(list.filter(e=>isIn(e.kind)).reduce((s,e)=>s+e.amount,0));
    const outSum=rnd(list.filter(e=>!isIn(e.kind)).reduce((s,e)=>s+e.amount,0));
    const lines=list.map(e=>`${fmtDay(e.date)} · ${kindName(e.kind)}${e.note?" — "+e.note:""}: ${isIn(e.kind)?"+":"-"}${money(e.amount)}`);
    const text=T("Κινήσεις — {n}",{n:c.name})+"\n\n"+(lines.length?lines.join("\n"):T("Καμία κίνηση"))+
      "\n\n"+T("Σύνολο εσόδων")+": "+money(inSum)+"\n"+T("Σύνολο εξόδων")+": "+money(outSum)+"\n"+T("Καθαρό")+": "+money(rnd(inSum-outSum));
    return{list,inSum,outSum,text};
  };
  const paint=()=>{
    const{list,inSum,outSum,text}=compose();
    $("#sendTotals").innerHTML=`<div class="sum3"><div class="sumcard"><span>${T("Έσοδα")}</span><b class="money">${money0(inSum)}</b></div>
      <div class="sumcard"><span>${T("Έξοδα")}</span><b class="owe">${money0(outSum)}</b></div>
      <div class="sumcard"><span>${T("Καθαρό")}</span><b>${money0(rnd(inSum-outSum))}</b></div></div>`;
    $("#sendList").innerHTML=panel(all.map(e=>{
      const off=excluded.has(e.id);
      return `<div class="row" style="align-items:center;${off?"opacity:.4":""}">
        <span style="color:${isIn(e.kind)?"var(--green)":"var(--red)"}">${isIn(e.kind)?"+":"−"}</span>
        <div class="grow"><div class="title" style="${off?"text-decoration:line-through":""}">${esc(kindName(e.kind))}${e.note?" · "+esc(e.note):""}</div>
        <div class="meta"><span>${fmtDay(e.date)}</span></div></div>
        <b class="${isIn(e.kind)?"money":"owe"}" style="margin-right:6px">${money(e.amount)}</b>
        <button class="mini ${off?"":"del"}" data-sendtoggle="${e.id}" aria-label="${off?T("Επαναφορά στην αποστολή"):T("Αφαίρεση από την αποστολή")}">${off?"↺":ic("trash",17)}</button></div>`;
    }).join(""));
    $("#sendPreview").value=text;
    $("#sendGo").disabled=!list.length;
  };
  openSheet({title:T("Αποστολή κινήσεων"),cancelLabel:T("Κλείσιμο"),
    body:`<p class="note">${T("Πάτα τον κάδο δίπλα σε μια κίνηση για να μην συμπεριληφθεί σε αυτή την αποστολή. Δεν σβήνεται από πουθενά αλλού, ο πελάτης απλώς δεν θα τη δει σε αυτό το μήνυμα.")}</p>
      <div id="sendTotals"></div>
      <label style="margin-top:14px">${T("Κινήσεις")}</label>
      <div id="sendList"></div>
      <label style="margin-top:14px">${T("Προεπισκόπηση μηνύματος")}</label>
      <textarea id="sendPreview" rows="6" readonly style="font-size:13.5px;line-height:1.5"></textarea>
      <button class="btn amber wide" id="sendGo" style="width:100%;margin-top:12px">${ic("shareios",18)} ${T("Αποστολή")}</button>`});
  paint();
  $("#shBody").addEventListener("click",function h(e){
    const t=e.target.closest("[data-sendtoggle]");
    if(t){const id2=t.dataset.sendtoggle;
      if(excluded.has(id2)){excluded.delete(id2);toast(T("Ξαναμπήκε στην αποστολή."))}
      else{excluded.add(id2);toast(T("Αφαιρέθηκε μόνο από αυτή την αποστολή. Η κίνηση παραμένει καταχωρημένη κανονικά."))}
      paint();
    }
  });
  $("#sendGo").onclick=async()=>{
    const{text}=compose();
    if(navigator.share){try{await navigator.share({text,title:T("Κινήσεις — {n}",{n:c.name})});toast(T("Στάλθηκε."))}
      catch(e){if(e.name!=="AbortError")toast(T("Η κοινοποίηση δεν ολοκληρώθηκε."))}}
    else{try{await navigator.clipboard.writeText(text);toast(T("Αντιγράφηκε, επικόλλησέ το όπου θες να το στείλεις."))}
      catch(e){toast(T("Δεν μπόρεσα να το αντιγράψω."))}}
  };
}
function trashClient(c){
  const tk=S.tasks.filter(x=>alive(x)&&x.clientId===c.id);
  const en=S.ledger.filter(e=>alive(e)&&(e.clientId===c.id||tk.some(t=>t.id===e.taskId)));
  const linked=tk.concat(en);
  c.trashed=Date.now();linked.forEach(o=>{o.trashed=Date.now();o.trashedBy=c.id});
  persist();render();
  undoToast(T("«{t}» πήγε στον κάδο.",{t:c.name})+(linked.length?" "+T("Μαζί και {n} εγγραφές του.",{n:linked.length}):""),
    ()=>{delete c.trashed;linked.forEach(o=>{delete o.trashed;delete o.trashedBy});syncTaskPaid();persist();render();toast(T("Επανήλθε."))});
}
function purgeOldTrash(){
  const days=+S.settings.trashDays||30,cutoff=Date.now()-days*86400000;
  let n=0;
  [S.tasks,S.clients,S.ledger,S.notes].forEach(arr=>{
    for(let i=arr.length-1;i>=0;i--){if(arr[i].trashed&&arr[i].trashed<cutoff){arr.splice(i,1);n++}}
  });
  if(n)write();
  return n;
}
function trash(obj,label){
  obj.trashed=Date.now();
  let linked=[];
  if(isTask(obj)){
    linked=S.ledger.filter(e=>e.taskId===obj.id&&alive(e));
    linked.forEach(e=>{e.trashed=Date.now();e.trashedBy=obj.id});
  }
  persist();render();
  const extra=linked.length?" "+pl(linked.length,"Μαζί πήγε και {n} κίνηση.","Μαζί πήγαν και {n} κινήσεις."):"";
  undoToast(T("«{t}» πήγε στον κάδο.",{t:label})+extra,()=>{
    delete obj.trashed;linked.forEach(e=>{delete e.trashed;delete e.trashedBy});
    syncTaskPaid();persist();render();toast(T("Επανήλθε."));
  });
}
function restoreObj(o){
  delete o.trashed;delete o.trashedBy;
  [...S.tasks,...S.ledger].forEach(x=>{if(x.trashedBy===o.id){delete x.trashed;delete x.trashedBy}});
  syncTaskPaid();
}
// η ένδειξη «εξοφλημένη» βγαίνει πάντα από τις ζωντανές εισπράξεις
function syncTaskPaid(){
  let ch=false;
  S.tasks.forEach(x=>{const amt=+x.amount||0;const should=amt>0&&taskPaid(x)+0.004>=amt;
    if(!!x.paid!==should){x.paid=should;if(should)x.paidAt=x.paidAt||Date.now();ch=true}});
  return ch;
}
// αναίρεση εξόφλησης: φεύγουν και οι εισπράξεις της εργασίας
function unsettleTask(id){
  const x=S.tasks.find(y=>y.id===id);if(!x)return;
  const ents=S.ledger.filter(e=>alive(e)&&e.taskId===x.id&&isIn(e.kind));
  const sum=rnd(ents.reduce((s,e)=>s+e.amount,0));
  if(!ents.length){x.paid=false;persist();render();toast(T("Δεν υπήρχαν εισπράξεις. Η δουλειά είναι ανεξόφλητη."));return}
  if(!confirm(T("Να αναιρεθεί η εξόφληση; Θα φύγουν και {n} από τις κινήσεις, σύνολο {a}.",{n:ents.length,a:money(sum)})))return;
  ents.forEach(e=>{e.trashed=Date.now();e.trashedBy=x.id});
  x.paid=false;persist();render();
  undoToast(T("Αναιρέθηκε η εξόφληση και αφαιρέθηκαν {a} από τα έσοδα.",{a:money(sum)}),
    ()=>{ents.forEach(e=>{delete e.trashed;delete e.trashedBy});syncTaskPaid();persist();render();toast(T("Επανήλθε."))});
}
const people=()=>S.settings.people||[];
const getPerson=id=>people().find(p=>p.id===id);
const NEARD=[0,300,1000,2000,5000];
const NEAR_DEFAULT=1000;
const nearLabel=m=>m?(m<1000?T("{n} μέτρα",{n:m}):T("{n} χλμ.",{n:(m/1000).toLocaleString(LOC(),{maximumFractionDigits:1})})):T("Χωρίς ειδοποίηση");
function whoHTML(ids){const l=(ids||[]).map(getPerson).filter(Boolean);if(!l.length)return"";
  return `<span class="whos">${l.map(p=>`<span class="who" style="background:${p.color}" title="${esc(T(p.name))}">${esc(initials(T(p.name)))}</span>`).join("")}</span>`}
const kinds=()=>S.settings.kinds||DEF_KINDS;
const getKind=id=>kinds().find(k=>k.id===id)||kinds()[0]||{id:"payment",name:"Πληρωμή",dir:"in"};
const isIn=k=>getKind(k).dir==="in";
const kindName=k=>T(getKind(k).name);
const liveEnt=()=>S.ledger.filter(e=>!e.cancelled&&alive(e));
const byNewest=(a,b)=>(new Date(b.date)-new Date(a.date))||((b.createdAt||0)-(a.createdAt||0));
const cEntries=id=>S.ledger.filter(e=>alive(e)&&e.clientId===id).sort(byNewest);
const taskEntries=id=>S.ledger.filter(e=>alive(e)&&e.taskId===id);
const taskPaid=x=>liveEnt().filter(e=>e.taskId===x.id&&isIn(e.kind)).reduce((s,e)=>s+e.amount,0);
const taskSpent=x=>liveEnt().filter(e=>e.taskId===x.id&&!isIn(e.kind)).reduce((s,e)=>s+e.amount,0);
const rnd=n=>Math.round(n*100)/100;
// Η χρέωση γίνεται οφειλή μόνο όταν η δουλειά έχει ολοκληρωθεί.
// Όσο είναι προσφορά σε αναμονή ή σε εξέλιξη, μετράει ως αναμενόμενο, όχι ως οφειλή.
function moneyBuckets(tasks,entries){
  const live=entries.filter(e=>!e.cancelled);
  const amt=x=>+x.amount||0;
  const offers=tasks.filter(x=>x.status==="waiting").reduce((s,x)=>s+amt(x),0);
  const pipeline=tasks.filter(x=>x.status==="pending"||x.status==="progress").reduce((s,x)=>s+amt(x),0);
  const doneCharges=tasks.filter(x=>x.status==="done").reduce((s,x)=>s+amt(x),0);
  const inEnt=live.filter(e=>isIn(e.kind));
  const received=inEnt.reduce((s,e)=>s+e.amount,0);
  const spent=live.filter(e=>!isIn(e.kind)).reduce((s,e)=>s+e.amount,0);
  const doneIds=new Set(tasks.filter(x=>x.status==="done").map(x=>x.id));
  const paidDone=inEnt.filter(e=>e.taskId&&doneIds.has(e.taskId)).reduce((s,e)=>s+e.amount,0);
  const general=inEnt.filter(e=>!e.taskId||!tasks.some(t=>t.id===e.taskId)).reduce((s,e)=>s+e.amount,0);
  const advOpen=inEnt.filter(e=>e.taskId&&!doneIds.has(e.taskId)&&tasks.some(t=>t.id===e.taskId)).reduce((s,e)=>s+e.amount,0);
  const covered=paidDone+general;
  // Οφειλή = άθροισμα ανά ολοκληρωμένη δουλειά (τιμή − εισπράξεις που συνδέθηκαν με αυτήν).
  // Ίδιος κανόνας με τον πίνακα της εργασίας και τον χάρτη, ώστε να λένε παντού το ίδιο νούμερο.
  const paidFor=x=>inEnt.filter(e=>e.taskId===x.id).reduce((s,e)=>s+e.amount,0);
  const owed=tasks.filter(x=>x.status==="done"&&!x.paid&&amt(x)>0).reduce((s,x)=>s+Math.max(0,amt(x)-paidFor(x)),0);
  return{offers:rnd(offers),pipeline:rnd(pipeline),doneCharges:rnd(doneCharges),received:rnd(received),spent:rnd(spent),
    owed:rnd(owed),prepaid:rnd(advOpen+Math.max(0,covered-doneCharges)),profit:rnd(received-spent)};
}
// δουλειές χωρίς πελάτη που έχουν ολοκληρωθεί και δεν έχουν εξοφληθεί· έμεναν έξω από το σύνολο «Σου χρωστάνε»
function orphanOwed(){
  const liveIds=new Set(S.clients.filter(alive).map(c=>c.id));
  return S.tasks.filter(x=>alive(x)&&x.status==="done"&&!x.paid&&(!x.clientId||!liveIds.has(x.clientId))&&(+x.amount||0)>0)
    .map(x=>({x,owe:rnd((+x.amount||0)-taskPaid(x))})).filter(o=>o.owe>0.004);
}
function cMoney(c){
  const tasks=S.tasks.filter(x=>alive(x)&&x.clientId===c.id&&x.status!=="cancelled");
  const ent=cEntries(c.id);
  const b=moneyBuckets(tasks,ent);
  return Object.assign(b,{ent,charges:rnd(b.offers+b.pipeline+b.doneCharges),balance:b.owed});
}
// εξόφληση εργασίας: καταχωρείται το υπόλοιπο ως είσπραξη
function settleTask(id){
  const x=S.tasks.find(y=>y.id===id);if(!x)return;
  const inKind=(kinds().find(k=>k.dir==="in"&&/εξοφλ|πληρ|payment/i.test(k.id+k.name))||kinds().find(k=>k.dir==="in")||{}).id;
  entryForm(null,{kind:inKind,client:x.clientId||"",task:x.id,settle:true});
}
const isOpen=x=>alive(x)&&x.status!=="done"&&x.status!=="cancelled";
const sec=(s,cls="")=>`<h2 class="sec ${cls}">${s}</h2>`;
const panel=h=>`<div class="panel">${h}</div>`;
function toast(m){const e=$("#toast");e.textContent=m;e.classList.add("show");clearTimeout(e._h);e._h=setTimeout(()=>e.classList.remove("show"),3200)}
const initials=n=>String(n||"?").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();

