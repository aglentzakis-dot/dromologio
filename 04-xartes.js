/* Δρομολόγιο — Τοποθεσίες, αποστάσεις, χάρτες. */
/* ---------- Τοποθεσίες & αποστάσεις ---------- */
function allAreas(){return AREAS.map(([name,lat,lng])=>({name,lat,lng})).concat(S.areas).concat(S.learned||[])}
// ό,τι περιοχή συναντάμε στον χάρτη μπαίνει στη μνήμη, ώστε να δουλεύει παντού, όχι μόνο στην Αττική
function learnArea(name,lat,lng){
  name=String(name||"").trim();
  if(!name||lat==null||lng==null)return null;
  const ex=findArea(name);if(ex)return ex;
  if(!Array.isArray(S.learned))S.learned=[];
  const o={name,lat:+lat,lng:+lng,auto:true};
  S.learned.push(o);if(S.learned.length>400)S.learned.shift();
  write();refreshLists();return o;
}
function findArea(name){const n=norm(name);if(!n)return null;return allAreas().find(a=>norm(a.name)===n)||null}
// βρίσκει περιοχή μέσα σε ελεύθερο κείμενο διεύθυνσης, π.χ. «Υπάτης 7, Αμπελόκηποι»
function areaInText(txt){
  const n=norm(txt);if(!n)return null;
  let best=null;
  allAreas().forEach(a=>{const k=norm(a.name);if(k.length>3&&n.includes(k)&&(!best||k.length>norm(best.name).length))best=a});
  return best;
}
function placeLoc(pl){
  if(!pl)return null;
  if(pl.lat!=null&&pl.lng!=null)return{lat:pl.lat,lng:pl.lng,label:pl.label||pl.area||T("Ακριβής θέση"),exact:true};
  const a=findArea(pl.area)||areaInText([pl.area,pl.street].filter(Boolean).join(", "));
  return a?{lat:a.lat,lng:a.lng,label:pl.label||a.name}:null;
}
function clientLoc(c,placeId){
  if(!c)return null;
  if(placeId){const pl=(c.places||[]).find(p=>p.id===placeId);const L=placeLoc(pl);if(L)return L}
  if(c.lat!=null&&c.lng!=null)return{lat:c.lat,lng:c.lng,label:c.area||T("Ακριβής θέση"),exact:true};
  const a=findArea(c.area)||areaInText([c.area,c.street,c.notes].filter(Boolean).join(", "));
  if(a)return{lat:a.lat,lng:a.lng,label:a.name};
  const first=(c.places||[]).map(placeLoc).find(Boolean);
  return first||null;
}
const clientAddrList=c=>[{id:"",label:T("Κύρια διεύθυνση"),street:c.street,number:c.number,area:c.area,zip:c.zip,floor:c.floor,lat:c.lat,lng:c.lng}]
  .concat((c.places||[]).map(pl=>Object.assign({},pl)));
const placeText=pl=>[[pl.street,pl.number].filter(Boolean).join(" "),pl.area,pl.zip].filter(Boolean).join(", ");
function taskLoc(x){
  if(x.ownLoc){
    if(x.lat!=null&&x.lng!=null)return{lat:x.lat,lng:x.lng,label:x.area||x.address||T("Ακριβής θέση"),exact:true};
    const a0=findArea(x.area)||areaInText([x.area,x.address].filter(Boolean).join(", "));
    if(a0)return{lat:a0.lat,lng:a0.lng,label:a0.name};
  }
  if(x.clientId){const c=getClient(x.clientId);if(c)return clientLoc(c,x.placeId)}
  if(x.lat!=null&&x.lng!=null)return{lat:x.lat,lng:x.lng,label:x.area||x.address||T("Ακριβής θέση"),exact:true};
  const a=findArea(x.area)||areaInText([x.area,x.address].filter(Boolean).join(", "));
  return a?{lat:a.lat,lng:a.lng,label:a.name}:null;
}
function baseLoc(){const b=S.settings.base;if(!b||!b.name)return null;if(b.lat!=null)return{lat:b.lat,lng:b.lng,label:b.name};const a=findArea(b.area);return a?{lat:a.lat,lng:a.lng,label:b.name}:null}
function resolvePlace(str){
  if(!str)return null;const B=baseLoc();if(B&&norm(str)===norm(B.label))return B;
  const a=findArea(str);if(a)return{lat:a.lat,lng:a.lng,label:a.name};
  const c=S.clients.find(c=>norm(c.name)===norm(str));if(c){const L=clientLoc(c);if(L)return{...L,label:c.name}}
  return null;
}
function km(a,b){const R=6371,r=x=>x*Math.PI/180;const dLa=r(b.lat-a.lat),dLo=r(b.lng-a.lng);
  const h=Math.sin(dLa/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h))*1.3}
