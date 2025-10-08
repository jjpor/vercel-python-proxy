// =========================================================
// API PROXY E DOM REFS (Variabili iniziali)
// =========================================================

// API proxy
const base_url = "https://vercel-python-proxy.vercel.app/api";
const deployment_id = "AKfycbwjmnBDZcMdBmP6Dj67S19qGDP61ujNtBvJZU65xqlUfluThOy1pphwjvACS9FVXJeD";

// DOM refs
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginMessageBox = document.getElementById('loginMessageBox');

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const callSection = document.getElementById('callSection');

const coachIdInput = document.getElementById('coachId');
const passwordInput = document.getElementById('password');
const coachNameDisplay = document.getElementById('coachNameDisplay');
const callSectionCoachNameDisplay = document.getElementById('callSectionCoachNameDisplay');

const earningsAmountDisplay = document.getElementById('earningsAmount');

const logCallBtn = document.getElementById('logCallBtn');
const viewStudentsBtn = document.getElementById('viewStudentsBtn');
const viewFolderBtn = document.getElementById('viewFolderBtn');
const viewCallLogBtn = document.getElementById('viewCallLogBtn');
const viewReportCardsBtn = document.getElementById('viewReportCardsBtn');
const viewCoachingDebriefBtn = document.getElementById('viewCoachingDebriefBtn');
const coachingDebriefSection = document.getElementById('coachingDebriefSection');
  // Coaching Debrief DOM
const debriefStudentSelect   = document.getElementById('debriefStudentSelect');
const debriefDateInput       = document.getElementById('debriefDateInput');
const debriefGoals           = document.getElementById('debrief_goals');
const debriefTopics          = document.getElementById('debrief_topics');
const debriefGrammar         = document.getElementById('debrief_grammar');
const debriefVocabulary      = document.getElementById('debrief_vocabulary');
const debriefPronunciation   = document.getElementById('debrief_pronunciation');
const debriefOther           = document.getElementById('debrief_other');
const debriefHomework        = document.getElementById('debrief_homework');
const debriefSaveDraftBtn    = document.getElementById('debriefSaveDraftBtn');
const debriefSendBtn         = document.getElementById('debriefSendBtn');
const debriefMsg             = document.getElementById('debriefMsg');

const logoutBtn = document.getElementById('logoutBtn');

const studentIdSelect = document.getElementById('studentId');
const productIdSelect = document.getElementById('productIdSelect');
const groupStudentsContainer = document.getElementById('groupStudentsContainer');

const callDateInput = document.getElementById('callDate');
const hourlyRateInput = document.getElementById('hourlyRate');
const technicalDurationInput = document.getElementById('technicalDuration');
const callDurationSelect = document.getElementById('callDuration');
const unitsInput = document.getElementById('units');
const contractIdInput = document.getElementById('contractId');
const productIdInput = document.getElementById('productId');
const submitBtn = document.getElementById('submitBtn');
const callMessageBox = document.getElementById('callMessageBox');

const callTypeRadios = document.querySelectorAll('input[name="callType"]');
const remainingCallsDisplay = document.getElementById('remainingCalls');

const callHistorySection = document.getElementById('callHistorySection');
const callHistoryTableBody = document.getElementById('callHistoryTableBody');
const backFromCallHistoryBtn = document.getElementById('backFromCallHistoryBtn');
const historyMonthYear = document.getElementById('historyMonthYear');

const viewFlashcardsBtn = document.getElementById('viewFlashcardsBtn');
const flashcardsSection = document.getElementById('flashcardsSection');
const backToDashboardFromFlashcardsBtn = document.getElementById('backToDashboardFromFlashcardsBtn');
const flashcardsContainer = document.getElementById('flashcardsContainer');

// Stato
let CURRENT_COACH_ID = null;
let CURRENT_COACH_NAME = null;
let CURRENT_COACH_ROLE = null;
let CURRENT_ALLOCATIONS_BY_STUDENT = {};
let LAST_SELECTED_STUDENT = null;
let LAST_DRAFTS = [];
let pendingFlashcardUpdates = [];


// =========================================================
// 1. FUNZIONI UTILITY BASE (Chiamate da tutte le altre)
// =========================================================

// Helpers UI
function showMessage(box, message, isSuccess = true) {
  box.textContent = message;
  box.className = 'mt-4 p-4 rounded-xl text-center block ' + (isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700');  
}
    
function hideMessage(box) {
  box.textContent = '';
  box.className = 'mt-4 p-4 rounded-xl text-center hidden';
}
   
function loaderHTML(message = "Loading...") {
  return `
    <div class="flex flex-col items-center justify-center py-4 text-gray-500">
      <div class="spinner-container mb-2">
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
      </div>
      <p>${message}</p>
    </div>
  `;
}

function showToast(msg, ms = 4000, color = "bg-green-600") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.className = `fixed top-4 right-4 text-white px-4 py-2 rounded-lg shadow-lg z-[99999] ${color}`;
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => { t.classList.add("hidden"); }, ms);
}

  
function switchSection(showEl) {
  // li prendo tutti senza dimentirne uno (tutti quelli che hanno classe  app-section)
  document.querySelectorAll('.app-section').forEach(el => el.classList.add('hidden'));
  showEl.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'auto' });
}

