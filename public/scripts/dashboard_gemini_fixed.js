
/**
 * ====================================================================
 * SMARTALK DASHBOARD (Gemini-clean style) — Apps Script Compatible
 * - Endpoint names aligned with dashboard.gs
 * - Params aligned to studentId/coachId semantics
 * - Minimal assumptions about DOM names (uses CONFIG.DOM_REFS)
 * - Flashcards updates batched via sequential doPost('updateFlashcardStatus')
 * ====================================================================
 */

/* ----------------------------- 1) CONFIG ----------------------------- */
const CONFIG = {
  API_BASE_URL: "https://script.google.com/macros/s/AKfycbwjmnBDZcMdBmP6Dj67S19qGDP61ujNtBvJZU65xqlUfluThOy1pphwjvACS9FVXJeD/exec",
  SESSION_KEY: "coachSession",
  DOM_REFS: {
    loginSection: 'loginSection',
    dashboardSection: 'dashboardSection',
    callSection: 'callSection',
    coachingDebriefSection: 'coachingDebriefSection',
    callHistorySection: 'callHistorySection',
    studentsSection: 'studentsSection',
    flashcardsSection: 'flashcardsSection',

    // Auth
    loginForm: 'loginForm',
    coachIdInput: 'coachId',
    passwordInput: 'password',
    loginMessageBox: 'loginMessageBox',
    googleLoginContainer: 'googleLoginContainer',
    logoutBtn: 'logoutBtn',

    // UI
    globalLoader: 'globalLoader',
    toast: 'toast',
    coachNameDisplay: 'coachNameDisplay',
    callSectionCoachNameDisplay: 'callSectionCoachNameDisplay',
    earningsAmountDisplay: 'earningsAmount',
    viewFolderBtn: 'viewFolderBtn',

    // Nav
    viewDashboardBtn: 'viewDashboardBtn',
    viewStudentsBtn: 'viewStudentsBtn',
    viewCallLogBtn: 'viewCallLogBtn',
    viewCallHistoryBtn: 'viewCallHistoryBtn',
    viewCoachingDebriefBtn: 'viewCoachingDebriefBtn',
    viewFlashcardsBtn: 'viewFlashcardsBtn',

    // Call Log
    callLogForm: 'callLogForm',
    callLogStudentSelect: 'callLogStudentSelect',
    callLogMessageBox: 'callLogMessageBox',

    // Students
    studentSelect: 'studentSelect',
    studentDetailsContainer: 'studentDetailsContainer',

    // Debrief
    debriefStudentSelect: 'debriefStudentSelect',
    debriefDateInput: 'debriefDateInput',
    debriefMsg: 'debriefMsg',
    debriefLoadDraftsBtn: 'debriefLoadDraftsBtn',
    debriefDraftsContainer: 'debriefDraftsContainer',
    debriefForm: 'coachingDebriefForm',
    debriefSaveDraftBtn: 'debriefSaveDraftBtn',
    debriefSendBtn: 'debriefSendBtn',
    debriefAIPreviewContainer: 'debriefAIPreviewContainer',

    // History
    callHistoryTableBody: 'callHistoryTableBody',
    historyMonthYear: 'historyMonthYear',

    // Flashcards
    flashcardsContainer: 'flashcardsContainer',
    flashcardsStudentSelect: 'flashcardsStudentSelect',
    flashcardCardContainer: 'flashcardCardContainer',
    flashcardControlsContainer: 'flashcardControlsContainer',
    flashcardFront: 'flashcardFront',
    flashcardBack: 'flashcardBack',
    flashcardStepDisplay: 'flashcardStepDisplay',
    flashcardProgress: 'flashcardProgress',
    flashcardDeckTotal: 'flashcardDeckTotal',
    flashcardGoodBtn: 'flashcardGoodBtn',
    flashcardBadBtn: 'flashcardBadBtn',
    flashcardSendUpdatesBtn: 'flashcardSendUpdatesBtn',
    flashcardRetryRedsBtn: 'flashcardRetryRedsBtn',
  }
};

/* --------------------------- 2) API SERVICE -------------------------- */
class APIService {
  constructor(baseUrl) { this.baseUrl = baseUrl; }

  async get(action, params = {}) {
    const url = new URL(this.baseUrl);
    url.searchParams.set("action", action);
    url.searchParams.set("_ts", Date.now());
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`GET ${action} ${res.status}`);
    return res.json();
  }

  async post(action, body = {}) {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body })
    });
    if (!res.ok) throw new Error(`POST ${action} ${res.status}`);
    return res.json();
  }
}

