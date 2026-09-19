/* Δρομολόγιο — Επιλογή επαγγέλματος.
   Στην πρώτη χρήση (και από τις Ρυθμίσεις) διαλέγεις τι δουλειά κάνεις και η εφαρμογή γεμίζει μόνη της:
   προτάσεις τίτλων εργασίας, «Τι περιλαμβάνει / Δεν περιλαμβάνει» της προσφοράς, λίστα «Τι παίρνω μαζί»
   και είδη εξόδων. Τα δεδομένα των επαγγελμάτων βρίσκονται στο 17-epaggelmata-data.js. */

const splitL=s=>String(s||"").split("|").map(x=>x.trim()).filter(Boolean);
function tradeById(id){
  if(id==="other")return TR_OTHER;
  const t=TRADES.find(x=>x.id===id);if(!t)return null;
  const base=t.alias?TRADES.find(x=>x.id===t.alias):null;
  return base?Object.assign({},base,t,{j:t.j||base.j,i:t.i||base.i,x:t.x||base.x,c:t.c||base.c,k:t.k||base.k}):t;
}
// Περνά τις λίστες του επαγγέλματος στην εφαρμογή. merge=true: κρατά ό,τι έχεις ήδη και προσθέτει όσα λείπουν.
function applyTrade(id,customName,merge){
  const t=tradeById(id);if(!t)return;
  const st=S.settings,uniq=a=>[...new Set(a)];
  const jobs=splitL(t.j),incl=splitL(t.i).concat(splitL(TR_COMMON.i)),excl=splitL(t.x).concat(splitL(TR_COMMON.x));
  const check=splitL(t.c).concat(splitL(TR_COMMON.c)),kindsNew=uniq(splitL(t.k).concat(splitL(TR_COMMON.k)));
  const toItems=(arr)=>arr.map(s=>({l:s,t:s,d:1}));
  offerLists(); // φροντίζει να υπάρχουν οι λίστες προσφοράς
  if(merge){
    const addTo=(list,arr)=>{const have=new Set(list.map(i=>i.t));arr.forEach(s=>{if(!have.has(s))list.push({l:s,t:s,d:0})})};
    addTo(st.offerIncl,incl);addTo(st.offerExcl,excl);
    st.jobTips=uniq((st.jobTips||[]).concat(jobs));
    st.checkTpl=uniq((st.checkTpl||[]).concat(check));
  }else{
    st.offerIncl=toItems(uniq(incl));st.offerExcl=toItems(uniq(excl));
    st.jobTips=jobs.slice();st.checkTpl=uniq(check);
    st.offerInclLast=null;st.offerExclLast=null;
  }
  st.offerDefV2=true;
  // είδη εξόδων: μόνο προσθήκη, ποτέ διαγραφή (μπορεί να έχουν ήδη κινήσεις)
  const ks=kinds();
  kindsNew.forEach(n=>{if(!ks.some(k=>norm(k.name)===norm(n)))ks.push({id:uid(),name:n,dir:"out"})});
  st.trade={id,name:customName||t.n};
  persist();render();
}
const tradeName=()=>S.settings.trade?T(S.settings.trade.name):"";

