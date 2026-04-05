/*
========================================
💰 INCOME CONTROL SYSTEM (FINAL PRO v4)
========================================
✔ Safe defaults
✔ Self-healing
✔ Toggle safe
✔ Activity log integrated
✔ Corruption-proof save
✔ Runtime protection (NEW)
✔ Production ready
========================================
*/

// =====================
// 🔹 DEFAULT SETTINGS
// =====================
function getDefaultIncomeSettings() {
  return {
    ugli: true,
    rli: true,
    binary: false,
    initialized: true,
    updatedAt: new Date().toISOString()
  };
}

// =====================
// 🔹 GET / SAVE SETTINGS
// =====================
function getIncomeSettings() {
  try {
    let stored = JSON.parse(localStorage.getItem("incomeSettings") || "{}");

    let merged = {
      ...getDefaultIncomeSettings(),
      ...stored
    };

    localStorage.setItem("incomeSettings", JSON.stringify(merged));

    return merged;

  } catch {
    let clean = getDefaultIncomeSettings();
    localStorage.setItem("incomeSettings", JSON.stringify(clean));
    return clean;
  }
}

// 🔒 SAFE SAVE
function saveIncomeSettings(data) {

  let safe = {
    ...getDefaultIncomeSettings(),
    ...(data || {})
  };

  localStorage.setItem("incomeSettings", JSON.stringify(safe));
}

// =====================
// 🔹 INIT
// =====================
function initIncomeControl() {

  let settings = getIncomeSettings();

  if (!settings.initialized) {

    let clean = getDefaultIncomeSettings();
    saveIncomeSettings(clean);

    if (typeof logActivity === "function") {
      logActivity("SYSTEM", "SYSTEM", "Income control initialized");
    }
  }
}

// =====================
// 🔹 SAFE GETTERS
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
// 🔥 CORE GUARD (NEW)
// =====================
function isIncomeAllowed(type) {

  if (!isIncomeSystemSafe()) return false;

  if (type === "ugli") return isUGLIEnabled();
  if (type === "rli") return isRLIEnabled();
  if (type === "binary") return isBinaryEnabled();

  return false;
}

// =====================
// 🔘 ADMIN CONTROL
// =====================
function toggleUGLI(adminId = "ADMIN") {

  let s = getIncomeSettings();

  s.ugli = !s.ugli;
  s.updatedAt = new Date().toISOString();

  saveIncomeSettings(s);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "UGLI → " + (s.ugli ? "ON" : "OFF"));
  }
}

function toggleRLI(adminId = "ADMIN") {

  let s = getIncomeSettings();

  s.rli = !s.rli;
  s.updatedAt = new Date().toISOString();

  saveIncomeSettings(s);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "RLI → " + (s.rli ? "ON" : "OFF"));
  }
}

function toggleBinary(adminId = "ADMIN") {

  let s = getIncomeSettings();

  s.binary = !s.binary;
  s.updatedAt = new Date().toISOString();

  saveIncomeSettings(s);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Binary → " + (s.binary ? "ON" : "OFF"));
  }
}

// =====================
// 🔒 HARD SAFETY
// =====================
function isIncomeSystemSafe() {

  let s = getIncomeSettings();

  if (!s || typeof s !== "object") return false;

  if (
    typeof s.ugli !== "boolean" ||
    typeof s.rli !== "boolean" ||
    typeof s.binary !== "boolean"
  ) {
    console.warn("⚠ Corrupted income settings → auto fixing");
    saveIncomeSettings(getDefaultIncomeSettings());
    return false;
  }

  if (!s.initialized) {
    console.warn("⚠ Income system not initialized");
    return false;
  }

  return true;
}

// =====================
// 🚀 INIT
// =====================
initIncomeControl();