// API helpers
async function apiGet(action, params = {}) {
  const url = new URL(base_url + "/get");
  url.searchParams.set("deployment_id", deployment_id);
  url.searchParams.set("action", action);
  url.searchParams.set("_ts", Date.now()); // avoid browser caching
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`GET ${action} failed: ${res.status}`);
  return res.json();
}
async function apiPost(action, body = {}) {
  const res = await fetch(base_url + "/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deployment_id, action, ...body })
  });
  if (!res.ok) throw new Error(`POST ${action} failed: ${res.status}`);
  return res.json();
}


// =========================================================
// 2. FUNZIONI LOADER E GOOGLE LOGIN (Ora corrette)
// =========================================================

// Global overlay loader controls
function showGlobalLoader() {
  const el = document.getElementById('globalLoader');
  if (el) el.style.display = 'flex';
}
function hideGlobalLoader() {
  const el = document.getElementById('globalLoader');
  if (el) el.style.display = 'none';
}
 
  
async function handleGoogleLogin(response) {
  showGlobalLoader(); // 👈 showGlobalLoader è definita sopra

  try {
    const credential = response.credential; 
    const resp = await apiPost("loginWithGoogle", { credential }); // apiPost è definita sopra

    if (!resp.success) {
      showToast("Google login fallito: " + resp.error, 5000, "bg-red-600"); // showToast è definita sopra
      location.reload(); 
      return;
    }

    document.getElementById('googleLoginContainer').classList.add('hidden');

    CURRENT_COACH_ID = resp.coachId;
    CURRENT_COACH_NAME = resp.coachName;
    CURRENT_COACH_ROLE = resp.role;
        // Persist session
    localStorage.setItem("coachSession", JSON.stringify({
      id: CURRENT_COACH_ID,
      name: CURRENT_COACH_NAME,
      role: CURRENT_COACH_ROLE
    }));

    coachNameDisplay.textContent = CURRENT_COACH_NAME;
    callSectionCoachNameDisplay.textContent = CURRENT_COACH_NAME;

    switchSection(dashboardSection); // switchSection è definita sopra

    hideGlobalLoader(); // 👈 chiudiamo subito, l’utente entra in dashboard

    // caricamenti secondari (non bloccano l’UI)
    await fetchMonthlyEarnings(); // Verrà chiamata senza errori se definita in seguito
    await loadStudentIds(); // Verrà chiamata senza errori se definita in seguito
  } catch (err) {
    showToast("Errore login Google: " + (err.message || err), 5000, "bg-red-600");
  } finally {
    hideGlobalLoader(); // 👈 safety net in caso di errori
  }
}


// =========================================================
// 3. TUTTE LE ALTRE FUNZIONI (Nel tuo ordine originale)
// =========================================================


// --- Load Students Dropdown
async function loadStudentsDropdown() {
  const select = document.getElementById('studentSelect');
  const container = document.getElementById('studentDetailsContainer');

  // UI di attesa
  select.innerHTML = '<option value="" disabled selected>Loading students...</option>';
  container.innerHTML = '<p class="text-gray-500 text-center">Select a student from the dropdown to view their details.</p>';

  showGlobalLoader(); // 👈 overlay on

  try {
    const resp = await apiGet('getStudents');
    let arr = (resp && resp.success && Array.isArray(resp.students)) ? resp.students : [];

    // 👉 Ordina alfabeticamente ignorando maiuscole/minuscole
    arr.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

    // Ripopola il select
    select.innerHTML = '<option value="" disabled selected>Select a student</option>';
    arr.forEach(id => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id;
      select.appendChild(opt);
    });
  } catch (err) {
    select.innerHTML = '<option value="" disabled selected>Error loading students</option>';
  } finally {
    hideGlobalLoader(); // 👈 overlay off SEMPRE
  }
}


