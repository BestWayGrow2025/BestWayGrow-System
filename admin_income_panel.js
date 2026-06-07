"use strict";

/*
========================================
ADMIN INCOME PANEL JS (CLEAN + SAFE + FINAL)
========================================
✔ Null safety
✔ DOM crash protection
✔ Filter safe handling
✔ Realtime SYSTEM_EVENTS support
✔ Production ready
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadAllIncome();
});

// ================= INIT PAGE =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

// ================= AUTH =================
function authPage() {
  session = JSON.parse(localStorage.getItem("loggedInAdmin") || "null");

  if (!session?.userId) {
    window.location.href = "admin_login.html";
    return;
  }

  if (typeof getUserById !== "function") {
    window.location.href = "admin_login.html";
    return;
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "admin") {
    localStorage.removeItem("loggedInAdmin");
    window.location.href = "admin_login.html";
    return;
  }

  if ((currentUser.status || "active") !== "active") {
    localStorage.removeItem("loggedInAdmin");
    alert("Account inactive");
    window.location.href = "admin_login.html";
    return;
  }
}

// ================= EVENTS =================
function bindEvents() {

  const filter = document.getElementById("filterType");
  const refreshBtn = document.getElementById("refreshBtn");

  if (filter) {
    filter.addEventListener("change", loadAllIncome);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadAllIncome);
  }
}

// ================= LOAD INCOME =================
function loadAllIncome() {

  const filterEl = document.getElementById("filterType");
  const type = filterEl ? filterEl.value : "";

  let logs = [];

  try {
    if (typeof getIncomeLogs === "function") {
      logs = getIncomeLogs() || [];
    }
  } catch (err) {
    console.error("Load error:", err);
    logs = [];
  }

  if (type) {
    logs = logs.filter(log => log?.type === type);
  }

  renderIncomeTable(logs);
}

// ================= RENDER TABLE =================
function renderIncomeTable(logs) {

  const table = document.getElementById("incomeTable");
  if (!table) return;

  let total = 0;
  table.innerHTML = "";

  if (!logs || logs.length === 0) {
    table.innerHTML = "<tr><td colspan='6'>No Data</td></tr>";
    updateSummary(0, 0);
    return;
  }

  logs.slice().reverse().forEach(log => {

    const amount = Number(log?.amount) || 0;
    total += amount;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${log?.time ? new Date(log.time).toLocaleString() : "-"}</td>
      <td>${log?.userId || "-"}</td>
      <td>${log?.type || "-"}</td>
      <td>₹${amount.toFixed(2)}</td>
      <td>${log?.sourceUser || "-"}</td>
      <td>${log?.note || ""}</td>
    `;

    table.appendChild(row);
  });

  updateSummary(total, logs.length);
}

// ================= SUMMARY =================
function updateSummary(total, count) {

  const payout = document.getElementById("totalPayout");
  const records = document.getElementById("totalRecords");

  if (payout) payout.innerText = (Number(total) || 0).toFixed(2);
  if (records) records.innerText = count || 0;
}

// ================= REALTIME CONNECT =================
(function connectIncomeToAdminPanel() {

  function refresh() {
    try {
      loadAllIncome?.();
    } catch (_) {}
  }

  function bind() {

    if (!window.SYSTEM_EVENTS?.on) return;

    window.SYSTEM_EVENTS.on("INCOME_UPDATED", refresh);
    window.SYSTEM_EVENTS.on("INCOME_EVENT", refresh);
    window.SYSTEM_EVENTS.on("INCOME_LOG_CREATED", refresh);
    window.SYSTEM_EVENTS.on("HOLD_INCOME_RELEASED", refresh);
    window.SYSTEM_EVENTS.on("INCOME_CREDIT", refresh);
  }

  if (window.SYSTEM_EVENTS?.emit) {
    bind();
  } else {
    const timer = setInterval(() => {
      if (window.SYSTEM_EVENTS?.emit) {
        clearInterval(timer);
        bind();
      }
    }, 50);
  }

})();
