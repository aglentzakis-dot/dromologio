/* Δρομολόγιο — Πρόσθετη εφαρμογή «Identify-AI» (αναγνώριση εξαρτήματος από φωτογραφία).
   Ανοίγει σε πλήρη οθόνη ΜΕΣΑ στο Δρομολόγιο (ενσωματωμένο πλαίσιο), με κουμπί επιστροφής.
   Ο κώδικας του Identify-AI δεν αλλάζει καθόλου· όλη η σύνδεση γίνεται από εδώ.
   Το πλαίσιο έχει άδεια για κάμερα, ώστε να δουλεύει η φωτογράφιση. */

const IDENT_URL="https://aglentzakis-dot.github.io/Identify-AI/";
const IDENT_ICON="🔩";

function identBuild(){
  let d=$("#identDlg");if(d)return d;
  d=document.createElement("div");d.id="identDlg";d.className="identdlg";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");
  d.innerHTML=`<div class="ident-top">
      <button type="button" class="ident-back" id="identBack">‹ ${T("Πίσω")}</button>
      <b id="identT">${IDENT_ICON} Identify-AI</b>
      <button type="button" class="ident-reload" id="identReload" aria-label="${T("Ανανέωση")}" title="${T("Ανανέωση")}">↻</button></div>
    <div class="ident-body"><div class="ident-wait" id="identWait">${T("Φόρτωση…")}</div>
      <iframe id="identFrame" title="Identify-AI" allow="camera *; microphone *; clipboard-read; clipboard-write; fullscreen; geolocation"
        allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
  document.body.appendChild(d);
  $("#identBack").onclick=closeIdent;
  $("#identReload").onclick=()=>{const f=$("#identFrame");$("#identWait").hidden=false;f.src=IDENT_URL+"?t="+Date.now()};
  $("#identFrame").addEventListener("load",()=>{const w=$("#identWait");if(w)w.hidden=true});
  return d;
}
// Ανοίγει το Identify-AI· αν δοθεί πελάτης, ο τίτλος γράφει για ποιον είναι.
function openIdent(clientName){
  if(!navigator.onLine){toast(T("Η αναγνώριση εξαρτήματος χρειάζεται σύνδεση στο διαδίκτυο."));return}
  const d=identBuild(),f=$("#identFrame");
  $("#identT").textContent=IDENT_ICON+" "+(clientName?T("Εξάρτημα για {c}",{c:clientName}):"Identify-AI");
  $("#identBack").textContent="‹ "+T("Πίσω");
  // φορτώνει μία φορά και μετά κρατά την κατάσταση όσο είσαι στην εφαρμογή (δεν χάνεται η φωτογραφία αν βγεις και ξαναμπείς)
  if(!f.getAttribute("src")){$("#identWait").hidden=false;f.src=IDENT_URL}
  d.classList.add("open");document.body.classList.add("identopen");
}
function closeIdent(){const d=$("#identDlg");if(d)d.classList.remove("open");document.body.classList.remove("identopen")}
const identOpen=()=>{const d=$("#identDlg");return !!(d&&d.classList.contains("open"))};

// Κουμπί για την καρτέλα πελάτη και για το μενού πρόσθετων εφαρμογών
function identBtnHTML(clientName){
  return `<button class="fotocta identcta" data-act="openIdent" data-cname="${esc(clientName||"")}">
    <span class="fic" style="font-size:24px">${IDENT_ICON}</span>
    <span class="ftx"><b>${T("Αναγνώριση εξαρτήματος")}</b><small>${T("φωτογράφισε ένα ανταλλακτικό: τι είναι, διαστάσεις, τι να ζητήσεις στο κατάστημα")}</small></span></button>`;
}
