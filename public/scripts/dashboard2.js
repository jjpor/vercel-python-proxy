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
const groupStudentsContainer = document.getElementById('groupStudentsContainer'); // Contenitore statico
const groupStudentsDynamic = document.getElementById('groupStudentsDynamic'); // Contenitore per i select dinamici

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
// 2. FUNZIONI LOADER E GOOGLE LOGIN
// (Le funzioni che avevi nel blocco <script> inline)
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

    hideGlobalLoader(); 

    // caricamenti secondari (non bloccano l’UI)
    await fetchMonthlyEarnings(); 
    await loadStudentIds(); 
  } catch (err) {
    showToast("Errore login Google: " + (err.message || err), 5000, "bg-red-600");
  } finally {
    hideGlobalLoader(); 
  }
}


// =========================================================
// 3. FUNZIONI PRINCIPALI E LISTENERS
// =========================================================


// --- Load Students Dropdown
async function loadStudentsDropdown() {
  const select = document.getElementById('studentSelect');
  const container = document.getElementById('studentDetailsContainer');

  // UI di attesa
  select.innerHTML = '<option value="" disabled selected>Loading students...</option>';
  container.innerHTML = '<p class="text-gray-500 text-center">Select a student from the dropdown to view their details.</p>';

  showGlobalLoader(); 

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
    hideGlobalLoader(); 
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


// --- Funzione per il rendering dei select dinamici di gruppo ---
function renderGroupStudentSelectors(students, numSelectors) {
    const container = document.getElementById('groupStudentsDynamic');
    if (!container) return;

    container.innerHTML = '';
    
    // Ordina gli studenti alfabeticamente
    students.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

    for (let i = 0; i < numSelectors; i++) {
        const div = document.createElement('div');
        div.className = 'w-full md:w-1/3 px-3 mb-6 md:mb-0';
        div.innerHTML = `
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Student ${i + 1} ID
            </label>
            <div class="relative">
                <select class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 student-selector"
                        onchange="updateFormState()">
                    <option value="" disabled selected>Select student ${i + 1}</option>
                    ${students.map(id => `<option value="${id}">${id}</option>`).join('')}
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        `;
        container.appendChild(div);
    }
    
    // Mostra il contenitore se non già visibile
    groupStudentsContainer.classList.remove('hidden'); 
}


  // Validazione form
  function updateFormState() {
    const selectedStudent = studentIdSelect.value;
    const selectedProduct = productIdSelect.value;
    const selectedDuration = callDurationSelect.value;
    const isInd = document.querySelector('input[name="callType"]:checked')?.value === 'IND';
    const isGroup = document.querySelector('input[name="callType"]:checked')?.value === 'GROUP';
    const hourlyRate = parseFloat(hourlyRateInput.value);

    let isValid = false;
    if (isInd) {
        isValid = selectedStudent && selectedProduct && selectedDuration && !isNaN(hourlyRate) && hourlyRate > 0;
    } else if (isGroup) {
        const selects = document.querySelectorAll('#groupStudentsDynamic .student-selector');
        const chosen = Array.from(selects).map(s => s.value).filter(Boolean);
        const unique = new Set(chosen);

        // La validazione di gruppo richiede: 
        // 1. Un prodotto selezionato.
        // 2. Tutti i select dinamici compilati (`chosen.length === selects.length`).
        // 3. Nessun duplicato (`unique.size === chosen.length`).
        // 4. Una durata selezionata.
        // 5. Una tariffa oraria valida.
        isValid = selectedProduct
          && selects.length > 0 // Assicurati che i select siano stati renderizzati
          && chosen.length === selects.length       
          && unique.size === chosen.length          
          && selectedDuration
          && !isNaN(hourlyRate) && hourlyRate > 0;
    }
    submitBtn.disabled = !isValid;
}
 
// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage(loginMessageBox);

  showGlobalLoader(); 

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
    // Non chiudere il loader qui, il loader viene chiuso in success.
    // In caso di errore lo lasciamo aperto per il messaggio di errore.
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

    // Memorizza i draft nel browser per un caricamento veloce
    LAST_DRAFTS = resp.drafts;

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

// listener globale per i bottoni Load (delegato - messo qui per essere definito una sola volta)
document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('loadDraftBtn')) return;
  
  const row = e.target.dataset.row;
  if (!row) return;

  // Trova il draft corrispondente nei dati salvati in memoria
  const draft = LAST_DRAFTS.find(d => d.rowNumber == row);
  if (!draft) return showToast("Draft data not found in memory.", 3000, 'bg-red-600');

  // salva l’ID riga in memoria (per il 'Send')
  window.debriefLoadedRow = row;

  // Popola tutti i campi
  debriefStudentSelect.value = draft.studentId || debriefStudentSelect.value;
  debriefDateInput.value = draft.dateISO || debriefDateInput.value;
  debriefGoals.value = draft.goals || '';
  debriefTopics.value = draft.topics || '';
  debriefGrammar.value = draft.grammar || '';
  debriefVocabulary.value = draft.vocabulary || '';
  debriefPronunciation.value = draft.pronunciation || '';
  debriefOther.value = draft.other || '';
  debriefHomework.value = draft.homework || '';

  showToast(`Loaded draft for ${draft.studentId || 'student'}`, 3000, 'bg-green-600');
});


