// ===============================
// 💰 INCOME CONTROL SYSTEM (FINAL)
// ===============================

// =====================
// 🔹 GET / SAVE SETTINGS
// =====================
function getIncomeSettings() {
  return JSON.parse(localStorage.getItem("incomeSettings") || "{}");
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
      binary: false, // future ready
      initialized: true,
      updatedAt: new Date().toISOString()
    };

    saveIncomeSettings(settings);

    // 📜 LOG
    if (typeof logActivity === "function") {
      logActivity("SYSTEM", "SYSTEM", "Income control initialized");
    }
  }
}

// =====================
// 🔹 CHECK SYSTEM (SAFE)
// =====================
function isUGLIEnabled() {
  return getIncomeSettings().ugli === true;
}

function isRLIEnabled() {
  return getIncomeSettings().rli === true;
}

function isBinaryEnabled() {
  return getIncomeSettings().binary === true;
}

// =====================
// 🔘 ADMIN CONTROL
// =====================
function toggleUGLI(adminId = "ADMIN") {

  let s = getIncomeSettings();
  s.ugli = !s.ugli;
  s.updatedAt = new Date().toISOString();

  saveIncomeSettings(s);

  // 📜 LOG
  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "UGLI toggled → " + (s.ugli ? "ON" : "OFF"));
  }
}

function toggleRLI(adminId = "ADMIN") {

  let s = getIncomeSettings();
  s.rli = !s.rli;
  s.updatedAt = new Date().toISOString();

  saveIncomeSettings(s);

  // 📜 LOG
  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "RLI toggled → " + (s.rli ? "ON" : "OFF"));
  }
}

function toggleBinary(adminId = "ADMIN") {

  let s = getIncomeSettings();
  s.binary = !s.binary;
  s.updatedAt = new Date().toISOString();

  saveIncomeSettings(s);

  // 📜 LOG
  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Binary toggled → " + (s.binary ? "ON" : "OFF"));
  }
}

// =====================
// 🚀 INIT
// =====================
initIncomeControl();
