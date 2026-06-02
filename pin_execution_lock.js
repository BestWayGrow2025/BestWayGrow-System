"use strict";

/*
========================================
PIN EXECUTION LOCK V1.2 FINAL SAFE
========================================
✔ Async-safe execution lock
✔ TTL auto-release system
✔ Race-condition hardened
✔ Duplicate execution protection
✔ Debug trace support
✔ Production-ready locking layer
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
  return String(key || "").trim().toUpperCase();
}

// ================= LOCK CHECK =================
function isPinExecutionLocked(key) {

  key = normalizePinLockKey(key);

  const entry = PIN_EXECUTION_LOCKS[key];

  if (!entry) return false;

  // AUTO EXPIRE
  if (Date.now() - entry.timestamp > PIN_EXECUTION_LOCK_TTL) {
    delete PIN_EXECUTION_LOCKS[key];
    return false;
  }

  return true;
}

// ================= SET LOCK =================
function setPinExecutionLock(key) {

  key = normalizePinLockKey(key);

  PIN_EXECUTION_LOCKS[key] = {
    timestamp: Date.now(),
    stack: new Error().stack // debug trace support
  };

  return true;
}

// ================= RELEASE LOCK =================
function releasePinExecutionLock(key) {

  key = normalizePinLockKey(key);

  delete PIN_EXECUTION_LOCKS[key];

  return true;
}

// ================= SAFE EXECUTION (ASYNC SAFE) =================
async function executeWithPinLock(key, callback) {

  key = normalizePinLockKey(key);

  // Atomic-style check + reserve
  if (isPinExecutionLocked(key)) {
    return false;
  }

  setPinExecutionLock(key);

  try {

    // FULL ASYNC SAFETY
    const result = await Promise.resolve(
      typeof callback === "function" ? callback() : null
    );

    return result;

  } catch (err) {

    console.error("[PIN EXECUTION ERROR]", err);
    return false;

  } finally {

    releasePinExecutionLock(key);
  }
}

// ================= SAFE READ API =================
function getPinLockSnapshot() {
  return { ...PIN_EXECUTION_LOCKS };
}

// ================= EXPORT =================
window.executeWithPinLock = executeWithPinLock;
window.isPinExecutionLocked = isPinExecutionLocked;
window.setPinExecutionLock = setPinExecutionLock;
window.releasePinExecutionLock = releasePinExecutionLock;

// Optional debug namespace (clean structure)
window.PIN_LOCK = {
  execute: executeWithPinLock,
  isLocked: isPinExecutionLocked,
  set: setPinExecutionLock,
  release: releasePinExecutionLock,
  snapshot: getPinLockSnapshot
};
