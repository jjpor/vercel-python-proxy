/* ----------------------------- 1) CONFIGURAZIONE ----------------------------- */
const CONFIG = {
  // NOTA: Utilizza l'endpoint e la logica API del file 'chaotic' che è funzionante.
  API_BASE_URL: "https://vercel-python-proxy.vercel.app/api",
  DEPLOYMENT_ID: "AKfycbwjmnBDZcMdBmP6Dj67S19qGDP61ujNtBvJZU65xqlUfluThOy1pphwjvACS9FVXJeD",
  SESSION_KEY: "coachSession",


  // Riferimenti DOM completi, unendo tutti i file
  DOM_REFS: {
    // Sezioni Principali
    loginSection: 'loginSection',
    dashboardSection: 'dashboardSection',
    callSection: 'callSection',
    coachingDebriefSection: 'coachingDebriefSection',
    callHistorySection: 'callHistorySection',
    studentsSection: 'studentsSection',
    flashcardsSection: 'flashcardsSection',
    reportCardsSection: 'reportCardsSection',
    reportCardFormSection: 'reportCardFormSection',
    teachingMaterialsSection: 'teachingMaterialsSection',


    // Autenticazione
    loginForm: 'loginForm',
    coachIdInput: 'coachId',
    passwordInput: 'password',
    loginMessageBox: 'loginMessageBox',
    googleLoginContainer: 'googleLoginContainer',
    logoutBtn: 'logoutBtn',


    // UI Globale
    globalLoader: 'globalLoader',
    toast: 'toast',
    coachNameDisplay: 'coachNameDisplay',
    callSectionCoachNameDisplay: 'callSectionCoachNameDisplay',
    earningsAmountDisplay: 'earningsAmount',
    viewFolderBtn: 'viewFolderBtn',


    // Navigazione
    viewDashboardBtn: 'viewDashboardBtn',
    viewStudentsBtn: 'viewStudentsBtn',
    viewCallLogBtn: 'viewCallLogBtn',
    viewCallHistoryBtn: 'viewCallHistoryBtn',
    viewCoachingDebriefBtn: 'viewCoachingDebriefBtn',
    viewFlashcardsBtn: 'viewFlashcardsBtn',
    viewReportCardsBtn: 'viewReportCardsBtn',
    viewTeachingMaterialsBtn: 'viewTeachingMaterialsBtn',


    // Sezione Log Call (la più complessa)
    callForm: 'callForm',
    studentIdContainer: 'studentIdContainer',
    studentIdSelect: 'studentId',
    productIdSelect: 'productIdSelect',
    groupStudentsContainer: 'groupStudentsContainer',
    groupStudentsDynamic: 'groupStudentsDynamic', // Container per i select dinamici
    callDateInput: 'callDate',
    hourlyRateInput: 'hourlyRate',
    technicalDurationInput: 'technicalDuration',
    callDurationSelect: 'callDuration',
    unitsInput: 'units',
    contractIdInput: 'contractId',
    productIdInput: 'productId',
    callSubmitBtn: 'submitBtn',
    callMessageBox: 'callMessageBox',
    remainingCallsDisplay: 'remainingCalls',
    notes: 'notes',
    attendance: 'attendance',


    // Sezione Studenti
    studentSelect: 'studentSelect',
    studentDetailsContainer: 'studentDetailsContainer',
    backToDashboardFromStudentsBtn: 'backToDashboardFromStudentsBtn',


    // Sezione Debrief
    debriefStudentSelect: 'debriefStudentSelect',
    debriefDateInput: 'debriefDateInput',
    debriefMsg: 'debriefMsg',
    debriefLoadDraftsBtn: 'debriefLoadDraftsBtn',
    debriefDraftsContainer: 'debriefDraftsContainer',
    debriefForm: 'coachingDebriefForm', // Assumendo l'ID del form
    debriefSaveDraftBtn: 'debriefSaveDraftBtn',
    debriefSendBtn: 'debriefSendBtn',
    backToDashboardFromDebriefBtn: 'backToDashboardFromDebriefBtn',


    // Sezione Storico Chiamate
    callHistoryTableBody: 'callHistoryTableBody',
    historyMonthYear: 'historyMonthYear',
    backFromCallHistoryBtn: 'backFromCallHistoryBtn',


    // Sezione Flashcards
    flashcardsSection: 'flashcardsSection',
    flashcardsStudentSelect: 'flashcardsStudentSelect',
    flashcardsContainer: 'flashcardsContainer',
    backToDashboardFromFlashcardsBtn: 'backToDashboardFromFlashcardsBtn',
    
    // Sezione Report Cards
    reportCardsContainer: 'reportCardsContainer',
    reportCardNoShowsContainer: 'reportCardNoShowsContainer',
    reportCardForm: 'reportCardForm',
    reportCardMessageBox: 'reportCardMessageBox',
    reportCardHistoryContainer: 'reportCardHistoryContainer',
    reportCardHistoryTableBody: 'reportCardHistoryTableBody',
    historyFilterMonth: 'historyFilterMonth',
    rcStudentId: 'rcStudentId',
    rcContractId: 'rcContractId',
    rcCoachId: 'rcCoachId',
    rcStudentName: 'rcStudentName',
    rcAttendance: 'rcAttendance',
    rcReport: 'rcReport',
    reportCardCallsTable: 'reportCardCallsTable',
    reportCardCallsTableBody: 'reportCardCallsTableBody',
    backToReportCardsBtn: 'backToReportCardsBtn',
    backToDashboardFromReportsBtn: 'backToDashboardFromReportsBtn',
    sendAllReportCardsBtn: 'sendAllReportCardsBtn',
    sendAllConfirmModal: 'sendAllConfirmModal',
    confirmSendAllBtn: 'confirmSendAllBtn',
    cancelSendAllBtn: 'cancelSendAllBtn',
    aiSuggestBtn: 'aiSuggestBtn',
    aiRefineBtn: 'aiRefineBtn',
    aiHelperMsg: 'aiHelperMsg',
  }
};