// --- Fetch & Render Student Details
async function fetchAndRenderStudentDetails(studentId) {
  const container = document.getElementById('studentDetailsContainer');
  container.innerHTML = '<p class="text-gray-500 text-center">Loading student details...</p>';
  try {
    const resp = await apiGet('getStudentInfo', { studentId });
    if (!resp.success || !resp.studentInfo) throw new Error(resp.error || "Student not found");
    const info = resp.studentInfo;
    const calls = info.calls || [];
    delete info.calls;

        // --- Fetch contracts per tabellina ---
    let contracts = [];
    try {
      const respContracts = await apiGet('getStudentContracts', { studentId });
      if (respContracts.success) contracts = respContracts.contracts || [];
    } catch (e) {
      console.warn("Contracts load error:", e);
    }

  
    // --- Link fields da trasformare in bottoni (con alias reali dallo sheet)
    const linkFieldDefs = {
      "Quizlet Link":       { label: "Quizlet",      aliases: ["Quizlet"] },
      "Drive Folder Link":  { label: "Drive Folder", aliases: ["Drive"] },
      "Homework File":      { label: "Homework",     aliases: ["Homework"] },
      "Lesson Plan File":   { label: "Lesson Plan",  aliases: ["Lesson Plan"] }
    };
    
    // helper per rendere cliccabile anche link senza http/https
    function normalizeUrl(u) {
      if (!u) return "";
      const s = String(u).trim();
      if (!s) return "";
      if (/^https?:\/\//i.test(s)) return s;
      return "https://" + s;
    }
    
    let buttonsHtml = "";
    for (const [primaryKey, def] of Object.entries(linkFieldDefs)) {
      // prova le chiavi in ordine: primaria + alias
      const candidates = [primaryKey, ...(def.aliases || [])];
      let value = "";
      for (const k of candidates) {
        const v = (info[k] || "").toString().trim();
        if (v && v !== "N/A") { value = v; break; }
      }
      // elimina SEMPRE tutte le chiavi (così non compaiono nella tabella)
      candidates.forEach(k => delete info[k]);
    
      if (value) {
        const url = normalizeUrl(value);
        buttonsHtml += `
          <a href="${url}" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-blue-600 text-white shadow
                    hover:bg-blue-700 active:scale-[.99] transition text-sm font-medium">
            ${def.label}
          </a>`;
      } else {
        buttonsHtml += `
          <span class="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-gray-200 text-gray-500 shadow-inner
                       cursor-not-allowed text-sm font-medium">
            ${def.label}
          </span>`;
      }
    }

    // --- Tabella dettagli
    let detailsHtml = `<h3 class="text-xl font-semibold text-gray-800 mb-4">Student Details</h3>
    <div class="overflow-x-auto mb-6"><table class="w-full text-sm"><tbody>`;

    for (const [key, value] of Object.entries(info)) {
      // Nascondi campo "Onboarded (dashboard)"
      if (key === 'Onboarded (dashboard)') {
        continue;
      }

      // Secondary Email → mailto
      if ((key === 'Email' || key === 'Secondary Email') && value && value !== 'N/A') {
        detailsHtml += `
          <tr>
            <td class="py-3 px-6 font-medium text-gray-700 whitespace-nowrap">${key}</td>
            <td class="py-3 px-6">
              <a href="mailto:${value}" class="text-blue-600 underline hover:text-blue-800">${value}</a>
            </td>
          </tr>`;
        continue;
      }

      // Phone → WhatsApp
      if (key === 'Phone' && value && value !== 'N/A') {
        const clean = value.replace(/\D/g, '');
        detailsHtml += `
          <tr>
            <td class="py-3 px-6 font-medium text-gray-700 whitespace-nowrap">${key}</td>
            <td class="py-3 px-6">
              <a href="https://wa.me/${clean}" target="_blank" class="text-blue-600 underline hover:text-blue-800">${value}</a>
            </td>
          </tr>`;
        continue;
      }

      // Status → badge
      if (key === 'Status') {
        const color = value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        detailsHtml += `
          <tr>
            <td class="py-3 px-6 font-medium text-gray-700 whitespace-nowrap">${key}</td>
            <td class="py-3 px-6"><span class="px-3 py-1 rounded-full text-xs font-semibold ${color}">${value}</span></td>
          </tr>`;
        continue;
      }

      // Report Card Cadency Months → "No report card" se vuoto/N.A.
      if (key === 'Report Card Cadency Months') {
        const hasCadency = value && value !== 'N/A';
        const display = hasCadency ? value : 'No report card';
        const badgeClass = hasCadency
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-200 text-gray-600";
      
        detailsHtml += `
          <tr>
            <td class="py-3 px-6 font-medium text-gray-700 whitespace-nowrap">${key}</td>
            <td class="py-3 px-6">
              <span class="px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}">
                ${display}
              </span>
            </td>
          </tr>`;
        continue;
      }

      // Default
      detailsHtml += `
        <tr>
          <td class="py-3 px-6 font-medium text-gray-700 whitespace-nowrap">${key}</td>
          <td class="py-3 px-6 text-gray-800">${value || 'N/A'}</td>
        </tr>`;
    }
    detailsHtml += `</tbody></table></div>`;

    // --- Se ci sono bottoni, aggiungili sotto la tabella (centrati e responsive)
    if (buttonsHtml) {
      detailsHtml += `
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          ${buttonsHtml}
        </div>`;
    }


          // --- Active & Expired Contracts ---
      if (contracts && contracts.length) {
        detailsHtml += `
          <h3 class="text-xl font-semibold text-gray-800 mb-4 mt-2">Contracts</h3>
          <div class="flex justify-center">
            <table class="text-sm border border-gray-200 rounded-xl mb-6">
              <thead class="bg-gray-100">
                <tr>
                  <th class="py-2 px-4 text-left">Product</th>
                  <th class="py-2 px-4 text-center">Duration</th>
                  <th class="py-2 px-4 text-center">Used</th>
                  <th class="py-2 px-4 text-center">Left</th>
                  <th class="py-2 px-4 text-center">Expiration</th>
                  <th class="py-2 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${contracts.map(c => {
                  const total = c.product?.totalCalls || (c.leftCalls && c.leftCalls > 0 ? c.leftCalls : 0);
                  const used = (c.product?.totalCalls && c.leftCalls !== undefined)
                    ? Math.max(0, c.product.totalCalls - c.leftCalls)
                    : (c.leftCalls === 0 ? "All" : "-");
                  const expiration = c.maxEndDate || c.endDate || "-";
                  const status = c.leftCalls === 0 ? "Ended" : "Active";
                  return `
                    <tr class="${c.leftCalls === 0 ? 'text-gray-400' : ''}">
                      <td class="py-2 px-4">${c.product?.productName || c.productId}</td>
                      <td class="py-2 px-4 text-center">${c.product?.duration || '-'}</td>
                      <td class="py-2 px-4 text-center">${used}</td>
                      <td class="py-2 px-4 text-center">${c.leftCalls ?? '∞'}</td>
                      <td class="py-2 px-4 text-center">${expiration}</td>
                      <td class="py-2 px-4 text-center">${status}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else {
        detailsHtml += `<p class="text-gray-500 italic text-center mb-4">No contracts found.</p>`;
      }
      

    
    // --- Call History (nuovo formato)
    detailsHtml += `<h3 class="text-xl font-semibold text-gray-800 mb-4 mt-6">Call History</h3>
    <div class="overflow-x-auto"><table class="w-full text-sm border border-gray-200 rounded-xl">
      <thead class="bg-gray-100">
        <tr>
          <th class="py-3 px-6 text-left">Date</th>
          <th class="py-3 px-6 text-left">Product</th>
          <th class="py-3 px-6 text-left">Coach ID</th>
          <th class="py-3 px-6 text-left">Duration (min)</th>
          <th class="py-3 px-6 text-left">Attendance</th>
          <th class="py-3 px-6 text-left">Notes</th>
        </tr>
      </thead>
      <tbody>`;
  
  if (calls.length > 0) {
    calls.forEach(c => {
      detailsHtml += `
        <tr class="border-b hover:bg-gray-50">
          <td class="py-3 px-6">${c.date || 'N/A'}</td>
          <td class="py-3 px-6">${c.productName || c.productId || '-'}</td>
          <td class="py-3 px-6">${c.coachId || '-'}</td>
          <td class="py-3 px-6">${c.duration || '-'}</td>
          <td class="py-3 px-6">${c.attendance || '-'}</td>
          <td class="py-3 px-6">${c.notes || ''}</td>
        </tr>`;
    });
  } else {
    detailsHtml += `<tr><td colspan="6" class="py-3 px-6 text-center text-gray-500">No calls found.</td></tr>`;
  }


    detailsHtml += `</tbody></table></div>`;

    container.innerHTML = detailsHtml;
  } catch (err) {
    container.innerHTML = `<p class="text-red-500 text-center">Error: ${err.message}</p>`;
  }
}


  // Validazione form
  function updateFormState() {
    const selectedStudent = studentIdSelect.value;
    const selectedProduct = productIdSelect.value;
    const selectedDuration = callDurationSelect.value;
    const isInd = document.querySelector('input[name="callType"]:checked').value === 'IND';
    const isGroup = document.querySelector('input[name="callType"]:checked').value === 'GROUP';
    const hourlyRate = parseFloat(hourlyRateInput.value);

    let isValid = false;
    if (isInd) {
        isValid = selectedStudent && selectedProduct && selectedDuration && !isNaN(hourlyRate) && hourlyRate > 0;
    } else if (isGroup) {
        const selects = groupStudentsDynamic.querySelectorAll('select');
        const chosen = Array.from(selects).map(s => s.value).filter(Boolean);
        const unique = new Set(chosen);

        isValid = selectedProduct
          && chosen.length === selects.length       // tutti compilati
          && unique.size === chosen.length          // no duplicati
          && selectedDuration
          && !isNaN(hourlyRate) && hourlyRate > 0;
    }
    submitBtn.disabled = !isValid;
}
 
// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage(loginMessageBox);

  showGlobalLoader(); // 👈 solo overlay, niente spinner nel bottone

  try {
    const coachId = coachIdInput.value.trim();
    const password = passwordInput.value.trim();
    const resp = await apiPost('login', { coachId, password });
    if (!resp.success) throw new Error(resp.error || 'Login failed');

    CURRENT_COACH_ID = String(resp.coachId);
    CURRENT_COACH_NAME = resp.coachName || CURRENT_COACH_ID;
    CURRENT_COACH_ROLE = resp.role;
    if (!CURRENT_COACH_ROLE) throw new Error("Ruolo coach non trovato. Contatta l'amministratore.");

    // Persist session
localStorage.setItem("coachSession", JSON.stringify({
  id: CURRENT_COACH_ID,
  name: CURRENT_COACH_NAME,
  role: CURRENT_COACH_ROLE
}));


    coachNameDisplay.textContent = CURRENT_COACH_NAME;
    callSectionCoachNameDisplay.textContent = CURRENT_COACH_NAME;

    switchSection(dashboardSection);
    hideGlobalLoader();
    await fetchMonthlyEarnings();
    await loadStudentIds();

    document.getElementById('googleLoginContainer').classList.add('hidden');
      
  } catch (err) {
    showMessage(loginMessageBox, err.message || String(err), false);
  } finally {
  }
});

