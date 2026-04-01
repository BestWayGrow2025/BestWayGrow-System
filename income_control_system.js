/* ===============================
   💰 INCOME CONTROL SYSTEM (FINAL PRO)
=============================== */

// =====================
// 🔹 GET / SAVE SETTINGS
// =====================
function getIncomeSettings() {
  try {
    return JSON.parse(localStorage.getItem("incomeSettings") || "{}");
  } catch {
    localStorage.setItem("incomeSettings", "{}");
    return {};
  }
}

function saveIncomeSettings(data) {
  localStorage.setItem("incomeSettings", JSON.stringify(data));
}

// =====================
// 🔹 INIT DEFAULT (SAFE)
// =====================
function initIncomeControl() {

  let settings = getIncomeSettings();

  if (!settings || !settings.initialized) {

    settings = {
      ugli: true,
      rli: true,
      binary: false,
      initialized: true,
      updatedAt: new Date().toISOString()
    };

    saveIncomeSettings(settings);

    // 📜 ACTIVITY LOG
    if (typeof logActivity === "function") {
      logActivity("SYSTEM", "SYSTEM", "Income control initialized");
    }
  }
}

// =====================
// 🔹 SAFE GETTERS (FIXED)
// =====================
function isUGLIEnabled() {
  let s = getIncomeSettings() || {};
  return s.ugli === true;
}

function isRLIEnabled() {
  let s = getIncomeSettings() || {};
  return s.rli === true;
}

function isBinaryEnabled() {
  let s = getIncomeSettings() || {};
  return s.binary === true;
}

// =====================
// 🔘 ADMIN CONTROL (SAFE)
// =====================
function toggleUGLI(adminId = "ADMIN") {

  let s = getIncomeSettings() || {};

  s.ugli = !s.ugli;
  s.updatedAt = new Date().toISOString();

  saveIncomeSettings(s);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "UGLI toggled → " + (s.ugli ? "ON" : "OFF"));
  }
}

function toggleRLI(adminId = "ADMIN") {

  let s = getIncomeSettings() || {};

  s.rli = !s.rli;
  s.updatedAt = new Date().toISOString();

  saveIncomeSettings(s);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "RLI toggled → " + (s.rli ? "ON" : "OFF"));
  }
}

function toggleBinary(adminId = "ADMIN") {

  let s = getIncomeSettings() || {};

  s.binary = !s.binary;
  s.updatedAt = new Date().toISOString();

  saveIncomeSettings(s);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Binary toggled → " + (s.binary ? "ON" : "OFF"));
  }
}

// =====================
// 🔒 HARD SAFETY (FINAL)
// =====================
function isIncomeSystemSafe() {

  let s = getIncomeSettings();

  // ❌ corrupted or invalid
  if (!s || typeof s !== "object" || !("ugli" in s)) {
    console.warn("⚠ Invalid income settings");
    return false;
  }

  // ❌ not initialized
  if (!s.initialized) {
    console.warn("⚠ Income system not initialized");
    return false;
  }

  return true;
}

// =====================
// 🚀 INIT (SAFE ORDER)
// =====================
// ⚠️ IMPORTANT: Call this AFTER initCoreSystem()
initIncomeControl();
