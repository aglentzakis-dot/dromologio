/* Δρομολόγιο — Έξυπνη συμπλήρωση και φόρμα εργασίας. */
/* ---------- Έξυπνη συμπλήρωση εργασίας ---------- */
const nrm1=s=>[...String(s)].map(ch=>ch.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()||ch).join("");
const LT="[a-zα-ωϊϋ]";
function stemOf(w){w=norm(w);const m=w.match(/^(.{4,}?)(ος|ας|ης|ου|ων|ες|ο|α|η|ι|ς)$/);return m?m[1]:w}
function bestMatch(n,items){let best=null;
  items.forEach(it=>{const ws=norm(it.name).split(/\s+/).filter(Boolean);if(!ws.length)return;
    const re=new RegExp("(^|[^a-zα-ωϊϋ0-9])("+ws.map(w=>escRe(stemOf(w))+LT+"*").join("\\s+")+")");const m=re.exec(n);
    if(m){const idx=m.index+m[1].length,len=m[2].length;if(!best||len>best.len)best={it,idx,len}}});
  return best}
const PREP=/(?:^|\s)(?:απο τον|απο την|απο το|απο τη|απο|στον|στην|στη|στο|στα|στους|στις|προς|για τον|για την|για το|του|της|τον|την|μεχρι τον|μεχρι την|μεχρι το)\s*$/;
function localParse(txt){
  const n=nrm1(txt),cut=[],now=new Date(),res={found:[]};
  const mark=(i,l)=>{if(l>0)cut.push([i,i+l])};let m,hh=null,mm=0,day=null,isEnd=false;
  const per=p=>p?(/απογευμα|βραδυ|μ\.?μ/.test(p)?"pm":/μεσημερι/.test(p)?"noon":"am"):null;
  const P="(\\s*(?:το\\s+)?(πρωι|μεσημερι|απογευμα|βραδυ|π\\.?μ\\.?|μ\\.?μ\\.?))?";
  const reT=[new RegExp("(?:(?:στις|κατα τις|γυρω στις|απο τις)\\s+)?(\\d{1,2})[:.](\\d{2})"+P),
    new RegExp("(?:στις|κατα τις|γυρω στις|απο τις)\\s+(\\d{1,2})(?![\\d:./])()"+P),
    new RegExp("(\\d{1,2})(?![\\d:./])()\\s*(?:η ωρα\\s*)?(\\s*(?:το\\s+)?(πρωι|μεσημερι|απογευμα|βραδυ))")];
  for(const re of reT){m=re.exec(n);if(m){hh=+m[1];mm=m[2]?+m[2]:0;const p=per(m[4]);if(p==="pm"&&hh<12)hh+=12;if(p==="noon"&&hh<6)hh+=12;if(hh>23||mm>59){hh=null;continue}mark(m.index,m[0].length);break}}
  if(hh==null&&(m=/(?:το\s+)?(πρωι|μεσημερι|απογευμα|βραδυ)/.exec(n))){hh={πρωι:9,μεσημερι:13,απογευμα:18,βραδυ:20}[m[1]];mark(m.index,m[0].length)}
  const WD=["κυριακη","δευτερα","τριτη","τεταρτη","πεμπτη","παρασκευη","σαββατο"];
  if((m=/(?:(μεχρι|εως|ως|το αργοτερο)\s+)?(?:(?:την|τη|το)\s+)?(σημερα|αυριο|μεθαυριο|κυριακη|δευτερα|τριτη|τεταρτη|πεμπτη|παρασκευη|σαββατο)/.exec(n))){
    isEnd=!!m[1];const w=m[2];const d=new Date(now);d.setHours(0,0,0,0);
    if(w==="αυριο")d.setDate(d.getDate()+1);else if(w==="μεθαυριο")d.setDate(d.getDate()+2);
    else if(w!=="σημερα"){let diff=(WD.indexOf(w)-d.getDay()+7)%7;if(diff===0&&hh!=null&&(hh*60+mm)<=now.getHours()*60+now.getMinutes())diff=7;d.setDate(d.getDate()+diff)}
    day=d;mark(m.index,m[0].length)}
  const MON=["ιανουαριου","φεβρουαριου","μαρτιου","απριλιου","μαιου","ιουνιου","ιουλιου","αυγουστου","σεπτεμβριου","οκτωβριου","νοεμβριου","δεκεμβριου"];
  if(!day&&((m=/(?:(μεχρι|εως|ως)\s+(?:τις\s+)?)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/.exec(n))||(m=new RegExp("(?:(μεχρι|εως|ως)\\s+(?:τις\\s+)?)?(\\d{1,2})\\s+("+MON.join("|")+")()").exec(n)))){
    isEnd=!!m[1];const mo=isNaN(+m[3])?MON.indexOf(m[3]):+m[3]-1;let y=m[4]?+m[4]:now.getFullYear();if(y<100)y+=2000;
    const d=new Date(y,mo,+m[2]);if(!m[4]&&d<new Date(now.getFullYear(),now.getMonth(),now.getDate()))d.setFullYear(y+1);
    if(!isNaN(d)){day=d;mark(m.index,m[0].length)}}
  if(hh!=null||day){
    const d=day?new Date(day):new Date(now);d.setSeconds(0,0);
    if(hh!=null)d.setHours(hh,mm);else d.setHours(isEnd?20:9,0);
    if(!day&&d<=now)d.setDate(d.getDate()+1);
    if(isEnd)res.end=toLocalInput(d);else res.start=toLocalInput(d);res.found.push(isEnd?"προθεσμία":"ώρα");
  }
  if((m=/(επειγοντως|επειγον|επειγουσα|αμεσα|οπωσδηποτε|σημαντικο|σημαντικη|βιαστικα)/.exec(n))){res.priority=3;mark(m.index,m[0].length)}
  else if((m=/(οποτε μπορω|οποτε βρω|χαλαρα|δεν βιαζει|δε βιαζει|οχι βιαζει|χωρις βιασυνη)/.exec(n))){res.priority=1;mark(m.index,m[0].length)}
  if((m=/(?:για\s+)?(\d+(?:[.,]\d+)?)\s*(?:ευρω|€)/.exec(n))){res.amount=m[1].replace(",",".");mark(m.index,m[0].length)}
  if((m=/(?:να μου (?:το )?θυμισεις|ειδοποιησε με|υπενθυμιση)\s*(\d+|μια|μιση|ενα)\s*(λεπτα|λεπτο|ωρα|ωρες|μερα|μερες)\s*(?:νωριτερα|πριν)?/.exec(n))){
    const q=m[1]==="μιση"?.5:m[1]==="μια"||m[1]==="ενα"?1:+m[1];res.remindBefore=Math.round(q*(/ωρ/.test(m[2])?60:/μερ/.test(m[2])?1440:1));mark(m.index,m[0].length)}
  const cands=[];S.clients.forEach(c=>{cands.push({name:c.name,c});c.name.split(/\s+/).filter(w=>w.length>=4).forEach(w=>cands.push({name:w,c}))});
  const withPrep=b=>{const before=n.slice(0,b.idx),pm=PREP.exec(before);return pm?[pm.index,b.idx-pm.index+b.len]:[b.idx,b.len]};
  const bc=bestMatch(n,cands);if(bc){res.clientId=bc.it.c.id;const[i,l]=withPrep(bc);mark(i,l)}
  const areaCands=allAreas().map(a=>({name:a.name,a}));const B=baseLoc();if(B)areaCands.push({name:B.label,a:{name:B.label}});
  const ba=bestMatch(n,areaCands);if(ba&&!(bc&&ba.idx<bc.idx+bc.len&&ba.idx+ba.len>bc.idx)){res.area=ba.it.a.name;const[i,l]=withPrep(ba);mark(i,l)}
  if((m=/(?:οδος|οδο|οδου|λεωφορος|λεωφορο|λεωφ\.?)\s+[a-zα-ωϊϋ]+(?:\s+\d+[a-zα-ω]?)?/.exec(n))){res.address=txt.substr(m.index,m[0].length);mark(m.index,m[0].length)}
  if((m=/^\s*(?:θελω|πρεπει|χρειαζεται|θα|να θυμηθω|θυμισε μου|μην ξεχασω)\s+(?:να\s+)?(?:(?:παω|περασω|τρεξω|παμε)(?:\s+(?=απο|στο|στη|στα|προς))?\s*)?/.exec(n)))mark(m.index,m[0].length);
  cut.sort((a,b)=>a[0]-b[0]);let out="",pos=0;cut.forEach(([a,b])=>{if(a>pos)out+=txt.slice(pos,a);pos=Math.max(pos,b)});out+=txt.slice(pos);
  out=out.replace(/\s+/g," ").replace(/^[\s,.;:–-]+|[\s,.;:–-]+$/g,"").replace(/\s+(και|και να)$/i,"").trim();
  // αφαίρεση εισαγωγικών ρημάτων κίνησης που έμειναν μπροστά, π.χ. «να πάω να πάρω…»
  for(let i=0;i<2;i++){const mm=/^\s*(?:να\s+)?(?:παω|περασω|τρεξω|παμε|περασουμε|παρω δρομο)\s+(?=να\s|απο\s|και\s)/i.exec(nrm1(out));
    if(mm)out=out.slice(mm[0].length).replace(/^(και|απο)\s+/i,"").trim();else break}
  out=out.replace(/^\s*(?:να\s+)?(?:παω|περασω)\s*$/i,"").trim();
  // δεν αφήνουμε πρόθεση κρεμασμένη στο τέλος όταν κόβεται ό,τι ακολουθούσε (ώρα, ποσό, πελάτης, περιοχή)
  for(let i=0;i<2;i++){const mp=/\s+(για|σε|στο|στη|στον|στην|με|απο|προς|κατα)\s*$/i.exec(out);if(mp)out=out.slice(0,mp.index).trim();else break}
  res.title=cap(out||txt.trim()).slice(0,90);res.desc=txt.trim();
  return res;
}
async function aiParse(text){
  const url=AI_URL||(inFrame()?"https://api.anthropic.com/v1/messages":"");if(!url)return null;
  const now=new Date();
  const sys=`Μετατρέπεις μια πρόταση σε εργασία για εφαρμογή υπενθυμίσεων. Τώρα: ${toLocalInput(now)}, ${now.toLocaleDateString("el-GR",{weekday:"long"})}. Απάντησε ΜΟΝΟ με έγκυρο JSON, χωρίς άλλο κείμενο, με κλειδιά: title (σύντομος τίτλος με κεφαλαίο πρώτο γράμμα, στη γλώσσα του κειμένου), clientName (όνομα πελάτη ή null), area (περιοχή στην ονομαστική ή null), address (οδός και αριθμός ή null), start (YYYY-MM-DDTHH:MM ή null), end (YYYY-MM-DDTHH:MM ή null για προθεσμία), priority (1, 2 ή 3), amount (αριθμός ή null), remindBefore (λεπτά ή null), notes (επιπλέον λεπτομέρειες ή null). Γνωστοί πελάτες: ${S.clients.map(c=>c.name).join(", ")||"κανένας"}.`;
  const ctrl=new AbortController(),tm=setTimeout(()=>ctrl.abort(),12000);
  try{
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},signal:ctrl.signal,body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:sys,messages:[{role:"user",content:text}]})});
    if(!r.ok)return null;const d=await r.json();const s=(d.content||[]).map(x=>x.text||"").join("").replace(/```json|```/g,"");
    const j=JSON.parse(s.slice(s.indexOf("{"),s.lastIndexOf("}")+1));
    const res={found:[],title:j.title,desc:j.notes?text.trim()+"\n"+j.notes:text.trim(),start:j.start||null,end:j.end||null,priority:j.priority,amount:j.amount,remindBefore:j.remindBefore,address:j.address};
    if(j.clientName){const c=S.clients.find(c=>norm(c.name)===norm(j.clientName))||S.clients.find(c=>norm(c.name).includes(norm(j.clientName))||norm(j.clientName).includes(norm(c.name)));if(c)res.clientId=c.id}
    if(j.area){const a=findArea(j.area)||(bestMatch(nrm1(j.area),allAreas().map(a=>({name:a.name,a})))||{}).it?.a;res.area=a?a.name:j.area}
    return res;
  }catch(e){return null}finally{clearTimeout(tm)}
}
function applyParsed(p){
  const f=[];
  if(p.title){$("#f_title").value=p.title;f.push(T("τίτλος"))}
  if(p.clientId&&getClient(p.clientId)){$("#f_client").value=p.clientId;f.push(T("πελάτης"))}
  else{if(p.area){$("#f_area").value=p.area;f.push(T("περιοχή"))}if(p.address&&$("#lw_addr")){$("#lw_addr").value=p.address;f.push(T("διεύθυνση"))}}
  if(p.start){$("#f_start").value=p.start;f.push(T("ώρα"))}
  if(p.end){$("#f_end").value=p.end;f.push(T("προθεσμία"))}
  if(p.priority&&+p.priority!==2){$("#f_prio")._set(String(p.priority));f.push(T("προτεραιότητα"))}
  if(p.amount){$("#f_amount").value=p.amount;f.push(T("ποσό"))}
  if(p.remindBefore!=null&&p.remindBefore>=0){const best=REMB.filter(x=>x>=0).reduce((a,b)=>Math.abs(b-p.remindBefore)<Math.abs(a-p.remindBefore)?b:a);$("#f_rb").value=best;f.push(T("υπενθύμιση"))}
  if(p.desc&&!val("f_desc"))$("#f_desc").value=p.desc;
  $("#f_client").dispatchEvent(new Event("change"));LW.upd();sheetDirty=true;
  toast(f.length?T("Συμπληρώθηκαν: {x}. Έλεγξέ τα πριν την αποθήκευση.",{x:f.join(", ")}):T("Δεν αναγνωρίστηκαν στοιχεία. Γράψε λίγο πιο αναλυτικά."));
}
async function aiFill(){
  const text=val("ai_text");if(!text){toast(T("Γράψε ή πες πρώτα τι θες να κάνεις."));return}
  const b=$("#ai_go");b.disabled=true;b.textContent=T("Επεξεργασία…");
  let p=await aiParse(text);if(!p||!p.title)p=localParse(text);
  b.disabled=false;b.textContent=T("Αυτόματη συμπλήρωση");applyParsed(p);
}
let micRec=null;
function startMic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast(T("Η υπαγόρευση δεν υποστηρίζεται εδώ. Πάτα το μικρόφωνο του πληκτρολογίου σου."));$("#ai_text").focus();return}
  const b=$("#ai_mic");
  // δεύτερο πάτημα ενώ ακούει = «τελείωσα», σταματάει και συμπληρώνει
  if(micRec){try{micRec.stop()}catch(e){}return}
  const r=micRec=new SR();
  r.lang=LANG==="en"?"en-GB":"el-GR";r.interimResults=false;r.maxAlternatives=1;r.continuous=true;
  b.classList.add("rec");b.setAttribute("aria-label",T("Πάτα ξανά όταν τελειώσεις"));
  toast(T("Μίλα τώρα… σταματάει μόνο του μόλις κάνεις μια μικρή παύση."));
  let said="",silenceT=null;
  const armSilence=()=>{clearTimeout(silenceT);silenceT=setTimeout(()=>{try{r.stop()}catch(e){}},2200)};
  r.onresult=e=>{
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(e.results[i].isFinal)said+=(said?" ":"")+e.results[i][0].transcript;
    }
    $("#ai_text").value=said;
    armSilence();
  };
  armSilence();
  r.onerror=e=>{if(e.error!=="no-speech"&&e.error!=="aborted")toast(e.error==="not-allowed"?T("Δεν δόθηκε άδεια για το μικρόφωνο."):T("Δεν ακούστηκε κάτι. Δοκίμασε ξανά."))};
  r.onend=()=>{clearTimeout(silenceT);b.classList.remove("rec");b.setAttribute("aria-label",T("Υπαγόρευση"));micRec=null;if(val("ai_text"))aiFill()};
  try{r.start()}catch(e){b.classList.remove("rec");micRec=null}
}

