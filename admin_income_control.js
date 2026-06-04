"use strict";

/*
========================================
ADMIN INCOME CONTROL v1.2 STABLE FULL
========================================
✔ Session protected
✔ Full feature retained
✔ Safe dependency handling
✔ No system break risk
✔ Clean modular flow
========================================
*/

let session = null;
let currentUser = null;

// ================= INIT =================
(function initIncomeControlPage() {

  try {

    initPageSafety();
    authPage();
    bindEvents();
    loadPage();

  } catch (err) {
    console.error("[INCOME CONTROL INIT ERROR]", err);
  }

})();

// ================= CORE INIT SAFETY =================
function initPageSafety() {

  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }

  if (typeof initIncomeControl === "function") {
    initIncomeControl();
  }
}

// ================= AUTH =================
function authPage() {

  session = JSON.parse(localStorage.getItem("loggedInAdmin") || "null");

  if (!session || !session.userId) {
    redirectToLogin();
  }

  if (typeof getUserById !== "function") {
    redirectToLogin();
  }

  currentUser = getUserById(session.userId);

  if (!currentUser) {
    redirectToLogin();
  }

  if (currentUser.role !== "admin") {
    clearSessionAndRedirect();
  }

  if ((currentUser.status || "active") !== "active") {
    clearSessionAndRedirect();
  }

}

// ================= REDIRECT HELPERS =================
function redirectToLogin() {
  window.location.href = "admin_login.html";
  throw new Error("STOP");
}

function clearSessionAndRedirect() {
  localStorage.removeItem("loggedInAdmin");
  redirectToLogin();
}

// ================= EVENTS =================
function bindEvents() {

  bindClick("ugliOnBtn", () => setIncome("ugli", true));
  bindClick("ugliOffBtn", () => setIncome("ugli", false));

  bindClick("rliOnBtn", () => setIncome("rli", true));
  bindClick("rliOffBtn", () => setIncome("rli", false));

  bindClick("binaryOnBtn", () => setIncome("binary", true));
  bindClick("binaryOffBtn", () => setIncome("binary", false));
}

function bindClick(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", fn);
}

// ================= LOAD =================
function loadPage() {
  refreshStatus();
}

// ================= DEP CHECK =================
function hasIncomeEngine() {
  return (
    typeof getIncomeSettings === "function" &&
    typeof saveIncomeSettings === "function"
  );
}

// ================= STATUS UPDATE =================
function refreshStatus() {

  updateStatus("ugliStatus", window.isUGLIEnabled);
  updateStatus("rliStatus", window.isRLIEnabled);
  updateStatus("binaryStatus", window.isBinaryEnabled);
}

function updateStatus(id, getter) {

  const el = document.getElementById(id);
  if (!el) return;

  let state = false;

  try {
    state = typeof getter === "function" ? getter() : false;
  } catch (err) {
    console.error("[STATUS ERROR]", err);
    state = false;
  }

  el.innerText = state ? "🟢 ACTIVE" : "🔴 OFF";
}

// ================= CORE CONTROL =================
function setIncome(key, state) {

  if (!hasIncomeEngine()) {
    alert("Income control dependency missing");
    return;
  }

  try {

    const settings = getIncomeSettings() || {};

    settings[key] = state;

    saveIncomeSettings(settings);

    refreshStatus();

    console.log("[INCOME CONTROL]", key, "=", state);

    alert(
      key.toUpperCase() +
      (state ? " ENABLED" : " DISABLED")
    );

  } catch (err) {
    console.error("[INCOME ERROR]", err);
  }
}
