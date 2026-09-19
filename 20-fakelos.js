/* Δρομολόγιο — Κοινός φάκελος αντιγράφων ασφαλείας.
   Ίδιος μηχανισμός με το «Ιστορικό οχημάτων»: όλες οι εφαρμογές στο aglentzakis-dot.github.io
   μοιράζονται τον ίδιο φάκελο (π.χ. Λήψεις/Backup), αποθηκευμένο στο IndexedDB
   (βάση "shared-backups", έκδοση 1, αποθήκη "handles", κλειδί "root").
   Το Δρομολόγιο γράφει μόνο στον δικό του υποφάκελο «Δρομολόγιο», ένα αρχείο ανά ημέρα.
   Όπου δεν υποστηρίζεται (iPhone, Firefox) ή ο χρήστης αρνηθεί, γίνεται κανονική λήψη του αρχείου. */

const FD_DB="shared-backups",FD_VER=1,FD_STORE="handles",FD_KEY="root",FD_SUB="Δρομολόγιο";
const fdSupported=()=>typeof window.showDirectoryPicker==="function"&&typeof indexedDB!=="undefined";
let fdRoot=null;   // ο κοινός φάκελος (κρατιέται και στη μνήμη, για να μη χάνεται το πάτημα του κουμπιού σε αναμονές)

