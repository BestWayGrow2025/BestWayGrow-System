/*
========================================
🔥 TRIGGER SYSTEM V7 (ULTRA FINAL CONNECTOR)
========================================
✔ Core aligned (safeGet / safeSet)
✔ Event → Income bridge
✔ Duplicate safe trigger
✔ System control aware
✔ Clean logging
✔ Return-safe execution
✔ Production locked
========================================
*/

// ===================================
// 🔒 TRIGGER STORAGE (SAFE)
// ===================================
function getTriggerStore() {
  let store = safeGet("triggerStore", {});
  return typeof store === "object" ? store : {};
}

function saveTriggerStore(store) {
  safeSet("triggerStore", store);
}

// ===================================
// 🔁 DUPLICATE CHECK
// ===================================
function isRecentTrigger(key) {

  let store = getTriggerStore();
  let last = store[key];

  if (!last) return false;

  return (Date.now() - Number(last)) < 3000;
}

function setTrigger(key) {

  let store = getTriggerStore();
  store[key] = Date.now();
  saveTriggerStore(store);
}

// ===================================
// 🔍 COMMON VALIDATION
// ===================================
function canRunTrigger(type) {

  let settings = getSystemSettings();

  if (!settings || typeof settings !== "object") return false;

  if (settings.lockMode === true) return false;

  if (settings.queueStop === true) return false;

  if (type === "upgrade" && settings.upgradesOpen === false) return false;

  if (type === "repurchase" && settings.repurchaseOpen === false) return false;

  return true;
}

// ===================================
// 🔥 PIN USE TRIGGER
// ===================================
function triggerPinUseIncome(userId, pin) {

  if (!userId || !pin) return false;

  let key = "TRG_PIN_" + userId + "_" + (pin.pinId || "");

  if (isRecentTrigger(key)) return false;
  setTrigger(key);

  try {

    if (!canRunTrigger(pin.type)) return false;

    if (typeof processIncome === "function") {

      processIncome(
        pin.type,
        userId,
        Number(pin.bv || 0)
      );

    } else {
      console.warn("processIncome not available");
      return false;
    }

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "Income triggered via PIN");
    }

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("Trigger PIN error: " + err.message, userId);
    }

    return false;
  }
}

// ===================================
// 🔥 UPGRADE TRIGGER
// ===================================
function triggerUpgradeIncome(userId, bv) {

  if (!userId || !bv) return false;

  let key = "TRG_UP_" + userId + "_" + Date.now();

  if (isRecentTrigger(key)) return false;
  setTrigger(key);

  try {

    if (!canRunTrigger("upgrade")) return false;

    if (typeof processIncome === "function") {

      processIncome("upgrade", userId, Number(bv));

    } else {
      console.warn("processIncome not available");
      return false;
    }

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "Income triggered via UPGRADE");
    }

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("Trigger upgrade error: " + err.message, userId);
    }

    return false;
  }
}

// ===================================
// 🔥 REPURCHASE TRIGGER
// ===================================
function triggerRepurchaseIncome(userId, bv) {

  if (!userId || !bv) return false;

  let key = "TRG_RP_" + userId + "_" + Date.now();

  if (isRecentTrigger(key)) return false;
  setTrigger(key);

  try {

    if (!canRunTrigger("repurchase")) return false;

    if (typeof processIncome === "function") {

      processIncome("repurchase", userId, Number(bv));

    } else {
      console.warn("processIncome not available");
      return false;
    }

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "Income triggered via REPURCHASE");
    }

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("Trigger repurchase error: " + err.message, userId);
    }

    return false;
  }
}
