"use strict";

/*
========================================
TRIGGER SYSTEM V9.0 (FINAL HARDENED)
========================================
✔ Core aligned
✔ Session-manager protected
✔ Duplicate trigger protection
✔ Replay-safe trigger control
✔ Upgrade / Repurchase / PIN support
✔ Queue-safe validation
✔ Income-control integrated
✔ Recursive execution blocked
✔ Safe trigger cleanup
✔ Trigger lock protection
✔ Detailed logging
✔ Production FINAL
========================================
*/

// =====================
// CONFIG
// =====================
const TRIGGER_STORE_KEY = "TRIGGER_SYSTEM_STORE";

const TRIGGER_LOCKS = {};
const TRIGGER_LOCK_TTL = 10000;

// =====================
// CORE SAFETY
// =====================
function isTriggerSystemSafe() {

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
// STORE
// =====================
function getTriggerStore() {

  try {

    let store = safeGet(
      TRIGGER_STORE_KEY,
      {}
    );

    return (
      store &&
      typeof store === "object"
    )
      ? store
      : {};

  } catch {

    return {};
  }
}

function saveTriggerStore(store) {

  try {

    if (
      !store ||
      typeof store !== "object"
    ) {
      store = {};
    }

    safeSet(
      TRIGGER_STORE_KEY,
      store
    );

    return true;

  } catch {

    return false;
  }
}

// =====================
// LOCK
// =====================
function isTriggerLocked(key) {

  let lock = TRIGGER_LOCKS[key];

  if (!lock) {
    return false;
  }

  if (
    Date.now() - lock >
    TRIGGER_LOCK_TTL
  ) {

    delete TRIGGER_LOCKS[key];

    return false;
  }

  return true;
}

function setTriggerLock(key, val) {

  if (val) {
    TRIGGER_LOCKS[key] = Date.now();
  } else {
    delete TRIGGER_LOCKS[key];
  }
}

// =====================
// DUPLICATE CHECK
// =====================
function isRecentTrigger(
  key,
  delay = 3000
) {

  let store = getTriggerStore();

  let last = Number(
    store[key] || 0
  );

  if (!last) {
    return false;
  }

  return (
    Date.now() - last
  ) < delay;
}

function setTrigger(key) {

  let store = getTriggerStore();

  store[key] = Date.now();

  saveTriggerStore(store);
}

// =====================
// CLEANUP
// =====================
function cleanTriggerStore() {

  try {

    let store = getTriggerStore();

    let changed = false;

    Object.keys(store).forEach(key => {

      if (
        (
          Date.now() -
          Number(store[key])
        ) > 86400000
      ) {

        delete store[key];

        changed = true;
      }
    });

    if (changed) {
      saveTriggerStore(store);
    }

    return true;

  } catch {

    return false;
  }
}

// =====================
// VALIDATION
// =====================
function canRunTrigger(type) {

  try {

    if (!isTriggerSystemSafe()) {
      return false;
    }

    if (
      typeof isSystemSafe === "function" &&
      !isSystemSafe()
    ) {
      return false;
    }

    let settings = {};

    if (
      typeof getSystemSettings === "function"
    ) {

      settings =
        getSystemSettings() || {};
    }

    if (
      settings.lockMode === true
    ) {
      return false;
    }

    if (
      settings.queueStop === true
    ) {
      return false;
    }

    if (
      type === "upgrade" &&
      settings.upgradesOpen === false
    ) {
      return false;
    }

    if (
      type === "repurchase" &&
      settings.repurchaseOpen === false
    ) {
      return false;
    }

    if (
      type === "registration" &&
      settings.registrationOpen === false
    ) {
      return false;
    }

    if (
      typeof isIncomeAllowed === "function"
    ) {

      if (!isIncomeAllowed(type)) {
        return false;
      }
    }

    return true;

  } catch (err) {

    if (
      typeof logCritical === "function"
    ) {

      logCritical(
        "Trigger validation error: " +
        err.message
      );
    }

    return false;
  }
}

// =====================
// MAIN TRIGGER
// =====================
function runIncomeTrigger(
  type,
  userId,
  bv,
  source,
  uniqueKey
) {

  if (!userId || !type) {
    return false;
  }

  if (!canRunTrigger(type)) {
    return false;
  }

  if (
    typeof processIncome !== "function"
  ) {

    console.warn(
      "processIncome missing"
    );

    return false;
  }

  let triggerKey =
    uniqueKey ||
    (
      "TRG_" +
      type + "_" +
      userId + "_" +
      Number(bv || 0)
    );

  if (
    isRecentTrigger(triggerKey)
  ) {
    return false;
  }

  if (
    isTriggerLocked(triggerKey)
  ) {
    return false;
  }

  setTriggerLock(triggerKey, true);

  try {

    setTrigger(triggerKey);

    bv = Number(bv || 0);

    if (
      isNaN(bv) ||
      bv < 0
    ) {
      bv = 0;
    }

    let success = processIncome(
      type,
      userId,
      bv
    );

    if (!success) {
      return false;
    }

    if (
      typeof logActivity === "function"
    ) {

      logActivity(
        userId,
        "SYSTEM",
        "TRIGGER " +
        String(type)
          .toUpperCase(),
        source ||
        "TRIGGER_SYSTEM"
      );
    }

    return true;

  } catch (err) {

    console.error(
      "Trigger error:",
      err.message
    );

    if (
      typeof logCritical === "function"
    ) {

      logCritical(
        "Trigger failure [" +
        type +
        "] : " +
        err.message,
        userId
      );
    }

    return false;

  } finally {

    setTriggerLock(
      triggerKey,
      false
    );
  }
}

// =====================
// PIN TRIGGER
// =====================
function triggerPinUseIncome(
  userId,
  pin
) {

  if (!userId || !pin) {
    return false;
  }

  let triggerType = String(
    pin.type || "upgrade"
  )
    .trim()
    .toLowerCase();

  let bv = Number(
    pin.bv || 0
  );

  if (
    !bv &&
    typeof getUpgradeBV === "function"
  ) {

    if (
      triggerType === "upgrade"
    ) {

      bv = getUpgradeBV();
    }

    if (
      triggerType === "repurchase" &&
      typeof getRepurchaseBV === "function"
    ) {

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

// =====================
// UPGRADE
// =====================
function triggerUpgradeIncome(
  userId,
  bv = null
) {

  if (!userId) {
    return false;
  }

  if (
    !bv &&
    typeof getUpgradeBV === "function"
  ) {

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

// =====================
// REPURCHASE
// =====================
function triggerRepurchaseIncome(
  userId,
  bv = null
) {

  if (!userId) {
    return false;
  }

  if (
    !bv &&
    typeof getRepurchaseBV === "function"
  ) {

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

// =====================
// REGISTRATION
// =====================
function triggerRegistrationIncome(
  userId,
  bv = 0
) {

  if (!userId) {
    return false;
  }

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

// =====================
// CLEAR
// =====================
function clearTriggerStore() {

  try {

    safeSet(
      TRIGGER_STORE_KEY,
      {}
    );

    return true;

  } catch {

    return false;
  }
}

// =====================
// CLEANER
// =====================
if (
  !window.__TRIGGER_CLEANER_STARTED__
) {

  window.__TRIGGER_CLEANER_STARTED__ =
    true;

  setInterval(() => {

    try {

      cleanTriggerStore();

    } catch (err) {

      if (
        typeof logCritical === "function"
      ) {

        logCritical(
          "Trigger cleanup failed: " +
          err.message
        );
      }
    }

  }, 60000);
}
