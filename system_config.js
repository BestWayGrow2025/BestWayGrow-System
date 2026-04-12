/*
========================================
⚙️ SYSTEM CONFIG V7 (BUSINESS CONTROL ENGINE)
========================================
✔ BV + Amount central control
✔ Safe storage (core integrated)
✔ Structure protection
✔ Validation enforced
✔ System lock aware
✔ Feature-safe usage
✔ Production locked
========================================
*/

const SYSTEM_CONFIG_KEY = "SYSTEM_CONFIG_DATA";

// ===================================
// 🔹 LOAD CONFIG (SAFE)
// ===================================
function loadSystemConfig() {

  let config = safeGet(SYSTEM_CONFIG_KEY, null);

  if (!config || typeof config !== "object") {
    config = getDefaultConfig();
    saveSystemConfig(config);
  }

  // 🔒 STRUCTURE PROTECTION
  config = mergeConfig(config);

  return config;
}

// ===================================
// 🔹 SAVE CONFIG (SAFE + VALIDATED)
// ===================================
function saveSystemConfig(config) {

  if (!isSystemSafe()) {
    console.warn("System locked — config not saved");
    return false;
  }

  if (!validateConfig(config)) {
    console.error("Invalid config data");
    return false;
  }

  safeSet(SYSTEM_CONFIG_KEY, config);
  return true;
}

// ===================================
// 🔹 DEFAULT CONFIG
// ===================================
function getDefaultConfig() {
  return {
    upgrade: {
      bv: 2100,
      amount: 3000
    },
    repurchase: {
      bv: 2100,
      amount: 0
    }
  };
}

// ===================================
// 🔹 STRUCTURE MERGE (ANTI-CORRUPTION)
// ===================================
function mergeConfig(config) {

  let def = getDefaultConfig();

  return {
    upgrade: {
      bv: Number(config?.upgrade?.bv ?? def.upgrade.bv),
      amount: Number(config?.upgrade?.amount ?? def.upgrade.amount)
    },
    repurchase: {
      bv: Number(config?.repurchase?.bv ?? def.repurchase.bv),
      amount: Number(config?.repurchase?.amount ?? def.repurchase.amount)
    }
  };
}

// ===================================
// 🔹 VALIDATION (STRICT)
// ===================================
function validateConfig(config) {

  if (!config) return false;

  let u = config.upgrade || {};
  let r = config.repurchase || {};

  if (u.bv <= 0 || u.amount <= 0) return false;
  if (r.bv < 0 || r.amount < 0) return false;

  return true;
}

// ===================================
// 🔹 SAFE ACCESS HELPERS
// ===================================
function getUpgradeBV() {
  return loadSystemConfig().upgrade.bv;
}

function getUpgradeAmount() {
  return loadSystemConfig().upgrade.amount;
}

function getRepurchaseBV() {
  return loadSystemConfig().repurchase.bv;
}

function getRepurchaseAmount() {
  return loadSystemConfig().repurchase.amount;
}