function clientPlaceForm(c,idx,back){
  const isNew=idx==null,pl=isNew?{label:"",street:"",number:"",area:"",zip:"",floor:"",lat:null,lng:null}:c.places[idx];
  openSheet({title:isNew?T("Νέα διεύθυνση πελάτη"):T("Επεξεργασία διεύθυνσης"),cancelLabel:T("Πίσω"),onCancel:back,
    saveLabel:isNew?T("Καταχώρηση"):T("Αποθήκευση"),saveStyle:isNew?"amber":"primary",
    body:`<label for="p_lbl">${T("Όνομα διεύθυνσης")}</label><input id="p_lbl" value="${esc(pl.label)}" placeholder="${T("π.χ. Εξοχικό, Αποθήκη, Γραφείο")}">
    <div class="two"><div><label for="f_street">${T("Οδός")}</label><input id="f_street" value="${esc(pl.street)}"></div>
    <div><label for="f_number">${T("Αριθμός")}</label><input id="f_number" value="${esc(pl.number)}"></div></div>
    <div class="two"><div><label for="f_area">${T("Περιοχή")}</label><input id="f_area" list="areaList" autocomplete="off" value="${esc(pl.area)}"></div>
    <div><label for="f_zip">${T("ΤΚ")}</label><input id="f_zip" inputmode="numeric" value="${esc(pl.zip)}"></div></div>
    <label for="p_floor">${T("Όροφος, κουδούνι")}</label><input id="p_floor" value="${esc(pl.floor)}">
    ${lwHTML({showAddr:false})}`,
    onSave:()=>{
      const d={label:val("p_lbl")||val("f_area")||T("Διεύθυνση"),street:val("f_street"),number:val("f_number"),
        area:val("f_area"),zip:val("f_zip"),floor:val("p_floor"),lat:LW.loc?LW.loc.lat:null,lng:LW.loc?LW.loc.lng:null};
      if(!d.street&&!d.area&&!d.lat){toast(T("Βάλε τουλάχιστον περιοχή ή σημείο."));return false}
      if(isNew){d.id=uid();c.places.push(d)}else Object.assign(pl,d);
      persist();render();geocodeClientIfNeeded(c);toast(T("Η διεύθυνση αποθηκεύτηκε."));
      if(back){back();return"replaced"}
    },
    onDelete:isNew?null:()=>{c.places.splice(idx,1);
      S.tasks.forEach(t=>{if(t.clientId===c.id&&t.placeId===pl.id)t.placeId=""});
      persist();render();toast(T("Η διεύθυνση διαγράφηκε."));if(back){back();return"replaced"}},
    deleteMsg:T("Να διαγραφεί η διεύθυνση;")});
  lwBind({loc:pl.lat!=null?{lat:pl.lat,lng:pl.lng}:null,
    addr:()=>[[val("f_street"),val("f_number")].filter(Boolean).join(" "),val("f_area"),val("f_zip")].filter(Boolean).join(", "),
    area:()=>val("f_area")});
}
// βρίσκει μόνη της συντεταγμένες από τη διεύθυνση, ώστε να μπαίνει στις διαδρομές
async function geocodeClientIfNeeded(c,silent){
  const targets=[];
  if(c.lat==null&&(c.street||c.area))targets.push({o:c,q:[[c.street,c.number].filter(Boolean).join(" "),c.area,c.zip].filter(Boolean).join(", ")});
  (c.places||[]).forEach(pl=>{if(pl.lat==null&&(pl.street||pl.area))targets.push({o:pl,q:[[pl.street,pl.number].filter(Boolean).join(" "),pl.area,pl.zip].filter(Boolean).join(", ")})});
  if(!targets.length||localFile())return;
  let found=0;
  for(const t of targets){
    if(!t.q)continue;
    try{
      const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=gr&accept-language=${LANG}&q=${encodeURIComponent(t.q)}`);
      const js=await r.json();
      if(js&&js[0]){t.o.lat=+js[0].lat;t.o.lng=+js[0].lon;found++;if(t.o.area)learnArea(t.o.area,t.o.lat,t.o.lng)}
    }catch(e){}
  }
  if(found){write();render();if(!silent)toast(pl_(found))}
  function pl_(n){return n===1?T("Βρέθηκε η θέση από τη διεύθυνση. Μπήκε στις διαδρομές."):T("Βρέθηκαν {n} θέσεις από τις διευθύνσεις.",{n:found})}
}

/* ---------- Φόρμα εργασίας ---------- */
function drawTaskMoney(x){
  const box=$("#tmoney");if(!box||!x)return;
  const amt=+x.amount||0,got=taskPaid(x),sp=taskSpent(x),rest=rnd(amt-got);
  const restShown=x.status==="waiting"?0:rest; // σε προσφορά δεν υπάρχει ακόμα πραγματικό υπόλοιπο προς είσπραξη
  const owedNow=x.status==="done";
  let payLabel,payCls;
  if(x.paid){payLabel=T("Εξοφλήθηκε");payCls="money"}
  else if(!amt){payLabel=T("Χωρίς τιμή");payCls=""}
  else if(x.status==="waiting"){payLabel=T("Προσφορά, σε αναμονή έγκρισης");payCls=""}
  else if(x.status!=="done"){payLabel=T("Δεν έχει ολοκληρωθεί ακόμα");payCls=""}
  else if(rest>0.004){payLabel=T("Ανεξόφλητη");payCls="owe"}
  else{payLabel=T("Εξοφλήθηκε");payCls="money"}
  box.innerHTML=`<div class="kv"><span>${T("Εισπράχθηκαν για αυτή")}</span><b class="money">${money(got)}</b></div>
    <div class="kv"><span>${T("Έξοδα για αυτή")}</span><b class="${sp?"owe":""}">${money(sp)}</b></div>
    <div class="kv"><span>${T("Υπόλοιπο προς είσπραξη")}</span><b class="${restShown>0.004?"owe":"money"}">${money(restShown)}</b></div>
    <div class="kv"><span>${T("Κέρδος από αυτή")}</span><b class="${rnd(got-sp)<0?"owe":"money"}">${money(rnd(got-sp))}</b></div>
    <div class="kv"><span>${T("Κατάσταση πληρωμής")}</span><b class="${payCls}">${payLabel}</b></div>
    ${x.offer&&x.offer.no?`<div class="kv"><span>${T("Προσφορά")}</span><b>${T("Αρ. {n}",{n:x.offer.no})} · ${x.offer.sentAt?T("στάλθηκε {d}",{d:new Date(x.offer.sentAt).toLocaleDateString(LOC(),{day:"numeric",month:"short"})}):T("δεν στάλθηκε ακόμα")}</b></div>`:""}
    ${warrantyUntil(x)?`<div class="kv"><span>${T("Εγγύηση έως")}</span><b class="${warrantyUntil(x)<new Date()?"owe":""}">${fmtShort(warrantyUntil(x))}${warrantyUntil(x)<new Date()?" · "+T("έληξε"):""}</b></div>`:""}
    <div class="twobtn"><button type="button" class="btn softin" data-tm="in">+ ${T("Είσπραξη")}</button>
      <button type="button" class="btn softout" data-tm="out">+ ${T("Έξοδο")}</button></div>
    ${!(got>0.004||x.paid)?`<div style="padding:0 14px 12px"><button type="button" class="btn amber" data-tm="settle" style="width:100%">${T("Εξοφλήθηκε")}</button></div>`:""}
    <div id="tmEntries"></div>
    ${(amt>0||got>0.004)?`<div class="twobtn" style="padding:0 14px 12px">
      <button type="button" class="btn ghost" data-tm="offer">${ic("edit",17)} ${T("Προσφορά")}</button>
      <button type="button" class="btn ghost" data-tm="receipt">${ic("archive",17)} ${T("Απόδειξη")}</button></div>`:`<div style="padding:0 14px 12px"><button type="button" class="btn ghost" data-tm="offer" style="width:100%">${ic("edit",17)} ${T("Προσφορά")}</button></div>`}
    ${oldOffersCount(x)?`<div style="padding:0 14px 12px"><button type="button" class="btn ghost" data-tm="oldoffers" style="width:100%">${ic("archive",17)} ${x.clientId?T("Παλιές προσφορές του πελάτη"):T("Παλιές προσφορές")} (${oldOffersCount(x)})</button></div>`:""}
    <p class="note" style="padding:0 14px 10px">${owedNow?T("Η δουλειά είναι ολοκληρωμένη, οπότε το υπόλοιπο μετράει ως οφειλή του πελάτη."):T("Όσο δεν είναι ολοκληρωμένη, το υπόλοιπο μετράει ως αναμενόμενο και όχι ως οφειλή.")}</p>`;
  drawTaskEntries(x);drawCheckBadge(x);
  box.onclick=e=>{
    const del=e.target.closest("[data-tmdel]");
    if(del){const en=S.ledger.find(y=>y.id===del.dataset.tmdel);if(!en)return;
      trash(en,kindName(en.kind)+" "+money(en.amount));
      const amt2=+x.amount||0;x.paid=amt2>0&&taskPaid(x)+0.004>=amt2;persist();
      drawTaskMoney(x);return}
    const edit=e.target.closest("[data-tmedit]");
    if(edit){const en=S.ledger.find(y=>y.id===edit.dataset.tmedit);if(!en)return;
      const dr=readTaskDraft();
      entryForm(en,{back:()=>{taskForm(x,null,dr);
        const amt2=+x.amount||0;x.paid=amt2>0&&taskPaid(x)+0.004>=amt2;persist()}});
      return}
    const b=e.target.closest("[data-tm]");if(!b)return;
    const tm=b.dataset.tm;
    if((tm==="in"||tm==="settle")&&x.status==="waiting"){
      if(confirm(T("Αυτή η δουλειά είναι ακόμα προσφορά, σε αναμονή έγκρισης. Να τη σημειώσω ως εγκεκριμένη τώρα, πριν καταχωρήσουμε είσπραξη;"))){
        x.status="pending";x.startedAt=x.startedAt||Date.now();persist();render();drawTaskMoney(x);
      }
    }
    if(tm==="unsettle"){unsettleTask(x.id);setTimeout(()=>drawTaskMoney(x),60);return}
    if(tm==="settle"){
      const dr=readTaskDraft();
      const inKind=(kinds().find(k=>k.dir==="in"&&/εξοφλ|πληρ|payment/i.test(k.id+k.name))||kinds().find(k=>k.dir==="in")||{}).id;
      entryForm(null,{kind:inKind,client:val("f_client")||x.clientId||"",task:x.id,settle:true,back:()=>taskForm(x,null,dr)});
      return;
    }
    if(tm==="receipt"){showReceipt(x);return}
    if(tm==="oldoffers"){const dr=readTaskDraft();offerArchiveSheet(x.clientId||"",()=>taskForm(x,null,dr),x.clientId?"":x.id);return}
    if(tm==="offer"){const dr=readTaskDraft();
      // Η τιμή της προσφοράς περνά στη φόρμα μόνο αν η εργασία δεν είχε τιμή· αποθηκεύεται με το «Αποθήκευση».
      offerSheet(x,()=>{const o=x.offer||{};
        if((dr.amount==null||dr.amount==="")&&!(+x.amount>0)&&offerAmt(o)>0)dr.amount=String(offerAmt(o));
        taskForm(x,null,dr)},dr);return}
    const dr=readTaskDraft();
    entryForm(null,{kind:tm==="in"?(kinds().find(k=>k.dir==="in")||{}).id:(kinds().find(k=>k.dir==="out")||{}).id,client:val("f_client")||x.clientId||"",task:x.id,
      back:()=>taskForm(x,null,dr)});};
}
function drawTaskEntries(x){
  const box=$("#tmEntries");if(!box)return;
  const list=taskEntries(x.id).sort(byNewest);
  if(!list.length){box.innerHTML="";return}
  box.innerHTML=sec(T("Κινήσεις αυτής της εργασίας"))+panel(list.map(en=>`<div class="row" data-tmedit="${en.id}" style="align-items:center">
      <span style="color:${isIn(en.kind)?"var(--green)":"var(--red)"}">${isIn(en.kind)?"+":"−"}</span>
      <div class="grow"><div class="title">${esc(kindName(en.kind))}${en.note?" · "+esc(en.note):""}</div>
      <div class="meta"><span>${fmtDay(en.date)}</span></div></div>
      <b class="${isIn(en.kind)?"money":"owe"}" style="margin-right:6px">${money(en.amount)}</b>
      <button class="mini del" data-tmdel="${en.id}" aria-label="${T("Διαγραφή")}">${ic("trash",17)}</button></div>`).join(""));
}
function wrapText(ctx,text,x,y,maxW,lh,measureOnly){
  const words=String(text||"").split(/\s+/).filter(Boolean);let line="";
  for(const w of words){
    const test=line?line+" "+w:w;
    if(ctx.measureText(test).width>maxW&&line){if(!measureOnly)ctx.fillText(line,x,y);line=w;y+=lh}
    else line=test;
  }
  if(line){if(!measureOnly)ctx.fillText(line,x,y);y+=lh}
  return y;
}
function receiptCanvas(x){
  const c=x.clientId&&getClient(x.clientId),biz=S.settings.biz||{};
  const amt=+x.amount||0,got=taskPaid(x),rest=rnd(amt-got);
  if(!x.receiptNo){S.settings.receiptSeq=(S.settings.receiptSeq||0)+1;x.receiptNo=S.settings.receiptSeq;write()}
  const W=900,cv=document.createElement("canvas");cv.width=W;cv.height=1200;
  const ctx=cv.getContext("2d");
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,W,cv.height);
  ctx.fillStyle="#17324D";ctx.fillRect(0,0,W,140);
  ctx.fillStyle="#ffffff";ctx.font="bold 38px system-ui,sans-serif";ctx.textAlign="left";
  ctx.fillText(biz.name||T("Δρομολόγιο"),40,64);
  ctx.font="19px system-ui,sans-serif";
  const bizLine=[biz.afm?T("ΑΦΜ")+" "+biz.afm:"",biz.phone,biz.address].filter(Boolean).join("   ·   ");
  if(bizLine)ctx.fillText(bizLine,40,102);
  let y=200;
  ctx.fillStyle="#17324D";ctx.font="bold 32px system-ui,sans-serif";ctx.fillText(T("ΑΠΟΔΕΙΞΗ"),40,y);
  ctx.textAlign="right";ctx.fillStyle="#5E7185";ctx.font="20px system-ui,sans-serif";
  ctx.fillText("#"+String(x.receiptNo).padStart(4,"0"),W-40,y-14);
  ctx.fillText(new Date().toLocaleDateString(LOC()),W-40,y+16);
  ctx.textAlign="left";y+=56;
  ctx.strokeStyle="#D6DEE3";ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(W-40,y);ctx.stroke();y+=44;
  ctx.fillStyle="#5E7185";ctx.font="bold 20px system-ui,sans-serif";ctx.fillText(T("Πελάτης"),40,y);y+=32;
  ctx.fillStyle="#17324D";ctx.font="24px system-ui,sans-serif";ctx.fillText(c?c.name:T("Ιδιώτης πελάτης"),40,y);y+=30;
  const addr=c?clientAddress(c):"";
  if(addr){ctx.fillStyle="#5E7185";ctx.font="18px system-ui,sans-serif";ctx.fillText(addr,40,y);y+=34}
  y+=16;
  ctx.fillStyle="#5E7185";ctx.font="bold 20px system-ui,sans-serif";ctx.fillText(T("Εργασία"),40,y);y+=32;
  ctx.fillStyle="#17324D";ctx.font="24px system-ui,sans-serif";
  y=wrapText(ctx,x.title,40,y,W-80,30)+6;
  if(x.desc){ctx.fillStyle="#5E7185";ctx.font="18px system-ui,sans-serif";y=wrapText(ctx,x.desc,40,y,W-80,24)+10}
  y+=20;ctx.strokeStyle="#D6DEE3";ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(W-40,y);ctx.stroke();y+=48;
  const row=(label,valtxt,color)=>{ctx.textAlign="left";ctx.font="23px system-ui,sans-serif";ctx.fillStyle="#17324D";ctx.fillText(label,40,y);
    ctx.textAlign="right";ctx.fillStyle=color||"#17324D";ctx.fillText(valtxt,W-40,y);ctx.textAlign="left";y+=42};
  row(T("Τιμή δουλειάς"),money(amt));
  row(T("Εισπράχθηκαν"),money(got),"#2E7D5B");
  y+=6;ctx.strokeStyle="#D6DEE3";ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(W-40,y);ctx.stroke();y+=40;
  ctx.font="bold 26px system-ui,sans-serif";
  row(T("Υπόλοιπο"),money(rest),rest>0.004?"#C8412B":"#2E7D5B");
  y+=30;
  ctx.font="bold 21px system-ui,sans-serif";ctx.fillStyle=rest<=0.004?"#2E7D5B":"#C8412B";
  ctx.fillText(rest<=0.004?T("✓ ΕΞΟΦΛΗΜΕΝΗ"):T("ΑΝΕΞΟΦΛΗΤΗ"),40,y);
  ctx.textAlign="center";ctx.fillStyle="#93A5B6";ctx.font="18px system-ui,sans-serif";
  ctx.fillText(T("Ευχαριστούμε για την εμπιστοσύνη"),W/2,cv.height-36);
  ctx.textAlign="left";
  return cv;
}
function dataUrlToBlob(u){const[h,b]=u.split(",");const m=/:(.*?);/.exec(h);const bin=atob(b);const arr=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return new Blob([arr],{type:m?m[1]:"image/png"})}
function downloadDataUrl(u,name){const a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
  toast(T("Η απόδειξη αποθηκεύτηκε στις λήψεις."))}
async function shareReceiptImage(u,name){
  try{
    const blob=dataUrlToBlob(u),file=new File([blob],name,{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:T("Απόδειξη")});return}
  }catch(e){}
  downloadDataUrl(u,name);
}
// Προσφορά: τραβάει ό,τι υπάρχει ήδη (πελάτης, τίτλος, λεπτομέρειες, τιμή, διεύθυνση,
// στοιχεία επιχείρησης, υλικά από τη λίστα ελέγχου) ώστε να μη γράφεις σχεδόν τίποτα.
// ——— Προσφορά ———
// Η προσφορά είναι ξεχωριστό έγγραφο μέσα στην εργασία (x.offer). Μόλις σταλεί κλειδώνει·
// για αλλαγές ξεκινά νέα, και η παλιά μένει στο ιστορικό (x.offers).
const OFFER_TERMS_OLD="Η τιμή περιλαμβάνει εργασία και υλικά. Πληρωμή με την ολοκλήρωση.";
const OFFER_TERMS_DEF="Η προσφορά περιλαμβάνει τις εργασίες και τα υλικά που αναφέρονται παραπάνω.\nΤυχόν πρόσθετες εργασίες ή υλικά που δεν περιλαμβάνονται στην παρούσα προσφορά χρεώνονται κατόπιν συνεννόησης και έγκρισης του πελάτη.\nΗ εξόφληση πραγματοποιείται με την ολοκλήρωση της εργασίας.";
const OFFER_INCL_DEF=[
  {l:"Εργασία",t:"Εργασία κατασκευής και εκτέλεσης"},
  {l:"Υλικά",t:"Προμήθεια των απαιτούμενων υλικών"},
  {l:"Μεταφορά",t:"Μεταφορά υλικών στον χώρο του έργου"},
  {l:"Αποξήλωση",t:"Αποξήλωση και απομάκρυνση παλαιών υλικών"},
  {l:"Απομάκρυνση μπαζών",t:"Συλλογή και απομάκρυνση μπαζών και υπολειμμάτων"},
  {l:"Τοποθέτηση",t:"Τοποθέτηση και σύνδεση"},
  {l:"Εργαλεία και μικροϋλικά",t:"Χρήση απαραίτητων εργαλείων και μικροϋλικών"},
  {l:"Καθαρισμός μετά",t:"Παράδοση του χώρου καθαρού και ολοκληρωμένου"}];
const OFFER_EXCL_DEF=[
  {l:"Οικοδομικές εργασίες",t:"Οικοδομικές εργασίες που δεν αναφέρονται στην προσφορά",on:1},
  {l:"Απρόβλεπτα υλικά",t:"Πρόσθετα υλικά που θα απαιτηθούν λόγω απρόβλεπτων συνθηκών",on:1},
  {l:"Επιπλέον εργασίες",t:"Εργασίες που θα ζητηθούν επιπλέον από τον πελάτη",on:1},
  {l:"Βάψιμο και αποκατάσταση",t:"Βάψιμο και αποκατάσταση επιφανειών",on:0},
  {l:"Άδειες και τέλη",t:"Άδειες, μελέτες και τέλη",on:0}];
const OFFER_FIRST_NO=500;
function offerLists(){
  const st=S.settings;
  if(!Array.isArray(st.offerIncl))st.offerIncl=OFFER_INCL_DEF.map(i=>({l:i.l,t:i.t}));
  if(!Array.isArray(st.offerExcl))st.offerExcl=OFFER_EXCL_DEF.map(i=>({l:i.l,t:i.t}));
  if(!st.offerTerms||st.offerTerms===OFFER_TERMS_OLD)st.offerTerms=OFFER_TERMS_DEF;
  return{incl:st.offerIncl,excl:st.offerExcl};
}
function nextOfferNo(){
  const seq=Math.max(+S.settings.offerSeq||0,OFFER_FIRST_NO-1)+1;
  S.settings.offerSeq=seq;return seq;
}
// Φέρνει την προσφορά της εργασίας σε σωστή μορφή· αν δεν έχει σταλεί, γεμίζει τα κενά από την εργασία.
function offerOf(x,dr){
  dr=dr||{};
  const L=offerLists(),st=S.settings;
  const o=x.offer||(x.offer={});
  if(o.extra!=null&&o.inclExtra==null){o.inclExtra=o.extra}
  delete o.extra;
  if(!o.no&&x.offerNo)o.no=x.offerNo;
  if(o.sentAt)return o;
  const cid=dr.clientId!=null&&dr.clientId!==""?dr.clientId:x.clientId;
  const c=cid&&getClient(cid);
  const tl=taskLoc(x);
  if(o.client==null)o.client=c?c.name:"";
  if(o.addr==null)o.addr=c?(clientAddress(c)||""):(tl?tl.label:"");
  if(o.title==null)o.title=dr.title||x.title||"";
  if(o.amount==null||o.amount===""){const a=dr.amount!=null&&dr.amount!==""?dr.amount:x.amount;o.amount=a!=null&&a!==""?String(a):""}
  if(o.valid==null)o.valid=+st.offerValid||30;
  if(!Array.isArray(o.incl))o.incl=Array.isArray(st.offerInclLast)?st.offerInclLast.slice():L.incl.map(i=>i.t);
  if(!Array.isArray(o.excl))o.excl=Array.isArray(st.offerExclLast)?st.offerExclLast.slice():OFFER_EXCL_DEF.filter(i=>i.on).map(i=>i.t);
  if(o.inclExtra==null)o.inclExtra="";
  if(o.exclExtra==null)o.exclExtra="";
  if(!o.terms||o.terms===OFFER_TERMS_OLD)o.terms=st.offerTerms;
  return o;
}
const offerAmt=o=>{const n=parseFloat(String(o.amount??"").replace(/\s/g,"").replace(",","."));return isFinite(n)?n:0};
const offerUntil=o=>{const d=new Date(o.date||Date.now());d.setDate(d.getDate()+(+o.valid||30));return d};
// Οι λίστες «Τι περιλαμβάνει» / «Δεν περιλαμβάνει»: πάτημα για επιλογή, και «Επεξεργασία λίστας»
// για μετονομασία, αλλαγή σειράς, διαγραφή (και των βασικών) και επαναφορά των βασικών.
// Η σειρά της λίστας είναι και η σειρά που τυπώνονται στο έγγραφο της προσφοράς.
function offerChipsHTML(kind,list,sel,editing){
  if(editing){
    const rows=list.map((i,n)=>`<div class="oerow" data-n="${n}">
        <div class="oefields"><input class="oe_l" data-n="${n}" value="${esc(T(i.l))}" placeholder="${T("Σύντομο όνομα")}" aria-label="${T("Σύντομο όνομα")}" autocomplete="off">
          <input class="oe_t" data-n="${n}" value="${esc(T(i.t))}" placeholder="${T("Κείμενο στην προσφορά")}" aria-label="${T("Κείμενο στην προσφορά")}" autocomplete="off"></div>
        <div class="oebtns"><button type="button" class="oemv" data-mv="up" data-n="${n}" aria-label="${T("Πάνω")}" ${n?"":"disabled"}>▲</button>
          <button type="button" class="oemv" data-mv="down" data-n="${n}" aria-label="${T("Κάτω")}" ${n<list.length-1?"":"disabled"}>▼</button>
          <button type="button" class="x bin" data-rm="${n}" aria-label="${T("Διαγραφή")}">${ic("trash",17)}</button></div></div>`).join("");
    return `<div class="oebox" id="ofbox_${kind}">
      <p class="note" style="margin:0 0 8px">${T("Πάνω: το όνομα στο κουμπί. Κάτω: το κείμενο που γράφεται στην προσφορά. Με τα βελάκια αλλάζεις σειρά.")}</p>
      ${rows||`<div class="empty">${T("Η λίστα είναι άδεια.")}</div>`}
      <div class="inrow" style="margin-top:8px"><input id="of_${kind}_new" placeholder="${T("Πρόσθεσε δικό σου…")}" autocomplete="off">
        <button type="button" class="btn ghost" data-add="${kind}" style="padding:10px 14px">${ic("plus",18)}</button></div>
      <div class="oefoot"><button type="button" class="linkbtn" data-reset="${kind}">${T("Επαναφορά βασικών")}</button>
        <button type="button" class="btn primary small" data-editdone="${kind}">${T("Τέλος")}</button></div></div>`;
  }
  const chips=list.map((i,n)=>`<button type="button" class="ochip${sel.has(i.t)?" on":""}" data-t="${esc(i.t)}" data-n="${n}">
      <i class="ock">✓</i><span>${esc(T(i.l))}</span></button>`).join("");
  return `<div class="oebox" id="ofbox_${kind}"><div class="ochips" id="of_${kind}">${chips}</div>
    <div class="inrow" style="margin-top:8px"><input id="of_${kind}_new" placeholder="${T("Πρόσθεσε δικό σου…")}" autocomplete="off">
    <button type="button" class="btn ghost" data-add="${kind}" style="padding:10px 14px">${ic("plus",18)}</button></div>
    <button type="button" class="linkbtn" data-edit="${kind}">${ic("edit",14)} ${T("Επεξεργασία λίστας (όνομα, σειρά, διαγραφή)")}</button></div>`;
}
function offerSheet(x,back,dr){
  const o=offerOf(x,dr);
  if(o.sentAt)return offerLockedSheet(x,back,dr);
  const L=offerLists();
  const items=(x.check||[]).map(i=>i.text).filter(Boolean);
  // Οι επιλογές κρατιούνται εδώ (όχι στα κουμπιά), ώστε να μη χάνονται όσο επεξεργάζεσαι τη λίστα.
  const sel={incl:new Set(o.incl),excl:new Set(o.excl)},editing={incl:false,excl:false};
  const picked=k=>L[k].filter(i=>sel[k].has(i.t)).map(i=>i.t);
  const others=clientOffersHTML(x);
  openSheet({title:o.no?T("Προσφορά Αρ. {n}",{n:o.no}):T("Νέα προσφορά"),cancelLabel:back?T("Πίσω"):T("Κλείσιμο"),onCancel:back||null,
    saveLabel:T("Δες την προσφορά"),saveStyle:"amber",
    onSave:()=>{
      o.client=val("of_client");o.addr=val("of_addr");o.title=val("of_title");
      o.amount=val("of_amount");o.valid=Math.max(1,Math.min(365,+val("of_valid")||30));
      o.incl=picked("incl");o.excl=picked("excl");
      o.inclExtra=val("of_inclx");o.exclExtra=val("of_exclx");o.terms=($("#of_terms").value||"").trim();
      o.showItems=!!($("#of_items")&&$("#of_items").checked);
      o.items=o.showItems?items.slice():[];
      if(!(offerAmt(o)>0)&&!confirm(T("Η προσφορά δεν έχει τιμή. Να συνεχίσω έτσι;")))return false;
      if(!o.no)o.no=nextOfferNo();
      o.date=Date.now();
      const st=S.settings;st.offerTerms=o.terms||st.offerTerms;st.offerInclLast=o.incl.slice();st.offerExclLast=o.excl.slice();st.offerValid=o.valid;
      persist();sheetDirty=false;
      $("#shTitle").textContent=T("Προσφορά Αρ. {n}",{n:o.no});
      showOffer(x,o,()=>{closePreview();offerLockedSheet(x,back,dr,true)});
      return false;
    },
    body:`<p class="note">${T("Τα στοιχεία ήρθαν από την εργασία. Άλλαξε ό,τι θέλεις — οι αλλαγές μένουν μόνο στην προσφορά.")}</p>
      <label for="of_client">${T("Πελάτης")}</label>
      <input id="of_client" value="${esc(o.client)}" placeholder="${T("Ιδιώτης πελάτης")}" autocomplete="off">
      <label for="of_addr">${T("Διεύθυνση")}</label>
      <input id="of_addr" value="${esc(o.addr)}" autocomplete="off">
      <label for="of_title">${T("Εργασία")}</label>
      <input id="of_title" value="${esc(o.title)}" autocomplete="off">
      <div class="ofgroup">
        <div class="ofhead">${T("Τι περιλαμβάνει")}<small>${T("πάτα για να το βάλεις ή να το βγάλεις")}</small></div>
        ${offerChipsHTML("incl",L.incl,sel.incl,false)}
        <label for="of_inclx">${T("Πρόσθετες λεπτομέρειες")}</label>
        <textarea id="of_inclx" rows="3" placeholder="${T("π.χ. πλακάκια 60×60 της επιλογής του πελάτη, κόλλα, αρμόστοκος…")}">${esc(o.inclExtra)}</textarea>
        ${items.length?`<label class="toggle" style="margin-top:12px"><input type="checkbox" id="of_items" ${o.showItems!==false?"checked":""}>${T("Να μπουν και τα υλικά από τη λίστα ελέγχου")} (${items.length})</label>`:""}
      </div>
      <div class="ofgroup">
        <div class="ofhead">${T("Δεν περιλαμβάνει")}<small>${T("προστατεύει κι εσένα και τον πελάτη")}</small></div>
        ${offerChipsHTML("excl",L.excl,sel.excl,false)}
        <label for="of_exclx">${T("Άλλα που δεν περιλαμβάνονται")}</label>
        <textarea id="of_exclx" rows="2">${esc(o.exclExtra)}</textarea>
      </div>
      <label for="of_terms">${T("Όροι")}</label>
      <textarea id="of_terms" rows="5">${esc(T(o.terms))}</textarea>
      <button type="button" class="linkbtn" id="of_termsDef">${T("Επαναφορά στους βασικούς όρους")}</button>
      <div class="oftotal">
        <div class="two">
          <div><label for="of_amount">${T("Τελική τιμή")}</label>
            <span class="curr"><b>€</b><input id="of_amount" inputmode="decimal" placeholder="0,00" value="${esc(o.amount)}"></span></div>
          <div><label for="of_valid">${T("Ισχύς (ημέρες)")}</label>
            <input id="of_valid" type="number" inputmode="numeric" min="1" max="365" value="${o.valid}"></div>
        </div>
      </div>${others}`});
  const body=$("#shBody");
  const redraw=kind=>{const box=$("#ofbox_"+kind);if(box)box.outerHTML=offerChipsHTML(kind,L[kind],sel[kind],editing[kind])};
  // Όταν αλλάζει το κείμενο ενός στοιχείου, η επιλογή και οι «τελευταίες επιλογές» ακολουθούν το νέο κείμενο.
  const renameSel=(kind,oldT,newT)=>{
    if(oldT===newT)return;
    if(sel[kind].has(oldT)){sel[kind].delete(oldT);sel[kind].add(newT)}
    const lastK=kind==="incl"?"offerInclLast":"offerExclLast",last=S.settings[lastK];
    if(Array.isArray(last)){const k=last.indexOf(oldT);if(k>=0)last[k]=newT}
  };
  body.addEventListener("input",e=>{
    const inp=e.target.closest(".oe_l,.oe_t");if(!inp)return;
    const kind=inp.closest(".oebox").id.slice(6),it=L[kind][+inp.dataset.n];if(!it)return;
    const v=inp.value.trim();if(!v)return;
    if(inp.classList.contains("oe_l"))it.l=v;
    else{renameSel(kind,it.t,v);it.t=v}
    it.c=1;sheetDirty=true;
  });
  body.addEventListener("click",e=>{
    const ed=e.target.closest("[data-edit]");
    if(ed){const k=ed.dataset.edit;editing[k]=true;redraw(k);return}
    const dn=e.target.closest("[data-editdone]");
    if(dn){const k=dn.dataset.editdone;editing[k]=false;persist();redraw(k);return}
    const mv=e.target.closest("[data-mv]");
    if(mv){const kind=mv.closest(".oebox").id.slice(6),list=L[kind],i=+mv.dataset.n,j=i+(mv.dataset.mv==="up"?-1:1);
      if(j<0||j>=list.length)return;[list[i],list[j]]=[list[j],list[i]];persist();redraw(kind);sheetDirty=true;
      const again=$(`#ofbox_${kind} [data-mv="${mv.dataset.mv}"][data-n="${j}"]`);if(again&&!again.disabled)again.focus();
      return}
    const rm=e.target.closest("[data-rm]");
    if(rm){const kind=rm.closest(".oebox").id.slice(6),list=L[kind],n=+rm.dataset.rm,it=list[n];if(!it)return;
      if(!confirm(T("Να σβηστεί το «{t}» από τις επιλογές;",{t:T(it.l)})))return;
      sel[kind].delete(it.t);list.splice(n,1);persist();redraw(kind);sheetDirty=true;return}
    const rs=e.target.closest("[data-reset]");
    if(rs){const kind=rs.dataset.reset,list=L[kind],defs=kind==="incl"?OFFER_INCL_DEF:OFFER_EXCL_DEF;
      const have=new Set(list.map(i=>i.t));let added=0;
      defs.forEach(d=>{if(!have.has(d.t)){list.push({l:d.l,t:d.t});added++}});
      persist();redraw(kind);toast(added?T("Προστέθηκαν ξανά {n} βασικά στοιχεία στο τέλος της λίστας.",{n:added}):T("Όλα τα βασικά στοιχεία υπάρχουν ήδη."));return}
    const chip=e.target.closest(".ochip");
    if(chip){const kind=chip.closest(".oebox").id.slice(6),t=chip.dataset.t;
      if(sel[kind].has(t))sel[kind].delete(t);else sel[kind].add(t);
      chip.classList.toggle("on",sel[kind].has(t));sheetDirty=true;return}
    const add=e.target.closest("[data-add]");
    if(add){const kind=add.dataset.add,inp=$("#of_"+kind+"_new"),t=(inp.value||"").trim();if(!t){inp.focus();return}
      const list=L[kind];
      let n=list.findIndex(i=>i.t.toLowerCase()===t.toLowerCase()||i.l.toLowerCase()===t.toLowerCase());
      if(n<0){list.push({l:t,t,c:1});n=list.length-1;persist()}
      sel[kind].add(list[n].t);redraw(kind);sheetDirty=true;
      const again=$("#of_"+kind+"_new");if(again&&editing[kind])again.focus();
      return}
    if(e.target.closest("#of_termsDef")){$("#of_terms").value=T(OFFER_TERMS_DEF);sheetDirty=true;return}
    const oh=e.target.closest("[data-coffer]");
    if(oh){const f=offerById(oh.dataset.coffer);if(f)showOffer(f.x,f.o)}
  });
  body.addEventListener("keydown",e=>{if(e.key==="Enter"&&/^of_(incl|excl)_new$/.test(e.target.id)){e.preventDefault();body.querySelector(`[data-add="${e.target.id.slice(3,7)}"]`).click()}});
}
function offerLockedSheet(x,back,dr,justSent){
  const o=x.offer,hist=(x.offers||[]).slice().reverse();
  const when=new Date(o.sentAt);
  openSheet({title:T("Προσφορά Αρ. {n}",{n:o.no}),cancelLabel:back?T("Πίσω"):T("Κλείσιμο"),onCancel:back||null,
    saveLabel:"+ "+T("Νέα προσφορά"),saveStyle:"amber",
    onSave:()=>{
      if(!confirm(T("Θα ξεκινήσει νέα προσφορά με νέο αριθμό, με αφετηρία τα στοιχεία αυτής. Η Αρ. {n} μένει όπως στάλθηκε, στο ιστορικό. Συνέχεια;",{n:o.no})))return false;
      x.offers=x.offers||[];x.offers.push(o);
      const n=JSON.parse(JSON.stringify(o));delete n.no;delete n.sentAt;delete n.date;n.prevNo=o.no;
      x.offer=n;persist();
      offerSheet(x,back,dr);return "replaced";
    },
    body:`<div class="oflock">${ic("shield",22)}<div><b>${justSent?T("Η προσφορά στάλθηκε και κλείδωσε."):T("Αυτή η προσφορά έχει σταλεί και δεν αλλάζει.")}</b>
        <span>${T("Στάλθηκε {d}",{d:when.toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"})+", "+when.toLocaleTimeString(LOC(),{hour:"2-digit",minute:"2-digit"})})}<br>${T("Αν χρειάζεται αλλαγή, πάτα «Νέα προσφορά» — θα πάρει νέο αριθμό και η παλιά θα μείνει όπως ήταν.")}</span></div></div>
      ${panel(`<div id="of_ro">
        <div class="kv"><span>${T("Πελάτης")}</span><b>${esc(o.client||T("Ιδιώτης πελάτης"))}</b></div>
        <div class="kv"><span>${T("Εργασία")}</span><b>${esc(o.title||"—")}</b></div>
        <div class="kv"><span>${T("Τελική τιμή")}</span><b class="money">${money(offerAmt(o))}</b></div>
        <div class="kv"><span>${T("Ισχύει έως")}</span><b class="${offerUntil(o)<new Date()?"owe":""}">${offerUntil(o).toLocaleDateString(LOC())}${offerUntil(o)<new Date()?" · "+T("έληξε"):""}</b></div></div>`)}
      <button type="button" class="btn ghost wide" id="of_view" style="margin-top:12px">${ic("msg",18)} ${T("Δες ή στείλε ξανά")}</button>
      ${hist.length?sec(T("Προηγούμενες προσφορές"))+panel(hist.map((h,i)=>`<div class="row" data-hist="${hist.length-1-i}" style="align-items:center">
          <div class="avatar" style="font-size:13px">${h.no}</div><div class="grow"><div class="title">${esc(h.title||T("Προσφορά"))}</div>
          <div class="meta"><span>${h.sentAt?T("Στάλθηκε {d}",{d:new Date(h.sentAt).toLocaleDateString(LOC())}):""}</span></div></div>
          <b class="amt">${money(offerAmt(h))}</b></div>`).join("")):""}${clientOffersHTML(x)}`});
  $("#of_view").onclick=()=>showOffer(x,o);
  $("#of_ro").onclick=()=>toast(T("Η προσφορά έχει σταλεί και δεν αλλάζει. Για αλλαγές πάτα «Νέα προσφορά»."));
  $("#shBody").addEventListener("click",e=>{const r=e.target.closest("[data-hist]");if(r){showOffer(x,x.offers[+r.dataset.hist]);return}
    const oh=e.target.closest("[data-coffer]");if(oh){const f=offerById(oh.dataset.coffer);if(f)showOffer(f.x,f.o)}});
}
function drawOfferDoc(ctx,o,W,dry){
  const biz=S.settings.biz||{};
  const F=(f,c)=>{ctx.font=f+" system-ui,sans-serif";if(c)ctx.fillStyle=c};
  const txt=(t,x,y)=>{if(!dry)ctx.fillText(t,x,y)};
  const rule=y=>{if(!dry){ctx.strokeStyle="#D6DEE3";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(W-40,y);ctx.stroke()}};
  if(!dry){ctx.fillStyle="#ffffff";ctx.fillRect(0,0,W,ctx.canvas.height);ctx.fillStyle="#17324D";ctx.fillRect(0,0,W,140)}
  ctx.textAlign="left";
  F("bold 38px","#ffffff");txt(biz.name||T("Δρομολόγιο"),40,64);
  F("19px","#ffffff");
  const bizLine=[biz.afm?T("ΑΦΜ")+" "+biz.afm:"",biz.phone,biz.address].filter(Boolean).join("   ·   ");
  if(bizLine)txt(bizLine,40,102);
  let y=200;
  F("bold 32px","#17324D");txt(T("ΠΡΟΣΦΟΡΑ"),40,y);
  ctx.textAlign="right";F("bold 21px","#17324D");txt(T("Αρ.")+" "+(o.no||"—"),W-40,y-14);
  F("19px","#5E7185");txt(new Date(o.date||Date.now()).toLocaleDateString(LOC()),W-40,y+16);
  ctx.textAlign="left";y+=56;rule(y);y+=44;
  F("bold 19px","#5E7185");txt(T("Προς"),40,y);y+=32;
  F("24px","#17324D");y=wrapText(ctx,o.client||T("Ιδιώτης πελάτης"),40,y,W-80,30,dry);
  if(o.addr){F("18px","#5E7185");y=wrapText(ctx,o.addr,40,y,W-80,24,dry)+4}
  y+=18;
  F("bold 19px","#5E7185");txt(T("Εργασία"),40,y);y+=32;
  F("bold 25px","#17324D");y=wrapText(ctx,o.title||"—",40,y,W-80,32,dry)+6;
  const block=(head,list,extra)=>{
    list=(list||[]).filter(Boolean);extra=(extra||"").trim();
    if(!list.length&&!extra)return;
    y+=16;F("bold 20px","#17324D");txt(head,40,y);y+=32;
    F("18px","#3D5266");
    list.forEach(t=>{txt("•",50,y);y=wrapText(ctx,t,72,y,W-112,25,dry)+3});
    if(extra){extra.split(/\n+/).forEach(p=>{y=wrapText(ctx,p,list.length?72:40,y,W-(list.length?112:80),25,dry)+3})}
    y+=4;
  };
  block(T("Περιλαμβάνει"),(o.incl||[]).map(t=>T(t)),o.inclExtra);
  if(o.showItems&&o.items&&o.items.length)block(T("Υλικά και εξοπλισμός"),o.items,"");
  block(T("Δεν περιλαμβάνει"),(o.excl||[]).map(t=>T(t)),o.exclExtra);
  y+=18;rule(y);y+=52;
  F("bold 30px","#17324D");txt(T("Τελική τιμή"),40,y);
  ctx.textAlign="right";ctx.fillStyle="#2E7D5B";txt(money(offerAmt(o)),W-40,y);ctx.textAlign="left";y+=40;
  F("19px","#5E7185");txt(T("Ισχύς προσφοράς: {n} ημέρες, έως {d}",{n:+o.valid||30,d:offerUntil(o).toLocaleDateString(LOC())}),40,y);y+=26;
  y+=14;rule(y);y+=36;
  if(o.terms){F("bold 18px","#5E7185");txt(T("Όροι"),40,y);y+=28;
    F("16.5px","#6E8193");T(o.terms).split(/\n+/).forEach(p=>{y=wrapText(ctx,p,40,y,W-80,23,dry)+5})}
  return y;
}
function offerCanvas(o){
  const W=900;
  const probe=document.createElement("canvas");probe.width=W;probe.height=10;
  const need=Math.max(760,Math.round(drawOfferDoc(probe.getContext("2d"),o,W,true)+60));
  const cv=document.createElement("canvas");cv.width=W;cv.height=need;
  drawOfferDoc(cv.getContext("2d"),o,W,false);
  return cv;
}
function closePreview(){$("#photoDlg").classList.remove("open")}
function showOffer(x,o,onSent){
  o=o||x.offer;
  const cv=offerCanvas(o),url=cv.toDataURL("image/png"),name="prosfora-"+(o.no||"")+".pdf";
  $("#phImg").src=url;$("#phT").textContent=T("Προσφορά Αρ. {n}",{n:o.no||"—"});
  const sent=!!o.sentAt;
  $("#phBot").innerHTML=`<button class="btn primary" id="rc_share">${ic("msg",18)} ${sent?T("Στείλε ξανά"):T("Αποστολή")}</button>
    <button class="btn ghost" id="rc_dl">${ic("archive",18)} ${T("Λήψη PDF")}</button>`;
  const go=async share=>{
    const ok=await downloadCanvasPdf(cv,name,share);
    if(ok&&!o.sentAt&&o===x.offer){o.sentAt=Date.now();persist();
      toast(T("Η προσφορά Αρ. {n} καταχωρήθηκε ως σταλμένη.",{n:o.no}));
      if(onSent)onSent()}
  };
  $("#rc_share").onclick=()=>go(true);
  $("#rc_dl").onclick=()=>go(false);
  $("#photoDlg").classList.add("open");
}

