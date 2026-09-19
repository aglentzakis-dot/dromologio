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
// Περνά τις λίστες των επαγγελμάτων (έως 3) στην εφαρμογή, ενωμένες χωρίς διπλά.
// sel = [{id, name}] · merge=true: κρατά ό,τι έχεις ήδη και προσθέτει όσα λείπουν.
const TRADE_MAX=3;
function applyTrades(sel,merge){
  sel=(sel||[]).filter(x=>tradeById(x.id)).slice(0,TRADE_MAX);if(!sel.length)return;
  const st=S.settings,uniq=a=>[...new Set(a)],all=f=>uniq(sel.flatMap(x=>splitL(tradeById(x.id)[f])));
  const jobs=all("j"),incl=uniq(all("i").concat(splitL(TR_COMMON.i))),excl=uniq(all("x").concat(splitL(TR_COMMON.x)));
  const check=uniq(all("c").concat(splitL(TR_COMMON.c))),kindsNew=uniq(all("k").concat(splitL(TR_COMMON.k)));
  const toItems=arr=>arr.map(s=>({l:s,t:s,d:1}));
  offerLists(); // φροντίζει να υπάρχουν οι λίστες προσφοράς
  if(merge){
    const addTo=(list,arr)=>{const have=new Set(list.map(i=>i.t));arr.forEach(s=>{if(!have.has(s))list.push({l:s,t:s,d:0})})};
    addTo(st.offerIncl,incl);addTo(st.offerExcl,excl);
    st.jobTips=uniq((st.jobTips||[]).concat(jobs));
    st.checkTpl=uniq((st.checkTpl||[]).concat(check));
  }else{
    st.offerIncl=toItems(incl);st.offerExcl=toItems(excl);
    st.jobTips=jobs;st.checkTpl=check;
    st.offerInclLast=null;st.offerExclLast=null;
  }
  st.offerDefV2=true;
  // είδη εξόδων: μόνο προσθήκη, ποτέ διαγραφή (μπορεί να έχουν ήδη κινήσεις)
  const ks=kinds();
  kindsNew.forEach(n=>{if(!ks.some(k=>norm(k.name)===norm(n)))ks.push({id:uid(),name:n,dir:"out"})});
  st.trades=sel.map(x=>({id:x.id,name:x.name||tradeById(x.id).n}));
  st.trade=st.trades[0];   // για συμβατότητα με όσα διαβάζουν ένα μόνο επάγγελμα
  persist();render();
}
const applyTrade=(id,name,merge)=>applyTrades([{id,name}],merge);
const myTrades=()=>Array.isArray(S.settings.trades)&&S.settings.trades.length?S.settings.trades:(S.settings.trade?[S.settings.trade]:[]);
const tradeName=()=>myTrades().map(t=>T(t.name)).join(" + ");