const fmtLL=p=>p.lat.toFixed(6)+", "+p.lng.toFixed(6);
const localFile=()=>!/^https?:$/.test(location.protocol);
const geoBlockedByFrame=()=>{try{if(!inFrame())return false;const f=document.featurePolicy||document.permissionsPolicy;
  return f&&f.allowsFeature?!f.allowsFeature("geolocation"):true}catch(e){return true}};
async function geoPermState(){try{if(!navigator.permissions||!navigator.permissions.query)return null;
  return (await navigator.permissions.query({name:"geolocation"})).state}catch(e){return null}}
async function geoReport(){
  const st=await geoPermState();
  return [T("Τρόπος ανοίγματος")+": "+(localFile()?T("τοπικό αρχείο ({p}) — χωρίς τοποθεσία, επαφές και ασφαλή αποθήκευση",{p:location.protocol}):T("κανονική ιστοσελίδα")),T("Ασφαλής σύνδεση")+": "+(window.isSecureContext?T("ναι"):T("όχι")),
    T("Μέσα σε πλαίσιο άλλης σελίδας")+": "+(inFrame()?(geoBlockedByFrame()?T("ναι, με φραγή θέσης"):T("ναι")):T("όχι")),
    T("Άδεια της σελίδας")+": "+(st==="granted"?T("δόθηκε"):st==="denied"?T("απορρίφθηκε"):st==="prompt"?T("θα ζητηθεί"):T("άγνωστη"))].join("\n");
}
async function getPos(cb){
  if(!navigator.geolocation){toast(T("Η συσκευή δεν δίνει θέση."));return}
  if(localFile()){toast(T("Η εφαρμογή τρέχει ως αρχείο από τις Λήψεις. Το Chrome δεν δίνει τοποθεσία σε αρχεία — ανέβασέ τη στο διαδίκτυο ή βάλε διεύθυνση και σημείο στον χάρτη."));return}
  if(!window.isSecureContext){toast(T("Η θέση λειτουργεί μόνο όταν η σελίδα ανοίγει με ασφαλή σύνδεση."));return}
  if(geoBlockedByFrame()){toast(T("Μέσα στην προεπισκόπηση η θέση δεν επιτρέπεται. Άνοιξε την εφαρμογή από τη σελίδα της στο Chrome."));return}
  const st=await geoPermState();
  if(st==="denied"){toast(T("Η τοποθεσία είναι μπλοκαρισμένη για αυτή τη σελίδα στο Chrome. Πάτα το εικονίδιο αριστερά από τη διεύθυνση, «Άδειες», και επίτρεψε την τοποθεσία."));return}
  toast(st==="prompt"?T("Ζητείται άδεια τοποθεσίας…"):T("Εντοπισμός θέσης…"));
  const ok=p=>cb({lat:p.coords.latitude,lng:p.coords.longitude});
  const fail=err=>{
    if(err.code===1)toast(st==="granted"?T("Η άδεια υπάρχει, αλλά το σύστημα δεν έδωσε θέση. Άνοιξε την Τοποθεσία του κινητού και ξαναδοκίμασε."):T("Δεν δόθηκε άδεια τοποθεσίας. Όταν εμφανιστεί το μήνυμα του Chrome, πάτα «Να επιτρέπεται»."));
    else if(err.code===3)toast(T("Η θέση άργησε να βρεθεί. Βγες σε ανοιχτό χώρο ή δοκίμασε ξανά."));
    else toast(T("Δεν βρέθηκε θέση. Έλεγξε ότι η τοποθεσία του κινητού είναι ανοιχτή."));
  };
  // πρώτα ακριβής θέση· αν αποτύχει για άλλο λόγο εκτός από άρνηση, δοκιμάζουμε πιο χαλαρά
  navigator.geolocation.getCurrentPosition(ok,err=>{
    if(err.code===1)return fail(err);
    navigator.geolocation.getCurrentPosition(ok,fail,{enableHighAccuracy:false,timeout:20000,maximumAge:300000});
  },{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
}
/* αναγνώριση συντεταγμένων σε πολλές μορφές, όπως στην εφαρμογή ψαρέματος */
function parseCoords(s){
  s=String(s||"").trim();if(!s)return null;let m;
  const ok=(a,b)=>{a=+a;b=+b;return isFinite(a)&&isFinite(b)&&Math.abs(a)<=90&&Math.abs(b)<=180&&!(a===0&&b===0)?{lat:a,lng:b}:null};
  if(/goo\.gl|maps\.app/i.test(s))return"short";
  if((m=s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)))return ok(m[1],m[2]);
  if((m=s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)))return ok(m[1],m[2]);
  if((m=s.match(/[?&](?:q|query|ll|destination|center|daddr)=(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/i)))return ok(m[1],m[2]);
  const parts=[...s.matchAll(/(\d{1,3})\s*[°º]\s*(\d{1,2})\s*['’′]\s*(\d{1,2}(?:[.,]\d+)?)?\s*(?:["”″]|'')?\s*([NSEWΒΝΑΔ])?/gi)];
  if(parts.length>=2){const cv=p=>{let v=+p[1]+(+p[2])/60+(p[3]?+p[3].replace(",",".")/3600:0);if(/[SWΝΔ]/.test(p[4]||""))v=-v;return v};return ok(cv(parts[0]),cv(parts[1]))}
  if((m=s.match(/(-?\d{1,2}[.,]\d{2,})\s*[,;\s]\s*(-?\d{1,3}[.,]\d{2,})/)))return ok(m[1].replace(",","."),m[2].replace(",","."));
  return null;
}
// «Αγίου Νικολάου 5, Ντράφι 190 09» -> οδός, περιοχή, ΤΚ
function splitAddress(txt){
  let t=String(txt||"").replace(/\s+/g," ").trim();if(!t)return null;
  let zip="";
  t=t.replace(/\b(\d{3})\s?(\d{2})\b/,(m,a,b)=>{zip=a+b;return ""}).replace(/\s+/g," ").trim();
  t=t.replace(/(^|,)\s*(Ελλάδα|Greece|GR)\s*(,|$)/i,"$1").replace(/,\s*,/g,",").replace(/^[,\s]+|[,\s]+$/g,"");
  const parts=t.split(",").map(x=>x.trim()).filter(Boolean);
  let street="",area="";
  if(parts.length>=2){street=parts[0];area=parts[parts.length-1];
    const known=parts.slice(1).map(findArea).filter(Boolean)[0];if(known)area=known.name}
  else if(parts.length===1){
    const a=areaInText(parts[0]);
    if(a&&norm(parts[0])!==norm(a.name)){area=a.name;street=parts[0].replace(new RegExp(escRe(a.name),"i"),"").replace(/[,\s]+$/,"").trim()}
    else if(a){area=a.name}else street=parts[0];
  }
  return(street||area||zip)?{street,area,zip}:null;
}
function applySplit(txt,fStreet,fArea,fZip){
  const d=splitAddress(txt);if(!d)return false;
  const got=[];
  const set=(id,v)=>{const el=$("#"+id);if(el&&v){el.value=v;return true}return false};
  if(d.street&&set(fStreet,d.street))got.push(T("οδός"));
  if(d.area&&set(fArea,d.area))got.push(T("περιοχή"));
  if(d.zip&&set(fZip,d.zip))got.push(T("ΤΚ"));
  if(got.length>1){sheetDirty=true;toast(T("Χωρίστηκε σε: {x}.",{x:got.join(", ")}));if(LW&&LW.upd)LW.upd();return true}
  return false;
}
function refreshLists(){
  const areas=allAreas().map(a=>`<option value="${esc(a.name)}">`).join("");
  $("#areaList").innerHTML=areas;const B=baseLoc();
  $("#placeList").innerHTML=(B?`<option value="${esc(B.label)}">`:"")+areas+S.clients.map(c=>`<option value="${esc(c.name)}">`).join("");
}

/* ---------- Χάρτης επιλογής σημείου ---------- */
let leafletP=null,MAP=null,MK=null,mapCb=null,mapPt=null;
function loadLeaflet(){
  if(window.L&&window.L.map)return Promise.resolve();if(leafletP)return leafletP;
  leafletP=new Promise((res,rej)=>{
    const c=document.createElement("link");c.rel="stylesheet";c.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(c);
    const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=res;s.onerror=()=>{leafletP=null;rej()};document.head.appendChild(s);
  });return leafletP;
}
async function openMapPicker(start,center,cb){
  try{await loadLeaflet()}catch(e){toast(T("Ο χάρτης χρειάζεται σύνδεση στο διαδίκτυο."));return}
  const Lf=window.L;mapCb=cb;mapPt=start?{...start}:null;const c=start||center||baseLoc()||{lat:37.9755,lng:23.7348};
  $("#mapT").textContent=T("Πάτα στον χάρτη για να διαλέξεις σημείο");
  $("#mapMe").innerHTML=ic("pin",18)+esc(T("Η θέση μου"));$("#mapUse").textContent=T("Χρήση σημείου");
  $("#mapDlg").classList.add("open");
  if(!MAP){MAP=Lf.map("mapBox").setView([c.lat,c.lng],start?17:13);
    Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(MAP);
    MAP.on("click",e=>setMapPt({lat:e.latlng.lat,lng:e.latlng.lng}));}
  else MAP.setView([c.lat,c.lng],start?17:13);
  if(MK){MK.remove();MK=null}if(mapPt)setMapPt(mapPt);
  setTimeout(()=>MAP.invalidateSize(),80);
}
function setMapPt(p){const Lf=window.L;mapPt=p;
  if(MK)MK.setLatLng([p.lat,p.lng]);
  else{MK=Lf.marker([p.lat,p.lng],{draggable:true,icon:Lf.divIcon({className:"mkpin",html:PINSVG,iconSize:[38,38],iconAnchor:[19,37]})}).addTo(MAP);
    MK.on("dragend",()=>{const q=MK.getLatLng();mapPt={lat:q.lat,lng:q.lng}})}}
const mapOpen=()=>$("#mapDlg").classList.contains("open");
function closeMap(){$("#mapDlg").classList.remove("open")}
$("#mapUse").onclick=()=>{if(!mapPt){toast(T("Πάτα πρώτα ένα σημείο στον χάρτη."));return}closeMap();if(mapCb)mapCb(mapPt)};
$("#mapX").onclick=closeMap;
$("#mapMe").onclick=()=>getPos(p=>{setMapPt(p);MAP.setView([p.lat,p.lng],17)});

/* ---------- Κοινό πλαίσιο τοποθεσίας (διεύθυνση, συντεταγμένες, χάρτης, «είμαι εκεί») ---------- */
let LW=null;
function lwHTML(o){
  return `<div class="lw">
  ${o.showAddr?`<label for="lw_addr">${T("Διεύθυνση")}</label><input id="lw_addr" value="${esc(o.address)}" placeholder="${T("Οδός και αριθμός, περιοχή")}" autocomplete="off">`:""}
  <div class="lw-row"><button type="button" class="lwbtn here" id="lw_here">${ic("pin",18)}${T("Είμαι εκεί τώρα")}</button>
    <button type="button" class="lwbtn pick" id="lw_map">${ic("map",18)}${T("Επιλογή στον χάρτη")}</button></div>
  <div class="lw-row"><button type="button" class="lwbtn" id="lw_find">${ic("search",18)}${T("Εύρεση διεύθυνσης")}</button>
    <a class="lwbtn" id="lw_gmap" href="#" target="_blank" rel="noopener">${ic("map",18)}${T("Στους Χάρτες Google")}</a></div>
  <label for="lw_coords">${T("Συντεταγμένες ή σύνδεσμος χάρτη")}</label>
  <input id="lw_coords" placeholder="${T("π.χ. 37.9601, 23.7530")}" autocomplete="off">
  <div id="lw_status" class="lw-status"></div><div id="lw_choices"></div></div>`;
}
function lwBind(o){
  LW={attempted:false,loc:o.loc||null,addr:o.addr||(()=>""),area:o.area||(()=>""),required:!!o.required};
  const coords=$("#lw_coords");if(LW.loc)coords.value=fmtLL(LW.loc);
  const upd=()=>{
    const st=$("#lw_status");if(!st)return;const q=LW.addr();
    $("#lw_gmap").href=LW.loc?`https://www.google.com/maps/search/?api=1&query=${LW.loc.lat},${LW.loc.lng}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q||"")}`;
    const a=findArea(LW.area());
    if(LW.loc){st.className="lw-status ok";st.innerHTML=`✓ ${T("Ακριβής θέση αποθηκευμένη.")} <button type="button" class="lk" id="lw_clear">${T("Καθαρισμός")}</button>`;
      $("#lw_clear").onclick=()=>{LW.loc=null;coords.value="";sheetDirty=true;upd()}}
    else if(a){st.className="lw-status";st.textContent=T("Θα χρησιμοποιηθεί το κέντρο της περιοχής {a}. Για ακρίβεια βάλε διεύθυνση ή σημείο.",{a:a.name})}
    else{st.className="lw-status"+(LW.attempted?" warn":"");st.textContent=LW.attempted?T("Χωρίς τοποθεσία. Δεν θα εμφανίζεται στις διαδρομές."):T("Πρόσθεσε τοποθεσία για να μπαίνει στις διαδρομές.")}
    const ai=$("#f_area");if(ai&&o.markArea)ai.classList.toggle("warn",LW.attempted&&!LW.loc&&!a);
  };
  coords.oninput=()=>{const v=coords.value.trim();if(!v){LW.loc=null;upd();return}
    const p=parseCoords(v);
    if(p==="short"){const st=$("#lw_status");st.className="lw-status warn";
      st.innerHTML=esc(T("Ο σύντομος σύνδεσμος δεν διαβάζεται. Άνοιξέ τον στους Χάρτες, πάτα παρατεταμένα το σημείο, αντέγραψε τις συντεταγμένες και επικόλλησέ τες εδώ."))+
      ` <a class="lk" href="${esc(v)}" target="_blank" rel="noopener">${T("Άνοιγμα συνδέσμου")}</a>`;return}
    if(p){LW.loc=p;sheetDirty=true;upd();clearTimeout(coords._t);coords._t=setTimeout(()=>reverseFill(p),700)}else{const st=$("#lw_status");st.className="lw-status warn";st.textContent=T("Δεν αναγνωρίστηκαν συντεταγμένες σε αυτό το κείμενο.")}};
  const addrEl=$("#lw_addr");
  if(addrEl){const doSplit=()=>{const v=addrEl.value;if(!/[,]|\d{3}\s?\d{2}/.test(v))return;
      const d=splitAddress(v);if(!d)return;
      if(d.street)addrEl.value=d.street;
      const ar=$("#f_area")||$("#p_area");if(ar&&d.area&&!ar.value)ar.value=d.area;
      if(d.zip)addrEl.value=(addrEl.value+" "+(d.area&&!ar?d.area:"")).trim();
      sheetDirty=true;if(LW&&LW.upd)LW.upd();
      if(d.area||d.zip)toast(T("Η διεύθυνση χωρίστηκε σε οδό, περιοχή και ΤΚ."))};
    addrEl.addEventListener("paste",()=>setTimeout(doSplit,60));}
  $("#lw_here").onclick=()=>getPos(p=>{LW.loc=p;coords.value=fmtLL(p);sheetDirty=true;upd();toast(T("Η θέση αποθηκεύτηκε στη φόρμα."));reverseFill(p)});
  $("#lw_map").onclick=()=>{const a=findArea(LW.area());openMapPicker(LW.loc,a,p=>{LW.loc=p;coords.value=fmtLL(p);sheetDirty=true;upd();reverseFill(p)})};
  $("#lw_find").onclick=()=>geocodeLW(false);
  $("#lw_gmap").onclick=e=>{if(!LW.loc&&!LW.addr()){e.preventDefault();toast(T("Γράψε πρώτα διεύθυνση."))}};
  ["lw_addr","f_area","f_street","f_number","f_zip","p_area"].forEach(id=>{const el=$("#"+id);if(el)el.addEventListener("input",upd)});
  // αυτόματη εύρεση: μόλις σταματήσεις να γράφεις διεύθυνση και δεν υπάρχει θέση
  const pending=()=>!!$("#lw_choices")?.children.length;
  const tryAuto=()=>{if($("#lw_choices")&&LW&&!LW.loc&&!pending()&&LW.addr().length>5)geocodeLW(true)};
  const auto=()=>{clearTimeout(LW._t);if($("#lw_choices"))$("#lw_choices").innerHTML="";LW._t=setTimeout(tryAuto,1300)};
  ["lw_addr","f_street","f_number","f_area","f_zip","p_area"].forEach(id=>{const el=$("#"+id);if(el){el.addEventListener("input",auto);el.addEventListener("blur",()=>{clearTimeout(LW._t);setTimeout(tryAuto,150)})}});
  LW.upd=upd;upd();
}
async function reverseFill(p,silent){
  if(!LW)return;
  const st=$("#lw_status");if(st&&!silent){st.className="lw-status";st.textContent=T("Αναζήτηση διεύθυνσης από το σημείο…")}
  try{
    const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&accept-language=${LANG}&lat=${p.lat}&lon=${p.lng}`);
    const js=await r.json(),a=js&&js.address;if(!a)throw 0;
    const road=a.road||a.pedestrian||a.footway||"",num=a.house_number||"",zip=a.postcode||"";
    const cand=[a.neighbourhood,a.suburb,a.quarter,a.city_district,a.village,a.town,a.municipality,a.city].filter(Boolean);
    const known=cand.map(x=>findArea(x)).find(Boolean);
    const area=known?known.name:(cand[0]||"");
    if(!known&&area)learnArea(area,p.lat,p.lng);
    const set=(id,v,force)=>{const el=$("#"+id);if(el&&v&&(force||!el.value.trim())){el.value=v;return true}return false};
    const f=[];
    if($("#f_street")){ // φόρμα πελάτη: χωριστά πεδία
      if(set("f_street",road,true))f.push(T("οδός"));
      if(set("f_number",num,true))f.push(T("αριθμός"));
      if(set("f_zip",zip,true))f.push(T("ΤΚ"));
    }else if(set("lw_addr",[road,num].filter(Boolean).join(" ")||js.display_name.split(",").slice(0,2).join(","),true))f.push(T("διεύθυνση"));
    if(set("f_area",area,true)||set("p_area",area,true))f.push(T("περιοχή"));
    sheetDirty=true;LW.upd();
    if(f.length&&!silent)toast(T("Συμπληρώθηκαν από το σημείο: {x}.",{x:f.join(", ")}));
    else if(!f.length&&!silent)toast(T("Το σημείο αποθηκεύτηκε, αλλά δεν βρέθηκε διεύθυνση για αυτό."));
  }catch(e){LW.upd();if(!silent)toast(T("Η διεύθυνση δεν βρέθηκε από το σημείο. Χρειάζεται σύνδεση στο διαδίκτυο."))}
}
async function geocodeLW(silent){
  if(!LW||!$("#lw_status"))return;
  const raw=($("#lw_addr")?.value||"").trim(),direct=parseCoords(raw);
  if(direct&&direct!=="short"){LW.loc=direct;$("#lw_coords").value=fmtLL(direct);sheetDirty=true;reverseFill(direct);return}
  const q=LW.addr();if(!q){if(!silent)toast(T("Γράψε πρώτα διεύθυνση."));return}
  const st=$("#lw_status");st.className="lw-status";st.textContent=T("Αναζήτηση…");$("#lw_choices").innerHTML="";
  try{
    const B=baseLoc();
    const vb=B?`&viewbox=${(B.lng-0.6).toFixed(3)},${(B.lat+0.5).toFixed(3)},${(B.lng+0.6).toFixed(3)},${(B.lat-0.5).toFixed(3)}&bounded=0`:`&viewbox=23.20,38.35,24.20,37.60&bounded=0`;
    const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=gr&addressdetails=1&accept-language=${LANG}${vb}&q=${encodeURIComponent(q)}`);
    const js=await r.json();
    if(!js.length){LW.upd();if(!silent)toast(T("Δεν βρέθηκε η διεύθυνση. Δοκίμασε στους Χάρτες Google ή διάλεξε στον χάρτη."));return}
    const pick=x=>{LW.loc={lat:+x.lat,lng:+x.lon};
      const ar=(LW.area&&LW.area())||((x.address&&(x.address.suburb||x.address.city||x.address.town||x.address.village))||"");
      if(ar)learnArea(ar,+x.lat,+x.lon);$("#lw_coords").value=fmtLL(LW.loc);$("#lw_choices").innerHTML="";sheetDirty=true;LW.upd();toast(T("Η διεύθυνση βρέθηκε. Έλεγξέ τη στον χάρτη αν θέλεις."))};
    if(js.length===1)return pick(js[0]);
    st.className="lw-status pick";st.textContent=T("Βρέθηκαν {n} σημεία. Πάτα παρακάτω αυτό που θέλεις.",{n:js.length});
    const box=$("#lw_choices");
    const short=x=>{const parts=String(x.display_name||"").split(",").map(t=>t.trim()).filter(Boolean);
      return `<b>${esc(parts.slice(0,2).join(", "))}</b>${parts.length>2?`<small>${esc(parts.slice(2,5).join(", "))}</small>`:""}`};
    box.innerHTML=js.map((x,i)=>`<button type="button" class="choice" data-i="${i}"><span class="cp">${ic("pin",18)}</span><span class="ctx">${short(x)}</span></button>`).join("");
    // επιλογή μόνο με καθαρό πάτημα: αν το δάχτυλο μετακινηθεί (κύλιση), δεν επιλέγεται τίποτα
    let pd=null;
    box.onpointerdown=e=>{pd={x:e.clientX,y:e.clientY,t:Date.now()}};
    box.onpointerup=e=>{const b=e.target.closest("[data-i]");if(!b||!pd)return;
      const moved=Math.hypot(e.clientX-pd.x,e.clientY-pd.y);pd=null;
      if(moved>10)return; // ήταν κύλιση, όχι επιλογή
      e.preventDefault();pick(js[+b.dataset.i])};
    box.onclick=e=>e.preventDefault();
    setTimeout(()=>box.scrollIntoView({behavior:"smooth",block:"center"}),60);
  }catch(e){LW.upd();if(!silent)toast(T("Η αναζήτηση χρειάζεται σύνδεση στο διαδίκτυο."))}
}

/* ---------- Χάρτης δουλειών ---------- */
let JM=null,jmLayer=null,jmDay=null,jmFilter="all",jmOwedClosed=false;
const dayKey=d=>{const x=new Date(d);return x.getFullYear()+"-"+pad(x.getMonth()+1)+"-"+pad(x.getDate())};
const taskDates=x=>[x.start,x.end,x.doneAt,x.cancelledAt].filter(Boolean).map(dayKey);
const jmStatus=x=>x.status==="done"?"done":x.status==="cancelled"?"cx":x.status==="waiting"?"wait":taskState(x)==="late"?"late":x.status==="progress"?"prog":x.status==="appt"?"appt":x.status==="inspect"?"insp":"open";
const JMC={open:"#F2B632",prog:"#2468B5",late:"#C8412B",wait:"#0E7490",done:"#2E7D5B",cx:"#8A96A3",owe:"#8E1F3F",appt:"#8A4FBF",insp:"#B45309"};
const jmOwedAmt=x=>x.status==="done"&&!x.paid&&(+x.amount||0)>0?Math.max(0,rnd((+x.amount||0)-taskPaid(x))):0;
// Φίλτρα = οι ίδιες καταστάσεις με τη φόρμα εργασίας (με την ίδια σειρά), συν «Οφειλές» και «Εκπρόθεσμες».
const JMF=[["all","Όλες",""],["owed","Οφειλές",JMC.owe],["late","Εκπρόθεσμες",JMC.late],["appt","Ραντεβού",JMC.appt],["insp","Έλεγχος",JMC.insp],
  ["wait","Προσφορές",JMC.wait],["open","Εκκρεμεί",JMC.open],["prog","Σε εξέλιξη",JMC.prog],["cx","Ακυρωμένες",JMC.cx],["done","Ολοκληρωμένες",JMC.done]];
function jmMatch(x){
  if(jmFilter==="all")return true;
  if(jmFilter==="owed")return jmOwedAmt(x)>0.004;
  return jmStatus(x)===jmFilter;
}
function jmJobs(){
  return S.tasks.filter(x=>{
    if(!alive(x))return false;   // ό,τι πήγε στον κάδο δεν εμφανίζεται πουθενά στον χάρτη
    if(!taskLoc(x))return false;
    if(!jmMatch(x))return false;
    if(jmDay)return taskDates(x).includes(jmDay);
    if(jmFilter==="owed")return jmOwedAmt(x)>0.004;
    if(jmFilter==="done"||jmFilter==="cx")return true;   // τα κλεισμένα φαίνονται όταν τα ζητήσεις ρητά
    return isOpen(x)||jmOwedAmt(x)>0.004;
  });
}
function jmRenderFilters(){
  const box=$("#jmFilters");if(!box)return;
  box.innerHTML=JMF.map(([k,l,col])=>`<button data-jf="${k}" class="${jmFilter===k?"on":""}">${col?`<span class="dotc2" style="background:${col}"></span>`:""}${T(l)}</button>`).join("");
  box.onclick=e=>{const b=e.target.closest("[data-jf]");if(!b)return;jmFilter=b.dataset.jf;
    if(jmDay&&!jmDaysList().some(([k])=>k===jmDay)){jmDay=null;$("#jmDate").value=""}
    jmRenderFilters();jmRenderStrip();jmDraw(true)};
}
function jmDaysList(){
  const m=new Map();
  // μετράμε μόνο ό,τι θα φαινόταν πραγματικά με το ενεργό φίλτρο, ώστε να μη βγαίνει άδεια μέρα
  S.tasks.forEach(x=>{if(!taskLoc(x)||!jmMatch(x))return;[...new Set(taskDates(x))].forEach(k=>m.set(k,(m.get(k)||0)+1))});
  // μόνο μέρες που έχουν πράγματι δουλειές με τοποθεσία· οι άδειες δεν εμφανίζονται καθόλου
  return[...m.entries()].filter(([,n])=>n>0).sort((a,b)=>b[0].localeCompare(a[0]));
}
function jmRenderStrip(){
  const strip=$("#jmDays"),open=S.tasks.filter(x=>isOpen(x)&&taskLoc(x)&&jmMatch(x)).length;
  strip.innerHTML=`<button data-d="" class="${jmDay?"":"on"}">${T("Σε εκκρεμότητα")} <i>${open}</i></button>`+
    jmDaysList().map(([k,n])=>{const d=new Date(k+"T12:00");
      const lbl=k===dayKey(new Date())?T("Σήμερα"):d.toLocaleDateString(LOC(),{weekday:"short",day:"numeric",month:"numeric"});
      return `<button data-d="${k}" class="${jmDay===k?"on":""} ${n?"has":""}">${cap(lbl)} <i>${n}</i></button>`}).join("");
  strip.onclick=e=>{const b=e.target.closest("[data-d]");if(!b)return;jmDay=b.dataset.d||null;
    $("#jmDate").value=jmDay||"";jmRenderStrip();jmDraw(true)};
  const on=strip.querySelector(".on");if(on)on.scrollIntoView({inline:"center",block:"nearest"});
}
function jmDraw(fit){
  const Lf=window.L;if(!JM)return;
  if(jmLayer)jmLayer.remove();
  jmLayer=Lf.layerGroup().addTo(JM);
  const jobs=jmJobs(),pts=[];
  jobs.forEach(x=>{
    const L=taskLoc(x),c=x.clientId&&getClient(x.clientId);
    const owe=jmOwedAmt(x),st=owe>0.004?"owe":jmStatus(x),col=JMC[st];
    pts.push([L.lat,L.lng]);
    const mk=Lf.marker([L.lat,L.lng],{icon:Lf.divIcon({className:"jpin",iconSize:[34,42],iconAnchor:[17,41],
      html:`<svg viewBox="0 0 24 30" width="34" height="42"><path d="M12 29S3 18.5 3 11.5A9 9 0 0121 11.5C21 18.5 12 29 12 29z" fill="${col}" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="11.5" r="3.6" fill="#fff"/></svg>`})}).addTo(jmLayer);
    const nav=`https://www.google.com/maps/dir/?api=1&destination=${L.lat},${L.lng}`;
    mk.bindPopup(`<div class="jpop"><b>${esc(x.title)}</b>
      <div class="meta">${[c?esc(c.name):"",esc(L.label),x.amount?money(x.amount):"",T(({open:"Εκκρεμεί",prog:"Σε εξέλιξη",late:"Εκπρόθεσμη",wait:"Προσφορά, αναμονή απάντησης",done:"Ολοκληρώθηκε",cx:"Ακυρώθηκε",owe:"Χρωστάει",appt:"Ραντεβού",insp:"Έλεγχος"})[st])].filter(Boolean).join(" · ")}</div>
      ${owe>0.004?`<div class="meta" style="color:var(--red);font-weight:800">${T("Οφείλει")} ${money(owe)}</div>`:""}
      ${whenText(x)?`<div class="meta">${whenText(x)}</div>`:""}
      <div class="row2"><button data-jt="${x.id}">${T("Άνοιγμα εργασίας")}</button>${c?`<button data-jc="${c.id}">${T("Καρτέλα πελάτη")}</button>`:""}<a href="${nav}" target="_blank" rel="noopener">${T("Πλοήγηση")}</a></div></div>`);
  });
  $("#jmT").textContent=jmDay?T("Δουλειές: {d}",{d:new Date(jmDay+"T12:00").toLocaleDateString(LOC(),{weekday:"long",day:"numeric",month:"long"})})
    :T("Δουλειές σε εκκρεμότητα ({n})",{n:jobs.length});
  const owedTotal=rnd(jobs.reduce((s,x)=>s+jmOwedAmt(x),0));
  const bar=$("#jmOwed");
  if(owedTotal>0.004&&!jmOwedClosed){bar.hidden=false;$("#jmOwedTxt").textContent=T("Σου χρωστάνε από αυτές τις δουλειές: {a}",{a:money(owedTotal)})}
  else bar.hidden=true;
  if(fit&&pts.length){
    if(pts.length===1)JM.setView(pts[0],15);
    else JM.fitBounds(pts,{padding:[50,60],maxZoom:17});
  }
  if(!jobs.length)toast(jmDay?T("Καμία δουλειά με τοποθεσία αυτή τη μέρα."):T("Καμία εκκρεμότητα με τοποθεσία."));
}
function jmUpdateOwedToggle(){
  const b=$("#jmOwedToggle");if(!b)return;
  b.innerHTML=ic(S.settings.jmShowOwed?"money":"filter",18);
  b.title=S.settings.jmShowOwed?T("Απόκρυψη οφειλών"):T("Εμφάνιση οφειλών");
  b.setAttribute("aria-label",b.title);
  b.style.opacity=S.settings.jmShowOwed?"1":".45";
}
async function openJobsMap(){
  try{await loadLeaflet()}catch(e){toast(T("Ο χάρτης χρειάζεται σύνδεση στο διαδίκτυο."));return}
  const Lf=window.L;
  $("#jmX").setAttribute("aria-label",T("Κλείσιμο"));$("#jmMe").innerHTML=ic("pin",18);
  $("#jmMe").setAttribute("aria-label",T("Η θέση μου"));$("#jmMe").title=T("Η θέση μου");
  $("#jmLbl").textContent=T("Δες μέρα:");$("#jmDate").setAttribute("aria-label",T("Δες μέρα"));
  decorateTime($("#jobsDlg"));
  // Το παλιό κουμπί «εμφάνιση/απόκρυψη οφειλών» έφυγε: η μπάρα οφειλών κλείνει με το ✕ της και ξαναβγαίνει την επόμενη φορά.
  jmOwedClosed=false;const tg=$("#jmOwedToggle");if(tg)tg.style.display="none";
  $("#jmOwedX").onclick=()=>{jmOwedClosed=true;$("#jmOwed").hidden=true};
  jmRenderFilters();
  $("#jobsDlg").classList.add("open");
  if(!JM){
    const B=baseLoc()||{lat:37.9755,lng:23.7348};
    JM=Lf.map("jmBox",{zoomControl:true}).setView([B.lat,B.lng],12);
    Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(JM);
    JM.on("popupopen",e=>{const el=e.popup.getElement();
      const b=el.querySelector("[data-jt]");
      if(b)b.onclick=()=>{const x=S.tasks.find(y=>y.id===b.dataset.jt);closeJobsMap();if(x)taskForm(x)};
      const cb=el.querySelector("[data-jc]");
      if(cb)cb.onclick=()=>{closeJobsMap();clientId=cb.dataset.jc;view="client";render();window.scrollTo(0,0)}});
  }
  jmRenderStrip();
  setTimeout(()=>{JM.invalidateSize();jmDraw(true)},120);
  setTimeout(()=>{JM.invalidateSize();jmDraw(true)},420);
}
const jobsMapOpen=()=>$("#jobsDlg").classList.contains("open");
function closeJobsMap(){$("#jobsDlg").classList.remove("open")}
$("#jmX").onclick=closeJobsMap;
$("#jmDate").onchange=e=>{jmDay=e.target.value||null;jmRenderStrip();jmDraw(true)};
$("#jmMe").onclick=()=>getPos(p=>{myPos=p;JM.setView([p.lat,p.lng],15);
  window.L.circleMarker([p.lat,p.lng],{radius:8,color:"#fff",weight:3,fillColor:"#2468B5",fillOpacity:1}).addTo(jmLayer)});

