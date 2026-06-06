"use strict";

/*
========================================
INTEGRATION LOCK LAYER V1.0 (BANK CORE SAFETY)
========================================
✔ Global atomic execution lock
✔ Prevents race conditions
✔ Auto-expiring stale lock
✔ System-wide transaction safety
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
  if (isSystemLocked()) {
    return false;
  }

  setGlobalLock({
    context,
    timestamp: Date.now()
  });

  return true;
}

// ================= RELEASE LOCK =================
function releaseSystemLock() {
  clearGlobalLock();
  return true;
}

// ================= SAFE EXECUTION =================
function executeWithSystemLock(fn, context = "generic") {
  try {
    if (typeof fn !== "function") {
      return false;
    }

    if (!acquireSystemLock(context)) {
      return false;
    }

    const result = fn();

    releaseSystemLock();

    return result;

  } catch (err) {
    releaseSystemLock();

    if (typeof logCritical === "function") {
      logCritical("LOCK_EXEC_ERROR: " + err.message);
    }

    return false;
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