/* --------------------------- 2) SERVIZIO API -------------------------- */
class APIService {
  constructor(baseUrl, deploymentId) {
    this.baseUrl = baseUrl;
    this.deploymentId = deploymentId;
  }


  async get(action, params = {}) {
    const url = new URL(`${this.baseUrl}/get`);
    url.searchParams.set("deployment_id", this.deploymentId);
    url.searchParams.set("action", action);
    url.searchParams.set("_ts", Date.now());
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`GET ${action} failed: ${res.status}`);
    return res.json();
  }


  async post(action, body = {}) {
    const res = await fetch(`${this.baseUrl}/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deployment_id: this.deploymentId, action, ...body })
    });
    if (!res.ok) throw new Error(`POST ${action} failed: ${res.status}`);
    return res.json();
  }
}


/* ----------------------- 3) GESTORE INTERFACCIA UTENTE (UI) ----------------------- */
const UIManager = {
  refs: {},
  initRefs() {
    for (const [key, id] of Object.entries(CONFIG.DOM_REFS)) {
      this.refs[key] = document.getElementById(id);
    }
  },
  showGlobalLoader() { this.refs.globalLoader?.classList.add('active'); },
  hideGlobalLoader() { this.refs.globalLoader?.classList.remove('active'); },
  showToast(msg, ms = 4000, color = "bg-green-600") {
    const t = this.refs.toast; if (!t) return;
    t.className = `fixed top-4 right-4 text-white px-4 py-2 rounded-lg shadow-lg z-[99999] ${color}`;
    t.textContent = msg;
    t.classList.remove("hidden");
    setTimeout(() => { t.classList.add("hidden"); }, ms);
  },
  showMessage(box, message, isSuccess = true) {
    if (!box) return;
    box.textContent = message;
    box.className = 'mt-4 p-4 rounded-xl text-center block ' + (isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700');
  },
  hideMessage(box) {
    if (!box) return;
    box.textContent = '';
    box.className = 'mt-4 p-4 rounded-xl text-center hidden';
  },
  switchSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(el => el.classList.add('hidden'));
    const section = this.refs[sectionId];
    if (section) section.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });
  },
  loaderHTML(msg = "Loading...") {
    return `<div class="flex flex-col items-center justify-center py-4 text-gray-500">
      <div class="spinner-container mb-2"><div class="spinner-dot"></div><div class="spinner-dot"></div><div class="spinner-dot"></div></div>
      <p>${msg}</p>
    </div>`;
  },
  escapeHTML(str) { return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
  normalizeUrl(u) {
    const s = String(u || '').trim();
    if (!s) return "";
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
  }
};


/* --------------------------- 4) APPLICAZIONE DASHBOARD ------------------------ */
class DashboardApp {
  #coach = { id: null, name: null, role: null };
  #api = new APIService(CONFIG.API_BASE_URL, CONFIG.DEPLOYMENT_ID);
  #callHistory = [];
  #lastDrafts = [];
  #debriefLoadedRow = null;


  constructor() {
    UIManager.initRefs();
    this.initEventListeners();
  }


  async init() {
    if (this.restoreSession()) {
      UIManager.switchSection('dashboardSection');
      this.updateCoachDisplay();
      this.loadDashboardData();
    } else {
      UIManager.switchSection('loginSection');
    }
  }


  // --- Autenticazione e Sessione ---
  restoreSession() {
    try {
      const raw = localStorage.getItem(CONFIG.SESSION_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      this.#coach = { id: s.id, name: s.name, role: s.role };
      return !!s.id;
    } catch {
      localStorage.removeItem(CONFIG.SESSION_KEY);
      return false;
    }
  }


  saveSession(payload) {
    this.#coach.id = String(payload.coachId);
    this.#coach.name = payload.coachName || this.#coach.id;
    this.#coach.role = payload.role || "";
    localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(this.#coach));
    UIManager.refs.googleLoginContainer?.classList.add('hidden');
    this.updateCoachDisplay();
  }


  async handleManualLogin(e) {
    e.preventDefault();
    UIManager.hideMessage(UIManager.refs.loginMessageBox);
    UIManager.showGlobalLoader();
    try {
      const coachId = UIManager.refs.coachIdInput?.value?.trim();
      const password = UIManager.refs.passwordInput?.value?.trim();
      const resp = await this.#api.post('login', { coachId, password });
      if (!resp.success) throw new Error(resp.error || "Login failed");
      if (!resp.role) throw new Error("Coach role not found. Contact administrator.");
      
      this.saveSession(resp);
      UIManager.switchSection('dashboardSection');
      await this.loadDashboardData();
    } catch (err) {
      UIManager.showMessage(UIManager.refs.loginMessageBox, err.message || String(err), false);
    } finally {
      UIManager.hideGlobalLoader();
    }
  }


  async handleGoogleLogin(response) {
    UIManager.showGlobalLoader();
    try {
      const resp = await this.#api.post('loginWithGoogle', { credential: response.credential });
      if (!resp.success) throw new Error(resp.error || "Google login failed");
      
      this.saveSession(resp);
      UIManager.switchSection('dashboardSection');
      await this.loadDashboardData();
    } catch (err) {
      UIManager.showToast("Google login error: " + (err.message || err), 5000, "bg-red-600");
    } finally {
      UIManager.hideGlobalLoader();
    }
  }


  handleLogout() {
    this.#coach = { id: null, name: null, role: null };
    localStorage.removeItem(CONFIG.SESSION_KEY);
    UIManager.refs.googleLoginContainer?.classList.remove('hidden');
    UIManager.refs.loginForm.reset();
    UIManager.switchSection('loginSection');
  }


  // --- Dati Dashboard ---
  updateCoachDisplay() {
    const name = this.#coach.name || "Coach";
    if (UIManager.refs.coachNameDisplay) UIManager.refs.coachNameDisplay.textContent = name;
    if (UIManager.refs.callSectionCoachNameDisplay) UIManager.refs.callSectionCoachNameDisplay.textContent = name;
  }
  
  async loadDashboardData() {
    await Promise.allSettled([
      this.fetchMonthlyEarnings(),
      this.loadStudentsForCallLog() // Pre-carica gli studenti per il form
    ]);
  }


  async fetchMonthlyEarnings() {
    if (!this.#coach.id) return;
    if (UIManager.refs.earningsAmountDisplay) UIManager.refs.earningsAmountDisplay.textContent = '...';
    try {
      const resp = await this.#api.get('getMonthlyEarnings', { coachId: this.#coach.id });
      UIManager.refs.earningsAmountDisplay.textContent = Number(resp.earnings || 0).toFixed(2);
    } catch {
      UIManager.refs.earningsAmountDisplay.textContent = '--';
    }
  }


  async handleViewFolder() {
    if (!this.#coach.id) return;
    UIManager.showGlobalLoader();
    try {
      const resp = await this.#api.get('getPaymentFolderUrl', { coachId: this.#coach.id });
      if (resp.success && resp.url) {
        window.open(UIManager.normalizeUrl(resp.url), "_blank");
      } else {
        UIManager.showToast("No folder found", 3000, "bg-red-600");
      }
    } catch (err) {
      UIManager.showToast("Error: " + err.message, 3000, "bg-red-600");
    } finally {
      UIManager.hideGlobalLoader();
    }
  }
  
  // --- Sezione Studenti ---
  async handleViewStudents() {
      UIManager.switchSection('studentsSection');
      const select = UIManager.refs.studentSelect;
      const container = UIManager.refs.studentDetailsContainer;
      if (!select || !container) return;


      select.innerHTML = '<option value="" disabled selected>Loading students...</option>';
      container.innerHTML = UIManager.loaderHTML("Select a student to view details.");
      
      try {
          const resp = await this.#api.get('getStudents');
          const arr = (resp?.success && Array.isArray(resp.students)) ? resp.students : [];
          arr.sort((a,b) => a.localeCompare(b,'en',{sensitivity:'base'}));
          
          select.innerHTML = '<option value="" disabled selected>Select a student</option>';
          arr.forEach(id => {
              const opt = document.createElement('option');
              opt.value = id;
              opt.textContent = id;
              select.appendChild(opt);
          });
      } catch (err) {
          select.innerHTML = '<option value="" disabled selected>Error loading students</option>';
          container.innerHTML = `<p class="text-red-600 text-center">Error: ${UIManager.escapeHTML(err.message)}</p>`;
      }
  }


  async fetchAndRenderStudentDetails(studentId) {
      const container = UIManager.refs.studentDetailsContainer;
      if (!container) return;
      container.innerHTML = UIManager.loaderHTML("Loading student details...");
      UIManager.showGlobalLoader();
      
      try {
          const [infoResp, contractsResp] = await Promise.all([
              this.#api.get('getStudentInfo', { studentId }),
              this.#api.get('getStudentContracts', { studentId }).catch(() => ({ success: false, contracts: [] }))
          ]);


          if (!infoResp.success || !infoResp.studentInfo) throw new Error(infoResp.error || "Student not found");


          const info = infoResp.studentInfo;
          const calls = info.calls || [];
          delete info.calls;
          const contracts = contractsResp.success ? (contractsResp.contracts || []) : [];


          container.innerHTML = this.renderStudentDetailsHTML(info, calls, contracts);
      } catch (err) {
          container.innerHTML = `<p class="text-red-600 text-center">Error: ${UIManager.escapeHTML(err.message)}</p>`;
      } finally {
          UIManager.hideGlobalLoader();
      }
  }


  renderStudentDetailsHTML(info, calls, contracts) {
      // --- Bottoni dinamici per i link ---
      const linkFieldDefs = {
        "Quizlet Link": { label: "Quizlet", aliases: ["Quizlet"] },
        "Drive Folder Link": { label: "Drive Folder", aliases: ["Drive"] },
        "Homework File": { label: "Homework", aliases: ["Homework"] },
        "Lesson Plan File": { label: "Lesson Plan", aliases: ["Lesson Plan"] }
      };
      
      let buttonsHtml = "";
      for (const [primaryKey, def] of Object.entries(linkFieldDefs)) {
          const candidates = [primaryKey, ...(def.aliases || [])];
          let value = "";
          for (const k of candidates) {
              if (info[k] && info[k] !== "N/A") { value = info[k]; break; }
          }
          candidates.forEach(k => delete info[k]); // Rimuove il campo dalla tabella
          
          if (value) {
              buttonsHtml += `<a href="${UIManager.normalizeUrl(value)}" target="_blank" class="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700 text-sm font-medium">
                  ${def.label}
              </a>`;
          } else {
              buttonsHtml += `<span class="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-gray-200 text-gray-500 shadow-inner cursor-not-allowed text-sm font-medium">
                  ${def.label}
              </span>`;
          }
      }


      // --- Tabella dettagli con formattazione speciale ---
      let detailsHtml = `<h3 class="text-xl font-semibold text-gray-800 mb-4">Student Details</h3>
      <div class="overflow-x-auto mb-6"><table class="w-full text-sm"><tbody>`;
      
      for (const [key, value] of Object.entries(info)) {
          if (key === 'Onboarded (dashboard)') continue;
          let rowHtml = `<tr><td class="py-3 px-6 font-medium text-gray-700 whitespace-nowrap">${key}</td><td class="py-3 px-6">`;


          if ((key === 'Email' || key === 'Secondary Email') && value && value !== 'N/A') {
              rowHtml += `<a href="mailto:${value}" class="text-blue-600 underline hover:text-blue-800">${value}</a>`;
          } else if (key === 'Phone' && value && value !== 'N/A') {
              rowHtml += `<a href="https://wa.me/${value.replace(/\D/g, '')}" target="_blank" class="text-blue-600 underline hover:text-blue-800">${value}</a>`;
          } else if (key === 'Status') {
              const color = value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
              rowHtml += `<span class="px-3 py-1 rounded-full text-xs font-semibold ${color}">${value}</span>`;
          } else {
              rowHtml += `${value || 'N/A'}`;
          }
          rowHtml += `</td></tr>`;
          detailsHtml += rowHtml;
      }
      detailsHtml += `</tbody></table></div>`;
      if (buttonsHtml) {
          detailsHtml += `<div class="mt-6 flex flex-wrap items-center justify-center gap-3">${buttonsHtml}</div>`;
      }


      // --- Tabella Contratti ---
      detailsHtml += `<h3 class="text-xl font-semibold text-gray-800 mb-4 mt-8">Contracts</h3>`;
      if (contracts.length) {
          detailsHtml += `<div class="flex justify-center"><table class="text-sm border border-gray-200 rounded-xl mb-6">
              <thead class="bg-gray-100"><tr>
                  <th class="py-2 px-4 text-left">Product</th><th class="py-2 px-4 text-center">Duration</th><th class="py-2 px-4 text-center">Used</th>
                  <th class="py-2 px-4 text-center">Left</th><th class="py-2 px-4 text-center">Expiration</th><th class="py-2 px-4 text-center">Status</th>
              </tr></thead><tbody>`;
          contracts.forEach(c => {
              const used = (c.product?.totalCalls && c.leftCalls !== undefined) ? Math.max(0, c.product.totalCalls - c.leftCalls) : "-";
              detailsHtml += `<tr class="${c.leftCalls === 0 ? 'text-gray-400' : ''}">
                  <td class="py-2 px-4">${c.product?.productName || c.productId}</td><td class="py-2 px-4 text-center">${c.product?.duration || '-'}</td>
                  <td class="py-2 px-4 text-center">${used}</td><td class="py-2 px-4 text-center">${c.leftCalls ?? '∞'}</td>
                  <td class="py-2 px-4 text-center">${c.maxEndDate || c.endDate || "-"}</td><td class="py-2 px-4 text-center">${c.leftCalls === 0 ? "Ended" : "Active"}</td>
              </tr>`;
          });
          detailsHtml += `</tbody></table></div>`;
      } else {
          detailsHtml += `<p class="text-gray-500 italic text-center mb-4">No contracts found.</p>`;
      }


      // --- Storico Chiamate ---
      detailsHtml += `<h3 class="text-xl font-semibold text-gray-800 mb-4 mt-6">Call History</h3>
      <div class="overflow-x-auto"><table class="w-full text-sm border border-gray-200 rounded-xl">
          <thead class="bg-gray-100"><tr>
              <th class="py-3 px-6 text-left">Date</th><th class="py-3 px-6 text-left">Product</th><th class="py-3 px-6 text-left">Coach</th>
              <th class="py-3 px-6 text-left">Duration</th><th class="py-3 px-6 text-left">Attendance</th><th class="py-3 px-6 text-left">Notes</th>
          </tr></thead><tbody>`;
      if (calls.length) {
          calls.forEach(c => {
              detailsHtml += `<tr class="border-b hover:bg-gray-50">
                  <td class="py-3 px-6">${c.date || 'N/A'}</td><td class="py-3 px-6">${c.productName || c.productId || '-'}</td>
                  <td class="py-3 px-6">${c.coachId || '-'}</td><td class="py-3 px-6">${c.duration || '-'}</td>
                  <td class="py-3 px-6">${c.attendance || '-'}</td><td class="py-3 px-6">${c.notes || ''}</td>
              </tr>`;
          });
      } else {
          detailsHtml += `<tr><td colspan="6" class="py-3 px-6 text-center text-gray-500">No calls found.</td></tr>`;
      }
      detailsHtml += `</tbody></table></div>`;


      return detailsHtml;
  }


  // --- Storico Chiamate ---
  async handleViewCallHistory() {
      if (!this.#coach.id) return;
      UIManager.switchSection('callHistorySection');
      const tableBody = UIManager.refs.callHistoryTableBody;
      if (!tableBody) return;
      
      tableBody.innerHTML = `<tr><td colspan="4">${UIManager.loaderHTML("Loading call history...")}</td></tr>`;
      try {
          const resp = await this.#api.get('getCallHistory', { coachId: this.#coach.id });
          this.#callHistory = (resp.success && resp.history) ? resp.history : [];
          this.renderHistoryTable();
      } catch (err) {
          tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-red-500">Error: ${err.message}</td></tr>`;
      }
  }


  renderHistoryTable() {
      const tableBody = UIManager.refs.callHistoryTableBody;
      const filter = UIManager.refs.historyMonthYear.value;
      if (!tableBody) return;


      const filtered = this.#callHistory.filter(h => {
          if (!filter) return true;
          if (!h.dateISO) return false;
          return h.dateISO.startsWith(filter);
      });
      
      if (!filtered.length) {
          tableBody.innerHTML = '<tr><td colspan="4" class="text-center p-4">No calls found for this period.</td></tr>';
          return;
      }
      
      tableBody.innerHTML = filtered.map(h => `
          <tr class="hover:bg-gray-50">
              <td class="border px-4 py-2">${h.date || h.dateISO || 'N/A'}</td>
              <td class="border px-4 py-2">${h.studentId || ''}</td>
              <td class="border px-4 py-2">${h.productName || h.productId || ''}</td>
              <td class="border px-4 py-2 text-right">${(Number(h.earnings) || 0).toFixed(2)}</td>
          </tr>
      `).join('');
  }
  
  // --- Sezione Log Call (Logica complessa) ---
  async handleViewCallLog() {
    if (!this.#coach.id) return;
    UIManager.switchSection('callSection');
    
    UIManager.refs.callForm.reset();
    document.querySelector('input[name="callType"][value="IND"]').checked = true;
    
    UIManager.refs.groupStudentsContainer.classList.add('hidden');
    UIManager.refs.studentIdContainer.classList.remove('hidden');
    UIManager.refs.remainingCallsDisplay.classList.add('hidden');
    UIManager.refs.callDateInput.value = new Date().toISOString().slice(0, 10);
    
    await this.loadStudentsForCallLog();
    this.updateCallFormState();
  }


  async loadStudentsForCallLog() {
    const select = UIManager.refs.studentIdSelect;
    select.innerHTML = '<option value="" disabled selected>Loading students...</option>';
    try {
      const resp = await this.#api.get('getStudents');
      const arr = (resp?.success && Array.isArray(resp.students)) ? resp.students : [];
      arr.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
      
      select.innerHTML = '<option value="" disabled selected>Select a student</option>';
      arr.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = id;
        select.appendChild(opt);
      });
      select.disabled = false;
    } catch {
      select.innerHTML = '<option value="" disabled selected>Error loading</option>';
    }
  }
  
  async handleCallTypeToggle(e) {
    const isGroup = e.target.value === 'GROUP';
    UIManager.showGlobalLoader();
    try {
      // Reset campi tecnici
      ['hourlyRateInput', 'technicalDurationInput', 'contractIdInput', 'productIdInput', 'unitsInput'].forEach(ref => UIManager.refs[ref].value = '');
      UIManager.refs.callDurationSelect.value = '';


      if (isGroup) {
        UIManager.refs.studentIdContainer.classList.add('hidden');
        UIManager.refs.groupStudentsContainer.classList.remove('hidden');
        UIManager.refs.remainingCallsDisplay.classList.add('hidden');
        await this.loadGroupProducts();
      } else {
        UIManager.refs.studentIdContainer.classList.remove('hidden');
        UIManager.refs.groupStudentsContainer.classList.add('hidden');
        UIManager.refs.productIdSelect.innerHTML = '<option value="" disabled selected>Select a Student ID first</option>';
        UIManager.refs.productIdSelect.disabled = true;
        await this.loadStudentsForCallLog();
      }
      this.updateCallFormState();
    } catch (err) {
      UIManager.showToast("Error loading data: " + (err.message || err), 4000, "bg-red-600");
    } finally {
      UIManager.hideGlobalLoader();
    }
  }


    async loadStudentContracts(studentId) {
        const { productIdSelect } = UIManager.refs;
        productIdSelect.disabled = true;
        productIdSelect.innerHTML = '<option value="" disabled selected>Loading products...</option>';
        UIManager.showGlobalLoader();
        try {
            const resp = await this.#api.get('getStudentContracts', { studentId });
            const contracts = (resp.success && Array.isArray(resp.contracts)) ? resp.contracts : [];
            
            productIdSelect.innerHTML = '<option value="" disabled selected>Select a product/allocation</option>';
            contracts.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.productId;
                opt.textContent = c.product?.productName || c.productId;
                opt.dataset.contractId = c.contractId;
                opt.dataset.product = JSON.stringify(c.product || {});
                opt.dataset.remainingCalls = c.leftCalls;
                productIdSelect.appendChild(opt);
            });
            productIdSelect.disabled = false;
        } catch {
            productIdSelect.innerHTML = '<option value="" disabled selected>Error loading</option>';
        } finally {
            UIManager.hideGlobalLoader();
        }
    }


    async loadGroupProducts() {
        const { productIdSelect } = UIManager.refs;
        productIdSelect.disabled = true;
        productIdSelect.innerHTML = '<option value="" disabled selected>Loading group products...</option>';
        try {
            const resp = await this.#api.get('getGroupProducts');
            const prods = (resp.success && Array.isArray(resp.products)) ? resp.products : [];
            
            productIdSelect.innerHTML = '<option value="" disabled selected>Select a group product</option>';
            prods.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.productId;
                opt.textContent = `${p.productName || p.productId} (${p.productId})`;
                opt.dataset.product = JSON.stringify(p);
                productIdSelect.appendChild(opt);
            });
            productIdSelect.disabled = false;
        } catch {
            productIdSelect.innerHTML = '<option value="" disabled selected>Error loading</option>';
        }
    }
    
    async onProductSelectChange() {
        const { productIdSelect, productIdInput, hourlyRateInput, technicalDurationInput, contractIdInput, remainingCallsDisplay, callMessageBox, callDurationSelect, groupStudentsDynamic } = UIManager.refs;
        const callType = document.querySelector('input[name="callType"]:checked').value;
        const opt = productIdSelect.options[productIdSelect.selectedIndex];


        // Reset
        productIdInput.value = productIdSelect.value || '';
        hourlyRateInput.value = '';
        technicalDurationInput.value = '';
        contractIdInput.value = '';
        remainingCallsDisplay.classList.add('hidden');
        UIManager.hideMessage(callMessageBox);


        if (!opt?.dataset.product) return;
        const prod = JSON.parse(opt.dataset.product);


        // Imposta rate e durata
        const rateKey = this.#coach.role;
        const displayRate = (rateKey && prod.rates) ? (prod.rates[rateKey] || 0) : 0;
        const nativeDuration = prod.duration || '';


        technicalDurationInput.value = nativeDuration;
        hourlyRateInput.dataset.baseRate = String(displayRate);
        hourlyRateInput.dataset.attendees = String(prod.participants || 1);


        if (nativeDuration) callDurationSelect.value = nativeDuration;


        if (callType === "IND") {
            contractIdInput.value = opt.dataset.contractId || '';
            const remaining = opt.dataset.remainingCalls;
            if (remaining !== undefined && remaining !== null) {
                remainingCallsDisplay.textContent = `Remaining: ${remaining} calls`;
                remainingCallsDisplay.classList.remove('hidden');
            }
        } else { // GROUP
            try {
                const resp = await this.#api.get('getGroupStudents', { productId: productIdSelect.value });
                const students = (resp.success && Array.isArray(resp.students)) ? resp.students : [];
                groupStudentsDynamic.innerHTML = '';
                for (let i = 0; i < (prod.participants || 2); i++) {
                    const sel = document.createElement('select');
                    sel.className = 'form-input';
                    sel.required = true;
                    let options = `<option value="" disabled selected>Select student ${i + 1}</option>`;
                    students.forEach(sid => options += `<option value="${sid}">${sid}</option>`);
                    sel.innerHTML = options;
                    sel.addEventListener('change', () => this.updateCallFormState());
                    groupStudentsDynamic.appendChild(sel);
                }
            } catch (err) { console.error("Error loading group students", err); }
        }
        
        callDurationSelect.disabled = !(displayRate > 0);
        this.recomputeUnitsAndRate();
    }
    
    recomputeUnitsAndRate() {
        const { callDurationSelect, technicalDurationInput, unitsInput, hourlyRateInput } = UIManager.refs;
        const override = parseFloat(callDurationSelect.value || '0');
        const native = parseFloat(technicalDurationInput.value || '0');
        const units = (native && override) ? (override / native) : 0;
        unitsInput.value = units ? units.toFixed(2) : '';


        const baseRateTotal = parseFloat(hourlyRateInput.dataset.baseRate || '0');
        const attendees = parseInt(hourlyRateInput.dataset.attendees || '1', 10);
        const callType = document.querySelector('input[name="callType"]:checked').value;


        const perStudentBase = attendees > 0 ? (baseRateTotal / attendees) : baseRateTotal;
        const ratePerStudent = perStudentBase * units;
        const rateTotal = ratePerStudent * attendees;


        hourlyRateInput.value = (callType === "IND" ? ratePerStudent : rateTotal).toFixed(2);
        this.updateCallFormState();
    }
    
    updateCallFormState() {
        const { studentIdSelect, productIdSelect, callDurationSelect, hourlyRateInput, groupStudentsDynamic, callSubmitBtn } = UIManager.refs;
        const callType = document.querySelector('input[name="callType"]:checked').value;
        let isValid = false;


        if (callType === 'IND') {
            isValid = studentIdSelect.value && productIdSelect.value && callDurationSelect.value && parseFloat(hourlyRateInput.value) > 0;
        } else {
            const selects = groupStudentsDynamic.querySelectorAll('select');
            const chosen = Array.from(selects).map(s => s.value).filter(Boolean);
            isValid = productIdSelect.value && chosen.length === selects.length && new Set(chosen).size === chosen.length && callDurationSelect.value && parseFloat(hourlyRateInput.value) > 0;
        }
        callSubmitBtn.disabled = !isValid;
    }


    async handleCallLogSubmission(e) {
        e.preventDefault();
        UIManager.hideMessage(UIManager.refs.callMessageBox);
        UIManager.showGlobalLoader();
        try {
            const form = UIManager.refs.callForm;
            const fd = new FormData(form);
            const callType = fd.get('callType');


            const payload = {
                coachId: this.#coach.id,
                coachName: this.#coach.name,
                callDate: fd.get('callDate'),
                callDuration: parseFloat(fd.get('callDuration')),
                units: parseFloat(fd.get('units')),
                hourlyRate: parseFloat(fd.get('hourlyRate')),
                productId: fd.get('productId'),
                notes: fd.get('notes'),
                attendance: fd.get('attendance'),
            };


            if (callType === 'IND') {
                payload.studentId = fd.get('studentId');
                payload.contractId = fd.get('contractId');
            } else {
                const selects = UIManager.refs.groupStudentsDynamic.querySelectorAll('select');
                payload.studentIds = Array.from(selects).map(s => s.value);
                payload.isGroup = true;
            }


            const resp = await this.#api.post('logCall', payload);
            if (!resp.success) throw new Error(resp.error || 'Error logging call.');


            UIManager.showMessage(UIManager.refs.callMessageBox, 'Call logged successfully!', true);
            form.reset();
            UIManager.refs.callDateInput.value = new Date().toISOString().slice(0, 10); // Ripristina data
            this.updateCallFormState();
            this.fetchMonthlyEarnings();
        } catch (err) {
            UIManager.showMessage(UIManager.refs.callMessageBox, err.message, false);
        } finally {
            UIManager.hideGlobalLoader();
        }
    }




  // --- Sezione Report Cards ---
  async handleViewReportCards() {
    if (!this.#coach.id) return;
    UIManager.switchSection('reportCardsSection');
    await this.loadReportCardsPending();
    await this.loadReportCardHistory();
  }


  async loadReportCardsPending() {
    const { reportCardsContainer, reportCardNoShowsContainer } = UIManager.refs;
    reportCardsContainer.innerHTML = UIManager.loaderHTML("Loading pending reports...");
    reportCardNoShowsContainer.innerHTML = "";
    reportCardNoShowsContainer.classList.add("hidden");


    try {
      const [tasksResp, draftsResp] = await Promise.all([
        this.#api.get("getReportCardTasks", { coachId: this.#coach.id }),
        this.#api.get("getReportCardDrafts", { coachId: this.#coach.id })
      ]);


      if (!tasksResp.success) throw new Error(tasksResp.error);
      if (!draftsResp.success) throw new Error(draftsResp.error);


      const tasks = tasksResp.tasks || [];
      const drafts = draftsResp.drafts || [];
      this.#lastDrafts = drafts;


      const pending = tasks.map(t => ({
        ...t,
        isDraft: !!drafts.find(d => d.studentId === t.studentId && d.contractId === t.contractId)
      }));


      if (!pending.length) {
        reportCardsContainer.innerHTML = '<p class="text-gray-500 text-center">No pending reports 🎉</p>';
      } else {
        reportCardsContainer.innerHTML = `<h3 class="text-xl font-semibold mb-4">Pending Reports</h3><div class="grid gap-4">` +
          pending.map(p => `
            <div class="p-4 bg-white rounded-xl shadow border">
              <h3 class="text-lg font-semibold">${p.name} ${p.surname} (${p.studentId})</h3>
              <p class="text-gray-600"><strong>Cadency:</strong> ${p.cadencyMonths} months</p>
              <p class="text-gray-600"><strong>Calls:</strong> ${p.calls}</p>
              <button class="writeReportBtn mt-3 text-white px-4 py-2 rounded-lg ${p.isDraft ? 'bg-indigo-600' : 'bg-blue-600'}"
                data-student="${p.studentId}" data-contract="${p.contractId}" data-name="${p.name} ${p.surname}">
                ${p.isDraft ? 'Edit Draft' : 'Write Report'}
              </button>
            </div>
          `).join('') + `</div>`;
      }
      // Logica No-shows per Head Coach
       if (this.#coach.role === "Head Coach" && tasksResp.noShows?.length) {
          reportCardNoShowsContainer.innerHTML = this.renderNoShowList(tasksResp.noShows);
          reportCardNoShowsContainer.classList.remove("hidden");
       }


    } catch (err) {
      reportCardsContainer.innerHTML = `<p class="text-red-500 text-center">Error: ${err.message}</p>`;
    }
  }


    renderNoShowList(list) {
        let html = `<details open class="mt-4 bg-red-50 rounded-xl border border-red-200">
            <summary class="cursor-pointer px-4 py-2 font-semibold text-red-600">No-show Students</summary>
            <div class="p-4 grid gap-4">`;
        list.forEach(ns => {
            const btnState = ns.alreadySubmitted ? 'disabled' : '';
            const btnClass = ns.alreadySubmitted ? 'bg-gray-400' : 'bg-indigo-600';
            const btnLabel = ns.alreadySubmitted ? 'Submitted' : 'Submit';
            html += `<div class="p-4 bg-white rounded-xl shadow border flex justify-between items-center">
                <div>
                    <p class="font-semibold">${ns.name} ${ns.surname} (${ns.studentId})</p>
                    <p class="text-gray-600">Cadency: ${ns.cadencyMonths} months</p>
                </div>
                <button class="submitNoShowBtn text-white px-3 py-1 rounded ${btnClass}"
                        data-student="${ns.studentId}" data-contract="${ns.contractId}" ${btnState}>
                    ${btnLabel}
                </button>
            </div>`;
        });
        html += `</div></details>`;
        return html;
    }
    
    async submitNoShow(e) {
        if (!e.target.classList.contains('submitNoShowBtn')) return;
        const btn = e.target;
        const studentId = btn.dataset.student;
        const contractId = btn.dataset.contract;
        try {
            const resp = await this.#api.post('submitNoShow', { studentId, contractId, coachId: this.#coach.id });
            if (!resp.success) throw new Error(resp.error);
            btn.disabled = true;
            btn.textContent = "Submitted";
            btn.classList.add("bg-gray-400");
            UIManager.showToast(`No-show submitted for ${studentId}`);
        } catch (err) {
            UIManager.showToast("Error: " + err.message, 5000, "bg-red-600");
        }
    }
    
    handleWriteReportClick(e) {
        if (!e.target.classList.contains('writeReportBtn')) return;
        const studentId = e.target.dataset.student;
        const contractId = e.target.dataset.contract;
        const { rcStudentId, rcContractId, rcCoachId, rcStudentName, rcAttendance, rcReport, reportCardForm, reportCardCallsTable } = UIManager.refs;
        
        reportCardForm.reset();
        rcStudentId.value = studentId;
        rcContractId.value = contractId;
        rcCoachId.value = this.#coach.id;
        rcStudentName.value = e.target.dataset.name || '';
        
        const draft = this.#lastDrafts.find(d => d.studentId === studentId && d.contractId === contractId);
        if (draft) {
            rcAttendance.value = draft.attendance || '';
            rcReport.value = draft.report || '';
        }
        
        reportCardCallsTable.classList.add('hidden');
        UIManager.switchSection('reportCardFormSection');
        this.loadStudentCallsForReport(studentId);
    }
    
    async loadStudentCallsForReport(studentId) {
        const { reportCardCallsTable, reportCardCallsTableBody } = UIManager.refs;
        reportCardCallsTable.classList.remove('hidden');
        reportCardCallsTableBody.innerHTML = `<tr><td colspan="2">${UIManager.loaderHTML("Loading calls...")}</td></tr>`;
        try {
            const resp = await this.#api.get('getStudentCallsForMonth', { studentId, coachId: this.#coach.id });
            if (!resp.success) throw new Error(resp.error);
            const calls = resp.calls || [];
            if (!calls.length) {
                reportCardCallsTableBody.innerHTML = '<tr><td colspan="2" class="text-center p-4">No calls this month</td></tr>';
            } else {
                reportCardCallsTableBody.innerHTML = calls.map(c => `
                    <tr><td class="border px-4 py-2">${c.date}</td><td class="border px-4 py-2">${c.attendance}</td></tr>
                `).join('');
            }
        } catch (err) {
            reportCardCallsTableBody.innerHTML = `<tr><td colspan="2" class="text-red-500 p-4">Error: ${err.message}</td></tr>`;
        }
    }
    
    async handleReportCardSubmit(e) {
        e.preventDefault();
        UIManager.hideMessage(UIManager.refs.reportCardMessageBox);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        try {
            const fd = new FormData(e.target);
            const payload = Object.fromEntries(fd.entries());
            const resp = await this.#api.post('submitReportCard', payload);
            if (!resp.success) throw new Error(resp.error);
            
            UIManager.showMessage(UIManager.refs.reportCardMessageBox, 'Report card saved as draft!', true);
            setTimeout(() => {
                UIManager.switchSection('reportCardsSection');
                this.loadReportCardsPending();
                this.loadReportCardHistory();
            }, 800);
        } catch (err) {
            UIManager.showMessage(UIManager.refs.reportCardMessageBox, err.message, false);
        } finally {
            submitBtn.disabled = false;
        }
    }
    
    async loadReportCardHistory() {
        const { reportCardHistoryTableBody, historyFilterMonth, sendAllReportCardsBtn } = UIManager.refs;
        reportCardHistoryTableBody.innerHTML = `<tr><td colspan="5">${UIManager.loaderHTML()}</td></tr>`;
        try {
            const resp = await this.#api.get('getReportCardHistory', { coachId: this.#coach.id });
            if (!resp.success) throw new Error(resp.error);
            
            const rows = resp.history || [];
            const filter = historyFilterMonth.value;
            const filtered = rows.filter(r => !filter || (r.dateISO && r.dateISO.startsWith(filter)));
            
            if (!filtered.length) {
                reportCardHistoryTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No report cards found</td></tr>';
            } else {
                reportCardHistoryTableBody.innerHTML = filtered.map(r => `
                    <tr>
                        <td class="border px-4 py-2">${r.dateISO?.slice(0, 10) || ''}</td>
                        <td class="border px-4 py-2">${r.name || ''} ${r.surname || ''}</td>
                        <td class="border px-4 py-2">${r.attendance || ''}</td>
                        <td class="border px-4 py-2">${(r.report || '').slice(0, 150)}...</td>
                        <td class="border px-4 py-2 text-center">${r.sent ? '✅' : '❌'}</td>
                    </tr>
                `).join('');
            }
            sendAllReportCardsBtn?.classList.toggle('hidden', this.#coach.role !== "Head Coach");
        } catch(err) {
            reportCardHistoryTableBody.innerHTML = `<tr><td colspan="5" class="text-red-500 p-4">Error: ${err.message}</td></tr>`;
        }
    }


    async handleSendAllReportCards() {
        UIManager.refs.sendAllConfirmModal.classList.add('hidden');
        UIManager.showGlobalLoader();
        try {
            const now = new Date();
            const resp = await this.#api.post('sendAllReportCards', {
                coachId: this.#coach.id,
                year: now.getFullYear(),
                month: now.getMonth()
            });
            if (!resp.success) throw new Error(resp.error);
            UIManager.showToast(resp.message || "Report cards sent!");
            await this.loadReportCardHistory();
        } catch (err) {
            UIManager.showToast("Error: " + err.message, 5000, "bg-red-600");
        } finally {
            UIManager.hideGlobalLoader();
        }
    }


  // --- Inizializzazione Eventi ---
  initEventListeners() {
    window.appInstance = this;
    window.handleGoogleLogin = this.handleGoogleLogin.bind(this);
    
    // Auth
    UIManager.refs.loginForm?.addEventListener('submit', (e) => this.handleManualLogin(e));
    UIManager.refs.logoutBtn?.addEventListener('click', () => this.handleLogout());


    // Navigazione
    UIManager.refs.viewDashboardBtn?.addEventListener('click', () => UIManager.switchSection('dashboardSection'));
    UIManager.refs.viewStudentsBtn?.addEventListener('click', () => this.handleViewStudents());
    UIManager.refs.viewFolderBtn?.addEventListener('click', () => this.handleViewFolder());
    UIManager.refs.viewCallLogBtn?.addEventListener('click', () => this.handleViewCallLog());
    UIManager.refs.viewCallHistoryBtn?.addEventListener('click', () => this.handleViewCallHistory());
    UIManager.refs.viewReportCardsBtn?.addEventListener('click', () => this.handleViewReportCards());
    UIManager.refs.viewTeachingMaterialsBtn?.addEventListener('click', () => UIManager.switchSection('teachingMaterialsSection'));
    
    // Sezione Studenti
    UIManager.refs.studentSelect?.addEventListener('change', (e) => {
        if (e.target.value) this.fetchAndRenderStudentDetails(e.target.value);
    });
    UIManager.refs.backToDashboardFromStudentsBtn?.addEventListener('click', () => UIManager.switchSection('dashboardSection'));


    // Sezione Log Call
    UIManager.refs.callForm?.addEventListener('submit', (e) => this.handleCallLogSubmission(e));
    document.querySelectorAll('input[name="callType"]').forEach(radio => {
        radio.addEventListener('change', (e) => this.handleCallTypeToggle(e));
    });
    UIManager.refs.studentIdSelect?.addEventListener('change', (e) => {
        if(e.target.value) this.loadStudentContracts(e.target.value);
    });
    UIManager.refs.productIdSelect?.addEventListener('change', () => this.onProductSelectChange());
    UIManager.refs.callDurationSelect?.addEventListener('change', () => this.recomputeUnitsAndRate());
    
    // Sezione Storico Chiamate
    UIManager.refs.historyMonthYear?.addEventListener('change', () => this.renderHistoryTable());
    UIManager.refs.backFromCallHistoryBtn?.addEventListener('click', () => UIManager.switchSection('dashboardSection'));
    
    // Sezione Report Cards
    document.addEventListener('click', (e) => this.handleWriteReportClick(e));
    document.addEventListener('click', (e) => this.submitNoShow(e));
    UIManager.refs.reportCardForm?.addEventListener('submit', (e) => this.handleReportCardSubmit(e));
    UIManager.refs.historyFilterMonth?.addEventListener('change', () => this.loadReportCardHistory());
    UIManager.refs.backToReportCardsBtn?.addEventListener('click', () => UIManager.switchSection('reportCardsSection'));
    UIManager.refs.backToDashboardFromReportsBtn?.addEventListener('click', () => UIManager.switchSection('dashboardSection'));


    // Modale Send All
    UIManager.refs.sendAllReportCardsBtn?.addEventListener('click', () => UIManager.refs.sendAllConfirmModal.classList.remove('hidden'));
    UIManager.refs.cancelSendAllBtn?.addEventListener('click', () => UIManager.refs.sendAllConfirmModal.classList.add('hidden'));
    UIManager.refs.confirmSendAllBtn?.addEventListener('click', () => this.handleSendAllReportCards());
  }
}


/* --------------------------- 5) AVVIO APPLICAZIONE ---------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  new DashboardApp().init();
});
