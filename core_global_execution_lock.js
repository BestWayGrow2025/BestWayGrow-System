"use strict";

/*
========================================
INTEGRATION LOCK LAYER V1.0 (BANK CORE SAFETY)
========================================
✔ Global execution-lock coordination
✔ Prevents normal concurrent execution conflicts
✔ Auto-expiring stale lock
✔ Owner-protected lock release
✔ System-wide transaction coordination
========================================
*/

const GLOBAL_LOCK_KEY = "__SYSTEM_GLOBAL_LOCK__";
const LOCK_TTL = 8000;

// ================= LOCK STATE =================
function getGlobalLock() {
  try {
    return JSON.parse(localStorage.getItem(GLOBAL_LOCK_KEY) || "null");
  } catch {
    return null;
  }
}

function setGlobalLock(data) {
  try {
    localStorage.setItem(
      GLOBAL_LOCK_KEY,
      JSON.stringify(data || null)
    );
  } catch (e) {
    if (typeof logCritical === "function") {
      logCritical("LOCK_SAVE_FAILED: " + e.message);
    }
  }
}

function clearGlobalLock() {
  try {
    localStorage.removeItem(GLOBAL_LOCK_KEY);
  } catch {}
}

// ================= LOCK CHECK =================
function isSystemLocked() {
  const lock = getGlobalLock();

  if (!lock || !lock.timestamp) {
    return false;
  }

  if (Date.now() - Number(lock.timestamp) > LOCK_TTL) {
    clearGlobalLock();
    return false;
  }

  return true;
}

// ================= ACQUIRE LOCK =================
function acquireSystemLock(context = "unknown") {

  const lockId =
    "LOCK_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2);

  const now = Date.now();
  const existing = getGlobalLock();

  // Existing valid lock is owned by another execution.
  if (
    existing &&
    existing.id &&
    Number.isFinite(Number(existing.timestamp)) &&
    now - Number(existing.timestamp) <= LOCK_TTL
  ) {
    return false;
  }

  const lockData = {
    id: lockId,
    context: String(context || "unknown"),
    timestamp: now
  };

  setGlobalLock(lockData);

  const verify = getGlobalLock();

  if (
    !verify ||
    verify.id !== lockId ||
    Number(verify.timestamp) !== now
  ) {
    return false;
  }

  return lockId;
}
// ================= RELEASE LOCK =================
function releaseSystemLock(lockId = null) {

  if (!lockId) {
    return false;
  }

  const current = getGlobalLock();

  if (!current || current.id !== lockId) {
    return false;
  }

  clearGlobalLock();

  // Verify that this execution actually released its lock.
  const verify = getGlobalLock();

  if (verify && verify.id === lockId) {
    return false;
  }

  return true;
}

// ================= SAFE EXECUTION =================
function executeWithSystemLock(fn, context = "generic") {
  let lockId = null;

  try {
    if (typeof fn !== "function") {
      return false;
    }

    lockId = acquireSystemLock(context);

    if (!lockId) {
      return false;
    }

    return fn();

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("LOCK_EXEC_ERROR: " + err.message);
    }

    return false;

  } finally {

    if (lockId) {
      releaseSystemLock(lockId);
    }
  }
}
// ================= EXPORT =================
window.getGlobalLock = getGlobalLock;
window.isSystemLocked = isSystemLocked;
window.acquireSystemLock = acquireSystemLock;
window.releaseSystemLock = releaseSystemLock;
window.executeWithSystemLock = executeWithSystemLock;

/* ================= INTEGRATION LOCK STATE FLAG ================= */

window.__INTEGRATION_LOCK_ACTIVE__ = {
  initialized: true,
  ready: false,
  timestamp: Date.now()
};