// crea bottone e container drafts (una sola volta, persistenti)
const labelEl = document.querySelector('label[for="debriefStudentSelect"]');
if (labelEl && !document.getElementById('debriefLoadDraftsBtn')) {
  const btn = document.createElement('button');
  btn.id = 'debriefLoadDraftsBtn';
  btn.textContent = '📂 Load Drafts';
  btn.className = 'ml-2 px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700';
  labelEl.after(btn);

  const container = document.createElement('div');
  container.id = 'debriefDraftsContainer';
  container.className = 'hidden mt-4';
  coachingDebriefSection.insertBefore(container, document.getElementById('debriefFieldsContainer'));

  btn.addEventListener('click', async () => {
  const studentId = debriefStudentSelect.value || null;

  // Mostra loader nella sezione sotto il modulo
  container.innerHTML = loaderHTML("Loading drafts...");
  container.classList.remove('hidden');

  try {
    const resp = await apiGet('getDebriefDrafts', { coachId: CURRENT_COACH_ID, studentId });
    if (!resp.success || !resp.drafts?.length) {
      container.innerHTML = '<p class="text-gray-500 text-sm mt-4 border-t pt-3">No drafts found.</p>';
      return;
    }

    // sposta container sotto al modulo di debrief (se non già lì)
    const fields = document.getElementById('debriefFieldsContainer');
    if (fields && fields.nextSibling !== container) {
      fields.parentNode.insertBefore(container, fields.nextSibling);
    }

    let html = `
      <div class="border-t mt-6 pt-4">
        <h3 class="text-lg font-semibold mb-2">💾 Saved Drafts</h3>
        <table class="min-w-full border border-gray-200 rounded-xl text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-3 py-2 border">Date</th>
              <th class="px-3 py-2 border">Student</th>
              <th class="px-3 py-2 border">Goals</th>
              <th class="px-3 py-2 border">Topics</th>
              <th class="px-3 py-2 border">Load</th>
            </tr>
          </thead>
          <tbody>`;

    resp.drafts.forEach(d => {
      html += `
        <tr class="border-b hover:bg-gray-50">
          <td class="px-3 py-2">${d.dateISO || '-'}</td>
          <td class="px-3 py-2">${d.studentId || '-'}</td>
          <td class="px-3 py-2">${(d.goals || '').slice(0, 50)}</td>
          <td class="px-3 py-2">${(d.topics || '').slice(0, 50)}</td>
          <td class="px-3 py-2 text-center">
            <button class="px-2 py-1 bg-green-600 text-white rounded text-xs loadDraftBtn"
                    data-row="${d.rowNumber}">Load</button>
          </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="text-red-500 text-sm mt-4 border-t pt-3">Error: ${err.message}</p>`;
  }
});

}

  
viewCoachingDebriefBtn.addEventListener('click', async () => {

  // listener globale per i bottoni Load (delegato)
    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('loadDraftBtn')) return;
      const row = e.target.dataset.row;
      if (!row) return;
    
      // salviamo l’ID riga in memoria
      window.debriefLoadedRow = row;
    
      // preleva dati dalla riga della tabella (puoi anche riusare fetch se serve)
      const tr = e.target.closest('tr');
      const tds = tr.querySelectorAll('td');
      const goals = tds[1]?.textContent || '';
      const topics = tds[2]?.textContent || '';
    
      // popola solo preview per ora (campi completi verranno fetchati lato backend se vuoi)
      document.getElementById('debrief_goals').value = goals;
      document.getElementById('debrief_topics').value = topics;
    
      showToast(`Loaded draft from row ${row}`, 3000, 'bg-green-600');
  });

  
  
  switchSection(coachingDebriefSection);

  // Precompila la data odierna
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  debriefDateInput.value = `${yyyy}-${mm}-${dd}`;

  // Carica lista studenti nel dropdown
  showGlobalLoader();  // 👈 mostra overlay

  try {
    const resp = await apiGet('getStudents');
    let arr = (resp && resp.success && Array.isArray(resp.students)) ? resp.students : [];
    arr.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

    debriefStudentSelect.innerHTML = '<option value="" disabled selected>Select a student</option>';
    arr.forEach(id => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id;
      debriefStudentSelect.appendChild(opt);
    });
  } catch (err) {
    debriefStudentSelect.innerHTML = '<option value="" disabled selected>Error loading students</option>';
  } finally {
    hideGlobalLoader();  // 👈 chiudi overlay SEMPRE
  }
});


        // --- Save Draft Debrief ---
    debriefSaveDraftBtn.addEventListener('click', async () => {
      debriefMsg.textContent = "💾 Saving draft...";
    
      try {
        const payload = {
          action: "saveDebrief",
          coachId: CURRENT_COACH_ID,
          studentId: debriefStudentSelect.value,
          date: debriefDateInput.value,
          goals: debriefGoals.value,
          topics: debriefTopics.value,
          grammar: debriefGrammar.value,
          vocabulary: debriefVocabulary.value,
          pronunciation: debriefPronunciation.value,
          other: debriefOther.value,
          homework: debriefHomework.value,
          draft: true
        };
    
        const resp = await apiPost('saveDebrief', payload);
    
        if (!resp.success) throw new Error(resp.error || "Unknown error");
        debriefMsg.textContent = "✅ Draft saved!";
      } catch (err) {
        console.error("Save draft error:", err);
        debriefMsg.textContent = "❌ " + (err.message || "Error saving draft");
      }
    });

      // --- Send Debrief ---
      debriefSendBtn.addEventListener('click', async () => {
        debriefMsg.textContent = "📤 Sending...";
      
        try {
          const resp = await apiPost("sendDebrief", {
            coachId: CURRENT_COACH_ID,
            studentId: debriefStudentSelect.value,
            rowNumber: window.debriefLoadedRow || null
          });
      
          if (!resp.success) throw new Error(resp.error || "Send failed");
          debriefMsg.textContent = "✅ Sent to student!";
        } catch (err) {
          console.error("Send debrief error:", err);
          debriefMsg.textContent = "❌ " + (err.message || "Error sending debrief");
        }
      });
      

      // =============== AI Preview Handler ===================
      async function handleAIPreview(fieldType) {
        const studentSelect = document.getElementById("debriefStudentSelect");
        const studentName = studentSelect?.options[studentSelect.selectedIndex]?.text || "Student";
      
        const textArea = document.getElementById(`debrief_${fieldType}`);
        const previewBox = document.getElementById(`aiPreview_${fieldType}`);
        const currentText = textArea.value.trim();
      
        // mostra loader
        previewBox.innerHTML = loaderHTML("Generating preview...");
        previewBox.classList.remove("hidden");
      
        try {
          const resp = await apiPost("generateDebriefText", {
            fieldType,
            currentText,
            studentName
          });
      
          if (!resp.success) throw new Error(resp.error || "AI generation failed");
      
          const suggestion = (resp.suggestion || "").trim();
          if (!suggestion) throw new Error("Empty AI response");
      
          // crea box anteprima
          previewBox.innerHTML = `
            <div class="bg-gray-100 p-3 rounded-lg shadow-sm text-sm text-gray-800">
              <div class="font-semibold mb-1">AI suggestion for ${capitalize(fieldType)}:</div>
              <div class="whitespace-pre-line mb-3">${escapeHTML(suggestion)}</div>
              <div class="flex gap-2">
                <button class="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                        onclick="applyAISuggestion('${fieldType}', \`${escapeBackticks(suggestion)}\`)">
                  ✅ Apply suggestion
                </button>
                <button class="px-2 py-1 bg-gray-300 text-xs rounded"
                        onclick="discardAISuggestion('${fieldType}')">
                  ❌ Discard
                </button>
              </div>
              <p class="text-[11px] text-gray-500 mt-1">No changes will be made until you confirm.</p>
            </div>
          `;
        } catch (err) {
          previewBox.innerHTML = `<p class="text-red-600 text-sm">Error: ${escapeHTML(err.message)}</p>`;
        }
      }
      
      // accetta il suggerimento
      function applyAISuggestion(fieldType, suggestion) {
        const textArea = document.getElementById(`debrief_${fieldType}`);
        textArea.value = suggestion.trim();
        discardAISuggestion(fieldType);
        showToast(`Applied AI suggestion for ${capitalize(fieldType)}`, "success");
      }
      
      // annulla il suggerimento
      function discardAISuggestion(fieldType) {
        const previewBox = document.getElementById(`aiPreview_${fieldType}`);
        previewBox.classList.add("hidden");
        previewBox.innerHTML = "";
      }
      
      // helper utils
      function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
      }
      function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, c => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[c]));
      }
      function escapeBackticks(str) {
        return str.replace(/`/g, "\\`");
      }

    
// My payment folder
viewFolderBtn.addEventListener('click', async () => {
  if (!CURRENT_COACH_ID) return;
  showGlobalLoader(); // 👈 loader on
  try {
    const resp = await apiGet('getPaymentFolderUrl', { coachId: CURRENT_COACH_ID });
    if (resp.success && resp.url) {
      window.open(resp.url, "_blank");
    } else {
      showToast("No folder found", 4000, "bg-red-600");
    }
  } catch (err) {
    showToast("Error: " + err.message, 5000, "bg-red-600");
  } finally {
    hideGlobalLoader(); // 👈 loader off
  }
});

//Student Info
  // Student dropdown change
document.getElementById('studentSelect').addEventListener('change', e => {
  const sid = e.target.value;
  if (sid) fetchAndRenderStudentDetails(sid);
});

// Aprire sezione Students dal dashboard
document.getElementById('viewStudentsBtn').addEventListener('click', () => {
  switchSection(document.getElementById('studentsSection'));
  loadStudentsDropdown();
});

// Torna al dashboard
document.getElementById('backToDashboardFromStudentsBtn').addEventListener('click', () => {
  switchSection(document.getElementById('dashboardSection'));
});
  
    
// Call History
let fullHistory = []; // memorizza tutte le calls
  viewCallLogBtn.addEventListener('click', async () => {
  if (!CURRENT_COACH_ID) return;
  switchSection(callHistorySection);
  callHistoryTableBody.innerHTML = `<tr><td colspan="4">${loaderHTML("Loading call history...")}</td></tr>`;
  try {
    const resp = await apiGet('getCallHistory', { coachId: CURRENT_COACH_ID });
    if (resp.success && resp.history.length) {
  fullHistory = resp.history; // salva tutto
  renderHistoryTable();       // disegna tabella (gestisce già i loop)
} else {
  callHistoryTableBody.innerHTML = '<tr><td colspan="4" class="text-center p-4">No calls logged</td></tr>';
}

  } catch (err) {
    callHistoryTableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-red-500">Error: ${err.message}</td></tr>`;
  }
});
backFromCallHistoryBtn.addEventListener('click', () => switchSection(dashboardSection));
  // cambio mese
historyMonthYear.addEventListener('change', renderHistoryTable);

function renderHistoryTable() {
  const selected = document.getElementById('historyMonthYear').value; // es. "2025-09"
  callHistoryTableBody.innerHTML = '';

  const filtered = fullHistory.filter(h => {
    if (!selected) return true;
    if (!h.dateISO) return false;
    let ym = "";
    if (h.dateISO instanceof Date) {
      ym = h.dateISO.toISOString().slice(0,7);
    } else {
      const d = new Date(h.dateISO);
      ym = isNaN(d) ? String(h.dateISO).slice(0,7) : d.toISOString().slice(0,7);
    }
    return ym === selected;
  });



  if (!filtered.length) {
    callHistoryTableBody.innerHTML = '<tr><td colspan="4" class="text-center p-4">No calls found</td></tr>';
    return;
  }

  filtered.forEach(h => {
    const row = document.createElement('tr');
      row.innerHTML = `
        <td class="border px-4 py-2">${h.date || h.dateISO || 'N/A'}</td>
        <td class="border px-4 py-2">${h.studentId || ''}</td>
        <td class="border px-4 py-2">${h.productName || h.productId || ''}</td>
        <td class="border px-4 py-2 text-right">${(Number(h.earnings) || 0).toFixed(2)}</td>
      `;

    callHistoryTableBody.appendChild(row);
  });
}
  
  // Logout
logoutBtn.addEventListener('click', () => {
  CURRENT_COACH_ID = null;
  CURRENT_COACH_NAME = null;
  CURRENT_COACH_ROLE = null;
  CURRENT_ALLOCATIONS_BY_STUDENT = {};
  coachIdInput.value = "";
  passwordInput.value = "";

  // Clear persisted session
  localStorage.removeItem("coachSession");

  // 👇 Riporta visibile il bottone Google
  document.getElementById('googleLoginContainer')?.classList.remove('hidden');

  switchSection(loginSection);
  hideMessage(loginMessageBox);
});


  // Earnings
  async function fetchMonthlyEarnings() {
    if (!CURRENT_COACH_ID) return;
    earningsAmountDisplay.textContent = '...';
    try {
      const resp = await apiGet('getMonthlyEarnings', { coachId: CURRENT_COACH_ID });
      const value = (resp && resp.success) ? resp.earnings : 0;
      earningsAmountDisplay.textContent = Number(value).toFixed(2);
    } catch (err) {
      earningsAmountDisplay.textContent = '--';
    }
  }

  // --- IND: load students & contracts ---
  async function loadStudentIds() {
    studentIdSelect.innerHTML = '<option value="" disabled selected>Loading Student IDs...</option>';
    productIdSelect.innerHTML = '<option value="" disabled selected>Select a Student ID first</option>';
    productIdSelect.disabled = true;
    remainingCallsDisplay.classList.add('hidden');

    try {
      const resp = await apiGet('getStudents');
      const arr = (resp && resp.success && Array.isArray(resp.students)) ? resp.students : [];

      studentIdSelect.innerHTML = '';
      const def = document.createElement('option');
      def.value = '';
      def.disabled = true;
      def.selected = true;
      def.textContent = 'Select a student';
      studentIdSelect.appendChild(def);

      // ordina alfabeticamente ignorando maiuscole/minuscole
      arr.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

      arr.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = id;
        studentIdSelect.appendChild(opt);
      });

      studentIdSelect.disabled = false;
    } catch (err) {
      studentIdSelect.innerHTML = '<option value="" disabled selected>Error loading</option>';
    }
  }

  async function loadStudentContracts(studentId) {
    productIdSelect.disabled = true;
    productIdSelect.innerHTML = '<option value="" disabled selected>Loading products...</option>';
    hourlyRateInput.value = '';
    technicalDurationInput.value = '';
    contractIdInput.value = '';
    productIdInput.value = '';
    remainingCallsDisplay.classList.add('hidden');
    updateFormState();

    showGlobalLoader(); // 👈 overlay on

    try {
      const resp = await apiGet('getStudentContracts', { studentId });
      const contracts = (resp && resp.success && Array.isArray(resp.contracts)) ? resp.contracts : [];
      CURRENT_ALLOCATIONS_BY_STUDENT[studentId] = contracts;

      productIdSelect.innerHTML = '';
      const def = document.createElement('option');
      def.value = '';
      def.disabled = true;
      def.selected = true;
      def.textContent = 'Select a product/allocation';
      productIdSelect.appendChild(def);

      contracts.forEach(c => {
        const prodName = (c.product && c.product.productName) ? c.product.productName : c.productId;
        const opt = document.createElement('option');
        opt.value = c.productId;
        opt.textContent = prodName;
        opt.dataset.contractId = c.contractId;
        opt.dataset.product = JSON.stringify(c.product || {});
        opt.dataset.remainingCalls = c.leftCalls;
        productIdSelect.appendChild(opt);
      });

      productIdSelect.disabled = false;
    } catch (err) {
      productIdSelect.innerHTML = '<option value="" disabled selected>Error loading</option>';
    } finally {
      hideGlobalLoader(); // 👈 overlay off SEMPRE
    }
  }

  studentIdSelect.addEventListener('change', () => {
    const studentId = studentIdSelect.value;
    LAST_SELECTED_STUDENT = studentId || null;
    if (studentId) {
      // carica i contratti per questo studente
      loadStudentContracts(studentId);
    } else {
      // reset UI se nessuno studente selezionato
      productIdSelect.innerHTML = '<option value="" disabled selected>Select a Student ID first</option>';
      productIdSelect.disabled = true;
      hourlyRateInput.value = '';
      technicalDurationInput.value = '';
      contractIdInput.value = '';
      productIdInput.value = '';
      remainingCallsDisplay.classList.add('hidden');
    }
    updateFormState();
  });

