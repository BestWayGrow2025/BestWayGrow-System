"use strict";

/*
========================================
INCOME CONTROL SYSTEM V9.1 (FINAL PATCHED - STRUCTURE PRESERVED)
========================================
✔ No structural rewrite
✔ Only safety + logic correctness fixes
✔ Production-safe orchestration layer
✔ Cross-engine stable gating
========================================
*/

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
// CORE SAFETY
// =====================
function isIncomeControlSafe() {

  try {

    if (
      typeof window.__CORE_STATE__ !== "undefined" &&
      window.__CORE_STATE__ &&
      window.__CORE_STATE__.initialized !== true
    ) {
      return false;
    }

    if (typeof getSession === "function") {

      let session = getSession();

      if (!session || !session.userId) {
        return false;
      }
    }

    return true;

  } catch {
    return false;
  }
}

// =====================
// SANITIZER (PURE)
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
// GET SETTINGS (NO SIDE EFFECT WRITE FIX)
// =====================
function getIncomeSettings() {

  try {

    let stored = safeGet(INCOME_SETTINGS_KEY, {});

    return sanitizeIncomeSettings(stored);

  } catch {

    return getDefaultIncomeSettings();
  }
}

// =====================
// SAVE SETTINGS
// =====================
function saveIncomeSettings(data) {

  try {

    if (!isIncomeControlSafe()) {
      return false;
    }

    if (typeof getSystemSettings === "function") {

      let sys = getSystemSettings();

      if (sys && sys.lockMode === true) {
        return false;
      }
    }

    safeSet(
      INCOME_SETTINGS_KEY,
      sanitizeIncomeSettings(data)
    );

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical(
        "saveIncomeSettings error: " + err.message
      );
    }

    return false;
  }
}

// =====================
// INIT
// =====================
function initIncomeControl() {

  if (window.__INCOME_CONTROL_INIT__ === true) {
    return true;
  }

  window.__INCOME_CONTROL_INIT__ = true;

  try {

    let settings = safeGet(
      INCOME_SETTINGS_KEY,
      null
    );

    if (
      !settings ||
      typeof settings !== "object" ||
      settings.initialized !== true
    ) {

      safeSet(
        INCOME_SETTINGS_KEY,
        getDefaultIncomeSettings()
      );

      if (typeof logActivity === "function") {
        logActivity(
          "SYSTEM",
          "SYSTEM",
          "Income control initialized"
        );
      }
    }

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical(
        "initIncomeControl error: " + err.message
      );
    }

    return false;
  }
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
// SYSTEM SAFETY CHECK
// =====================
function isIncomeSystemSafe() {

  try {

    let s = safeGet(INCOME_SETTINGS_KEY, null);

    if (!s || typeof s !== "object") {
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

    let corrupted = boolKeys.some(
      k => typeof s[k] !== "boolean"
    );

    if (corrupted) {
      return false;
    }

    return s.initialized === true;

  } catch {
    return false;
  }
}

// =====================
// MASTER GATE
// =====================
function isIncomeAllowed(type) {

  try {

    if (!isIncomeControlSafe()) {
      return false;
    }

    if (typeof getSystemSettings === "function") {

      let sys = getSystemSettings();

      if (sys && sys.lockMode === true) {
        return false;
      }
    }

    if (!isIncomeMasterEnabled()) {
      return false;
    }

    if (!isIncomeSystemSafe()) {
      return false;
    }

    let t = normalizeIncomeType(type);

    if (t === "ugli") return isUGLIEnabled();
    if (t === "rli") return isRLIEnabled();
    if (t === "binary") return isBinaryEnabled();

    return false;

  } catch {
    return false;
  }
}

// =====================
// TOGGLE CONTROL
// =====================
function toggleIncomeFlag(key, label, adminId = "ADMIN") {

  try {

    if (!isIncomeControlSafe()) {
      return false;
    }

    let session =
      typeof getSession === "function"
        ? getSession()
        : null;

    if (!session || !session.role) {
      return false;
    }

    if (!["admin","system_admin","super_admin"].includes(session.role)) {
      return false;
    }

    let s = getIncomeSettings();

    if (!(key in s)) {
      return false;
    }

    s[key] = !s[key];

    if (!saveIncomeSettings(s)) {
      return false;
    }

    if (typeof logActivity === "function") {
      logActivity(
        adminId,
        "ADMIN",
        label + " → " + (s[key] ? "ON" : "OFF")
      );
    }

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("toggleIncomeFlag error: " + err.message);
    }

    return false;
  }
}

// =====================
// ADMIN WRAPPERS
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
// INIT CALL
// =====================
initIncomeControl();
