"use strict";

/*
========================================
ADMIN INCOME CONTROL V1.1 FINAL (SAFE PATCH ONLY)
========================================
✔ NO LOGIC CHANGE
✔ SAFE NULL PROTECTION ADDED
✔ DEPENDENCY CRASH PROTECTION
✔ UI BEHAVIOR PRESERVED
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

  try {

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

  } catch (err) {
    console.error("[INIT ERROR]", err);
    throw err;
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

// ================= LOAD PAGE =================
function loadPage() {
  refreshStatus();
}

// ================= SAFE STATUS =================
function safeStatus(fn) {
  try {
    return typeof fn === "function" ? fn() : false;
  } catch (err) {
    console.error("[STATUS ERROR]", err);
    return false;
  }
}

// ================= DEPENDENCY GUARD =================
function validateIncomeDependencies() {
  try {
    return (
      typeof getIncomeSettings === "function" &&
      typeof saveIncomeSettings === "function"
    );
  } catch (e) {
    return false;
  }
}

// ================= REFRESH STATUS =================
function refreshStatus() {

  const ugliStatus = document.getElementById("ugliStatus");
  if (ugliStatus) {
    ugliStatus.innerText =
      safeStatus(window.isUGLIEnabled)
        ? "🟢 ACTIVE"
        : "🔴 OFF";
  }

  const rliStatus = document.getElementById("rliStatus");
  if (rliStatus) {
    rliStatus.innerText =
      safeStatus(window.isRLIEnabled)
        ? "🟢 ACTIVE"
        : "🔴 OFF";
  }

  const binaryStatus = document.getElementById("binaryStatus");
  if (binaryStatus) {
    binaryStatus.innerText =
      safeStatus(window.isBinaryEnabled)
        ? "🟢 ACTIVE"
        : "🔴 OFF";
  }
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
