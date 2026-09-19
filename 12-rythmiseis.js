/* Δρομολόγιο — Ρυθμίσεις. */
/* ---------- Ρυθμίσεις ---------- */
function searchSheet(){
  openSheet({title:T("Αναζήτηση"),cancelLabel:T("Κλείσιμο"),
    body:`<input id="gq" type="search" placeholder="${T("Γράψε όνομα, δουλειά, σημείωση ή ποσό")}" autocomplete="off">
      <div id="gres"><p class="note">${T("Ψάχνει σε πελάτες, εργασίες, υπενθυμίσεις και κινήσεις.")}</p></div>`});
  const run=()=>{
    const q=norm(val("gq"));const box=$("#gres");
    if(q.length<2){box.innerHTML=`<p class="note">${T("Γράψε τουλάχιστον δύο γράμματα.")}</p>`;return}
    const cl=S.clients.filter(alive).filter(c=>norm([c.name,c.company,c.area,c.street,c.mobile,c.phone,c.notes].join(" ")).includes(q)).slice(0,8);
    const tk=S.tasks.filter(alive).filter(x=>norm([x.title,x.desc,x.area,x.address,(getClient(x.clientId)||{}).name].join(" ")).includes(q)).sort(byDue).slice(0,10);
    const rm=S.reminders.filter(r=>remActive(r)&&norm(r.text).includes(q)).slice(0,8);
    const en=S.ledger.filter(alive).filter(e=>norm([e.note,kindName(e.kind),String(e.amount),(getClient(e.clientId)||{}).name].join(" ")).includes(q)).slice(0,8);
    let h="";
    if(cl.length)h+=sec(T("Πελάτες"))+panel(cl.map(c=>`<div class="row" data-act="openClient" data-id="${c.id}" style="align-items:center"><div class="avatar">${esc(initials(c.name))}</div>
      <div class="grow"><div class="title">${esc(c.name)}</div><div class="meta"><span>${esc([c.area,c.mobile].filter(Boolean).join(" · "))}</span></div></div></div>`).join(""));
    if(tk.length)h+=sec(T("Εργασίες"))+panel(tk.map(x=>taskRow(x,true,false)).join(""));
    if(rm.length)h+=sec(T("Υπενθυμίσεις"))+panel(rm.map(remRow).join(""));
    if(en.length)h+=sec(T("Κινήσεις"))+panel(en.map(e=>entryRow(e,true)).join(""));
    box.innerHTML=h||`<div class="empty">${T("Δεν βρέθηκε τίποτα.")}</div>`;
  };
  $("#gq").addEventListener("input",run);
  setTimeout(()=>$("#gq").focus(),80);
}
function checkProgress(x){
  const l=x.check||[];return{done:l.filter(i=>i.done).length,total:l.length};
}
function drawCheckBadge(x){
  const b=$("#chkBadge");if(!b)return;
  const{done,total}=checkProgress(x);
  b.textContent=total?` ${done}/${total}`:"";
  b.className="chkbadge"+(total&&done===total?" full":"");
}
function checkSheet(x,back){
  const list=x.check||(x.check=[]);
  const paint=()=>{
    const{done,total}=checkProgress(x);
    $("#chkHead").innerHTML=total
      ?`<div class="chkbar"><span style="width:${Math.round(done/total*100)}%"></span></div>
        <p class="note" style="margin:6px 0 0">${T("{d} από {t} έτοιμα",{d:done,t:total})}</p>`
      :`<p class="note" style="margin:0">${T("Η λίστα είναι άδεια. Πρόσθεσε ό,τι χρειάζεσαι ή φόρτωσε τη δική σου προεπιλογή.")}</p>`;
    $("#chkList").innerHTML=list.length?panel(list.map((it,i)=>`<div class="row listedit ${it.done?"chkdone":""}" style="align-items:center">
        <button type="button" class="check ${it.done?"on":""}" data-chk="${i}" aria-label="${T("Έγινε")}">${it.done?"✓":""}</button>
        <div class="grow title">${esc(it.text)}</div>
        <button class="mv" data-chkmv="${i}" data-dir="up">▲</button><button class="mv" data-chkmv="${i}" data-dir="down">▼</button>
        <button class="x bin" data-chkdel="${i}" aria-label="${T("Διαγραφή")}">${ic("trash",18)}</button></div>`).join("")):"";
  };
  openSheet({title:T("Τι παίρνω μαζί"),cancelLabel:back?T("Πίσω"):T("Κλείσιμο"),onCancel:back||null,
    body:`<div id="chkHead"></div>
      <div class="inrow" style="margin:12px 0 4px"><input id="chk_new" placeholder="${T("Πρόσθεσε κάτι…")}" autocomplete="off"><button class="btn amber" id="chk_add">${T("Προσθήκη")}</button></div>
      <div id="chkList"></div>
      <div class="twobtn" style="margin-top:12px">
        <button class="btn ghost" id="chk_tpl">${ic("plus",16)} ${T("Από την προεπιλογή μου")}</button>
        <button class="btn ghost" id="chk_save">${ic("edit",16)} ${T("Γίνε η προεπιλογή μου")}</button></div>
      <button class="btn ghost wide" id="chk_clear" style="width:100%;margin-top:8px">${T("Ξετσέκαρε όλα")}</button>`});
  paint();
  $("#chk_add").onclick=()=>{const v=val("chk_new");if(!v)return;list.push({text:v,done:false});$("#chk_new").value="";persist();paint()};
  $("#chk_new").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("#chk_add").click()}});
  $("#chk_tpl").onclick=()=>{const have=new Set(list.map(i=>norm(i.text)));
    (S.settings.checkTpl||[]).forEach(t=>{if(!have.has(norm(t)))list.push({text:t,done:false})});
    persist();paint();toast(T("Μπήκαν τα σταθερά σου."))};
  $("#chk_save").onclick=()=>{if(!list.length)return toast(T("Η λίστα είναι άδεια."));
    S.settings.checkTpl=list.map(i=>i.text);write();toast(T("Αποθηκεύτηκε ως προεπιλογή για τις επόμενες δουλειές."))};
  $("#chk_clear").onclick=()=>{list.forEach(i=>i.done=false);persist();paint()};
  $("#chkList").onclick=e=>{
    const c=e.target.closest("[data-chk]"),m=e.target.closest("[data-chkmv]"),d=e.target.closest("[data-chkdel]");
    if(c){const i=+c.dataset.chk;list[i].done=!list[i].done;persist();paint();return}
    if(m){const i=+m.dataset.chkmv,j=i+(m.dataset.dir==="up"?-1:1);if(j<0||j>=list.length)return;
      [list[i],list[j]]=[list[j],list[i]];persist();paint();return}
    if(d){const i=+d.dataset.chkdel;list.splice(i,1);persist();paint()}
  };
}
function notesSheet(){
  const list=S.notes.filter(alive).sort((a,b)=>b.date-a.date);
  openSheet({title:T("Σημειώσεις με ημερομηνία"),cancelLabel:T("Πίσω"),onCancel:()=>settingsSheet("notes"),
    body:`<div class="inrow"><input id="note_new" placeholder="${T("Γράψε μια σημείωση…")}"><button class="btn amber" id="note_add">${T("Προσθήκη")}</button></div>`+
      (list.length?panel(list.map(n=>`<div class="row listedit" style="align-items:flex-start">
          <div class="grow"><div class="title" style="white-space:pre-wrap">${esc(n.text)}</div><div class="meta"><span>${fmtDay(n.date)}</span></div></div>
          <button class="x bin" data-notedel="${n.id}" aria-label="${T("Διαγραφή")}">${ic("trash",18)}</button></div>`).join("")):
        `<div class="empty" style="margin-top:10px">${T("Δεν έχεις γράψει καμία σημείωση ακόμα.")}</div>`)});
  $("#note_add").onclick=()=>{const v=val("note_new");if(!v)return;
    S.notes.push({id:uid(),text:v,date:Date.now()});persist();render();notesSheet()};
  $("#shBody").onclick=e=>{const d=e.target.closest("[data-notedel]");if(!d)return;
    const n=S.notes.find(x=>x.id===d.dataset.notedel);if(!n)return;
    trash(n,n.text.length>40?n.text.slice(0,40)+"…":n.text);notesSheet()};
}
function binSheet(){
  const tt=S.tasks.filter(x=>!alive(x)&&!x.trashedBy),tc=S.clients.filter(x=>!alive(x)),te=S.ledger.filter(x=>!alive(x)&&!x.trashedBy),tn=S.notes.filter(x=>!alive(x));
  const row=(o,title,sub,kind)=>`<div class="row arch" style="align-items:center"><div class="grow"><div class="title">${esc(title)}</div>
    <div class="meta"><span>${esc(sub)}</span><span>${fmtDay(o.trashed)}</span><span>${T("σβήνει σε {n} μέρες",{n:Math.max(0,Math.ceil(((S.settings.trashDays||30)*86400000-(Date.now()-o.trashed))/86400000))})}</span></div></div>
    <button class="mini" data-bin="restore" data-kind="${kind}" data-id="${o.id}" title="${T("Επαναφορά")}">↺</button>
    <button class="mini del" data-bin="purge" data-kind="${kind}" data-id="${o.id}" title="${T("Οριστική διαγραφή")}">${ic("trash",18)}</button></div>`;
  openSheet({title:T("Κάδος"),cancelLabel:T("Κλείσιμο"),body:
    `<p class="note">${T("Ό,τι σβήνεις μένει εδώ {n} μέρες, μετά διαγράφεται μόνο του οριστικά.",{n:S.settings.trashDays||30})}</p>
     <div class="inrow" style="margin-bottom:14px"><label for="bin_days" style="margin:0;flex:1">${T("Μέρες πριν το οριστικό σβήσιμο")}</label>
       <input id="bin_days" type="number" min="1" max="365" value="${S.settings.trashDays||30}" style="width:78px;text-align:center"></div>`+
    (tt.length?sec(T("Εργασίες"))+panel(tt.map(x=>row(x,x.title,[x.clientId&&getClient(x.clientId)?getClient(x.clientId).name:"",x.amount?money(x.amount):""].filter(Boolean).join(" · "),"task")).join("")):"")+
    (tc.length?sec(T("Πελάτες"))+panel(tc.map(c=>row(c,c.name,[c.area,c.mobile].filter(Boolean).join(" · "),"client")).join("")):"")+
    (te.length?sec(T("Κινήσεις"))+panel(te.map(e=>row(e,kindName(e.kind)+" "+money(e.amount),e.note||"","entry")).join("")):"")+
    (tn.length?sec(T("Σημειώσεις"))+panel(tn.map(n=>row(n,n.text.length>60?n.text.slice(0,60)+"…":n.text,fmtDay(n.date),"note")).join("")):"")+
    (tt.length||tc.length||te.length||tn.length?`<button class="btn danger wide" data-bin="purgeAll">${T("Άδειασμα κάδου")}</button>`:panel(`<div class="empty">${T("Ο κάδος είναι άδειος.")}</div>`))});
  $("#bin_days").onchange=e=>{const v=Math.max(1,Math.min(365,+e.target.value||30));S.settings.trashDays=v;write();
    const purged=purgeOldTrash();if(purged)render();toast(T("Ενημερώθηκε: {n} μέρες.",{n:v}));
    setTimeout(binSheet,0)};
  $("#shBody").onclick=e=>{
    const b=e.target.closest("[data-bin]");if(!b)return;
    const act=b.dataset.bin;
    if(act==="purgeAll"){if(!confirm(T("Να σβηστούν οριστικά όλα όσα είναι στον κάδο;")))return;
      S.tasks=S.tasks.filter(alive);S.clients=S.clients.filter(alive);S.ledger=S.ledger.filter(alive);S.notes=S.notes.filter(alive);persist();render();return binSheet()}
    const arr=b.dataset.kind==="task"?S.tasks:b.dataset.kind==="client"?S.clients:b.dataset.kind==="note"?S.notes:S.ledger;
    const o=arr.find(x=>x.id===b.dataset.id);if(!o)return;
    if(act==="restore"){restoreObj(o);persist();render();toast(T("Επανήλθε."));return binSheet()}
    if(!confirm(T("Οριστική διαγραφή; Δεν αναιρείται.")))return;
    arr.splice(arr.indexOf(o),1);persist();render();binSheet();
  };
}
// Ευρετήριο ρυθμίσεων: τι υπάρχει, πού βρίσκεται, και με ποιες λέξεις το ψάχνει κάποιος
const SETTINGS_INDEX=[
  ["look","Επιλογή ώρας","στρογγυλό ρολόι, ώρα, ρολόι, καντράν, επιλογέας ώρας, χρόνος"],
  ["look","Πεδία ώρας","ημέρα και ώρα, ενιαίο πεδίο, ξεχωριστά, ημερομηνία"],
  ["look","Γλώσσα","ελληνικά, αγγλικά, language, γλωσσα"],
  ["look","Χρώματα, γράμματα και όνομα","θέμα, χρώμα, φόντο, μέγεθος γραμμάτων, εικονίδιο, όνομα εφαρμογής, εμφάνιση"],
  ["work","Στοιχεία επιχείρησης","ΑΦΜ, επωνυμία, τηλέφωνο, διεύθυνση, απόδειξη"],
  ["work","Σπίτι ή έδρα","έδρα, σπίτι, αφετηρία, βάση"],
  ["work","Δικές μου τοποθεσίες","αποθήκη, σημεία, τοποθεσίες, διευθύνσεις"],
  ["work","Διαδρομή","παράκαμψη, χιλιόμετρα, διαδρομή, στάσεις"],
  ["work","Είδη κινήσεων","υλικά, καύσιμα, κατηγορίες, έσοδα, έξοδα"],
  ["work","Έτοιμες σημειώσεις","προτάσεις, σημειώσεις κινήσεων"],
  ["work","Κλείδωμα Ταμείου","κωδικός, κλείδωμα, ξέχασα τον κωδικό, ασφάλεια, pin"],
  ["work","Ποιοι δουλεύουν","άτομα, συνεργάτες, χρώματα ατόμων"],
  ["work","Ειδοποιήσεις και ήχος","ήχος, δόνηση, ξυπνητήρι, ειδοποιήσεις, υπενθυμίσεις"],
  ["data","Αντίγραφο ασφαλείας","backup, επαναφορά, αποθήκευση, email, αρχείο"],
  ["data","Κάδος","διαγραμμένα, επαναφορά, σβήσιμο, μέρες"],
  ["data","Εγκατάσταση εφαρμογής","εγκατάσταση, αρχική οθόνη, εικονίδιο, iphone"],
  ["data","Έλεγχος για νεότερη έκδοση","αναβάθμιση, έκδοση, ενημέρωση"],
  ["apps","Φωτόμετρηση - Σημειώσεις","φωτογραφίες, μετρήσεις, διαστάσεις, φωτομέτρα"],
  ["apps","Σημειώσεις με ημερομηνία","σημειώσεις, κείμενο, ημερομηνία"]
];
const GROUP_NAME={work:"Στοιχεία και ρυθμίσεις",look:"Εμφάνιση",data:"Δεδομένα",
  apps:"Ρυθμίσεις εφαρμογών",notes:"Ρυθμίσεις εφαρμογών",tools:"Τα εργαλεία μου",ours:"Οι εφαρμογές μας"};