function fdDB(){return new Promise((ok,no)=>{
  const r=indexedDB.open(FD_DB,FD_VER);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(FD_STORE))r.result.createObjectStore(FD_STORE)};
  r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function fdTx(mode,fn){const db=await fdDB();
  return new Promise((ok,no)=>{const tx=db.transaction(FD_STORE,mode),st=tx.objectStore(FD_STORE),rq=fn(st);
    tx.oncomplete=()=>{db.close();ok(rq&&rq.result)};tx.onerror=tx.onabort=()=>{db.close();no(tx.error)}})}
async function fdGet(){if(!fdSupported())return null;try{fdRoot=(await fdTx("readonly",s=>s.get(FD_KEY)))||null}catch(e){fdRoot=null}return fdRoot}
async function fdSet(h){await fdTx("readwrite",s=>s.put(h,FD_KEY));fdRoot=h}
async function fdDel(){await fdTx("readwrite",s=>s.delete(FD_KEY));fdRoot=null}   // σβήνει ΜΟΝΟ το κλειδί, όχι τα αρχεία

const fdLabel=()=>fdRoot?`${fdRoot.name} / ${FD_SUB}`:"";
async function fdPick(){
  const h=await window.showDirectoryPicker({id:"backups",mode:"readwrite",startIn:"downloads"});
  await fdSet(h);return h;
}
// Άδεια εγγραφής: πρώτα ερώτηση χωρίς παράθυρο· αν δεν έχει δοθεί, αίτημα (μέσα στο πάτημα του κουμπιού).
async function fdPerm(h,ask){
  const o={mode:"readwrite"};
  if(await h.queryPermission(o)==="granted")return true;
  if(!ask)return false;
  return (await h.requestPermission(o))==="granted";
}
// Βρίσκει τον φάκελο (από εδώ ή από άλλη εφαρμογή) ή ζητά να διαλεχτεί, και εξασφαλίζει άδεια.
async function fdReady(){
  let h=fdRoot||await fdGet();
  if(!h)h=await fdPick();
  if(!await fdPerm(h,true))throw new Error("denied");
  return h;
}
async function fdSub(h){return h.getDirectoryHandle(FD_SUB,{create:true})}
async function fdWrite(h){
  const dir=await fdSub(h),name=fileName("json");
  const fh=await dir.getFileHandle(name,{create:true}),w=await fh.createWritable();
  await w.write(backupPayload());await w.close();
  return name;
}

// Κουμπί «Αποθήκευση»: στον κοινό φάκελο, αλλιώς κανονική λήψη ώστε να μη χαθεί ποτέ το αντίγραφο.
async function saveBackupFile(){
  if(!fdSupported()){downloadBackup();return}
  try{
    const h=await fdReady(),name=await fdWrite(h);
    S.meta.lastFolder=Date.now();markBackup();fdPaint();
    toast(T("Αποθηκεύτηκε στο {f}: {n}",{f:fdLabel(),n:name}));
  }catch(e){
    downloadBackup();
    if(e&&e.name==="AbortError")toast(T("Δεν διάλεξες φάκελο. Το αντίγραφο αποθηκεύτηκε στις λήψεις."));
    else if(e&&e.message==="denied")toast(T("Δεν δόθηκε άδεια για τον φάκελο. Το αντίγραφο αποθηκεύτηκε στις λήψεις."));
    else toast(T("Ο φάκελος δεν είναι διαθέσιμος. Το αντίγραφο αποθηκεύτηκε στις λήψεις."));
  }
}
async function fdChoose(){
  if(!fdSupported()){toast(T("Αυτός ο φυλλομετρητής δεν υποστηρίζει κοινό φάκελο. Τα αντίγραφα αποθηκεύονται στις λήψεις."));return}
  try{const h=await fdPick();await fdSub(h);fdPaint();toast(T("Ο φάκελος αντιγράφων ορίστηκε: {f}",{f:fdLabel()}))}
  catch(e){if(!e||e.name!=="AbortError")toast(T("Ο φάκελος δεν ορίστηκε."))}
}
async function fdClear(){
  if(!fdRoot&&!await fdGet())return;
  if(!confirm(T("Να σταματήσει η χρήση του φακέλου «{f}»;\n\nΤα αρχεία που είναι ήδη εκεί ΔΕΝ σβήνονται.\n\nΠροσοχή: ο φάκελος είναι κοινός, οπότε θα σταματήσει να χρησιμοποιείται από ΟΛΕΣ τις εφαρμογές σου μέχρι να τον ξαναδιαλέξεις.",{f:fdLabel()})))return;
  try{await fdDel()}catch(e){}
  fdPaint();toast(T("Ο φάκελος αντιγράφων αφαιρέθηκε. Τα αρχεία έμειναν όπως ήταν."));
}

// Επαναφορά: τα 10 νεότερα αρχεία του υποφακέλου, το πρώτο με σήμανση «νεότερο».
async function fdRestoreSheet(){
  if(!fdSupported()){toast(T("Αυτός ο φυλλομετρητής δεν υποστηρίζει κοινό φάκελο. Διάλεξε «Επαναφορά από αρχείο»."));return}
  let files=[];
  try{
    const h=await fdReady(),dir=await fdSub(h);
    for await(const [n,x] of dir.entries()){
      if(x.kind!=="file"||!/\.(json|txt)$/i.test(n))continue;
      const f=await x.getFile();files.push({n,x,t:f.lastModified,sz:f.size});
    }
  }catch(e){if(!e||e.name!=="AbortError")toast(T("Ο φάκελος δεν είναι διαθέσιμος."));return}
  // ταξινόμηση: η ημερομηνία του ονόματος πρώτα, μετά η ώρα αλλαγής
  const dOf=n=>(n.match(/\d{4}-\d{2}-\d{2}/)||[""])[0];
  files.sort((a,b)=>dOf(b.n).localeCompare(dOf(a.n))||b.t-a.t);files=files.slice(0,10);
  const kb=s=>s<1024?s+" B":(s/1024).toFixed(s<10240?1:0).replace(".",",")+" KB";
  openSheet({title:T("Επαναφορά από τον φάκελο"),cancelLabel:T("Πίσω"),onCancel:()=>backupSheet(),
    body:`<p class="note">${esc(fdLabel())}</p>
      <p class="note">${T("Πάτα ένα αντίγραφο για να γίνει η επαναφορά. Τα τωρινά δεδομένα θα αντικατασταθούν.")}</p>
      ${files.length?panel(files.map((f,i)=>`<button class="optrow" data-fdf="${i}">
        <span class="grow"><b>${esc(f.n)}</b><small style="display:block;color:var(--muted)">${new Date(f.t).toLocaleString(LOC())} · ${kb(f.sz)}</small></span>
        ${i===0?`<span class="chip on" style="pointer-events:none">${T("νεότερο")}</span>`:""}</button>`).join(""))
        :`<div class="empty">${T("Δεν υπάρχουν ακόμα αντίγραφα στον φάκελο.")}</div>`}`});
  $("#shBody").addEventListener("click",async e=>{
    const b=e.target.closest("[data-fdf]");if(!b)return;
    try{restoreFrom(await (await files[+b.dataset.fdf].x.getFile()).text())}catch(er){toast(T("Το αρχείο δεν διαβάστηκε."))}
  });
}

// Ενότητα «Φάκελος αντιγράφων» (Ρυθμίσεις › Δεδομένα και παράθυρο αντιγράφου ασφαλείας)
function fdSettingsHTML(){
  if(!fdSupported())return `<h3 class="sub">${T("Φάκελος αντιγράφων")}</h3>
    <p class="note">${T("Αυτός ο φυλλομετρητής δεν υποστηρίζει κοινό φάκελο (π.χ. iPhone, Firefox). Τα αντίγραφα αποθηκεύονται στις λήψεις.")}</p>`;
  return `<h3 class="sub">${T("Φάκελος αντιγράφων")}</h3>
    <p class="note">${T("Κοινός φάκελος για όλες τις εφαρμογές σου. Το Δρομολόγιο γράφει μόνο στον υποφάκελο «{s}», ένα αρχείο την ημέρα.",{s:FD_SUB})}</p>
    <div class="inrow fdrow"><div class="fdname" data-fdname>${fdRoot?"📁 "+esc(fdLabel()):T("Δεν έχει οριστεί φάκελος")}</div>
      <button type="button" class="btn ghost" data-act="fdClear" data-fdx aria-label="${T("Σταμάτα τη χρήση του φακέλου")}" title="${T("Σταμάτα τη χρήση του φακέλου")}" ${fdRoot?"":"hidden"}>✕</button></div>
    <button type="button" class="btn ghost" data-act="fdChoose" data-fdpick style="width:100%;margin-top:8px">📁 ${fdRoot?T("Αλλαγή φακέλου"):T("Επιλογή φακέλου")}</button>`;
}
// ανανεώνει την ένδειξη όπου φαίνεται, χωρίς να ξανασχεδιάζεται το παράθυρο
function fdPaint(){
  document.querySelectorAll("[data-fdname]").forEach(el=>el.textContent=fdRoot?"📁 "+fdLabel():T("Δεν έχει οριστεί φάκελος"));
  document.querySelectorAll("[data-fdx]").forEach(el=>el.hidden=!fdRoot);
  document.querySelectorAll("[data-fdpick]").forEach(el=>el.textContent="📁 "+(fdRoot?T("Αλλαγή φακέλου"):T("Επιλογή φακέλου")));
  document.querySelectorAll("[data-fdsave]").forEach(el=>el.innerHTML=ic("archive",20)+(fdRoot?T("Αποθήκευση στον φάκελο {f}",{f:esc(fdLabel())}):T("Αποθήκευση αρχείου στο κινητό")));
}

// Σιωπηλή αποθήκευση όταν κλείνεις/κρύβεις την εφαρμογή: μόνο αν υπάρχει ήδη άδεια (χωρίς κανένα παράθυρο).
document.addEventListener("visibilitychange",async()=>{
  if(document.visibilityState!=="hidden"||!fdRoot||!S.meta.changes)return;
  if(typeof isDemo==="function"&&isDemo())return;
  if(Date.now()-(S.meta.lastFolder||0)<10*60000)return;
  try{if(!await fdPerm(fdRoot,false))return;await fdWrite(fdRoot);S.meta.lastFolder=Date.now();write()}catch(e){}
});

fdGet().then(fdPaint);