viewCoachingDebriefBtn.addEventListener('click', async () => {
  switchSection(coachingDebriefSection);

  // Pulisci i campi
  debriefGoals.value = debriefTopics.value = debriefGrammar.value = debriefVocabulary.value = '';
  debriefPronunciation.value = debriefOther.value = debriefHomework.value = '';
  window.debriefLoadedRow = null; // Resetta la riga caricata
  document.getElementById('debriefDraftsContainer')?.classList.add('hidden'); // Nascondi i draft

  // Precompila la data odierna
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  debriefDateInput.value = `${yyyy}-${mm}-${dd}`;

  // Carica lista studenti nel dropdown
  showGlobalLoader();  

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
    hideGlobalLoader(); 
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
        showToast("Draft saved successfully!", 3000, 'bg-green-600');
      } catch (err) {
        console.error("Save draft error:", err);
        debriefMsg.textContent = "❌ " + (err.message || "Error saving draft");
        showToast("Error saving draft: " + (err.message || "Unknown error"), 5000, 'bg-red-600');
      }
    });

      // --- Send Debrief ---
      debriefSendBtn.addEventListener('click', async () => {
        debriefMsg.textContent = "📤 Sending...";
      
        try {
          const payload = {
            coachId: CURRENT_COACH_ID,
            studentId: debriefStudentSelect.value,
            rowNumber: window.debriefLoadedRow || null
          };
          
          if (!payload.studentId) throw new Error("Please select a student first.");

          const resp = await apiPost("sendDebrief", payload);
      
          if (!resp.success) throw new Error(resp.error || "Send failed");
          debriefMsg.textContent = "✅ Sent to student!";
          showToast("Debrief sent successfully!", 3000, 'bg-green-600');
        } catch (err) {
          console.error("Send debrief error:", err);
          debriefMsg.textContent = "❌ " + (err.message || "Error sending debrief");
          showToast("Error sending debrief: " + (err.message || "Unknown error"), 5000, 'bg-red-600');
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
        showToast(`Applied AI suggestion for ${capitalize(fieldType)}`, 3000, "bg-green-600");
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
        // usato per iniettare il suggerimento nella funzione JS 'applyAISuggestion'
        return str.replace(/`/g, "\\`");
      }

    
// My payment folder
viewFolderBtn.addEventListener('click', async () => {
  if (!CURRENT_COACH_ID) return;
  showGlobalLoader(); 
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
    hideGlobalLoader(); 
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
  switchSection(dashboardSection);
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
  // Popola la lista Month/Year per il filtro (aggiunto qui)
  const months = new Set();
  fullHistory.forEach(h => {
    if (h.dateISO) {
      // Garantisce che il formato sia YYYY-MM
      const d = new Date(h.dateISO);
      if (!isNaN(d)) {
        months.add(d.toISOString().slice(0, 7)); 
      }
    }
  });

  historyMonthYear.innerHTML = '<option value="">All Months</option>';
  Array.from(months).sort().reverse().forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    // Formato display es: 2024-05 -> May 2024
    const [year, month] = m.split('-');
    const date = new Date(year, month - 1);
    opt.textContent = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    historyMonthYear.appendChild(opt);
  });


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

  // Riporta visibile il bottone Google
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

    showGlobalLoader(); 

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
      hideGlobalLoader(); 
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
  const callType = document.querySelector('input[name="callType"]:checked')?.value;
  const selectedProductId = productIdSelect.value;
  productIdInput.value = selectedProductId || '';
  hourlyRateInput.value = '';
  technicalDurationInput.value = '';
  contractIdInput.value = '';
  remainingCallsDisplay.classList.add('hidden');
  hideMessage(callMessageBox);
  updateFormState();

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
  hourlyRateInput.value = displayRate.toFixed(2); // Set initial rate

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
      // aggiunge l'opzione se non presente (es. 45 min)
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
  else if (callType === "GROUP") {
    // Nascondi i select precedenti e mostra il loader
    groupStudentsDynamic.innerHTML = loaderHTML("Loading group students list...");
    groupStudentsContainer.classList.remove('hidden');

    try {
      const resp = await apiGet('getGroupStudents', { productId: selectedProductId });
      const studs = (resp && resp.success && Array.isArray(resp.students)) ? resp.students : [];
      const n = prod.participants || 1; // Numero di partecipanti attesi
      
      if (studs.length < n) {
          showMessage(callMessageBox, `Warning: Product expects ${n} participants but only ${studs.length} students found in group.`, false);
      }
      
      // Renderizza i select dinamici
      renderGroupStudentSelectors(studs, n);

    } catch (e) {
      console.error('Error loading group students:', e);
      showMessage(callMessageBox, `Error loading group students: ${e.message}`, false);
      groupStudentsContainer.classList.add('hidden');
    }
  }

  // Abilita la durata e aggiorna lo stato finale
  callDurationSelect.disabled = false;
  updateFormState();
});

// Aggiungi listener per aggiornare lo stato del form al cambio di callType
callTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const isInd = radio.value === 'IND';
        const isGroup = radio.value === 'GROUP';
        
        // Reset delle selezioni principali
        studentIdSelect.value = '';
        productIdSelect.innerHTML = '<option value="" disabled selected>Select a Product</option>';
        productIdSelect.disabled = true;
        
        // Toggle visibilità
        document.getElementById('indStudentsContainer').classList.toggle('hidden', !isInd);
        groupStudentsContainer.classList.toggle('hidden', !isGroup);

        // Reset del contenuto dinamico di gruppo
        if (groupStudentsDynamic) groupStudentsDynamic.innerHTML = '';

        // Carica i dati appropriati
        if (isInd) {
            loadStudentIds(); 
        } else if (isGroup) {
            loadGroupProducts(); 
        }
        
        updateFormState();
    });
});

