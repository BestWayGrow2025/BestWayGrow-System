/*
========================================
🔥 TRIGGER SYSTEM V8 FINAL LOCK
========================================
✔ Core aligned
✔ Safe trigger storage
✔ Duplicate trigger protection
✔ Upgrade / Repurchase / PIN support
✔ Queue-safe validation
✔ Admin control aware
✔ Config-aware BV fallback
✔ Detailed logging
✔ Error safe
✔ Production ready
========================================
*/

// ===================================
// STORAGE
// ===================================
const TRIGGER_STORE_KEY = "TRIGGER_SYSTEM_STORE";

// ===================================
// LOAD STORE
// ===================================
function getTriggerStore() {

  let store = {};

  try {
    store = safeGet(TRIGGER_STORE_KEY, {});
  } catch (e) {
    store = {};
  }

  return (store && typeof store === "object") ? store : {};
}

// ===================================
// SAVE STORE
// ===================================
function saveTriggerStore(store) {

  if (!store || typeof store !== "object") {
    store = {};
  }

  safeSet(TRIGGER_STORE_KEY, store);
}

// ===================================
// DUPLICATE CHECK
// ===================================
function isRecentTrigger(key, delay = 3000) {

  let store = getTriggerStore();
  let last = Number(store[key] || 0);

  if (!last) return false;

  return (Date.now() - last) < delay;
}

function setTrigger(key) {

  let store = getTriggerStore();
  store[key] = Date.now();

  saveTriggerStore(store);
}

// ===================================
// CLEAN OLD STORE
// ===================================
function cleanTriggerStore() {

  let store = getTriggerStore();
  let changed = false;

  Object.keys(store).forEach(key => {
    if ((Date.now() - Number(store[key])) > 86400000) {
      delete store[key];
      changed = true;
    }
  });

  if (changed) {
    saveTriggerStore(store);
  }
}

// ===================================
// SYSTEM VALIDATION
// ===================================
function canRunTrigger(type) {

  try {

    if (typeof isSystemSafe === "function") {
      if (!isSystemSafe()) return false;
    }

    let settings = {};

    if (typeof getSystemSettings === "function") {
      settings = getSystemSettings() || {};
    }

    if (settings.lockMode === true) return false;
    if (settings.queueStop === true) return false;

    if (type === "upgrade" && settings.upgradesOpen === false) {
      return false;
    }

    if (type === "repurchase" && settings.repurchaseOpen === false) {
      return false;
    }

    if (type === "registration" && settings.registrationOpen === false) {
      return false;
    }

    return true;

  } catch (err) {
    console.error("Trigger validation error:", err.message);
    return false;
  }
}

// ===================================
// COMMON PROCESSOR
// ===================================
function runIncomeTrigger(type, userId, bv, source, uniqueKey) {

     if (!canRunTrigger(type)) return false;

    if (typeof isIncomeAllowed === "function") {
      if (!isIncomeAllowed(type)) return false;
    }

    if (typeof processIncome !== "function") {
      console.warn("processIncome missing");
      return false;
    }
  
  try {

    if (!userId || !type) return false;

    if (!canRunTrigger(type)) return false;

    if (typeof processIncome !== "function") {
      console.warn("processIncome missing");
      return false;
    }

    let triggerKey = uniqueKey || (
      "TRG_" + type + "_" + userId + "_" + bv
    );

    if (isRecentTrigger(triggerKey)) {
      return false;
    }

    setTrigger(triggerKey);

    bv = Number(bv || 0);

    if (isNaN(bv) || bv < 0) {
      bv = 0;
    }

    processIncome(type, userId, bv);

    if (typeof logActivity === "function") {
      logActivity(
        userId,
        "SYSTEM",
        "TRIGGER " + type.toUpperCase(),
        source || "TRIGGER_SYSTEM"
      );
    }

    return true;

  } catch (err) {

    console.error("Trigger error:", err.message);

    if (typeof logCritical === "function") {
      logCritical(
        "Trigger failure [" + type + "] : " + err.message,
        userId
      );
    }

    return false;
  }
}

// ===================================
// PIN USE TRIGGER
// ===================================
function triggerPinUseIncome(userId, pin) {

  if (!userId || !pin) return false;

  let triggerType = pin.type || "upgrade";
  let bv = Number(pin.bv || 0);

  triggerType = String(triggerType).toLowerCase();


  // fallback from config
  if (!bv && typeof getUpgradeBV === "function") {
    if (triggerType === "upgrade") {
      bv = getUpgradeBV();
    }

    if (triggerType === "repurchase" && typeof getRepurchaseBV === "function") {
      bv = getRepurchaseBV();
    }
  }

  let uniqueKey =
    "PIN_" +
    userId + "_" +
    (pin.pinId || "") + "_" +
    triggerType;

  return runIncomeTrigger(
    triggerType,
    userId,
    bv,
    "PIN_USE",
    uniqueKey
  );
}

// ===================================
// UPGRADE TRIGGER
// ===================================
function triggerUpgradeIncome(userId, bv = null) {

  if (!userId) return false;

  if (!bv && typeof getUpgradeBV === "function") {
    bv = getUpgradeBV();
  }

  let uniqueKey =
    "UPGRADE_" +
    userId + "_" +
    Number(bv || 0);

  return runIncomeTrigger(
    "upgrade",
    userId,
    bv,
    "UPGRADE",
    uniqueKey
  );
}

// ===================================
// REPURCHASE TRIGGER
// ===================================
function triggerRepurchaseIncome(userId, bv = null) {

  if (!userId) return false;

  if (!bv && typeof getRepurchaseBV === "function") {
    bv = getRepurchaseBV();
  }

  let uniqueKey =
    "REPURCHASE_" +
    userId + "_" +
    Number(bv || 0);

  return runIncomeTrigger(
    "repurchase",
    userId,
    bv,
    "REPURCHASE",
    uniqueKey
  );
}

// ===================================
// REGISTRATION TRIGGER
// ===================================
function triggerRegistrationIncome(userId, bv = 0) {

  if (!userId) return false;

  let uniqueKey =
    "REGISTRATION_" +
    userId;

  return runIncomeTrigger(
    "registration",
    userId,
    Number(bv || 0),
    "REGISTRATION",
    uniqueKey
  );
}

// ===================================
// CLEAR TEST TRIGGERS
// ===================================
function clearTriggerStore() {

  safeSet(TRIGGER_STORE_KEY, {});
  return true;
}

// ===================================
// AUTO CLEANUP
// ===================================
if (!window.__TRIGGER_CLEANER_STARTED__) {

  window.__TRIGGER_CLEANER_STARTED__ = true;

  setInterval(() => {
    try {
      cleanTriggerStore();
    } catch (e) {
      console.error("Trigger cleanup failed:", e.message);
    }
  }, 60000);
}
