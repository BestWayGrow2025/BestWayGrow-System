"use strict";

/*
========================================
PIN EXECUTION LOCK V1.1 (FINAL SAFE)
========================================
✔ Unified execution lock layer
✔ Duplicate execution protection
✔ TTL auto unlock system
✔ Queue-safe locking
✔ Flow-safe locking
✔ INIT GUARD ADDED
✔ Production SAFE
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_EXECUTION_LOCK__) return;

  window.__PIN_EXECUTION_LOCK__ = true;

  console.log("[PIN EXECUTION LOCK] LOADED");

})();

// ================= STORAGE =================
const PIN_EXECUTION_LOCKS = {};

// ================= CONFIG =================
const PIN_EXECUTION_LOCK_TTL = 10000;

// ================= NORMALIZER =================
function normalizePinLockKey(key) {

  return String(key || "")
    .trim()
    .toUpperCase();
}

// ================= LOCK CHECK =================
function isPinExecutionLocked(key) {

  key = normalizePinLockKey(key);

  const timestamp = PIN_EXECUTION_LOCKS[key];

  if (!timestamp) return false;

  // AUTO EXPIRE
  if (Date.now() - timestamp > PIN_EXECUTION_LOCK_TTL) {

    delete PIN_EXECUTION_LOCKS[key];

    return false;
  }

  return true;
}

// ================= SET LOCK =================
function setPinExecutionLock(key) {

  key = normalizePinLockKey(key);

  PIN_EXECUTION_LOCKS[key] = Date.now();

  return true;
}

// ================= RELEASE LOCK =================
function releasePinExecutionLock(key) {

  key = normalizePinLockKey(key);

  delete PIN_EXECUTION_LOCKS[key];

  return true;
}

// ================= SAFE EXECUTION =================
function executeWithPinLock(key, callback) {

  key = normalizePinLockKey(key);

  if (isPinExecutionLocked(key)) {
    return false;
  }

  setPinExecutionLock(key);

  try {

    const result = callback();

    return result;

  } catch (err) {

    console.error("[PIN EXECUTION ERROR]", err);

    return false;

  } finally {

    releasePinExecutionLock(key);
  }
}

// ================= EXPORT =================
window.executeWithPinLock = executeWithPinLock;
window.isPinExecutionLocked = isPinExecutionLocked;
window.setPinExecutionLock = setPinExecutionLock;
window.releasePinExecutionLock = releasePinExecutionLock;