// Aggiungi listener per la durata e il rate
callDurationSelect.addEventListener('change', updateFormState);
hourlyRateInput.addEventListener('input', updateFormState); 


// Log Call Button (Passa alla sezione Log Call)
logCallBtn.addEventListener('click', async () => {
    switchSection(callSection);

    // Pre-popola la data odierna
    const today = new Date().toISOString().split('T')[0];
    callDateInput.value = today;
    
    // Simula il click sul radio button selezionato per inizializzare il form
    const initialRadio = document.querySelector('input[name="callType"]:checked');
    if (initialRadio) {
        initialRadio.dispatchEvent(new Event('change'));
    } else {
        // Fallback: Seleziona IND se nulla è selezionato
        document.getElementById('callTypeInd').checked = true;
        document.getElementById('callTypeInd').dispatchEvent(new Event('change'));
    }

    // Setta la durata predefinita se necessario
    if (!callDurationSelect.value) {
        // Tenta di selezionare l'opzione predefinita o la prima disponibile
        callDurationSelect.value = callDurationSelect.querySelector('option[disabled]')?.nextElementSibling?.value || '';
    }

    updateFormState();
});


// Submit Log Call Form
submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging...';
    hideMessage(callMessageBox);

    const callType = document.querySelector('input[name="callType"]:checked')?.value;
    const isGroup = callType === 'GROUP';
    const isInd = callType === 'IND';

    let studentIds = [];
    if (isInd) {
        studentIds = [studentIdSelect.value];
    } else if (isGroup) {
        // Raccoglie tutti gli studenti selezionati nei select dinamici
        const selects = document.querySelectorAll('#groupStudentsDynamic .student-selector');
        studentIds = Array.from(selects).map(s => s.value).filter(Boolean);
        if (studentIds.length === 0) {
            showMessage(callMessageBox, "Please select at least one student for the group call.", false);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log Call';
            return;
        }
    } else {
        showMessage(callMessageBox, "Please select a call type.", false);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log Call';
        return;
    }

    const payload = {
        action: 'logCall',
        coachId: CURRENT_COACH_ID,
        date: callDateInput.value,
        duration: callDurationSelect.value,
        technicalDuration: technicalDurationInput.value,
        hourlyRate: hourlyRateInput.value,
        units: unitsInput.value,
        contractId: contractIdInput.value,
        productId: productIdInput.value,
        callType: callType,
        studentIds: studentIds
    };

    showGlobalLoader();
    try {
        const resp = await apiPost('logCall', payload);
        if (!resp.success) throw new Error(resp.error || 'Log failed');

        showMessage(callMessageBox, `✅ Call logged successfully for ${studentIds.join(', ')}!`, true);
        showToast("Call logged!", 3000, 'bg-green-600');

        // Reset form e UI dopo successo
        loginForm.reset();
        await fetchMonthlyEarnings(); // Aggiorna i guadagni
        if (isInd) await loadStudentContracts(studentIds[0]); // Ricarica i contratti per l'aggiornamento dei Remaining Calls
        
    } catch (err) {
        showMessage(callMessageBox, `Error: ${err.message || String(err)}`, false);
        showToast("Error logging call.", 5000, 'bg-red-600');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log Call';
        hideGlobalLoader();
        updateFormState(); // Ultimo aggiornamento dello stato
    }
});