// --- GROUP: load products & students ---
async function loadGroupProducts() {
  productIdSelect.disabled = true;
  productIdSelect.innerHTML = '<option value="" disabled selected>Loading group products...</option>';

  try {
    const resp = await apiGet('getGroupProducts');
    const prods = (resp && resp.success && Array.isArray(resp.products)) ? resp.products : [];

    productIdSelect.innerHTML = '';
    const def = document.createElement('option');
    def.value = '';
    def.disabled = true;
    def.selected = true;
    def.textContent = 'Select a group product';
    productIdSelect.appendChild(def);

    prods.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.productId;
      opt.textContent = `${p.productName || p.productId} (${p.productId})`;
      opt.dataset.product = JSON.stringify(p); // contiene duration + rates
      productIdSelect.appendChild(opt);
    });

    productIdSelect.disabled = false;
  } catch (err) {
    productIdSelect.innerHTML = '<option value="" disabled selected>Error loading group products</option>';
  }
}

productIdSelect.addEventListener('change', async () => {
  const callType = document.querySelector('input[name="callType"]:checked').value;
  const selectedProductId = productIdSelect.value;
  productIdInput.value = selectedProductId || '';
  hourlyRateInput.value = '';
  technicalDurationInput.value = '';
  contractIdInput.value = '';
  remainingCallsDisplay.classList.add('hidden');
  hideMessage(callMessageBox);
  updateFormState();

  // prendo l'opzione selezionata
  const opt = productIdSelect.options[productIdSelect.selectedIndex];
  if (!opt || !opt.dataset.product) {
    callDurationSelect.disabled = true;
    return;
  }

  let prod = {};
  try {
    prod = JSON.parse(opt.dataset.product);
  } catch (e) {
    console.error('Error parsing product data', e);
    callDurationSelect.disabled = true;
    return;
  }

  // rate per ruolo
  const rateKey = CURRENT_COACH_ROLE;
  let displayRate = 0;
  if (rateKey && prod.rates && Object.prototype.hasOwnProperty.call(prod.rates, rateKey)) {
    displayRate = Number(prod.rates[rateKey] || 0);
  } else {
    showMessage(callMessageBox, `Errore: ruolo '${rateKey}' mancante nel prodotto.`, false);
  }

  // durata nativa
  const nativeDuration = prod.duration || '';
  technicalDurationInput.value = nativeDuration;

  // memorizza i dati base per ricalcolo override
  hourlyRateInput.dataset.baseRate = String(displayRate || 0);
  hourlyRateInput.dataset.attendees = String(prod.participants || 1);

  // set default override = durata nativa
  if (nativeDuration) {
    let found = false;
    for (let i = 0; i < callDurationSelect.options.length; i++) {
      if (callDurationSelect.options[i].value == nativeDuration) {
        callDurationSelect.value = nativeDuration;
        found = true;
        break;
      }
    }
    if (!found) {
      const newOption = document.createElement('option');
      newOption.value = nativeDuration;
      newOption.textContent = nativeDuration;
      callDurationSelect.appendChild(newOption);
      callDurationSelect.value = nativeDuration;
    }
  }

  // --- IND ---
  if (callType === "IND") {
    const contractId = opt.dataset.contractId || '';
    contractIdInput.value = contractId;
    productIdInput.value = selectedProductId;

    if (opt.dataset.unlimited === "true") {
      remainingCallsDisplay.classList.add('hidden');
    } else {
      const remaining = opt.dataset.remainingCalls;
      if (remaining !== undefined && remaining !== null && remaining !== "" && remaining !== "null" && remaining !== "undefined") {
        remainingCallsDisplay.textContent = `Remaining: ${remaining} calls`;
        remainingCallsDisplay.classList.remove('hidden');
      } else {
        remainingCallsDisplay.classList.add('hidden');
      }
    }
  } 
  // --- GROUP ---
  else {
    try {
      console.log("🧩 getGroupStudents called with:", selectedProductId);
      const resp = await apiGet('getGroupStudents', { productId: selectedProductId });
      const studs = (resp && resp.success && Array.isArray(resp.students)) ? resp.students : [];
      const n = prod.participants || ...
// ... Il resto del tuo codice originale continua qui (senza modifiche di contenuto)