// Δικές μας εφαρμογές — πρόσθεσε εδώ όποια θέλεις να προβάλλεται μέσα από το Δρομολόγιο
const OUR_APPS=[
  {icon:"📏",name:"ΦωτοΜέτρα",desc:"φωτογραφίες με σημειώσεις και διαστάσεις",url:"https://aglentzakis-dot.github.io/fotometra/"}
];
function settingsSheet(group){
  if(!group){
    openSheet({title:T("Ρυθμίσεις"),cancelLabel:T("Κλείσιμο"),body:`
      <input id="set_q" placeholder="${T("Αναζήτηση, π.χ. ρολόι, κωδικός, αντίγραφο…")}" autocomplete="off" style="margin-bottom:10px">
      <div id="set_res"></div>
      <div class="choose" id="set_menu">
      <button data-act="settingsGroup" data-g="work">${ic("tasks")}<span>${T("Στοιχεία και ρυθμίσεις")}<small>${T("επιχείρηση, έδρα, σημεία, άτομα, ταμείο, διαδρομή, ειδοποιήσεις")}</small></span></button>
      <button data-act="settingsGroup" data-g="look">${ic("gear")}<span>${T("Εμφάνιση")}<small>${T("ώρα και ρολόι, γλώσσα, χρώματα, γράμματα")}</small></span></button>
      <button data-act="settingsGroup" data-g="data">${ic("shield")}<span>${T("Δεδομένα")}<small>${T("αντίγραφα, κάδος, τοποθεσία, έκδοση")}</small></span></button>
      <button class="appsbtn" data-act="settingsGroup" data-g="apps">${ic("measure")}<span>${T("Ρυθμίσεις εφαρμογών")}<small>${T("φωτόμετρηση, σημειώσεις, άλλες εφαρμογές μας")}</small></span></button>
      <button data-act="feedback">${ic("msg")}<span>${T("Αξιολόγηση και επικοινωνία")}<small>${T("πες μας τη γνώμη σου")}</small></span></button>
    </div>`});
    const q=$("#set_q"),res=$("#set_res"),menu=$("#set_menu");
    q.oninput=()=>{
      const t=norm(q.value.trim());
      if(t.length<2){res.innerHTML="";menu.hidden=false;return}
      menu.hidden=true;
      const hits=SETTINGS_INDEX.filter(([g,name,keys])=>norm(T(name)).includes(t)||norm(keys).includes(t)||norm(T(GROUP_NAME[g])).includes(t));
      res.innerHTML=hits.length?panel(hits.map(([g,name])=>`<div class="row" data-act="settingsGroup" data-g="${g}" style="align-items:center">
          <span style="color:var(--loc)">${ic("gear",20)}</span>
          <div class="grow"><div class="title">${T(name)}</div><div class="meta"><span>${T(GROUP_NAME[g])}</span></div></div>
          <span class="note">›</span></div>`).join("")):`<div class="empty">${T("Δεν βρέθηκε ρύθμιση με αυτή τη λέξη.")}</div>`;
    };
    return;
  }
  settingsGroupSheet(group);
}
function settingsGroupSheet(group){
  const B=S.settings.base,bl=baseLoc();
  const backTo=(group==="tools"||group==="ours")?(()=>settingsGroupSheet("apps")):(()=>settingsSheet());
  openSheet({title:T(GROUP_NAME[group]||"Δεδομένα"),cancelLabel:T("Πίσω"),onCancel:backTo,body:`${(group==="apps"||group==="notes")?`
    <div class="choose">
      <button data-act="settingsGroup" data-g="tools">${ic("measure")}<span>${T("Τα εργαλεία μου")}<small>${T("φωτόμετρηση, γραπτές σημειώσεις")}</small></span></button>
      <button data-act="settingsGroup" data-g="ours">${ic("plus")}<span>${T("Οι εφαρμογές μας")}<small>${T("δες και δοκίμασε τις άλλες μας εφαρμογές")}</small></span></button>
    </div>`:""}${group==="tools"?`<h3 class="sub">${T("Φωτόμετρηση - Σημειώσεις")}</h3>
    <p class="note">${T("Ανοίγει τη ΦωτοΜέτρα, τη δεύτερη εφαρμογή σου για φωτογραφίες με σημειώσεις και διαστάσεις.")}</p>
    ${fotoBtnHTML("*","Φωτόμετρηση - Σημειώσεις","Φωτόμετρηση - Σημειώσεις")}
    <h3 class="sub" style="margin-top:22px">${T("Γραπτές σημειώσεις")}</h3>
    <p class="note">${T("Απλό κείμενο με ημερομηνία, χωρίς φωτογραφία.")}</p>
    <button class="btn ghost wide" data-act="notesSheet" style="width:100%">${ic("edit",18)} ${T("Σημειώσεις με ημερομηνία")}${(S.notes&&S.notes.filter(alive).length)?` (${S.notes.filter(alive).length})`:""}</button>`:""}${group==="ours"?`<h3 class="sub">${T("Άλλες εφαρμογές μας")}</h3>
    <p class="note">${T("Δοκίμασέ τες, ανοίγουν σε δικό τους παράθυρο.")}</p>
    ${panel(OUR_APPS.map(a=>`<a class="row" href="${a.url}" target="_blank" rel="noopener" style="align-items:center;text-decoration:none;color:inherit">
        <span style="font-size:22px">${a.icon}</span>
        <div class="grow"><div class="title">${T(a.name)}</div><div class="meta"><span>${T(a.desc)}</span></div></div>
        <span class="note">↗</span></a>`).join(""))}`:""}${group==="look"?`<h3 class="sub">${T("Ώρα και ρολόι")}</h3>
    <label>${T("Επιλογή ώρας")}</label>
    <div class="seg" id="lk_clock"><button type="button" data-v="app">${T("Στρογγυλό ρολόι")}</button><button type="button" data-v="native">${T("Του κινητού")}</button></div>
    <label>${T("Πεδία ώρας")}</label>
    <div class="seg" id="lk_dt"><button type="button" data-v="0">${T("Ενιαίο πεδίο")}</button><button type="button" data-v="1">${T("Ημέρα + ώρα ξεχωριστά")}</button></div>
    <h3 class="sub">${T("Γλώσσα")}</h3>
    <div class="seg" id="s_lang"><button type="button" data-v="el">🇬🇷 Ελληνικά</button><button type="button" data-v="en">🇬🇧 English</button></div>
    `:""}${group==="work"?`<h3 class="sub">${T("Στοιχεία επιχείρησης")}</h3>
    <p class="note">${T("Εμφανίζονται στην κορυφή κάθε ψηφιακής απόδειξης.")}</p>
    <button class="btn ghost" data-act="bizSheet" style="width:100%">${ic("edit",18)} ${(S.settings.biz&&S.settings.biz.name)?esc(S.settings.biz.name):T("Συμπλήρωσε στοιχεία επιχείρησης")}</button>
    <h3 class="sub">${T("Σπίτι ή έδρα")}</h3>
    ${B?panel(`<div class="row" data-act="placeEdit" data-kind="base" style="align-items:center">
        <span style="color:var(--loc)">${ic("home",22)}</span>
        <div class="grow"><div class="title">${esc(B.name)}</div>
        <div class="meta">${[B.address,B.area].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join("")}
          ${B.lat!=null?`<span>${T("Ακριβής θέση")}</span>`:bl?`<span>${T("Κέντρο περιοχής {a}",{a:(findArea(B.area)||{}).name||B.area})}</span>`:`<span style="color:var(--red)">${T("Χωρίς θέση")}</span>`}</div></div>
        <span class="note">${T("Αλλαγή")}</span></div>`)
      :`<p class="note">${T("Δεν έχει οριστεί. Από εδώ ξεκινάς συνήθως τις δουλειές.")}</p>
        <button class="btn ghost" data-act="placeEdit" data-kind="base" style="width:100%">${ic("home",18)} ${T("Όρισε σπίτι ή έδρα")}</button>`}
    `:""}${group==="work"?`<h3 class="sub">${T("Δικές μου τοποθεσίες")}</h3><p class="note">${T("Σημεία που δεν είναι στη λίστα, π.χ. «Αποθήκη». Βάζεις διεύθυνση, σημείο στον χάρτη ή την τρέχουσα θέση.")}</p>
    ${panel((B&&bl?`<div class="row" data-act="placeEdit" data-kind="base" style="align-items:center"><span style="color:var(--loc)">${ic("home",20)}</span>
        <div class="grow"><div class="title">${esc(B.name)} <span class="tag paid">${T("έδρα")}</span></div>
        <div class="meta"><span>${esc([B.address,B.area||bl.label].filter(Boolean).join(", "))}</span></div></div><span class="note">${T("Αλλαγή")}</span></div>`:"")+
      S.areas.map((a,i)=>`<div class="row" data-act="placeEdit" data-kind="place" data-i="${i}" style="align-items:center"><span style="color:var(--loc)">${ic("pin",20)}</span>
        <div class="grow"><div class="title">${esc(a.name)}</div>${a.address||a.area?`<div class="meta"><span>${esc([a.address,a.area].filter(Boolean).join(", "))}</span></div>`:""}</div>
        <span class="note">${T("Αλλαγή")}</span></div>`).join("")||`<div class="empty">${T("Δεν έχεις άλλες τοποθεσίες.")}</div>`)}
    <button class="btn ghost" data-act="placeEdit" data-kind="place" style="width:100%;margin-top:8px">+ ${T("Νέα τοποθεσία")}</button>
    `:""}${group==="data"?`<h3 class="sub">${T("Εγκατάσταση στο κινητό")}</h3>
    <p class="note" id="s_instNote">${installNote()}</p>
    <button class="btn amber" data-act="install" style="width:100%">${ic("plus",18)} ${isIOS()?T("Οδηγίες εγκατάστασης (iPhone)"):T("Εγκατάσταση εφαρμογής")}</button>
    `:""}${group==="work"?`<h3 class="sub">${T("Διαδρομή")}</h3>
    <label for="s_det">${T("Προεπιλεγμένη μέγιστη παράκαμψη")}</label><input id="s_det" type="number" min="0.5" max="30" step="0.5" value="${S.settings.detour}">
    <p class="note">${T("Πόσα επιπλέον χιλιόμετρα δέχεσαι από προεπιλογή. Βάλε λίγα αν μένεις σε πόλη με κοντινές δουλειές, περισσότερα αν μένεις σε επαρχία με αραιές αποστάσεις.")}</p>
    <h3 class="sub">${T("Ταμείο")}</h3>
    <button class="btn ghost" data-act="editKinds" style="width:100%">${ic("money",18)} ${T("Είδη κινήσεων")}</button>
    <button class="btn ghost" data-act="editTips" style="width:100%;margin-top:8px">${ic("edit",18)} ${T("Έτοιμες σημειώσεις")}</button>
    <label class="toggle" style="margin-top:16px"><input type="checkbox" id="s_mlock" ${S.settings.moneyLock&&S.settings.moneyLock.on?"checked":""}>${T("Κλείδωμα εμφάνισης")}</label>
    <p class="note">${T("Ζητάει έναν απλό κωδικό πριν ανοίξει το Ταμείο. Δεν κρυπτογραφεί τίποτα, είναι μόνο μια οθόνη ιδιωτικότητας.")}</p>
    ${S.settings.moneyLock&&S.settings.moneyLock.on?`<button class="btn ghost" data-act="changeMoneyPin" style="width:100%">${ic("edit",18)} ${T("Αλλαγή κωδικού")}</button>
      <button class="btn danger" data-act="mlockForgot" style="width:100%;margin-top:8px">${ic("trash",17)} ${T("Ξέχασα τον κωδικό, βγάλε το κλείδωμα")}</button>
      <p class="note">${T("Δεν σβήνει καμία δουλειά ή πελάτη, μόνο βγάζει το κλείδωμα.")}</p>`:""}
    `:""}${group==="work"?`<h3 class="sub">${T("Ποιοι δουλεύουν")}</h3>
    <button class="btn ghost" data-act="managePeople" style="width:100%">${ic("person",18)} ${T("Άτομα και χρώματα")}</button>
    `:""}${group==="work"?`<h3 class="sub">${T("Ειδοποιήσεις και ήχος")}</h3>
    <button class="btn ghost" data-act="notifs" style="width:100%">${ic("sound",18)} ${T("Ήχος, δόνηση και ειδοποιήσεις")}</button>
    `:""}${group==="look"?`<h3 class="sub">${T("Εμφάνιση εφαρμογής")}</h3>
    <button class="btn ghost" data-act="look" style="width:100%">${T("Χρώματα, γράμματα και όνομα")}</button>
    `:""}${group==="data"?`<h3 class="sub">${T("Αντίγραφο ασφαλείας")}</h3><p class="note">${backupStatus()}</p>
    <button class="btn amber" data-act="backup" style="width:100%">${T("Αντίγραφο ασφαλείας και επαναφορά")}</button>
    `:""}${group==="data"?`<h3 class="sub">${T("Τοποθεσία")}</h3>
    <button class="btn ghost" id="s_geo" style="width:100%">${ic("pin",18)} ${T("Έλεγχος άδειας τοποθεσίας")}</button>
    <div id="s_geoOut" class="lw-status"></div>
    `:""}${group==="data"?`<h3 class="sub">${T("Επικοινωνία")}</h3>
    <button class="btn ghost" data-act="feedback" style="width:100%">${ic("msg",18)} ${T("Αξιολόγηση και επικοινωνία")}</button>
    `:""}${group==="data"?`<h3 class="sub">${T("Κάδος")}</h3>
    <button class="btn ghost" data-act="bin" style="width:100%">${ic("trash",18)} ${T("Κάδος")} (${S.tasks.filter(x=>!alive(x)).length+S.clients.filter(x=>!alive(x)).length+S.ledger.filter(x=>!alive(x)).length})</button>
    `:""}${group==="data"?`<h3 class="sub">${T("Διαγραφή")}</h3><button class="btn danger" id="s_wipe" style="padding-left:0">${T("Διαγραφή όλων των δεδομένων")}</button>
    <button class="btn ghost" data-act="checkUpdate" style="width:100%;margin-top:18px">${ic("shield",18)} ${T("Έλεγχος για νεότερη έκδοση")}</button>
    <p class="verline">${T("Δρομολόγιο")} · ${T("Έκδοση")} ${APP_VERSION}<br>${T("Ανέβηκε")} ${APP_BUILD}</p>`:""}`});
  if($("#s_lang")){segBind("s_lang",LANG);$("#s_lang")._on=v=>setLang(v)}
  if($("#lk_clock")){segBind("lk_clock",S.settings.clock==="native"?"native":"app");
    $("#lk_clock")._on=v=>{S.settings.clock=v;if(v==="app")S.settings.splitTime=true;write();render();
      toast(v==="app"?T("Η ώρα ανοίγει με το στρογγυλό ρολόι της εφαρμογής."):T("Η ώρα ανοίγει με τον επιλογέα του κινητού."));
      setTimeout(()=>settingsGroupSheet("look"),60)}}
  if($("#lk_dt")){segBind("lk_dt",S.settings.splitTime?"1":"0");
    $("#lk_dt")._on=v=>{S.settings.splitTime=v==="1";write();render();setTimeout(()=>settingsGroupSheet("look"),60)}}
  if($("#s_det"))$("#s_det").onchange=e=>{const x=parseFloat(e.target.value);if(x>0){S.settings.detour=x;route.limit=null;write()}};
  if($("#s_mlock"))$("#s_mlock").onchange=e=>{
    const ml=S.settings.moneyLock||(S.settings.moneyLock={on:false,pin:""});
    if(e.target.checked){
      const p1=(prompt(T("Όρισε έναν απλό κωδικό, π.χ. 4 ψηφία:"))||"").trim();
      if(!p1){e.target.checked=false;return}
      ml.on=true;ml.pin=p1;write();toast(T("Το κλείδωμα ενεργοποιήθηκε."));
    }else{
      if(ml.pin){
        const p=prompt(T("Γράψε τον τρέχοντα κωδικό για να το απενεργοποιήσεις:"));
        if(p!==ml.pin){e.target.checked=true;toast(T("Λάθος κωδικός."));return}
      }
      ml.on=false;write();toast(T("Το κλείδωμα απενεργοποιήθηκε."));
    }
    settingsSheet("work");
  };
  if($("#s_geo"))$("#s_geo").onclick=async()=>{
    const out=$("#s_geoOut");out.className="lw-status";out.textContent=T("Έλεγχος…");
    const info=await geoReport();
    if(!navigator.geolocation){out.className="lw-status warn";out.textContent=info;return}
    navigator.geolocation.getCurrentPosition(
      p=>{out.className="lw-status ok";out.textContent=info+"\n"+T("Η θέση βρέθηκε")+": "+fmtLL({lat:p.coords.latitude,lng:p.coords.longitude})},
      e=>{out.className="lw-status warn";out.textContent=info+"\n"+T("Σφάλμα")+" "+e.code+": "+(e.message||"")},
      {enableHighAccuracy:true,timeout:15000,maximumAge:0});
  };
  if($("#s_wipe"))$("#s_wipe").onclick=()=>{if(confirm(T("Να διαγραφούν όλοι οι πελάτες, οι εργασίες και οι υπενθυμίσεις;"))&&confirm(T("Σίγουρα; Δεν αναιρείται."))){const keep={look:S.settings.look,lang:S.settings.lang};S=fix({});Object.assign(S.settings,keep);write();closeSheet();view="today";render();toast(T("Όλα διαγράφηκαν."))}};
}
const standalone=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream;
let installPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;
  if($("#s_instNote"))$("#s_instNote").textContent=installNote()});