// --- Flashcards Logic ---

// Deck management helpers (Reconstructed from snippets)
let cardsByEn = new Map();
let smartDeck = [];
let sessionTotalSteps = 20;
let stepIndex = 0;
let renderNextCard = null; // Funzione per la prossima carta

function buildSmartDeck(cards) {
  // logica di costruzione del deck (es. smart logic)
  return cards.filter(c => c.score < 5 || c.score === undefined); 
}

function pickCardFromSmartDeck(deck) {
  // logica di selezione (es. random o basata sul punteggio)
  if (!deck.length) return null;
  return deck[Math.floor(Math.random() * deck.length)];
}

function renderCard(current, total, card) {
  if (!card) {
    flashcardsContainer.innerHTML = '<div class="text-center p-8">Session Complete!</div>';
    return;
  }
  
  const scoreDisplay = card.score === undefined ? 'New' : card.score;
  flashcardsContainer.innerHTML = `
    <div class="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg">
      <div class="text-xs text-gray-500 mb-4">${current + 1} of ${total}</div>
      <div class="text-center text-xl font-semibold mb-4 text-blue-600">Flashcard Test</div>
      <div id="flashcardSide" class="border p-6 rounded-lg bg-gray-50 min-h-[100px] flex items-center justify-center">
        <p class="text-2xl">${escapeHTML(card.en)}</p>
      </div>
      <div class="mt-4 flex justify-between items-center text-sm">
        <p>Score: <span class="font-bold">${scoreDisplay}</span></p>
        <button id="flipBtn" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Flip</button>
      </div>
      <div id="controls" class="mt-6 hidden">
        <p class="text-center mb-3 font-medium">How well did you know this?</p>
        <div class="flex justify-center gap-4">
          <button class="scoreBtn p-3 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600" data-status="unknown">❌</button>
          <button class="scoreBtn p-3 rounded-full bg-yellow-500 text-white shadow-md hover:bg-yellow-600" data-status="familiar">🟡</button>
          <button class="scoreBtn p-3 rounded-full bg-green-500 text-white shadow-md hover:bg-green-600" data-status="mastered">✅</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('flipBtn').addEventListener('click', () => {
    document.getElementById('flashcardSide').innerHTML = `<p class="text-2xl text-gray-800">${escapeHTML(card.it)}</p>`;
    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('flipBtn').classList.add('hidden');
  });

  document.querySelectorAll('.scoreBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Logga l'aggiornamento
      pendingFlashcardUpdates.push({ 
        en: card.en, 
        status: btn.dataset.status 
      });

      // 2. Aggiorna il punteggio in memoria per il retry (smartDeck)
      if (btn.dataset.status === "unknown") {
        card.score = Math.max((card.score || 0) - 1, 1);
      } else if (btn.dataset.status === "mastered") {
        card.score = Math.min((card.score || 0) + 1, 5);
      } else { // familiar
        card.score = Math.min((card.score || 0) + 0.5, 5);
      }

      // 3. Prossima carta
      stepIndex++;
      if (stepIndex < sessionTotalSteps) {
        renderNextCard();
      } else {
        // Fine sessione, mostra pulsante per retry o save
        flashcardsContainer.innerHTML = `
          <div class="text-center p-8">
            <h3 class="text-2xl font-bold mb-4">Session Complete!</h3>
            <p class="mb-6">Ready to save or retry difficult cards?</p>
            <button id="saveUpdatesBtn" class="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700">
              Save ${pendingFlashcardUpdates.length} Updates
            </button>
            <button id="retryBtn" class="ml-4 px-5 py-2 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600">
              Retry Failed Cards
            </button>
          </div>
        `;
        setupPostSessionControls(); // Configura i listeners
      }
    });
  });
}

function setupPostSessionControls() {
  const container = flashcardsContainer;

  // Save Updates
  document.getElementById('saveUpdatesBtn')?.addEventListener('click', async () => {
    if (!pendingFlashcardUpdates.length) return;
    
    container.innerHTML = loaderHTML("Saving updates...");

    try {
      const resp = await apiPost('updateFlashcards', { 
        coachId: CURRENT_COACH_ID,
        updates: pendingFlashcardUpdates 
      });

      if (!resp.success) throw new Error(resp.error || "Save failed");

      container.innerHTML = `<p class="text-center p-8 text-green-600 font-bold">✅ Updates Saved Successfully!</p>`;
      pendingFlashcardUpdates = []; // Pulisci dopo il salvataggio
    } catch (err) {
      container.innerHTML = `<p class="text-center p-8 text-red-600">Error saving: ${err.message}. Try again.</p>`;
    }
  });

  // Retry Failed Cards
  document.getElementById('retryBtn')?.addEventListener('click', () => {
    const redCards = pendingFlashcardUpdates
      .filter(c => c.status === "unknown")
      .map(u => cardsByEn.get(String(u.en || "").toLowerCase()))
      .filter(Boolean);

    if (!redCards.length) {
      container.innerHTML = `<p class="text-center p-8 text-green-600">No cards to retry. Good job!</p>`;
      return;
    }
    
    // Assegna un punteggio basso per assicurarne la selezione nel nuovo deck
    redCards.forEach(rc => rc.score = Math.max(rc.score || 1, 1)); 

    // Reset della sessione
    pendingFlashcardUpdates = [];
    stepIndex = 0;
    
    // CORREZIONE: Imposta il nuovo totale per il retry (10)
    sessionTotalSteps = 10; 

    const redDeck = buildSmartDeck(redCards);
    
    // Sovrascrive la funzione per usare il deck e il totale corretti
    function renderNextRed() {
      const next = pickCardFromSmartDeck(redDeck);
      renderCard(stepIndex, sessionTotalSteps, next);
    }

    // Assegna la nuova logica per il prossimo round
    renderNextCard = renderNextRed;
    renderNextCard();
  });
}


async function loadFlashcardsDashboard() {
  flashcardsContainer.innerHTML = loaderHTML("Loading students for flashcards...");
  
  try {
    const resp = await apiGet('getStudents');
    const students = (resp && resp.success && Array.isArray(resp.students)) ? resp.students : [];

    // Crea un dropdown
    const selectHtml = `
      <div class="text-center mb-6">
        <label for="flashcardStudentSelect" class="block text-lg font-medium text-gray-700 mb-2">Select Student for Flashcards</label>
        <select id="flashcardStudentSelect" class="w-full max-w-sm p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
          <option value="" disabled selected>Choose a student</option>
          ${students.map(id => `<option value="${id}">${id}</option>`).join('')}
        </select>
      </div>
      <div id="flashcardDeckOptions" class="hidden text-center">
          <p class="text-gray-600 mb-4">Select a deck size to start:</p>
          <button data-size="10" class="startDeckBtn px-5 py-2 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700">Start 10 Cards</button>
          <button data-size="20" class="startDeckBtn ml-4 px-5 py-2 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700">Start 20 Cards</button>
      </div>
    `;
    flashcardsContainer.innerHTML = selectHtml;

    // Listener per la selezione dello studente
    document.getElementById('flashcardStudentSelect').addEventListener('change', async (e) => {
      const studentId = e.target.value;
      if (!studentId) return;

      document.getElementById('flashcardDeckOptions').classList.add('hidden');
      flashcardsContainer.innerHTML = loaderHTML("Loading flashcards for " + studentId + "...");
      
      try {
        const cardResp = await apiGet('getFlashcards', { studentId });
        const allCards = (cardResp.success && Array.isArray(cardResp.flashcards)) ? cardResp.flashcards : [];
        
        if (!allCards.length) {
          flashcardsContainer.innerHTML = `<p class="text-center p-8 text-gray-500">No flashcards found for ${studentId}.</p>`;
          return;
        }

        // 1. Mappa le carte per EN per aggiornamento in memoria
        cardsByEn.clear();
        allCards.forEach(c => cardsByEn.set(String(c.en || "").toLowerCase(), c));

        // 2. Costruisci il deck smart iniziale
        smartDeck = buildSmartDeck(allCards);
        if (!smartDeck.length) {
          flashcardsContainer.innerHTML = `<p class="text-center p-8 text-green-600">All ${allCards.length} cards are mastered! 🎉</p>`;
          return;
        }

        // 3. Mostra opzioni di dimensione deck
        flashcardsContainer.innerHTML = selectHtml; // Ridisegna il select
        document.getElementById('flashcardStudentSelect').value = studentId; // Risetta lo studente
        document.getElementById('flashcardDeckOptions').classList.remove('hidden');

        // 4. Listener per l'inizio della sessione
        document.querySelectorAll('.startDeckBtn').forEach(btn => {
          btn.addEventListener('click', () => {
            sessionTotalSteps = parseInt(btn.dataset.size, 10);
            stepIndex = 0;
            pendingFlashcardUpdates = [];
            
            // Funzione default per la prossima carta (usa il deck smart)
            function renderNextDefault() {
              const next = pickCardFromSmartDeck(smartDeck);
              renderCard(stepIndex, sessionTotalSteps, next);
            }
            renderNextCard = renderNextDefault;

            // 🚀 Avvia la prima carta
            renderNextCard();
          });
        });

      } catch (err) {
        flashcardsContainer.innerHTML = `<p class="text-red-500 text-center">Error loading flashcards: ${err.message}</p>`;
      }
    });
  } catch (err) {
    flashcardsContainer.innerHTML = `<p class="text-red-500 text-center">Error loading students: ${err.message}</p>`;
  }
}

// Event Listeners per la navigazione Flashcards
viewFlashcardsBtn.addEventListener('click', () => {
  switchSection(flashcardsSection);
  loadFlashcardsDashboard();
});

backToDashboardFromFlashcardsBtn.addEventListener('click', () => {
  switchSection(dashboardSection);
});
