"use strict";

/*
========================================
FEATURE LOCK MANAGER V1.0
========================================
✔ Per-feature execution locks
✔ CTOR / PIN / INCOME / UPGRADE control
✔ Business-level concurrency protection
✔ Built on top of integration_lock.js
========================================
*/

const FEATURE_LOCK_KEY = "__FEATURE_LOCK_STATE__";
const FEATURE_LOCK_TTL = 5000;

// ================= STORAGE =================
function getFeatureLocks() {
  try {
    return JSON.parse(
      localStorage.getItem(FEATURE_LOCK_KEY) || "{}"
    );
  } catch {
    return {};
  }
}

function saveFeatureLocks(data) {
  try {
    localStorage.setItem(
      FEATURE_LOCK_KEY,
      JSON.stringify(
        data && typeof data === "object" ? data : {}
      )
    );
  } catch (e) {
    if (typeof logCritical === "function") {
      logCritical("FEATURE_LOCK_SAVE_FAILED: " + e.message);
    }
  }
}

// ================= LOCK CHECK =================
function isFeatureLocked(feature) {
  if (!feature) {
    return false;
  }

  const locks = getFeatureLocks();
  const ts = locks[feature];

  if (!ts) {
    return false;
  }

  if (Date.now() - Number(ts) > FEATURE_LOCK_TTL) {
    delete locks[feature];
    saveFeatureLocks(locks);
    return false;
  }

  return true;
}

// ================= ACQUIRE =================
function acquireFeatureLock(feature) {
  if (!feature) {
    return false;
  }

  if (isFeatureLocked(feature)) {
    return false;
  }

  const locks = getFeatureLocks();
  locks[feature] = Date.now();
  saveFeatureLocks(locks);

  return true;
}

// ================= RELEASE =================
function releaseFeatureLock(feature) {
  if (!feature) {
    return false;
  }

  const locks = getFeatureLocks();

  delete locks[feature];

  saveFeatureLocks(locks);

  return true;
}

// ================= SAFE EXECUTION =================
function executeWithFeatureLock(feature, fn) {
  try {
    if (!feature || typeof fn !== "function") {
      return false;
    }

    if (!acquireFeatureLock(feature)) {
      return false;
    }

    const result =
      typeof executeWithSystemLock === "function"
        ? executeWithSystemLock(
            fn,
            "FEATURE_" + feature
          )
        : fn();

    releaseFeatureLock(feature);

    return result;

  } catch (err) {
    releaseFeatureLock(feature);

    if (typeof logCritical === "function") {
      logCritical(
        "FEATURE_LOCK_EXEC_ERROR: " + err.message
      );
    }

    return false;
  }
}

// ================= EXPORT =================
window.getFeatureLocks = getFeatureLocks;
window.isFeatureLocked = isFeatureLocked;
window.acquireFeatureLock = acquireFeatureLock;
window.releaseFeatureLock = releaseFeatureLock;
window.executeWithFeatureLock = executeWithFeatureLock;

window.__FEATURE_LOCK_MANAGER_ACTIVE__ = true;