/* ----------------------------- 3) UI MGR ----------------------------- */
const UIManager = {
  refs: {},
  initRefs() {
    for (const [k, id] of Object.entries(CONFIG.DOM_REFS)) this.refs[k] = document.getElementById(id);
  },
  showGlobalLoader() { this.refs.globalLoader?.classList.add('active'); },
  hideGlobalLoader() { this.refs.globalLoader?.classList.remove('active'); },
  showToast(msg, ms = 3000, color = "bg-green-600") {
    const t = this.refs.toast; if (!t) return;
    t.className = `fixed top-4 right-4 text-white px-4 py-2 rounded-lg shadow-lg z-[99999] ${color}`;
    t.textContent = msg; t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, ms);
  },
  showMessage(box, msg, ok = true) {
    if (!box) return;
    box.classList.remove('hidden');
    box.classList.toggle('bg-green-100', ok);
    box.classList.toggle('bg-red-100', !ok);
    box.innerHTML = `<p class="${ok ? 'text-green-800':'text-red-800'}">${msg}</p>`;
  },
  hideMessage(box) { if (!box) return; box.classList.add('hidden'); box.innerHTML = ""; },
  switchSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(e => e.classList.add('hidden'));
    this.refs[sectionId]?.classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');
    window.scrollTo({ top: 0 });
  },
  loaderHTML(msg="Loading...") {
    return `<div class="flex flex-col items-center justify-center py-4 text-gray-500">
      <div class="spinner-container mb-2"><div class="spinner-dot"></div><div class="spinner-dot"></div><div class="spinner-dot"></div></div>
      <p>${msg}</p>
    </div>`;
  },
  escapeHTML(str){return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
  normalizeUrl(u){const s=String(u||'').trim(); if(!s) return ""; return /^https?:\/\//i.test(s)?s:`https://${s}`;}
};

/* --------------------------- 4) DASHBOARD APP ------------------------ */
class DashboardApp {
  #coach = { id:null, name:null, role:null };
  #api = new APIService(CONFIG.API_BASE_URL);
  #callHistory = [];
  #cardsByEn = new Map();
  #pendingFlashcardUpdates = [];
  #stepIndex = 0; #sessionTotalSteps = 20; #currentDeck = []; #renderNextCard = null;

  constructor(){ UIManager.initRefs(); this.initEventListeners(); }

  async init(){
    if (this.restoreSession()) {
      UIManager.switchSection(CONFIG.DOM_REFS.dashboardSection);
      this.updateCoachDisplay();
      this.loadDashboardData();
    } else {
      UIManager.switchSection(CONFIG.DOM_REFS.loginSection);
    }
  }

  /* ---- Auth ---- */
  restoreSession(){
    try{
      const raw = localStorage.getItem(CONFIG.SESSION_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      this.#coach = { id:s.id, name:s.name, role:s.role };
      return !!s.id;
    }catch{ localStorage.removeItem(CONFIG.SESSION_KEY); return false; }
  }
  saveSession(payload){
    this.#coach.id = String(payload.coachId);
    this.#coach.name = payload.coachName || this.#coach.id;
    this.#coach.role = payload.role || "";
    localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(this.#coach));
    UIManager.refs.googleLoginContainer?.classList.add('hidden');
    this.updateCoachDisplay();
  }
  async handleManualLogin(e){
    e.preventDefault();
    UIManager.hideMessage(UIManager.refs.loginMessageBox);
    UIManager.showGlobalLoader();
    try{
      const coachId = UIManager.refs.coachIdInput?.value?.trim();
      const password = UIManager.refs.passwordInput?.value?.trim();
      const resp = await this.#api.post('login', { coachId, password });
      if (!resp.success) throw new Error(resp.error || "Login failed");
      this.saveSession(resp);
      UIManager.switchSection(CONFIG.DOM_REFS.dashboardSection);
      await this.loadDashboardData();
    }catch(err){
      UIManager.showMessage(UIManager.refs.loginMessageBox, err.message || String(err), false);
    }finally{ UIManager.hideGlobalLoader(); }
  }
  async handleGoogleLogin(response){
    UIManager.showGlobalLoader();
    try{
      const resp = await this.#api.post('loginWithGoogle', { credential: response.credential });
      if (!resp.success) throw new Error(resp.error || "Google login failed");
      this.saveSession(resp);
      UIManager.switchSection(CONFIG.DOM_REFS.dashboardSection);
      await this.loadDashboardData();
    }catch(err){
      UIManager.showToast("Google login: " + (err.message||err), 4000, "bg-red-600");
    }finally{ UIManager.hideGlobalLoader(); }
  }
  handleLogout(){
    this.#coach = { id:null, name:null, role:null };
    localStorage.removeItem(CONFIG.SESSION_KEY);
    UIManager.refs.googleLoginContainer?.classList.remove('hidden');
    UIManager.switchSection(CONFIG.DOM_REFS.loginSection);
  }

  /* ---- Dashboard data ---- */
  updateCoachDisplay(){
    const name = this.#coach.name || "Coach";
    if (UIManager.refs.coachNameDisplay) UIManager.refs.coachNameDisplay.textContent = name;
    if (UIManager.refs.callSectionCoachNameDisplay) UIManager.refs.callSectionCoachNameDisplay.textContent = name;
  }
  async loadDashboardData(){
    await Promise.allSettled([ this.fetchMonthlyEarnings(), this.loadStudentsForCallLog() ]);
  }
  async fetchMonthlyEarnings(){
    if (!this.#coach.id) return;
    if (UIManager.refs.earningsAmountDisplay) UIManager.refs.earningsAmountDisplay.textContent = '...';
    try{
      const resp = await this.#api.get('getMonthlyEarnings', { coachId: this.#coach.id });
      const v = (resp && resp.success) ? resp.earnings : 0;
      UIManager.refs.earningsAmountDisplay.textContent = Number(v).toFixed(2);
    }catch{ UIManager.refs.earningsAmountDisplay.textContent = '--'; }
  }
  async handleViewFolder(){
    if (!this.#coach.id) return;
    UIManager.showGlobalLoader();
    try{
      const resp = await this.#api.get('getPaymentFolderUrl', { coachId: this.#coach.id });
      if (resp.success && resp.url) window.open(UIManager.normalizeUrl(resp.url), "_blank");
      else UIManager.showToast("No folder found", 3000, "bg-red-600");
    }catch(err){ UIManager.showToast("Error: " + err.message, 3000, "bg-red-600"); }
    finally{ UIManager.hideGlobalLoader(); }
  }

  /* ---- Call Log ---- */
  async loadStudentsForCallLog(){
    const select = UIManager.refs.callLogStudentSelect; if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Loading students...</option>';
    try{
      const resp = await this.#api.get('getStudents');
      const arr = (resp?.success && Array.isArray(resp.students)) ? resp.students : [];
      arr.sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}));
      select.innerHTML = '<option value="" disabled selected>Select a student</option>';
      for (const id of arr){ const o=document.createElement('option'); o.value=id; o.textContent=id; select.appendChild(o); }
    }catch{ select.innerHTML = '<option value="" disabled selected>Error loading students</option>'; }
  }
  async handleCallLogSubmission(e){
    e.preventDefault();
    UIManager.hideMessage(UIManager.refs.callLogMessageBox);
    UIManager.showGlobalLoader();
    try{
      const fd = new FormData(UIManager.refs.callLogForm);
      const data = Object.fromEntries(fd.entries());
      // Expect Apps Script fields: studentId, productId, callDate, callDuration, attendance, notes
      // Map common alias names if present
      data.coachId = this.#coach.id;
      if (!data.studentId && data.student && !data.studentId) data.studentId = data.student;
      if (!data.callDate && data.date) data.callDate = data.date;
      if (!data.attendance) data.attendance = "YES";
      const resp = await this.#api.post('logCall', data);
      if (!resp.success) throw new Error(resp.error || "Submission failed");
      UIManager.showMessage(UIManager.refs.callLogMessageBox, "Call logged successfully!", true);
      UIManager.refs.callLogForm.reset();
      await this.handleViewCallHistory();
    }catch(err){
      UIManager.showMessage(UIManager.refs.callLogMessageBox, err.message || String(err), false);
    }finally{ UIManager.hideGlobalLoader(); }
  }

  /* ---- Call History ---- */
  async handleViewCallHistory(){
    if (!this.#coach.id) return;
    UIManager.switchSection(CONFIG.DOM_REFS.callHistorySection);
    const body = UIManager.refs.callHistoryTableBody; if (!body) return;
    body.innerHTML = `<tr><td colspan="5">${UIManager.loaderHTML("Loading call history...")}</td></tr>`;
    UIManager.showGlobalLoader();
    try{
      const resp = await this.#api.get('getCallHistory', { coachId: this.#coach.id });
      if (resp.success) { this.#callHistory = resp.history || []; this.renderHistoryTable(); }
      else body.innerHTML = '<tr><td colspan="5" class="p-4 text-center">No calls</td></tr>';
    }catch(err){
      body.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-600">Error: ${UIManager.escapeHTML(err.message)}</td></tr>`;
    }finally{ UIManager.hideGlobalLoader(); }
  }
  renderHistoryTable(){
    const body = UIManager.refs.callHistoryTableBody; const filter = UIManager.refs.historyMonthYear?.value;
    let list = this.#callHistory || [];
    if (filter) {
      const fdate = new Date(filter);
      list = list.filter(x => {
        const d = new Date(x.dateISO || x.date);
        return d.getFullYear()===fdate.getFullYear() && d.getMonth()===fdate.getMonth();
      });
    }
    if (!list.length){ body.innerHTML = '<tr><td colspan="5" class="p-4 text-center">No calls for this period.</td></tr>'; return; }
    body.innerHTML = list.map(c => `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3">${UIManager.escapeHTML(c.date || c.dateISO || '')}</td>
        <td class="px-4 py-3">${UIManager.escapeHTML(c.studentId || '')}</td>
        <td class="px-4 py-3">${UIManager.escapeHTML(c.productId || '')}</td>
        <td class="px-4 py-3">${UIManager.escapeHTML(String(c.earnings ?? ''))}</td>
        <td class="px-4 py-3">
          <button class="text-blue-600 hover:underline"
            onclick="window.appInstance.loadDebriefForCall('${UIManager.escapeHTML(c.studentId || '')}', '${UIManager.escapeHTML(c.dateISO || '')}')">
            View/Edit Debrief
          </button>
        </td>
      </tr>
    `).join('');
  }
  loadDebriefForCall(studentId, dateISO){
    if (UIManager.refs.debriefStudentSelect) UIManager.refs.debriefStudentSelect.value = studentId;
    if (UIManager.refs.debriefDateInput && dateISO) UIManager.refs.debriefDateInput.value = dateISO;
    UIManager.switchSection(CONFIG.DOM_REFS.coachingDebriefSection);
    this.handleLoadDraftDebrief();
  }

  /* ---- Students ---- */
  handleViewStudents(){ UIManager.switchSection(CONFIG.DOM_REFS.studentsSection); this.loadStudentsForInfoSection(); }
  async loadStudentsForInfoSection(){
    const select = UIManager.refs.studentSelect, container = UIManager.refs.studentDetailsContainer;
    if (!select || !container) return;
    select.innerHTML = '<option value="" disabled selected>Loading students...</option>';
    container.innerHTML = UIManager.loaderHTML("Select a student to view details.");
    UIManager.showGlobalLoader();
    try{
      const resp = await this.#api.get('getStudents');
      const arr = (resp?.success && Array.isArray(resp.students)) ? resp.students : [];
      arr.sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}));
      select.innerHTML = '<option value="" disabled selected>Select a student</option>';
      arr.forEach(id => { const o=document.createElement('option'); o.value=id; o.textContent=id; select.appendChild(o); });
    }catch(err){
      select.innerHTML = '<option value="" disabled selected>Error loading students</option>';
      container.innerHTML = `<p class="text-red-600 text-center">Error: ${UIManager.escapeHTML(err.message)}</p>`;
    }finally{ UIManager.hideGlobalLoader(); }
  }
  async fetchAndRenderStudentDetails(studentId){
    const container = UIManager.refs.studentDetailsContainer; if (!container) return;
    container.innerHTML = UIManager.loaderHTML("Loading student details...");
    UIManager.showGlobalLoader();
    try{
      const [infoResp, contractsResp] = await Promise.all([
        this.#api.get('getStudentInfo', { studentId }),
        this.#api.get('getStudentContracts', { studentId }).catch(()=>({success:false, contracts:[]}))
      ]);
      if (!infoResp.success || !infoResp.studentInfo) throw new Error(infoResp.error || "Student not found");
      const info = infoResp.studentInfo; const calls = info.calls || []; delete info.calls;
      const contracts = contractsResp.success ? (contractsResp.contracts||[]) : [];
      container.innerHTML = this.renderStudentDetailsHTML(studentId, info, calls, contracts);
    }catch(err){
      container.innerHTML = `<p class="text-red-600 text-center">Error: ${UIManager.escapeHTML(err.message)}</p>`;
    }finally{ UIManager.hideGlobalLoader(); }
  }
  renderStudentDetailsHTML(studentId, info, calls, contracts){
    const infoHtml = Object.entries(info).map(([k,v])=>`
      <div class="p-2 border-b"><span class="font-semibold">${UIManager.escapeHTML(k)}:</span> ${UIManager.escapeHTML(v)}</div>
    `).join('');
    const contractRows = (contracts||[]).map(c=>`
      <tr><td>${UIManager.escapeHTML(c.product?.productName || c.productId || '')}</td>
          <td>${c.unlimited ? 'Unlimited' : (c.leftCalls ?? '')}</td>
          <td>${UIManager.escapeHTML(String(c.product?.duration || ''))} min</td></tr>
    `).join('') || '<tr><td colspan="3" class="text-center">No contracts</td></tr>';
    const callRows = (calls||[]).map(c=>`
      <tr><td>${UIManager.escapeHTML(c.date || '')}</td>
          <td>${UIManager.escapeHTML(c.productName || c.productId || '')}</td>
          <td><a href="#" class="text-blue-600 hover:underline" onclick="window.appInstance.loadDebriefForCall('${UIManager.escapeHTML(studentId)}','${UIManager.escapeHTML(c.dateISO||'')}')">Debrief</a></td></tr>
    `).join('') || '<tr><td colspan="3" class="text-center">No calls</td></tr>';
    return `
      <h3 class="text-xl font-bold mb-4">${UIManager.escapeHTML(studentId)} Details</h3>
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h4 class="font-semibold text-lg mb-3 border-b pb-2">Student Info</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${infoHtml}</div>
      </div>
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h4 class="font-semibold text-lg mb-3 border-b pb-2">Contracts</h4>
        <table class="min-w-full"><thead><tr><th>Product</th><th>Left</th><th>Duration</th></tr></thead><tbody>${contractRows}</tbody></table>
      </div>
      <div class="bg-white shadow rounded-lg p-6">
        <h4 class="font-semibold text-lg mb-3 border-b pb-2">Call History</h4>
        <table class="min-w-full"><thead><tr><th>Date</th><th>Product</th><th>Debrief</th></tr></thead><tbody>${callRows}</tbody></table>
      </div>`;
  }

  /* ---- Debrief ---- */
  async handleViewDebrief(){
    UIManager.switchSection(CONFIG.DOM_REFS.coachingDebriefSection);
    const t = new Date(); const yyyy=t.getFullYear(), mm=String(t.getMonth()+1).padStart(2,'0'), dd=String(t.getDate()).padStart(2,'0');
    if (UIManager.refs.debriefDateInput) UIManager.refs.debriefDateInput.value = `${yyyy}-${mm}-${dd}`;
    await this.loadStudentsForDebrief();
  }
  async loadStudentsForDebrief(){
    const select = UIManager.refs.debriefStudentSelect; if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Loading students...</option>';
    UIManager.showGlobalLoader();
    try{
      const resp = await this.#api.get('getStudents');
      const arr = (resp?.success && Array.isArray(resp.students)) ? resp.students : [];
      arr.sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}));
      select.innerHTML = '<option value="" disabled selected>Select a student</option>';
      arr.forEach(id => { const o=document.createElement('option'); o.value=id; o.textContent=id; select.appendChild(o); });
    }catch{ select.innerHTML='<option value="" disabled selected>Error loading students</option>'; }
    finally{ UIManager.hideGlobalLoader(); }
  }
  async handleSaveDraftDebrief(e){
    if (e) e.preventDefault();
    UIManager.hideMessage(UIManager.refs.debriefMsg);
    const fd = new FormData(UIManager.refs.debriefForm); const data = Object.fromEntries(fd.entries());
    data.coachId = this.#coach.id;
    // Apps Script expects: saveDebrief (doPost) with structured fields; we pass through as-is + coachId
    UIManager.showGlobalLoader();
    try{
      const resp = await this.#api.post('saveDebrief', data);
      if (!resp.success) throw new Error(resp.error || "Save failed");
      UIManager.showToast("Draft saved", 2000, "bg-green-600");
      await this.handleLoadDraftDebrief();
    }catch(err){ UIManager.showMessage(UIManager.refs.debriefMsg, err.message, false); }
    finally{ UIManager.hideGlobalLoader(); }
  }
  async handleLoadDraftDebrief(){
    const studentId = UIManager.refs.debriefStudentSelect?.value || "";
    const date = UIManager.refs.debriefDateInput?.value || "";
    const container = UIManager.refs.debriefDraftsContainer; if (!container) return;
    container.innerHTML = UIManager.loaderHTML("Loading drafts...");
    try{
      const resp = await this.#api.get('getDebriefDrafts', { coachId: this.#coach.id, studentId, date });
      if (resp.success && Array.isArray(resp.drafts) && resp.drafts.length){
        container.innerHTML = this.renderDraftsList(resp.drafts);
      } else {
        container.innerHTML = '<p class="text-gray-500">No drafts found.</p>';
      }
    }catch(err){
      container.innerHTML = `<p class="text-red-600">Error: ${UIManager.escapeHTML(err.message)}</p>`;
    }
  }
  renderDraftsList(drafts){
    return `<div class="mt-4 max-h-60 overflow-y-auto">` + drafts.map(d=>{
      const preview = UIManager.escapeHTML(String(d.summary || d.content || '').slice(0,120)) + '...';
      const payload = encodeURIComponent(JSON.stringify(d));
      return `<div class="border p-3 mb-2 rounded bg-gray-50 flex justify-between items-center">
        <div><p class="font-semibold">${UIManager.escapeHTML(d.date || d.timestamp || '')}</p><p class="text-sm text-gray-600">${preview}</p></div>
        <button class="bg-blue-600 text-white text-sm px-3 py-1 rounded" onclick="window.appInstance.applyDraftFromPayload('${payload}')">Load</button>
      </div>`;
    }).join('') + `</div>`;
  }
  applyDraftFromPayload(payload){
    const d = JSON.parse(decodeURIComponent(payload)); const form = UIManager.refs.debriefForm; if (!form) return;
    Object.entries(d).forEach(([k,v])=>{ const el=form.elements[k]; if (el) el.value = v; });
    UIManager.showToast("Draft loaded", 1500, "bg-green-600");
  }
  async handleSendDebrief(e){
    e.preventDefault(); UIManager.hideMessage(UIManager.refs.debriefMsg);
    const fd = new FormData(UIManager.refs.debriefForm); const data = Object.fromEntries(fd.entries());
    data.coachId = this.#coach.id;
    UIManager.showGlobalLoader();
    try{
      const resp = await this.#api.post('sendDebrief', data);
      if (!resp.success) throw new Error(resp.error || "Send failed");
      UIManager.showMessage(UIManager.refs.debriefMsg, "Debrief sent", true);
      UIManager.refs.debriefForm.reset();
      await this.handleLoadDraftDebrief();
    }catch(err){ UIManager.showMessage(UIManager.refs.debriefMsg, err.message, false); }
    finally{ UIManager.hideGlobalLoader(); }
  }
  async handleAIPreview(fieldName){
    const studentId = UIManager.refs.debriefStudentSelect?.value;
    const field = document.querySelector(`[name="${fieldName}"]`);
    const preview = UIManager.refs.debriefAIPreviewContainer;
    if (!studentId || !field?.value){ UIManager.showToast("Select a student & fill the field", 2000, "bg-yellow-600"); return; }
    preview.innerHTML = UIManager.loaderHTML("Generating...");
    try{
      const resp = await this.#api.post('generateDebriefText', { studentId, coachId: this.#coach.id, fieldName, currentText: field.value });
      if (resp.success && resp.suggestion){
        preview.innerHTML = `<div class="border p-3 rounded bg-yellow-50">
          <p class="font-semibold">AI Suggestion</p>
          <div class="mt-2 whitespace-pre-wrap">${UIManager.escapeHTML(resp.suggestion)}</div>
          <div class="mt-3 flex gap-2">
            <button class="bg-green-600 text-white px-3 py-1 rounded" onclick="window.appInstance.applyAISuggestion('${fieldName}', '${resp.suggestion.replace(/'/g,"&#39;").replace(/"/g,"&quot;")}')">Apply</button>
            <button class="bg-red-600 text-white px-3 py-1 rounded" onclick="window.appInstance.discardAISuggestion()">Discard</button>
          </div>
        </div>`;
      } else {
        preview.innerHTML = `<p class="text-red-600">AI error: ${UIManager.escapeHTML(resp.error || 'Unknown')}</p>`;
      }
    }catch(err){ preview.innerHTML = `<p class="text-red-600">Error: ${UIManager.escapeHTML(err.message)}</p>`; }
  }
  applyAISuggestion(fieldName, suggestion){
    const el = document.querySelector(`[name="${fieldName}"]`); if (el) el.value = suggestion;
    this.discardAISuggestion(); UIManager.showToast("Applied", 1200, "bg-green-600");
  }
  discardAISuggestion(){ if (UIManager.refs.debriefAIPreviewContainer) UIManager.refs.debriefAIPreviewContainer.innerHTML = ""; }

  /* ---- Flashcards ---- */
  handleViewFlashcards(){ UIManager.switchSection(CONFIG.DOM_REFS.flashcardsSection); this.initFlashcards(); }
  async initFlashcards(){
    const container = UIManager.refs.flashcardsContainer, select = UIManager.refs.flashcardsStudentSelect;
    if (!container || !select) return;
    container.innerHTML = UIManager.loaderHTML("Loading students...");
    select.innerHTML = '<option value="" disabled selected>Loading students...</option>';
    UIManager.showGlobalLoader();
    try{
      const resp = await this.#api.get('getStudents');
      const arr = (resp?.success && Array.isArray(resp.students)) ? resp.students : [];
      arr.sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}));
      select.innerHTML = '<option value="" disabled selected>Select a student</option>';
      arr.forEach(id => { const o=document.createElement('option'); o.value=id; o.textContent=id; select.appendChild(o); });
      container.innerHTML = "<p class='text-gray-500 text-center'>Select a student to start.</p>";
      select.onchange = () => this.startFlashcardSession(select.value);
    }catch(err){ container.innerHTML = `<p class="text-red-600 text-center">Error: ${UIManager.escapeHTML(err.message)}</p>`; }
    finally{ UIManager.hideGlobalLoader(); }
  }
  async startFlashcardSession(studentId){
    const container = UIManager.refs.flashcardsContainer; container.innerHTML = UIManager.loaderHTML("Loading flashcards...");
    try{
      const resp = await this.#api.get('getFlashcards', { studentId });
      if (!resp.success || !Array.isArray(resp.cards)) throw new Error(resp.error || "No cards");
      this.#cardsByEn = new Map(resp.cards.map(c=>[String(c.en||"").toLowerCase(), c]));
      this.#pendingFlashcardUpdates = []; this.#stepIndex = 0; this.#sessionTotalSteps = 20;
      this.#currentDeck = this.buildSmartDeck(resp.cards);
      const renderCard = (step, total, card) => {
        UIManager.refs.flashcardStepDisplay.textContent = step+1;
        UIManager.refs.flashcardDeckTotal.textContent = total;
        UIManager.refs.flashcardProgress.style.width = `${((step+1)/total)*100}%`;
        UIManager.refs.flashcardFront.textContent = UIManager.escapeHTML(card.en);
        UIManager.refs.flashcardBack.textContent = UIManager.escapeHTML(card.it);
        UIManager.refs.flashcardSendUpdatesBtn.classList.add('hidden');
        UIManager.refs.flashcardRetryRedsBtn.classList.add('hidden');
        UIManager.refs.flashcardControlsContainer.classList.remove('hidden');
        UIManager.refs.flashcardCardContainer.classList.remove('flipped');
        UIManager.refs.flashcardCardContainer.onclick = () => UIManager.refs.flashcardCardContainer.classList.toggle('flipped');
        UIManager.refs.flashcardGoodBtn.onclick = () => this.updateFlashcardScore(card,'good');
        UIManager.refs.flashcardBadBtn.onclick = () => this.updateFlashcardScore(card,'bad');
      };
      this.#renderNextCard = () => {
        if (this.#stepIndex >= this.#sessionTotalSteps) { this.renderFlashcardSessionComplete(); return; }
        const next = this.pickCard(this.#currentDeck);
        renderCard(this.#stepIndex, this.#sessionTotalSteps, next);
        this.#stepIndex++;
      };
      this.#renderNextCard();
    }catch(err){ container.innerHTML = `<p class="text-red-600 text-center">Error: ${UIManager.escapeHTML(err.message)}</p>`; }
  }
  buildSmartDeck(cards){
    const deck = []; const now = Date.now();
    cards.forEach(c=>{
      const last = c.lastReview ? new Date(c.lastReview).getTime() : 0;
      const score = Math.max(c.score || 1, 1);
      const priority = (now - last) / (score * 86400000) + (10/score);
      for(let i=0;i<Math.min(Math.ceil(priority),15);i++) deck.push(c);
    });
    for (let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    return deck;
  }
  pickCard(deck){ if (!deck?.length) { const all=[...this.#cardsByEn.values()]; return all[Math.floor(Math.random()*all.length)]||{}; } return deck.shift(); }
  updateFlashcardScore(card, status){
    this.#pendingFlashcardUpdates = this.#pendingFlashcardUpdates.filter(u=>u.en!==card.en);
    let s = card.score || 1;
    s = status==='good' ? Math.min(s+1,15) : Math.max(s-1,1);
    this.#pendingFlashcardUpdates.push({ en: card.en, score: s, status });
    card.score = s; card.lastReview = new Date().toISOString().split('T')[0];
    this.#renderNextCard();
  }
  renderFlashcardSessionComplete(){
    UIManager.refs.flashcardCardContainer.innerHTML = `<div class="p-8 text-center">
      <h3 class="text-2xl font-bold text-green-600 mb-4">Session Complete!</h3>
      <p>You reviewed ${this.#sessionTotalSteps} cards.</p></div>`;
    UIManager.refs.flashcardControlsContainer.classList.add('hidden');
    UIManager.refs.flashcardSendUpdatesBtn.classList.remove('hidden');
    const hasReds = this.#pendingFlashcardUpdates.some(u=>u.status==='bad');
    UIManager.refs.flashcardRetryRedsBtn.classList.toggle('hidden', !hasReds);
  }
  async sendFlashcardUpdates(){
    if (!this.#pendingFlashcardUpdates.length){ UIManager.showToast("No changes", 1500, "bg-yellow-600"); return; }
    UIManager.showGlobalLoader();
    try{
      const studentId = UIManager.refs.flashcardsStudentSelect?.value;
      for (const u of this.#pendingFlashcardUpdates){
        await this.#api.post('updateFlashcardStatus', { studentId, en: u.en, score: u.score, status: u.status });
      }
      UIManager.showToast("Progress saved", 2000, "bg-green-600");
      this.#pendingFlashcardUpdates = [];
      await this.initFlashcards();
    }catch(err){ UIManager.showToast("Save error: " + err.message, 3000, "bg-red-600"); }
    finally{ UIManager.hideGlobalLoader(); }
  }
  handleRetryReds(){
    const reds = this.#pendingFlashcardUpdates.filter(u=>u.status==='bad')
      .map(u=>this.#cardsByEn.get(String(u.en||'').toLowerCase())).filter(Boolean);
    if (!reds.length) return;
    this.#pendingFlashcardUpdates = []; this.#stepIndex=0; this.#sessionTotalSteps=10;
    const deck = this.buildSmartDeck(reds);
    this.#renderNextCard = () => {
      if (this.#stepIndex >= this.#sessionTotalSteps) { this.renderFlashcardSessionComplete(); return; }
      const next = this.pickCard(deck);
      UIManager.refs.flashcardStepDisplay.textContent = this.#stepIndex+1;
      UIManager.refs.flashcardDeckTotal.textContent = this.#sessionTotalSteps;
      UIManager.refs.flashcardGoodBtn.onclick = () => this.updateFlashcardScore(next,'good');
      UIManager.refs.flashcardBadBtn.onclick = () => this.updateFlashcardScore(next,'bad');
      this.#stepIndex++;
    };
    this.#renderNextCard();
  }

  /* ---- Events ---- */
  initEventListeners(){
    window.appInstance = this;
    window.handleGoogleLogin = this.handleGoogleLogin.bind(this);
    window.handleAIPreview = (f)=>this.handleAIPreview(f);
    window.applyAISuggestion = (f,s)=>this.applyAISuggestion(f,s);
    window.discardAISuggestion = ()=>this.discardAISuggestion();

    UIManager.refs.loginForm?.addEventListener('submit', (e)=>this.handleManualLogin(e));
    UIManager.refs.logoutBtn?.addEventListener('click', ()=>this.handleLogout());

    document.getElementById(CONFIG.DOM_REFS.viewDashboardBtn)?.addEventListener('click', ()=>UIManager.switchSection(CONFIG.DOM_REFS.dashboardSection));
    document.getElementById(CONFIG.DOM_REFS.viewStudentsBtn)?.addEventListener('click', ()=>this.handleViewStudents());
    document.getElementById(CONFIG.DOM_REFS.viewCallLogBtn)?.addEventListener('click', ()=>UIManager.switchSection(CONFIG.DOM_REFS.callSection));
    document.getElementById(CONFIG.DOM_REFS.viewCallHistoryBtn)?.addEventListener('click', ()=>this.handleViewCallHistory());
    document.getElementById(CONFIG.DOM_REFS.viewCoachingDebriefBtn)?.addEventListener('click', ()=>this.handleViewDebrief());
    document.getElementById(CONFIG.DOM_REFS.viewFlashcardsBtn)?.addEventListener('click', ()=>this.handleViewFlashcards());
    UIManager.refs.viewFolderBtn?.addEventListener('click', ()=>this.handleViewFolder());

    UIManager.refs.studentSelect?.addEventListener('change', (e)=>{ if (e.target.value) this.fetchAndRenderStudentDetails(e.target.value); });

    UIManager.refs.callLogForm?.addEventListener('submit', (e)=>this.handleCallLogSubmission(e));
    UIManager.refs.historyMonthYear?.addEventListener('change', ()=>this.renderHistoryTable());

    UIManager.refs.debriefForm?.addEventListener('submit', (e)=>this.handleSendDebrief(e));
    UIManager.refs.debriefSaveDraftBtn?.addEventListener('click', (e)=>this.handleSaveDraftDebrief(e));
    UIManager.refs.debriefLoadDraftsBtn?.addEventListener('click', ()=>this.handleLoadDraftDebrief());
    UIManager.refs.debriefStudentSelect?.addEventListener('change', ()=>this.handleLoadDraftDebrief());
    UIManager.refs.debriefDateInput?.addEventListener('change', ()=>this.handleLoadDraftDebrief());

    UIManager.refs.flashcardSendUpdatesBtn?.addEventListener('click', ()=>this.sendFlashcardUpdates());
    UIManager.refs.flashcardRetryRedsBtn?.addEventListener('click', ()=>this.handleRetryReds());
  }
}

/* --------------------------- 5) BOOTSTRAP ---------------------------- */
document.addEventListener('DOMContentLoaded', ()=>{ new DashboardApp().init(); });