window.addEventListener("appinstalled",()=>{installPrompt=null;S.settings.installBannerOff=true;write();$("#instBar")?.remove();toast(T("Η εφαρμογή εγκαταστάθηκε."))});
function installNote(){
  if(standalone())return T("Η εφαρμογή είναι ήδη εγκατεστημένη και τρέχει σε δικό της παράθυρο.");
  if(localFile())return T("Τρέχει ως αρχείο. Η εγκατάσταση γίνεται μόνο από τη διεύθυνσή της στο διαδίκτυο.");
  if(isIOS())return T("Στο iPhone πάτα το κουμπί για τις οδηγίες του Safari, βήμα βήμα.");
  if(installPrompt)return T("Πάτα εγκατάσταση για να μπει σαν κανονική εφαρμογή, με δικό της εικονίδιο.");
  return T("Αν το κουμπί δεν δουλέψει, άνοιξε το μενού με τις τρεις τελείες του Chrome και διάλεξε «Προσθήκη στην αρχική οθόνη» ή «Εγκατάσταση εφαρμογής».");
}
function iosInstallSheet(){
  openSheet({title:T("Εγκατάσταση στο iPhone"),cancelLabel:T("Κατάλαβα"),body:`
    <div class="ioststep"><b>1</b><span>${T("Άνοιξε αυτή τη σελίδα στο Safari, όχι σε άλλο πρόγραμμα περιήγησης.")}</span></div>
    <div class="ioststep"><b>2</b><span>${T("Πάτα το κουμπί «Κοινή χρήση» ")}${ic("shareios",18)}${T(" κάτω από τη γραμμή διευθύνσεων.")}</span></div>
    <div class="ioststep"><b>3</b><span>${T("Κύλισε και πάτα «Προσθήκη στην Αρχική οθόνη».")}</span></div>
    <div class="ioststep"><b>4</b><span>${T("Πάτα «Προσθήκη» πάνω δεξιά. Το εικονίδιο θα εμφανιστεί στην αρχική οθόνη σου.")}</span></div>`});
}
async function doInstallSmart(){
  if(standalone()){toast(T("Η εφαρμογή είναι ήδη εγκατεστημένη."));return}
  if(isIOS()){iosInstallSheet();return}
  await doInstall();
}
async function doInstall(){
  if(standalone()){toast(T("Η εφαρμογή είναι ήδη εγκατεστημένη."));return}
  if(localFile()){toast(T("Τρέχει ως αρχείο. Η εγκατάσταση γίνεται μόνο από τη διεύθυνσή της στο διαδίκτυο."));return}
  if(installPrompt){
    installPrompt.prompt();
    try{const r=await installPrompt.userChoice;if(r&&r.outcome!=="accepted")toast(T("Η εγκατάσταση ακυρώθηκε."))}catch(e){}
    installPrompt=null;return;
  }
  await initSW();
  toast(T("Το Chrome δεν έδωσε κουμπί εγκατάστασης. Μενού τρεις τελείες → «Προσθήκη στην αρχική οθόνη»."));
}
function setLang(v){LANG=v;S.settings.lang=v;write();applyLook();render();settingsSheet("look")}
function placeSheet(kind,idx){
  const isBase=kind==="base",cur=isBase?(S.settings.base||{name:T("Έδρα")}):(idx!=null?S.areas[idx]:{name:""});
  openSheet({title:isBase?T("Σπίτι ή έδρα"):idx!=null?T("Επεξεργασία τοποθεσίας"):T("Νέα τοποθεσία"),cancelLabel:T("Πίσω"),onCancel:settingsSheet,
    body:`<label for="p_name">${T("Όνομα")}</label><input id="p_name" value="${esc(cur.name)}" placeholder="${T("π.χ. Σπίτι, Αποθήκη")}">
    ${isBase?`<label for="p_area">${T("Περιοχή")}</label><input id="p_area" list="areaList" autocomplete="off" value="${esc(cur.area)}">`:""}
    ${lwHTML({showAddr:true,address:cur.address})}`,
    onSave:()=>{
      const name=val("p_name");if(!name){toast(T("Γράψε όνομα."));return false}
      const area=isBase?val("p_area"):"";
      if(!LW.loc&&!findArea(area)){LW.attempted=true;LW.upd();toast(T("Βάλε τοποθεσία: διεύθυνση, σημείο στον χάρτη ή «Είμαι εκεί τώρα»."));return false}
      const o={name,area,address:val("lw_addr"),lat:LW.loc?LW.loc.lat:null,lng:LW.loc?LW.loc.lng:null};
      if(isBase){S.settings.base=o;if(!route.fromGeo)route.from=""}
      else{if(AREAS.some(a=>norm(a[0])===norm(name))||S.areas.some((a,i)=>i!==idx&&norm(a.name)===norm(name))){toast(T("Υπάρχει ήδη τοποθεσία με αυτό το όνομα."));return false}
        if(!o.lat){const a=findArea(area);o.lat=a.lat;o.lng=a.lng}
        if(idx!=null)S.areas[idx]=o;else S.areas.push(o)}
      persist();render();toast(T("Αποθηκεύτηκε."));settingsSheet();return"replaced";
    },
    onDelete:(isBase&&S.settings.base)||(!isBase&&idx!=null)?()=>{if(isBase){S.settings.base=null;route.from=""}else S.areas.splice(idx,1);persist();render();settingsSheet();return"replaced"}:null,
    deleteMsg:T("Να διαγραφεί η τοποθεσία;")});
  lwBind({loc:cur.lat!=null?{lat:cur.lat,lng:cur.lng}:null,addr:()=>[val("lw_addr"),val("p_area")].filter(Boolean).join(", "),area:()=>val("p_area")});
}
const PCOLORS=["#7FA8D9","#E8A49C","#8FC7AE","#C0A8DE","#EBC27D","#8FC4CC","#E3A8C4","#AEB6C2","#9DD0C7","#D9C08F","#B9C48F","#D7A9A0"];
function peopleSheet(back){
  openSheet({title:T("Ποιοι δουλεύουν"),cancelLabel:T("Πίσω"),onCancel:back||null,body:
    `<p class="note">${T("Ό,τι προσθέσεις εδώ εμφανίζεται στη νέα εργασία, με το χρώμα του.")}</p>`+
    panel(people().map((p,i)=>`<div class="row" style="cursor:default;align-items:center"><span class="who" style="background:${p.color};width:26px;height:26px">${esc(initials(p.name))}</span>
      <div class="grow"><input class="pname" data-i="${i}" value="${esc(p.name)}" style="border:0;padding:6px 0;font-weight:700;background:none"></div>
      <button class="swatch" data-pal="${i}" style="background:${p.color}" aria-label="${T("Χρώμα")}"></button>
      ${people().length>1?`<button class="x bin" data-pdel="${i}" aria-label="${T("Διαγραφή")}">${ic("trash",19)}</button>`:""}</div>`).join(""))+
    `<div class="inrow" style="margin-top:10px"><input id="p_new" placeholder="${T("Όνομα ή ομάδα")}" autocomplete="off"><button class="btn ghost" id="p_add">${T("Προσθήκη")}</button></div>
     <div id="palBox"></div>`});
  const refresh=()=>{peopleSheet(back);render()};
  $("#shBody").addEventListener("change",e=>{
    const n=e.target.closest(".pname");
    if(n){people()[+n.dataset.i].name=n.value.trim()||T("Άτομο");write();render()}});
  $("#shBody").addEventListener("click",e=>{
    const sw=e.target.closest("[data-pal]");if(!sw)return;
    const i=+sw.dataset.pal,box=$("#palBox");
    box.innerHTML=`<label>${T("Χρώμα για {n}",{n:esc(people()[i].name)})}</label><div class="palette">${PCOLORS.map(col=>`<button type="button" class="${people()[i].color===col?"on":""}" data-col="${col}" style="background:${col}" aria-label="${col}"></button>`).join("")}</div>`;
    box.scrollIntoView({block:"nearest",behavior:"smooth"});
    box.querySelector(".palette").onclick=ev=>{const c=ev.target.closest("[data-col]");if(!c)return;
      people()[i].color=c.dataset.col;write();refresh()};});
  $("#shBody").addEventListener("click",e=>{const d=e.target.closest("[data-pdel]");if(!d)return;
    const i=+d.dataset.pdel,pid=people()[i].id;
    if(!confirm(T("Να αφαιρεθεί από τη λίστα;")))return;
    people().splice(i,1);S.tasks.forEach(t=>{t.who=(t.who||[]).filter(w=>w!==pid);if(!t.who.length)t.who=[people()[0].id]});
    write();refresh()});
  $("#p_add").onclick=()=>{const n=val("p_new");if(!n){toast(T("Γράψε όνομα."));return}
    people().push({id:uid(),name:n,color:PCOLORS[people().length%PCOLORS.length],on:true});write();refresh()};
}
let fbRating=0;
function feedbackSheet(){
  fbRating=+S.settings.appRating||0;
  openSheet({title:T("Αξιολόγηση και επικοινωνία"),cancelLabel:T("Πίσω"),onCancel:settingsSheet,body:`
    <p class="note">${T("Πες μας πώς σου φαίνεται η εφαρμογή και τι θα ήθελες να προστεθεί.")}</p>
    <div class="panel"><div class="starwrap"><span class="lbl">${T("Πόσο σου αρέσει")}</span><div id="fb_stars">${starsHTML(fbRating,null,26)}</div></div></div>
    <label for="fb_text">${T("Το μήνυμά σου")}</label>
    <textarea id="fb_text" rows="5" placeholder="${T("π.χ. θα ήθελα να προσθέσετε…")}"></textarea>
    <label for="fb_from">${T("Πού να σου απαντήσουμε")} <span style="font-weight:600;color:var(--muted)">${T("(προαιρετικό)")}</span></label>
    <input id="fb_from" type="email" value="${esc(S.settings.backupEmail)}" placeholder="${T("άφησέ το κενό αν δεν θέλεις απάντηση")}">
    <button class="btn amber wide gobtn" id="fb_send">${ic("msg",20)}${T("Αποστολή")}</button>
    <p class="note">${T("Αν δεν σταλεί από την εφαρμογή, ανοίγει το πρόγραμμα ταχυδρομείου σου με το μήνυμα έτοιμο.")}</p>`});
  bindStars($("#fb_stars").firstElementChild,()=>fbRating,v=>{fbRating=v;S.settings.appRating=v;write()});
  $("#fb_send").onclick=async()=>{
    const txt=val("fb_text");if(!txt&&!fbRating){toast(T("Γράψε μήνυμα ή βάλε αστέρια."));return}
    const subject=T("Δρομολόγιο")+" — "+(fbRating?(fbRating>=6?T("Κορυφαίος πελάτης"):fbRating+"/5"):T("Σχόλιο"));
    const body=[txt,"",T("Αξιολόγηση")+": "+(fbRating>=6?"6 (💎)":fbRating+"/5"),T("Απάντηση στο")+": "+(val("fb_from")||"—"),
      T("Έκδοση")+": "+(S.settings.look.title||T("Δρομολόγιο"))].join("\n");
    const b=$("#fb_send");b.disabled=true;b.textContent=T("Αποστολή…");
    let sent=false;
    if(mailReady()){
      try{
        const c=ejCfg();
        const r=await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({service_id:c.service,template_id:c.template,user_id:c.key,template_params:{
            user_email:DEV_EMAIL,to_email:DEV_EMAIL,app_name:T("Δρομολόγιο"),subject,date:new Date().toLocaleString(LOC()),message:body,backup_data:body,file_name:"feedback.txt"}})});
        sent=r.ok;
      }catch(e){}
    }
    b.disabled=false;b.innerHTML=ic("msg",20)+T("Αποστολή");
    if(sent){toast(T("Ευχαριστούμε! Το μήνυμα στάλθηκε."));closeSheet()}
    else{location.href=`mailto:${DEV_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast(T("Ανοίγει το ταχυδρομείο σου για να το στείλεις."))}
  };
}
function notifSheet(){
  const st=S.settings;
  if(canNotify()&&Notification.permission==="granted"&&!st.notify){st.notify=true;write()}
  if(canNotify()&&Notification.permission==="granted")initSW();
  openSheet({title:T("Ειδοποιήσεις και ήχος"),cancelLabel:T("Πίσω"),onCancel:settingsSheet,body:`
    <label>${T("Ήχος υπενθύμισης")}</label>
    <div id="soundList">${Object.entries(SOUNDS).map(([k,v])=>`<button type="button" class="optrow ${st.sound===k?"on":""}" data-snd="${k}">${T(v.name)}${st.sound===k?'<span class="tick">✓</span>':""}<span class="n">${k==="none"?"":T("Δοκιμή")} ▶</span></button>`).join("")}</div>
    <label>${T("Δικοί σου ήχοι")}</label>
    <div id="customSndList">${(st.customSounds||[]).map((c,i)=>`<div class="row listedit sndrow ${st.sound===c.id?"on2":""}" style="align-items:center">
        <button type="button" class="sndsel" data-sndsel="${c.id}" aria-label="${T("Επιλογή")}">${st.sound===c.id?ic("ask",18).replace("ask","check"):""}${st.sound===c.id?"✓":"○"}</button>
        <div class="grow"><div class="title">${esc(c.name)}</div>${c.persistent?`<div class="meta"><span>${T("επίμονος, σαν ξυπνητήρι")}</span></div>`:""}</div>
        <button type="button" class="mini" data-sndplay="${c.id}" aria-label="${T("Δοκιμή")}">▶</button>
        <button type="button" class="mv" data-sndmv="${i}" data-dir="up">▲</button><button type="button" class="mv" data-sndmv="${i}" data-dir="down">▼</button>
        <button type="button" class="x bin" data-snddel="${i}" aria-label="${T("Διαγραφή")}">${ic("trash",18)}</button></div>`).join("")||`<p class="note">${T("Δεν έχεις ανεβάσει δικό σου ήχο ακόμα.")}</p>`}</div>
    <label class="btn ghost wide filebtn" style="text-align:center;margin-top:2px">${ic("plus",16)} ${T("Ανέβασμα δικού σου ήχου")}<input type="file" id="snd_file" accept="audio/*" hidden></label>
    <label class="toggle"><input type="checkbox" id="n_debt" ${st.debtAlert?"checked":""}>${T("Ειδοποίηση όταν πλησιάζω πελάτη που χρωστάει")}</label>
    <label class="toggle" style="margin-top:16px"><input type="checkbox" id="n_vib" ${st.vibrate?"checked":""}>${T("Δόνηση")}</label>
    <h3 class="sub">${T("Ειδοποιήσεις κινητού")}</h3>
    <div class="lw-status ${!canNotify()?"warn":Notification.permission==="granted"?"ok":Notification.permission==="denied"?"warn":""}">${
      !canNotify()?T("Η συσκευή δεν υποστηρίζει ειδοποιήσεις."):
      Notification.permission==="granted"?T("Άδεια ειδοποιήσεων: δόθηκε."):
      Notification.permission==="denied"?T("Άδεια ειδοποιήσεων: μπλοκαρισμένη από το Chrome."):T("Άδεια ειδοποιήσεων: θα ζητηθεί την πρώτη φορά.")}</div>
    <p class="note">${T("Εμφανίζονται στο πάνω μέρος της οθόνης, ακόμα και όταν κοιτάς άλλη εφαρμογή, όσο η εφαρμογή μένει ανοιχτή σε καρτέλα.")}</p>
    <label class="toggle"><input type="checkbox" id="n_on" ${st.notify&&canNotify()&&Notification.permission==="granted"?"checked":""}>${T("Ειδοποιήσεις στην οθόνη του κινητού")}</label>
    <button type="button" class="btn ghost wide" id="n_test">${T("Δοκιμαστική ειδοποίηση")}</button>
    <p class="note">${T("Για να χτυπάει και με την εφαρμογή τελείως κλειστή χρειάζεται η έκδοση εγκατάστασης για Android. Η ιστοσελίδα μπορεί να ειδοποιεί μόνο όσο μένει ανοιχτή.")}</p>`});
  $("#customSndList").onclick=e=>{
    const sel=e.target.closest("[data-sndsel]"),play=e.target.closest("[data-sndplay]"),mv=e.target.closest("[data-sndmv]"),del=e.target.closest("[data-snddel]");
    if(sel){st.sound=sel.dataset.sndsel;write();playSound(st.sound,false);notifSheet();return}
    if(play){playSound(play.dataset.sndplay,false);return}
    if(mv){const i=+mv.dataset.sndmv,j=i+(mv.dataset.dir==="up"?-1:1),arr=st.customSounds;
      if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];write();notifSheet();return}
    if(del){const i=+del.dataset.snddel,c=st.customSounds[i];
      if(!confirm(T("Να διαγραφεί ο ήχος «{n}»;",{n:c.name})))return;
      if(st.sound===c.id)st.sound="chime";
      st.customSounds.splice(i,1);write();notifSheet();return}
  };
  $("#snd_file").onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>900000){toast(T("Ο ήχος είναι πολύ μεγάλος. Διάλεξε κάτι κάτω από 1MB."));e.target.value="";return}
    const rd=new FileReader();
    rd.onload=()=>{
      const name=(f.name||T("Ήχος")).replace(/\.[a-z0-9]+$/i,"").slice(0,40);
      const persistent=confirm(T("Να παίζει επίμονα σαν ξυπνητήρι, μέχρι να τον σταματήσεις;"));
      st.customSounds.push({id:uid(),name,dataUrl:rd.result,persistent});
      write();toast(T("Ο ήχος προστέθηκε."));notifSheet();
    };
    rd.onerror=()=>toast(T("Το αρχείο δεν διαβάστηκε."));
    rd.readAsDataURL(f);
  };
  $("#soundList").onclick=e=>{const b=e.target.closest("[data-snd]");if(!b)return;
    st.sound=b.dataset.snd;write();playSound(st.sound,false);
    $("#soundList").querySelectorAll("[data-snd]").forEach(x=>{const on=x.dataset.snd===st.sound;x.classList.toggle("on",on);
      const t=x.querySelector(".tick");if(t)t.remove();if(on)x.insertAdjacentHTML("beforeend",'<span class="tick">✓</span>')})};
  $("#n_debt").onchange=e=>{st.debtAlert=e.target.checked;write();updateWatch();toast(e.target.checked?T("Ενεργό. Θα σε ειδοποιώ όταν είσαι κοντά σε οφειλέτη."):T("Ανενεργό."))};
  $("#n_vib").onchange=e=>{st.vibrate=e.target.checked;write();if(st.vibrate&&navigator.vibrate)navigator.vibrate(120)};
  $("#n_on").onchange=async e=>{if(e.target.checked){const ok=await askNotify();e.target.checked=ok;if(ok)toast(T("Οι ειδοποιήσεις ενεργοποιήθηκαν."))}else{st.notify=false;write()}};
  $("#n_test").onclick=async()=>{
    if(Notification.permission!=="granted"&&!await askNotify())return;
    if(!S.settings.notify){S.settings.notify=true;write()}
    playSound(undefined,false);if(st.vibrate&&navigator.vibrate)navigator.vibrate([200,100,200]);
    const ok=await phoneNotify(T("Δοκιμαστική ειδοποίηση"),T("Έτσι θα φαίνονται οι υπενθυμίσεις σου."),"test");
    toast(ok?T("Στάλθηκε. Δες την επάνω στην οθόνη."):T("Η ειδοποίηση δεν εμφανίστηκε. Χρειάζεται το αρχείο sw.js δίπλα στην εφαρμογή."));
    notifSheet();};
}
function lookSheet(){
  const Lk=S.settings.look,cur=lookVals();
  openSheet({title:T("Εμφάνιση εφαρμογής"),cancelLabel:T("Πίσω"),onCancel:settingsSheet,body:`
    <label>${T("Έτοιμα θέματα")}</label><div class="presets" id="lk_presets">${Object.entries(PRESETS).map(([k,p])=>`<button type="button" class="preset ${Lk.preset===k?"on":""}" data-p="${k}"><span style="background:${p.brand}"></span><span style="background:${p.accent}"></span><span style="background:${p.paper}"></span><em>${T(p.name)}</em></button>`).join("")}</div>
    <label>${T("Δικά σου χρώματα")}</label><div class="colors">
    ${[["brand","Κεφαλίδα και κουμπιά"],["accent","Τονισμός"],["paper","Φόντο"],["ink","Γράμματα"]].map(([k,l])=>`<label class="colorrow"><input type="color" data-c="${k}" value="${cur[k]}"><span>${T(l)}</span></label>`).join("")}</div>
    <label>${T("Μέγεθος γραμμάτων")}</label><div class="seg" id="lk_z"><button type="button" data-v="1">${T("Κανονικά")}</button><button type="button" data-v="1.12">${T("Μεγάλα")}</button><button type="button" data-v="1.25">${T("Πολύ μεγάλα")}</button></div>
    <label>${T("Φόντο εφαρμογής")}</label>
    <div class="seg" id="lk_bg"><button type="button" data-v="art">${T("Εικόνα")}</button><button type="button" data-v="none">${T("Απλό")}</button></div>
    <label for="lk_bgop">${T("Πόσο έντονο")}: <b id="bgopV">${Math.round((Lk.bgOpacity??0.1)*100)}%</b></label>
    <input type="range" id="lk_bgop" min="0.03" max="0.45" step="0.01" value="${Lk.bgOpacity??0.1}">
    <div class="lw-row"><label class="lwbtn pick" style="margin:0">${ic("map",18)}${T("Δική μου εικόνα φόντου")}<input type="file" id="lk_bgfile" accept="image/*" hidden></label>
      <button type="button" class="lwbtn" id="lk_bgreset">${T("Επαναφορά εικόνας")}</button></div>
    <label class="toggle" style="margin-top:14px"><input type="checkbox" id="lk_icon" ${Lk.icon===false?"":"checked"}>${T("Εικονίδιο στην κεφαλίδα")}</label>
    <label for="lk_title">${T("Όνομα εφαρμογής")}</label><input id="lk_title" value="${esc(Lk.title)}" placeholder="${T("Δρομολόγιο")}">
    <button type="button" class="btn ghost wide" id="lk_reset">${T("Επαναφορά αρχικής εμφάνισης")}</button>`});
  const refresh=()=>{const v=lookVals();document.querySelectorAll("[data-c]").forEach(i=>i.value=v[i.dataset.c]);document.querySelectorAll(".preset").forEach(b=>b.classList.toggle("on",b.dataset.p===Lk.preset))};
  $("#lk_presets").onclick=e=>{const b=e.target.closest("[data-p]");if(!b)return;Object.assign(Lk,{preset:b.dataset.p,brand:"",accent:"",paper:"",ink:""});write();applyLook();refresh()};
  document.querySelectorAll("[data-c]").forEach(i=>i.oninput=()=>{Lk[i.dataset.c]=i.value;write();applyLook()});
  segBind("lk_z",String(Lk.zoom||1));$("#lk_z")._on=v=>{Lk.zoom=+v;write();applyLook();render()};
  segBind("lk_bg",Lk.bg||"art");$("#lk_bg")._on=v=>{Lk.bg=v;write();applyLook()};
  $("#lk_bgop").oninput=e=>{Lk.bgOpacity=+e.target.value;$("#bgopV").textContent=Math.round(Lk.bgOpacity*100)+"%";write();applyLook()};
  $("#lk_icon").onchange=e=>{Lk.icon=e.target.checked;write();applyLook()};
  $("#lk_bgreset").onclick=()=>{Lk.customBg="";Lk.bg="art";write();applyLook();lookSheet()};
  $("#lk_bgfile").onchange=e=>{const f=e.target.files[0];if(!f)return;
    const img=new Image(),rd=new FileReader();
    rd.onload=()=>{img.onload=()=>{
      const side=560,cv=document.createElement("canvas");cv.width=cv.height=side;
      const k=Math.max(side/img.width,side/img.height),w=img.width*k,h=img.height*k;
      cv.getContext("2d").drawImage(img,(side-w)/2,(side-h)/2,w,h);
      try{Lk.customBg=cv.toDataURL("image/webp",0.7);Lk.bg="art";write();applyLook();toast(T("Η εικόνα μπήκε ως φόντο."))}
      catch(err){toast(T("Η εικόνα δεν αποθηκεύτηκε."))}};img.src=rd.result};
    rd.readAsDataURL(f);e.target.value=""};
  $("#lk_title").oninput=e=>{Lk.title=e.target.value.trim();write();applyLook()};
  $("#lk_reset").onclick=()=>{Object.assign(Lk,{preset:"classic",brand:"",accent:"",paper:"",ink:"",zoom:1,title:"",bg:"art",bgOpacity:0.1,icon:true,customBg:"",customIcon:""});write();applyLook();render();lookSheet()};
}

