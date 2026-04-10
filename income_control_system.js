/*
========================================
💰 INCOME CONTROL SYSTEM V7 (LOCKED)
========================================
✔ Master income switch
✔ Type mapping (upgrade / repurchase)
✔ Backward compatible (ugli / rli)
✔ System lock integrated
✔ Self-healing storage
✔ Corruption-proof
✔ Production locked
========================================
*/

// =====================
// 🔹 DEFAULT SETTINGS
// =====================
function getDefaultIncomeSettings() {
  return {
    incomeEnabled: true,   // 🔥 MASTER SWITCH
    ugli: true,            // upgrade income
    rli: true,             // repurchase income
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

  safe.updatedAt = new Date().toISOString();

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

function isIncomeMasterEnabled() {
  return getIncomeSettings().incomeEnabled === true;
}

// =====================
// 🔥 TYPE NORMALIZER (V7 FIX)
// =====================
function normalizeIncomeType(type) {

  if (!type) return "";

  type = String(type).toLowerCase();

  if (type === "upgrade") return "ugli";
  if (type === "repurchase") return "rli";

  return type;
}

// =====================
// 🔥 CORE GUARD (V7)
// =====================
function isIncomeAllowed(type) {

  // 🔒 SYSTEM LOCK
  if (typeof getSystemSettings === "function") {
    let sys = getSystemSettings();
    if (sys && sys.lockMode) return false;
  }

  // 🔒 MASTER SWITCH
  if (!isIncomeMasterEnabled()) return false;

  // 🔒 SYSTEM SAFE
  if (!isIncomeSystemSafe()) return false;

  // 🔄 NORMALIZE TYPE
  let t = normalizeIncomeType(type);

  if (t === "ugli") return isUGLIEnabled();
  if (t === "rli") return isRLIEnabled();
  if (t === "binary") return isBinaryEnabled();

  return false;
}

// =====================
// 🔘 ADMIN CONTROL
// =====================
function toggleMasterIncome(adminId = "ADMIN") {

  let s = getIncomeSettings();

  s.incomeEnabled = !s.incomeEnabled;

  saveIncomeSettings(s);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "MASTER INCOME → " + (s.incomeEnabled ? "ON" : "OFF"));
  }
}

function toggleUGLI(adminId = "ADMIN") {

  let s = getIncomeSettings();

  s.ugli = !s.ugli;

  saveIncomeSettings(s);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "UGLI → " + (s.ugli ? "ON" : "OFF"));
  }
}

function toggleRLI(adminId = "ADMIN") {

  let s = getIncomeSettings();

  s.rli = !s.rli;

  saveIncomeSettings(s);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "RLI → " + (s.rli ? "ON" : "OFF"));
  }
}

function toggleBinary(adminId = "ADMIN") {

  let s = getIncomeSettings();

  s.binary = !s.binary;

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
    typeof s.binary !== "boolean" ||
    typeof s.incomeEnabled !== "boolean"
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