// Παράθυρο επιλογής: έως 3 ειδικότητες (π.χ. Σιδεράς + Μεταλλικές κατασκευές),
// με αναζήτηση· πάνω πάνω το «Άλλο» για δικό σου επάγγελμα.
function tradeSheet(back){
  const list=TRADES.slice().sort((a,b)=>a.n.localeCompare(b.n,"el"));
  const sel=myTrades().map(t=>({id:t.id,name:t.id==="other"?t.name:undefined}));
  const has=id=>sel.some(x=>x.id===id);
  const other=sel.find(x=>x.id==="other");
  const rows=q=>list.filter(t=>!q||norm(t.n).includes(q)||norm(T(t.n)).includes(q)).map(t=>`<button class="optrow ${has(t.id)?"on":""}" data-trade="${t.id}">
      <span class="trbox">${has(t.id)?"✓":""}</span><span class="grow">${esc(T(t.n))}</span></button>`).join("")||`<div class="empty">${T("Δεν βρέθηκε. Γράψ' το στο «Άλλο» από πάνω.")}</div>`;
  const chosenHTML=()=>sel.length?sel.map((x,i)=>`<span class="trchip">${esc(x.id==="other"?x.name:T(tradeById(x.id).n))}<b data-trrm="${i}">×</b></span>`).join(""):`<span class="note">${T("Δεν έχεις διαλέξει ακόμα.")}</span>`;
  const refresh=()=>{$("#tr_chosen").innerHTML=chosenHTML();$("#tr_n").textContent=sel.length+"/"+TRADE_MAX;
    $("#tr_list").innerHTML=panel(rows(norm(val("tr_q"))));const b=$("#sSave");if(b)b.disabled=!sel.length};
  openSheet({title:T("Τι δουλειά κάνεις;"),cancelLabel:back?T("Πίσω"):T("Κλείσιμο"),onCancel:back||null,
    saveLabel:T("Εφαρμογή"),saveStyle:"amber",
    onSave:()=>{
      if(!sel.length){toast(T("Διάλεξε τουλάχιστον μία ειδικότητα."));return false}
      let merge=false;
      // αν έχεις ήδη δουλέψει την εφαρμογή, ρωτάμε πριν πειράξουμε τις λίστες σου
      if(S.tasks.length||S.clients.length||S.settings.jobTips){
        merge=!confirm(T("Να αντικατασταθούν οι λίστες σου (προτάσεις εργασιών, «Τι περιλαμβάνει / Δεν περιλαμβάνει», «Τι παίρνω μαζί») με αυτές του επαγγέλματος «{n}»;\n\nΟΚ = αντικατάσταση\nΆκυρο = να προστεθούν δίπλα σε όσα ήδη έχεις",{n:sel.map(x=>x.id==="other"?x.name:T(tradeById(x.id).n)).join(" + ")}));
      }
      applyTrades(sel,merge);
      toast(T("Έτοιμο: {n}. Οι λίστες σου γέμισαν με τα βασικά του επαγγέλματος.",{n:tradeName()}));
      if(back)setTimeout(back,0);
    },
    body:`<p class="note">${T("Διάλεξε έως 3 ειδικότητες, π.χ. Σιδεράς + Μεταλλικές κατασκευές. Η εφαρμογή θα γεμίσει μόνη της με συνηθισμένες δουλειές, λίστες για τις προσφορές, εργαλεία που παίρνεις μαζί και είδη εξόδων. Όλα αλλάζουν μετά όπως θέλεις.")}</p>
      <div class="trsel"><b>${T("Οι ειδικότητές σου")} <span id="tr_n">${sel.length}/${TRADE_MAX}</span></b><div id="tr_chosen">${chosenHTML()}</div></div>
      <div class="ofgroup" style="margin-top:10px">
        <div class="ofhead">${T("Άλλο (δικό μου επάγγελμα)")}<small>${T("γράψε τι κάνεις· ξεκινάς με γενικές λίστες που τις φτιάχνεις στα μέτρα σου")}</small></div>
        <div class="inrow"><input id="tr_other" placeholder="${T("π.χ. Επισκευές σκαφών")}" value="${other?esc(other.name):""}" autocomplete="off">
        <button type="button" class="btn ghost" id="tr_otherGo">${ic("plus",18)}</button></div></div>
      <input class="search" id="tr_q" type="search" placeholder="${T("Αναζήτηση επαγγέλματος")}" style="margin:14px 0 10px">
      <div id="tr_list">${panel(rows(""))}</div>`});
  const add=(id,name)=>{
    if(id==="other"){const k=sel.findIndex(x=>x.id==="other");if(k>=0){sel[k].name=name;refresh();return}}
    else if(has(id)){sel.splice(sel.findIndex(x=>x.id===id),1);refresh();return}
    if(sel.length>=TRADE_MAX){toast(T("Έως 3 ειδικότητες. Βγάλε πρώτα μία για να προσθέσεις άλλη."));return}
    sel.push({id,name});refresh();
  };
  $("#tr_q").oninput=()=>{$("#tr_list").innerHTML=panel(rows(norm(val("tr_q"))))};
  $("#shBody").addEventListener("click",e=>{
    const rm=e.target.closest("[data-trrm]");if(rm){sel.splice(+rm.dataset.trrm,1);refresh();return}
    const b=e.target.closest("[data-trade]");if(b){add(b.dataset.trade);return}
    if(e.target.closest("#tr_otherGo")){const v=val("tr_other");if(!v){$("#tr_other").focus();toast(T("Γράψε πρώτα το επάγγελμά σου."));return}add("other",v);$("#tr_other").blur()}
  });
  $("#tr_other").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("#tr_otherGo").click()}});
  const b=$("#sSave");if(b)b.disabled=!sel.length;
}
// Κάρτα στην αρχική όσο δεν έχει διαλεχτεί επάγγελμα.
function tradeCardHTML(){
  if(myTrades().length||S.settings.tradeSkip||(typeof isDemo==="function"&&isDemo()))return "";
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
