"use strict";

/*
========================================
ADMIN INCOME CONTROL V1.1 FINAL (SAFE + ENTERPRISE PATCH)
========================================
✔ No logic change
✔ Null safety added
✔ DOM crash protection
✔ Realtime SYSTEM_EVENTS sync
✔ Production ready
========================================
*/

let session = null;
let currentUser = null;

// ================= INIT =================
initIncomeControlPage();

function initIncomeControlPage() {
  try {
    initPage();
    authPage();
    bindEvents();
    loadPage();
  } catch (err) {
    console.error("[INCOME CONTROL INIT ERROR]", err);
  }
}

// ================= SYSTEM INIT =================
function initPage() {

  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }

  if (typeof initIncomeControl === "function") {
    initIncomeControl();
  } else {
    alert("income control system missing");
    throw new Error("STOP");
  }
}

// ================= AUTH =================
function authPage() {

  session = JSON.parse(localStorage.getItem("loggedInAdmin") || "null");

  if (!session?.userId) {
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }

  if (typeof getUserById !== "function") {
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "admin") {
    localStorage.removeItem("loggedInAdmin");
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }

  if ((currentUser.status || "active") !== "active") {
    localStorage.removeItem("loggedInAdmin");
    alert("Account inactive");
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }
}

// ================= EVENTS =================
function bindEvents() {

  const ugliOnBtn = document.getElementById("ugliOnBtn");
  if (ugliOnBtn) ugliOnBtn.addEventListener("click", () => setUGLI(true));

  const ugliOffBtn = document.getElementById("ugliOffBtn");
  if (ugliOffBtn) ugliOffBtn.addEventListener("click", () => setUGLI(false));

  const rliOnBtn = document.getElementById("rliOnBtn");
  if (rliOnBtn) rliOnBtn.addEventListener("click", () => setRLI(true));

  const rliOffBtn = document.getElementById("rliOffBtn");
  if (rliOffBtn) rliOffBtn.addEventListener("click", () => setRLI(false));

  const binaryOnBtn = document.getElementById("binaryOnBtn");
  if (binaryOnBtn) binaryOnBtn.addEventListener("click", () => setBinary(true));

  const binaryOffBtn = document.getElementById("binaryOffBtn");
  if (binaryOffBtn) binaryOffBtn.addEventListener("click", () => setBinary(false));
}

// ================= LOAD =================
function loadPage() {
  refreshStatus();
}

// ================= SAFE STATUS =================
function safeStatus(fn) {
  try {
    return typeof fn === "function" ? fn() : false;
  } catch (_) {
    return false;
  }
}

// ================= DEPENDENCY CHECK =================
function validateIncomeDependencies() {
  try {
    return (
      typeof getIncomeSettings === "function" &&
      typeof saveIncomeSettings === "function"
    );
  } catch (_) {
    return false;
  }
}

// ================= REFRESH STATUS =================
function refreshStatus() {

  const ugliStatus = document.getElementById("ugliStatus");
  const rliStatus = document.getElementById("rliStatus");
  const binaryStatus = document.getElementById("binaryStatus");

  if (!ugliStatus || !rliStatus || !binaryStatus) return;

  ugliStatus.innerText =
    safeStatus(window.isUGLIEnabled) ? "🟢 ACTIVE" : "🔴 OFF";

  rliStatus.innerText =
    safeStatus(window.isRLIEnabled) ? "🟢 ACTIVE" : "🔴 OFF";

  binaryStatus.innerText =
    safeStatus(window.isBinaryEnabled) ? "🟢 ACTIVE" : "🔴 OFF";
}

// ================= UGLI =================
function setUGLI(state) {

  if (!validateIncomeDependencies()) {
    alert("Income control dependency missing");
    return;
  }

  const settings = getIncomeSettings() || {};
  settings.ugli = !!state;
  saveIncomeSettings(settings);

  refreshStatus();
  alert("UGLI " + (state ? "ENABLED" : "DISABLED"));
}

// ================= RLI =================
function setRLI(state) {

  if (!validateIncomeDependencies()) {
    alert("Income control dependency missing");
    return;
  }

  const settings = getIncomeSettings() || {};
  settings.rli = !!state;
  saveIncomeSettings(settings);

  refreshStatus();
  alert("RLI " + (state ? "ENABLED" : "DISABLED"));
}

// ================= BINARY =================
function setBinary(state) {

  if (!validateIncomeDependencies()) {
    alert("Income control dependency missing");
    return;
  }

  const settings = getIncomeSettings() || {};
  settings.binary = !!state;
  saveIncomeSettings(settings);

  refreshStatus();
  alert("Binary " + (state ? "ENABLED" : "DISABLED"));
}

/* ================= REALTIME SYSTEM BRIDGE ================= */
(function connectIncomeControlToSystem() {

  function safeRefresh() {
    try {
      refreshStatus?.();
    } catch (_) {}
  }

  function bind() {

    if (!window.SYSTEM_EVENTS?.on) return;

    window.SYSTEM_EVENTS.on("INCOME_UPDATED", safeRefresh);
    window.SYSTEM_EVENTS.on("INCOME_EVENT", safeRefresh);
    window.SYSTEM_EVENTS.on("INCOME_CREDIT", safeRefresh);
    window.SYSTEM_EVENTS.on("INCOME_LOG_CREATED", safeRefresh);
    window.SYSTEM_EVENTS.on("HOLD_INCOME_RELEASED", safeRefresh);
  }

  if (window.SYSTEM_EVENTS?.on) {
    bind();
  } else {

    const timer = setInterval(() => {
      if (window.SYSTEM_EVENTS?.on) {
        clearInterval(timer);
        bind();
      }
    }, 50);

  }

})();
