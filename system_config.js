/*
========================================
⚙️ SYSTEM CONFIG V8 FINAL LOCK
========================================
✔ Core integrated
✔ Safe storage
✔ Validation protected
✔ Default auto repair
✔ Apply / Reset / Restart support
✔ Config version safe
✔ Test mode support
✔ Production ready
========================================
*/

const SYSTEM_CONFIG_KEY = "SYSTEM_CONFIG_DATA";
const SYSTEM_CONFIG_VERSION = "V8";

// ===================================
// DEFAULT CONFIG
// ===================================
function getDefaultConfig() {
  return {
    version: SYSTEM_CONFIG_VERSION,

    upgrade: {
      bv: 2100,
      amount: 3000
    },

    repurchase: {
      bv: 2100,
      amount: 0
    },

    testing: {
      enabled: true,
      clearLogsAllowed: true,
      clearQueueAllowed: true,
      clearTempAllowed: true
    }
  };
}

// ===================================
// LOAD CONFIG
// ===================================
function loadSystemConfig() {

  let config = null;

  try {
    config = safeGet(SYSTEM_CONFIG_KEY, null);
  } catch (e) {
    config = null;
  }

  if (!config || typeof config !== "object") {
    config = getDefaultConfig();
    saveSystemConfig(config);
    return config;
  }

  config = mergeConfig(config);

  return config;
}

// ===================================
// SAVE CONFIG
// ===================================
function saveSystemConfig(config) {

  try {

    if (typeof isSystemSafe === "function") {
      if (!isSystemSafe()) {
        console.warn("System locked");
        return false;
      }
    }

    config = mergeConfig(config);

    if (!validateConfig(config)) {
      console.error("Invalid system config");
      return false;
    }

    safeSet(SYSTEM_CONFIG_KEY, config);
    return true;

  } catch (err) {
    console.error("Save config error:", err.message);
    return false;
  }
}

// ===================================
// MERGE CONFIG
// ===================================
function mergeConfig(config) {

  let def = getDefaultConfig();

  return {
    version: SYSTEM_CONFIG_VERSION,

    upgrade: {
      bv: Number(config?.upgrade?.bv ?? def.upgrade.bv),
      amount: Number(config?.upgrade?.amount ?? def.upgrade.amount)
    },

    repurchase: {
      bv: Number(config?.repurchase?.bv ?? def.repurchase.bv),
      amount: Number(config?.repurchase?.amount ?? def.repurchase.amount)
    },

    testing: {
      enabled: Boolean(config?.testing?.enabled ?? def.testing.enabled),
      clearLogsAllowed: Boolean(config?.testing?.clearLogsAllowed ?? def.testing.clearLogsAllowed),
      clearQueueAllowed: Boolean(config?.testing?.clearQueueAllowed ?? def.testing.clearQueueAllowed),
      clearTempAllowed: Boolean(config?.testing?.clearTempAllowed ?? def.testing.clearTempAllowed)
    }
  };
}

// ===================================
// VALIDATION
// ===================================
function validateConfig(config) {

  if (!config || typeof config !== "object") return false;

  let u = config.upgrade || {};
  let r = config.repurchase || {};
  let t = config.testing || {};

  if (isNaN(u.bv) || u.bv <= 0) return false;
  if (isNaN(u.amount) || u.amount <= 0) return false;

  if (isNaN(r.bv) || r.bv < 0) return false;
  if (isNaN(r.amount) || r.amount < 0) return false;

  if (typeof t.enabled !== "boolean") return false;
  if (typeof t.clearLogsAllowed !== "boolean") return false;
  if (typeof t.clearQueueAllowed !== "boolean") return false;
  if (typeof t.clearTempAllowed !== "boolean") return false;

  return true;
}

// ===================================
// APPLY CONFIG
// ===================================
function applySystemConfig(newConfig) {

  let current = loadSystemConfig();

  let merged = {
    ...current,
    ...newConfig,
    upgrade: {
      ...current.upgrade,
      ...(newConfig.upgrade || {})
    },
    repurchase: {
      ...current.repurchase,
      ...(newConfig.repurchase || {})
    },
    testing: {
      ...current.testing,
      ...(newConfig.testing || {})
    }
  };

  return saveSystemConfig(merged);
}

// ===================================
// RESET CONFIG
// ===================================
function resetSystemConfig() {

  let config = getDefaultConfig();

  saveSystemConfig(config);

  return config;
}

// ===================================
// RESTART SYSTEM
// ===================================
function restartSystem() {

  try {

    let settings = null;
    let config = loadSystemConfig();

    if (typeof getSystemSettings === "function") {
      settings = getSystemSettings();
    }

    if (typeof initCoreSystem === "function") {
      initCoreSystem();
    }

    if (settings && typeof saveSystemSettings === "function") {
      saveSystemSettings(settings);
    }

    saveSystemConfig(config);

    console.log("System restarted successfully");

    return true;

  } catch (err) {
    console.error("Restart failed:", err.message);
    return false;
  }
}

// ===================================
// TEST MODE HELPERS
// ===================================
function clearTestLogs() {

  let config = loadSystemConfig();

  if (!config.testing.enabled || !config.testing.clearLogsAllowed) {
    return false;
  }

  safeSet("activityLogs", []);
  safeSet("incomeLogs", []);
  safeSet("transactions", []);

  return true;
}

function clearTestQueue() {

  let config = loadSystemConfig();

  if (!config.testing.enabled || !config.testing.clearQueueAllowed) {
    return false;
  }

  safeSet("REG_QUEUE_DATA", []);
  safeSet("PIN_REQUEST_QUEUE", []);

  return true;
}

function clearTemporaryData() {

  let config = loadSystemConfig();

  if (!config.testing.enabled || !config.testing.clearTempAllowed) {
    return false;
  }

  localStorage.removeItem("REG_QUEUE_LOCK");
  localStorage.removeItem("PIN_QUEUE_LOCK");
  localStorage.removeItem("TEMP_STATE");
  localStorage.removeItem("TEMP_CACHE");

  return true;
}

// ===================================
// SAFE ACCESS HELPERS
// ===================================
function getUpgradeBV() {
  return Number(loadSystemConfig().upgrade.bv || 0);
}

function getUpgradeAmount() {
  return Number(loadSystemConfig().upgrade.amount || 0);
}

function getRepurchaseBV() {
  return Number(loadSystemConfig().repurchase.bv || 0);
}

function getRepurchaseAmount() {
  return Number(loadSystemConfig().repurchase.amount || 0);
}

function isTestingMode() {
  return Boolean(loadSystemConfig().testing.enabled);
}

