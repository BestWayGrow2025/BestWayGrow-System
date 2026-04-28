/*
========================================
INCOME CONTROL SYSTEM V8.0 (FINAL CORE PATCH)
========================================
✔ Core system aligned (safeGet / safeSet)
✔ Master income switch
✔ Type mapping (upgrade / repurchase)
✔ System lock integrated
✔ Self-healing storage
✔ Corruption-proof
✔ Strict structure validation
✔ Re-entrant safe init
✔ Toggle write guard
✔ Cross-engine safe checks
✔ Production LOCKED
========================================
*/

// =====================
// CONFIG
// =====================
const INCOME_SETTINGS_KEY = "incomeSettings";

// =====================
// DEFAULT SETTINGS
// =====================
function getDefaultIncomeSettings() {
  return {
    incomeEnabled: true,
    ugli: true,
    rli: true,
    binary: false,

    incomeWalletEnabled: true,
    holdWalletEnabled: true,
    totalIncomeTracking: true,

    initialized: true,
    updatedAt: new Date().toISOString()
  };
}

// =====================
// INTERNAL SANITIZER
// =====================
function sanitizeIncomeSettings(data = {}) {
  let clean = {
    ...getDefaultIncomeSettings(),
    ...(data && typeof data === "object" ? data : {})
  };

  clean.incomeEnabled = clean.incomeEnabled === true;
  clean.ugli = clean.ugli === true;
  clean.rli = clean.rli === true;
  clean.binary = clean.binary === true;

  clean.incomeWalletEnabled = clean.incomeWalletEnabled !== false;
  clean.holdWalletEnabled = clean.holdWalletEnabled !== false;
  clean.totalIncomeTracking = clean.totalIncomeTracking !== false;

  clean.initialized = clean.initialized === true;
  clean.updatedAt = new Date().toISOString();

  return clean;
}

// =====================
// GET SETTINGS (SAFE)
// =====================
function getIncomeSettings() {
  let stored = safeGet(INCOME_SETTINGS_KEY, {});
  let clean = sanitizeIncomeSettings(stored);

  safeSet(INCOME_SETTINGS_KEY, clean);
  return clean;
}

// =====================
// SAVE SETTINGS (SAFE)
// =====================
function saveIncomeSettings(data) {
  if (typeof getSystemSettings === "function") {
    let sys = getSystemSettings();
    if (sys && sys.lockMode) return false;
  }

  let safe = sanitizeIncomeSettings(data);
  safeSet(INCOME_SETTINGS_KEY, safe);

  return true;
}

// =====================
// INIT
// =====================
function initIncomeControl() {
  if (window.__INCOME_CONTROL_INIT__) return true;
  window.__INCOME_CONTROL_INIT__ = true;

  let settings = safeGet(INCOME_SETTINGS_KEY, null);

  if (!settings || typeof settings !== "object" || settings.initialized !== true) {
    saveIncomeSettings(getDefaultIncomeSettings());

    if (typeof logActivity === "function") {
      logActivity("SYSTEM", "SYSTEM", "Income control initialized");
    }
  }

  return true;
}

// =====================
// SAFE GETTERS
// =====================
function isIncomeMasterEnabled() {
  return getIncomeSettings().incomeEnabled === true;
}

function isUGLIEnabled() {
  return getIncomeSettings().ugli === true;
}

function isRLIEnabled() {
  return getIncomeSettings().rli === true;
}

function isBinaryEnabled() {
  return getIncomeSettings().binary === true;
}

function isIncomeWalletEnabled() {
  return getIncomeSettings().incomeWalletEnabled === true;
}

function isHoldWalletEnabled() {
  return getIncomeSettings().holdWalletEnabled === true;
}

function isTotalIncomeTrackingEnabled() {
  return getIncomeSettings().totalIncomeTracking === true;
}

// =====================
// TYPE NORMALIZER
// =====================
function normalizeIncomeType(type) {
  if (!type) return "";

  type = String(type).trim().toLowerCase();

  if (type === "upgrade") return "ugli";
  if (type === "repurchase") return "rli";

  return type;
}

// =====================
// CORE GUARD
// =====================
function isIncomeAllowed(type) {
  if (typeof getSystemSettings === "function") {
    let sys = getSystemSettings();
    if (sys && sys.lockMode) return false;
  }

  if (!isIncomeMasterEnabled()) return false;
  if (!isIncomeSystemSafe()) return false;

  let t = normalizeIncomeType(type);

  if (t === "ugli") return isUGLIEnabled();
  if (t === "rli") return isRLIEnabled();
  if (t === "binary") return isBinaryEnabled();

  return false;
}

// =====================
// TOGGLE HELPER
// =====================
function toggleIncomeFlag(key, label, adminId = "ADMIN") {
  let s = getIncomeSettings();

  if (!(key in s)) return false;

  s[key] = !s[key];

  if (!saveIncomeSettings(s)) return false;

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", label + " → " + (s[key] ? "ON" : "OFF"));
  }

  return true;
}

// =====================
// ADMIN CONTROL
// =====================
function toggleMasterIncome(adminId = "ADMIN") {
  return toggleIncomeFlag("incomeEnabled", "MASTER INCOME", adminId);
}

function toggleUGLI(adminId = "ADMIN") {
  return toggleIncomeFlag("ugli", "UGLI", adminId);
}

function toggleRLI(adminId = "ADMIN") {
  return toggleIncomeFlag("rli", "RLI", adminId);
}

function toggleBinary(adminId = "ADMIN") {
  return toggleIncomeFlag("binary", "Binary", adminId);
}

function toggleIncomeWallet(adminId = "ADMIN") {
  return toggleIncomeFlag("incomeWalletEnabled", "Income Wallet", adminId);
}

function toggleHoldWallet(adminId = "ADMIN") {
  return toggleIncomeFlag("holdWalletEnabled", "Hold Wallet", adminId);
}

function toggleTotalIncomeTracking(adminId = "ADMIN") {
  return toggleIncomeFlag("totalIncomeTracking", "Total Income Tracking", adminId);
}

// =====================
// HARD SAFETY
// =====================
function isIncomeSystemSafe() {
  let s = safeGet(INCOME_SETTINGS_KEY, null);

  if (!s || typeof s !== "object") {
    saveIncomeSettings(getDefaultIncomeSettings());
    return false;
  }

  let boolKeys = [
    "incomeEnabled",
    "ugli",
    "rli",
    "binary",
    "incomeWalletEnabled",
    "holdWalletEnabled",
    "totalIncomeTracking",
    "initialized"
  ];

  let corrupted = boolKeys.some(k => typeof s[k] !== "boolean");

  if (corrupted) {
    console.warn("Income settings corrupted → auto fix");
    saveIncomeSettings(getDefaultIncomeSettings());
    return false;
  }

  return s.initialized === true;
}

// =====================
// INIT CALL
// =====================
initIncomeControl();