// Πραγματικό PDF, φτιαγμένο εδώ, χωρίς εξωτερικές βιβλιοθήκες: μία σελίδα A4 με την εικόνα μέσα.
function canvasToPdfBlob(cv){
  const jpg=cv.toDataURL("image/jpeg",0.92);
  const b64=jpg.split(",")[1];
  const bin=atob(b64),img=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)img[i]=bin.charCodeAt(i);
  const PW=595.28,PH=841.89,M=24;                 // A4 σε στιγμές, με περιθώριο
  const scale=Math.min((PW-2*M)/cv.width,(PH-2*M)/cv.height);
  const w=cv.width*scale,h=cv.height*scale,ox=(PW-w)/2,oy=(PH-h)/2;
  const parts=[],offs=[];let len=0;
  const push=str=>{const arr=typeof str==="string"?new TextEncoder().encode(str):str;parts.push(arr);len+=arr.length};
  push("%PDF-1.4\n");
  const obj=(n,body)=>{offs[n]=len;push(n+" 0 obj\n"+body+"\nendobj\n")};
  obj(1,"<< /Type /Catalog /Pages 2 0 R >>");
  obj(2,"<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3,"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+PW.toFixed(2)+" "+PH.toFixed(2)+"] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>");
  const content="q "+w.toFixed(2)+" 0 0 "+h.toFixed(2)+" "+ox.toFixed(2)+" "+oy.toFixed(2)+" cm /Im0 Do Q";
  obj(4,"<< /Length "+content.length+" >>\nstream\n"+content+"\nendstream");
  offs[5]=len;
  push("5 0 obj\n<< /Type /XObject /Subtype /Image /Width "+cv.width+" /Height "+cv.height+
    " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+img.length+" >>\nstream\n");
  push(img);push("\nendstream\nendobj\n");
  const xref=len;
  let x="xref\n0 6\n0000000000 65535 f \n";
  for(let i=1;i<=5;i++)x+=String(offs[i]).padStart(10,"0")+" 00000 n \n";
  push(x+"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF");
  return new Blob(parts,{type:"application/pdf"});
}
async function downloadCanvasPdf(cv,filename,share){
  try{
    const blob=canvasToPdfBlob(cv),file=new File([blob],filename,{type:"application/pdf"});
    if(share!==false&&navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file],title:filename});return true}catch(e){if(e.name==="AbortError")return false}
    }
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    toast(T("Το PDF αποθηκεύτηκε στις λήψεις."));
    return true;
  }catch(e){toast(T("Το PDF δεν δημιουργήθηκε."));return false}
}
function showReceiptImage(dataUrl,filename){
  $("#phImg").src=dataUrl;$("#phT").textContent=T("Ψηφιακή απόδειξη");
  $("#phBot").innerHTML=`<button class="btn primary" id="rc_share">${ic("msg",18)} ${T("Κοινοποίηση")}</button>
    <button class="btn ghost" id="rc_dl">${ic("archive",18)} ${T("Λήψη")}</button>`;
  $("#rc_share").onclick=()=>shareReceiptImage(dataUrl,filename);
  $("#rc_dl").onclick=()=>downloadDataUrl(dataUrl,filename);
  $("#photoDlg").classList.add("open");
}
function showReceipt(x){
  const cv=receiptCanvas(x),url=cv.toDataURL("image/png");
  showReceiptImage(url,"apodeixi-"+(x.receiptNo||"")+".png");
}
function readTaskDraft(){
  if(!$("#f_prio"))return{};
  return{title:val("f_title"),clientId:val("f_client")==="__new"?"":val("f_client"),area:val("f_area"),address:val("lw_addr"),desc:val("f_desc"),start:dtVal("f_start"),end:dtVal("f_end"),
    remindBefore:+val("f_rb"),nearAlert:+val("f_near"),placeId:val("f_place"),ownLoc:$("#f_own")&&$("#f_own").dataset.on==="1",priority:+($("#f_prio").dataset.v||2),status:val("f_status"),amount:val("f_amount"),
    who:[...($("#f_who")?.querySelectorAll(".pbtn.on")||[])].map(b=>b.dataset.p).filter(Boolean),_loc:LW?LW.loc:null};
}
function taskForm(t0,presetClient,draft){
  let autoT=null;
  const isNew=!t0,orig=t0||{};
  const v=Object.assign({priority:2,status:"pending",remindBefore:0,nearAlert:isNew?NEAR_DEFAULT:0,clientId:presetClient||""},orig,draft||{});
  const loc0=draft?draft._loc||null:(v.lat!=null?{lat:v.lat,lng:v.lng}:null);
  const opts=S.clients.slice().sort((a,b)=>a.name.localeCompare(b.name,"el")).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");
  openSheet({title:isNew?T("Νέα εργασία"):T("Επεξεργασία εργασίας"),saveLabel:isNew?T("Καταχώρηση"):T("Αποθήκευση"),saveStyle:isNew?"amber":"primary",
    body:`${isNew?`<div class="aibox"><div class="aihead">${ic("spark",18)}<b>${T("Πες ή γράψε τι θες να κάνεις")}</b></div>
      <div class="inrow"><textarea id="ai_text" rows="2" placeholder="${T("π.χ. Αύριο 9 το πρωί να πάω στον Κολωνό να πάρω ξύλο")}"></textarea>
      <button type="button" class="micbtn" id="ai_mic" aria-label="${T("Φωνητική υπαγόρευση")}">${ic("mic",20)}</button></div>
      <button type="button" class="btn amber wide" id="ai_go" style="margin-top:8px">${T("Αυτόματη συμπλήρωση")}</button></div>`:""}
    <label for="f_title">${T("Τι πρέπει να γίνει")}</label>
    <input id="f_title" value="${esc(v.title)}" autocomplete="off">
    <div class="quick" id="f_titleTips">${(S.settings.taskTips||[]).map(t=>`<button type="button" data-tip="${esc(T(t))}">${esc(T(t))}</button>`).join("")}
      <button type="button" class="tipedit" data-act="editTaskTips" data-act2="local">${ic("edit",14)} ${T("Αλλαγή")}</button></div>
    <label for="f_client">${T("Πελάτης")}</label>
    <div class="inrow"><select id="f_client"><option value="">${T("Χωρίς πελάτη")}</option><option value="__new">+ ${T("Νέος πελάτης…")}</option>${opts}</select>
    <button type="button" class="btn ghost" id="f_editClient" title="${T("Επεξεργασία πελάτη")}" aria-label="${T("Επεξεργασία πελάτη")}" style="padding:10px">${ic("edit",20)}</button></div>
    <div id="addrWrap" style="display:none"><label for="f_place">${T("Διεύθυνση πελάτη")}</label><select id="f_place"></select></div>
    <div id="clientLoc" class="lw-status"></div>
    <div id="ownWrap" style="display:none"><button type="button" class="lwbtn pick" id="f_own" style="width:100%;margin-top:8px">${ic("pin",18)}<span id="f_ownTxt"></span></button></div>
    <label for="f_status">${T("Κατάσταση")}</label>
    <select id="f_status" class="stsel st-${v.status||"pending"}">${statusOptions(v.status||"pending")}</select>
    <div id="areaWrap"><label for="f_area">${T("Περιοχή")}</label><input id="f_area" list="areaList" autocomplete="off" value="${esc(v.area)}">${lwHTML({showAddr:true,address:v.address})}</div>
    <label for="f_start">${T("Ημέρα και ώρα")}</label>${dtHTML("f_start",v.start)}
    <label for="f_rb">${T("Υπενθύμιση")}</label><select id="f_rb">${REMB.map(m=>`<option value="${m}">${rbLabel(m)}</option>`).join("")}</select>
    <label for="f_end">${T("Λήξη ή προθεσμία")}</label>${dtHTML("f_end",v.end)}
    <label>${T("Ποιος θα πάει")}</label>
    <div class="pplrow" id="f_who">${people().map(p=>`<button type="button" class="pbtn" data-p="${p.id}" style="--pc:${p.color}"><span class="dotc" style="background:${p.color}"></span>${esc(T(p.name))}</button>`).join("")}
      <button type="button" class="pbtn" data-act="managePeople"><span class="dotc" style="background:var(--muted)">+</span>${T("Άτομα")}</button></div>
    <label for="f_near">${T("Ειδοποίηση όταν πλησιάσω το σημείο")}</label>
    <select id="f_near">${NEARD.map(m=>`<option value="${m}">${nearLabel(m)}</option>`).join("")}</select>
    <label>${T("Προτεραιότητα")}</label><div class="seg prio" id="f_prio"><button type="button" data-v="1">${T("Χαμηλή")}</button><button type="button" data-v="2">${T("Κανονική")}</button><button type="button" data-v="3">${T("Υψηλή")}</button></div>
    <label for="f_amount">${T("Τιμή της δουλειάς")}</label>
    <span class="curr"><b>€</b><input id="f_amount" inputmode="decimal" placeholder="0,00" value="${esc(v.amount??"")}"></span>
    ${isNew?"":`<div class="panel" id="tmoney"></div>`}
    <div class="two"><div><label for="f_warranty">${T("Εγγύηση")}</label>
      <select id="f_warranty"><option value="0">${T("Χωρίς εγγύηση")}</option><option value="3">${T("3 μήνες")}</option>
      <option value="6">${T("6 μήνες")}</option><option value="12">${T("1 χρόνος")}</option><option value="24">${T("2 χρόνια")}</option></select></div>
    <div><label for="f_completed">${T("Χρόνος αποπεράτωσης")}</label><input type="date" id="f_completed" value="${esc((v.completedOn||"").slice(0,10))}"></div></div>
    ${isNew?"":`<label style="margin-top:14px">${T("Τι παίρνω μαζί")}</label>
      <button type="button" class="btn ghost wide" data-act="checkSheet" data-id="${t0.id}" style="width:100%">
        ${ic("tasks",18)} ${T("Λίστα ελέγχου")}<b class="chkbadge" id="chkBadge"></b></button>
      <label style="margin-top:14px">${T("Φωτογραφίες")}</label>
      ${fotoBtnHTML("ergasia:"+t0.id,v.title||T("Εργασία"),"Φωτογραφία με καταμέτρηση")}
      <div class="panel pad" style="margin-top:10px"><div class="phogrid" id="phogrid"></div></div>`}
    <label for="f_desc">${T("Λεπτομέρειες")}</label><textarea id="f_desc" rows="3">${esc(v.desc)}</textarea>`,
    onSave:()=>{
      const title=val("f_title");if(!title){toast(T("Γράψε τι πρέπει να γίνει."));$("#f_title").focus();return false}
      const start=dtVal("f_start"),end=dtVal("f_end");
      if(start&&end&&new Date(end)<new Date(start)){toast(T("Η λήξη είναι πριν από την έναρξη."));return false}
      const amt=val("f_amount").replace(",",".");if(amt&&isNaN(+amt)){toast(T("Το ποσό πρέπει να είναι αριθμός."));return false}
      const cid=(val("f_client")!=="__new"&&val("f_client"))||null,status=val("f_status"),rb=+val("f_rb"),loc=cid?null:LW.loc;
      const has=cid?!!clientLoc(getClient(cid)):!!(loc||findArea(val("f_area")));
      if(!has){LW.attempted=true;LW.upd();if(!confirm(T("Η εργασία δεν έχει τοποθεσία και δεν θα μπαίνει στις διαδρομές. Να αποθηκευτεί έτσι;")))return false}
      const who=[...$("#f_who").querySelectorAll(".pbtn.on")].map(b=>b.dataset.p).filter(Boolean);
      const own=$("#f_own")&&$("#f_own").dataset.on==="1";
      const d={title,who:who.length?who:[people()[0].id],nearAlert:+val("f_near")||0,warrantyMonths:+val("f_warranty")||0,completedOn:val("f_completed")||"",clientId:cid,placeId:cid&&!own?(val("f_place")||""):"",ownLoc:!!own,desc:val("f_desc"),start,end,remindBefore:rb,priority:+($("#f_prio").dataset.v||2),status,amount:amt?+amt:null,paid:!!(t0&&t0.paid),
        area:(cid&&!own)?"":val("f_area"),address:(cid&&!own)?"":val("lw_addr"),
        lat:(cid&&!own)?null:(LW&&LW.loc?LW.loc.lat:null),lng:(cid&&!own)?null:(LW&&LW.loc?LW.loc.lng:null)};
      if(start!==orig.start||rb!==orig.remindBefore||isNew){const at=start?+new Date(start)-Math.max(0,rb)*60000:0;d.startNotified=start&&rb>=0?at<Date.now():false;d.snoozeUntil=null}
      if(status==="done"&&orig.status!=="done"){d.doneAt=Date.now();if(!d.completedOn)d.completedOn=new Date().toISOString().slice(0,10)}

      clearTimeout(autoT);clearDraft();
      if(isNew){d.id=uid();d.createdAt=Date.now();S.tasks.push(d);if(view==="tasks")taskFilter="open"}else Object.assign(t0,d);
      syncWarrantyReminder(isNew?d:t0);
      save();
      if(isNew&&!d.start&&!d.end&&isOpen(d)&&!isWaiting(d)&&!isSomeday(d)&&d.priority!==3){
        toast(d.priority===1?T("Προστέθηκε τελευταία στη λίστα, χαμηλή προτεραιότητα."):T("Προστέθηκε τελευταία στη λίστα, ώστε να προχωρήσουν πρώτα οι παλιότερες."));
      }else toast(isNew?T("Η εργασία προστέθηκε."):T("Οι αλλαγές αποθηκεύτηκαν."));
      if(d.priority===3&&isOpen(d)&&S.settings.manualOrder&&posOf(d.id)>1&&confirm(T("Είναι υψηλής προτεραιότητας. Να πάει πρώτη, πριν τις παλιότερες;")))moveTaskTo(d.id,1);
      else if(d.priority===3&&isOpen(d)&&!S.settings.manualOrder&&(isNew||!t0||t0.priority!==3))toast(T("Υψηλή προτεραιότητα: ανέβηκε ψηλά στη λίστα από μόνη της."));
    },
    onCancel:()=>{clearTimeout(autoT);clearDraft()},
    onDelete:isNew?null:()=>{clearDraft();trashTask(t0)},
    deleteMsg:T("Να πάει η εργασία στον κάδο; Θα πάρει μαζί και τις εισπράξεις ή τα έξοδά της.")});
  $("#f_warranty").value=String(v.warrantyMonths||0);
  if(!isNew){drawTaskMoney(t0);drawTaskPhotos(t0)}
  if(!isNew)$("#shBody").insertAdjacentHTML("beforeend",`<button type="button" class="btn ghost wide" id="f_another">${ic("plus",18)} ${T("Νέα εργασία για τον ίδιο πελάτη")}</button>`);
  $("#f_client").value=v.clientId||"";$("#f_status").value=v.status||"pending";
  $("#f_status").onchange=e=>{e.target.className="stsel st-"+e.target.value};$("#f_rb").value=String(REMB.includes(+v.remindBefore)?+v.remindBefore:0);
  $("#f_near").value=String(NEARD.includes(+v.nearAlert)?+v.nearAlert:0);
  const whoSel=new Set(v.who&&v.who.length?v.who:[people()[0].id]);
  const paint=()=>$("#f_who").querySelectorAll("[data-p]").forEach(b=>b.classList.toggle("on",whoSel.has(b.dataset.p)));
  $("#f_who").addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(!b)return;
    whoSel.has(b.dataset.p)?whoSel.delete(b.dataset.p):whoSel.add(b.dataset.p);sheetDirty=true;paint()});
  paint();
  segBind("f_prio",String(v.priority||2));
  lwBind({loc:loc0,addr:()=>[val("lw_addr"),val("f_area")].filter(Boolean).join(", "),area:()=>val("f_area"),markArea:true});
  let ownOn=!!v.ownLoc;
  const sync=()=>{const cv=$("#f_client").value,has=cv&&cv!=="__new",cl=$("#clientLoc");
    $("#ownWrap").style.display=has?"":"none";
    const ob=$("#f_own");if(ob){ob.dataset.on=ownOn?"1":"0";ob.classList.toggle("here",ownOn);
      $("#f_ownTxt").textContent=ownOn?T("Δική της διεύθυνση, όχι του πελάτη"):T("Άλλη διεύθυνση μόνο για αυτή τη δουλειά")}
    $("#areaWrap").style.display=(has&&!ownOn)?"none":"";
    const aw=$("#addrWrap"),sel=$("#f_place");
    if(has&&ownOn){cl.className="lw-status";cl.textContent=T("Η δουλειά έχει δική της διεύθυνση. Συμπλήρωσέ τη παρακάτω.");$("#addrWrap").style.display="none";return}
    if(has){
      const c=getClient(cv),list=clientAddrList(c);
      if(list.length>1){aw.style.display="";const cur=sel.value||v.placeId||"";
        sel.innerHTML=list.map(pl=>`<option value="${pl.id||""}">${esc(pl.label||T("Διεύθυνση"))}${placeText(pl)?" — "+esc(placeText(pl)):""}</option>`).join("");
        sel.value=[...sel.options].some(o=>o.value===cur)?cur:"";}
      else{aw.style.display="none";sel.innerHTML=""}
      const L=clientLoc(c,sel.value||null);
      cl.className="lw-status "+(L?"ok":"warn");
      cl.textContent=L?T("Τοποθεσία από τον πελάτη: {a}",{a:L.label}):T("Ο πελάτης δεν έχει τοποθεσία. Συμπλήρωσέ τη στην καρτέλα του.");
    }
    else{aw.style.display="none";cl.className="lw-status";cl.textContent=""}};
  $("#f_place").onchange=sync;
  $("#f_own").onclick=()=>{ownOn=!ownOn;sheetDirty=true;sync();if(ownOn)setTimeout(()=>$("#f_area")?.focus(),80)};
  const goNew=()=>{const dr=readTaskDraft();clientForm(null,{onDone:c=>taskForm(t0,null,{...dr,clientId:c.id}),onCancel:()=>taskForm(t0,null,dr)})};
  $("#f_client").onchange=()=>{if($("#f_client").value==="__new"){goNew();return}sync()};
  $("#f_editClient").onclick=()=>{const cid=val("f_client");
    if(!cid||cid==="__new"){toast(T("Διάλεξε πρώτα πελάτη."));return}
    const dr=readTaskDraft();
    clientForm(getClient(cid),{onDone:()=>taskForm(t0,null,dr),onCancel:()=>taskForm(t0,null,dr)});};
  sync();
  if(isNew){$("#ai_go").onclick=aiFill;$("#ai_mic").onclick=startMic}
  // Τίποτα δεν χάνεται αν κλείσει η εφαρμογή: κρατιέται πρόχειρο.
  // Η εργασία ΔΕΝ αλλάζει μέχρι να πατήσεις «Αποθήκευση», ώστε το «Άκυρο» να ακυρώνει στ' αλήθεια.
  const keepSafe=()=>{
    clearTimeout(autoT);
    autoT=setTimeout(()=>{
      if(!$("#f_title")||!$("#f_prio"))return;   // το φύλλο έκλεισε στο μεταξύ
      const d=readTaskDraft();
      if(d.title||d.desc||d.amount||d.start)saveDraft("task",isNew?d:Object.assign({},d,{_editId:t0.id}));
    },700);
  };
  $("#shBody").addEventListener("input",keepSafe);
  $("#shBody").addEventListener("change",keepSafe);
  $("#f_titleTips").onclick=e=>{
    if(e.target.closest("[data-act=editTaskTips]")){const dr=readTaskDraft();taskTipsSheet(()=>taskForm(t0,null,dr));return}
    const b=e.target.closest("[data-tip]");if(!b)return;
    $("#f_title").value=b.dataset.tip;sheetDirty=true};
  if(!isNew)$("#f_another").onclick=()=>{const cid=val("f_client");closeSheet();setTimeout(()=>taskForm(null,cid&&cid!=="__new"?cid:null),80)};
  if(draft)sheetDirty=true;
}