// Παράθυρο επιλογής: αναζήτηση + λίστα· πάνω πάνω το «Άλλο» για δικό σου επάγγελμα.
function tradeSheet(back){
  const cur=S.settings.trade&&S.settings.trade.id;
  const list=TRADES.slice().sort((a,b)=>a.n.localeCompare(b.n,"el"));
  const rows=q=>list.filter(t=>!q||norm(t.n).includes(q)||norm(T(t.n)).includes(q)).map(t=>`<button class="optrow ${cur===t.id?"on":""}" data-trade="${t.id}">
      <span class="grow">${esc(T(t.n))}</span>${cur===t.id?'<span class="tick">✓</span>':""}</button>`).join("")||`<div class="empty">${T("Δεν βρέθηκε. Γράψ' το στο «Άλλο» από πάνω.")}</div>`;
  openSheet({title:T("Τι δουλειά κάνεις;"),cancelLabel:back?T("Πίσω"):T("Κλείσιμο"),onCancel:back||null,
    body:`<p class="note">${T("Διάλεξε το επάγγελμά σου και η εφαρμογή θα γεμίσει μόνη της με συνηθισμένες δουλειές, λίστες για τις προσφορές, εργαλεία που παίρνεις μαζί και είδη εξόδων. Όλα αλλάζουν μετά όπως θέλεις.")}</p>
      <div class="ofgroup" style="margin-top:6px">
        <div class="ofhead">${T("Άλλο (δικό μου επάγγελμα)")}<small>${T("γράψε τι κάνεις· ξεκινάς με γενικές λίστες που τις φτιάχνεις στα μέτρα σου")}</small></div>
        <div class="inrow"><input id="tr_other" placeholder="${T("π.χ. Επισκευές σκαφών")}" value="${cur==="other"?esc(tradeName()):""}" autocomplete="off">
        <button type="button" class="btn amber" id="tr_otherGo">${T("Επιλογή")}</button></div></div>
      <input class="search" id="tr_q" type="search" placeholder="${T("Αναζήτηση επαγγέλματος")}" style="margin:14px 0 10px">
      <div id="tr_list">${panel(rows(""))}</div>`});
  $("#tr_q").oninput=e=>{$("#tr_list").innerHTML=panel(rows(norm(e.target.value)))};
  const choose=(id,name)=>{
    const t=tradeById(id);if(!t)return;
    let merge=false;
    // αν έχεις ήδη δουλέψει την εφαρμογή, ρωτάμε πριν πειράξουμε τις λίστες σου
    if(S.tasks.length||S.clients.length||S.settings.jobTips){
      merge=!confirm(T("Να αντικατασταθούν οι λίστες σου (προτάσεις εργασιών, «Τι περιλαμβάνει / Δεν περιλαμβάνει», «Τι παίρνω μαζί») με αυτές του επαγγέλματος «{n}»;\n\nΟΚ = αντικατάσταση\nΆκυρο = να προστεθούν δίπλα σε όσα ήδη έχεις",{n:name||T(t.n)}));
    }
    applyTrade(id,name,merge);closeSheet();
    toast(T("Έτοιμο: {n}. Οι λίστες σου γέμισαν με τα βασικά του επαγγέλματος.",{n:name||T(t.n)}));
  };
  $("#shBody").addEventListener("click",e=>{
    const b=e.target.closest("[data-trade]");if(b){choose(b.dataset.trade);return}
    if(e.target.closest("#tr_otherGo")){const v=val("tr_other");if(!v){$("#tr_other").focus();toast(T("Γράψε πρώτα το επάγγελμά σου."));return}choose("other",v)}
  });
  $("#tr_other").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("#tr_otherGo").click()}});
}
// Κάρτα στην αρχική όσο δεν έχει διαλεχτεί επάγγελμα.
function tradeCardHTML(){
  if(S.settings.trade||S.settings.tradeSkip||(typeof isDemo==="function"&&isDemo()))return "";
  return `<div class="democard tradecard"><b>${T("Τι δουλειά κάνεις;")}</b>
    <span>${T("Διάλεξε επάγγελμα και η εφαρμογή θα έχει έτοιμες τις συνηθισμένες δουλειές σου, τις λίστες των προσφορών και τα εργαλεία που παίρνεις μαζί.")}</span>
    <div class="twobtn" style="padding:0"><button class="btn amber" data-act="tradePick">${ic("person",18)} ${T("Διάλεξε επάγγελμα")}</button>
    <button class="btn ghost" data-act="tradeSkip">${T("Όχι τώρα")}</button></div></div>`;
}
// Γραμμή στις Ρυθμίσεις › Στοιχεία και ρυθμίσεις
function tradeSettingsHTML(){
  return `<h3 class="sub">${T("Επάγγελμα")}</h3>
    <p class="note">${T("Από εδώ ορίζονται οι έτοιμες λίστες: προτάσεις εργασιών, προσφορές, εργαλεία και έξοδα.")}</p>
    <button class="btn ghost" data-act="tradePick" style="width:100%">${ic("person",18)} ${tradeName()?esc(tradeName())+" · "+T("Αλλαγή"):T("Διάλεξε επάγγελμα")}</button>`;
}
// η αρχική σχεδιάστηκε πριν φορτωθεί αυτό το αρχείο: ξανασχεδιάζεται για να φανεί η κάρτα
if(view==="today")render();
