"use strict";

const UPGRADE_LOCKS = {};
const UPGRADE_LOCK_TTL = 10000;

function normalizeUpgradeAction(actionType) {
  return String(actionType || "").trim().toUpperCase();
}

function isUpgradeLocked(key) {
  const ts = UPGRADE_LOCKS[key];

  if (!ts) return false;

  if (Date.now() - ts > UPGRADE_LOCK_TTL) {
    delete UPGRADE_LOCKS[key];
    return false;
  }

  return true;
}

function setUpgradeLock(key, state) {
  if (state) {
    UPGRADE_LOCKS[key] = Date.now();
  } else {
    delete UPGRADE_LOCKS[key];
  }
}

function generateUpgradeKey(actionType, payload = {}, userId = "SYSTEM") {
  return [
    normalizeUpgradeAction(actionType),
    userId,
    payload.pinId || "-",
    payload.packageId || "-",
    payload.orderId || "-",
    payload.txnId || "-"
  ].join("|");
}

// ================= MAIN ENGINE =================
function executeUpgrade(actionType, payload = {}) {

  let user = null;
  let execKey = null;

  try {

    if (typeof getCurrentUser === "function") {
      user = getCurrentUser();
    }

    if (!user || !user.userId) {
      throw new Error("No active session");
    }

    actionType = normalizeUpgradeAction(actionType);

    execKey = generateUpgradeKey(
      actionType,
      payload,
      user.userId
    );

    if (isUpgradeLocked(execKey)) {
      throw new Error("Duplicate upgrade blocked");
    }

    setUpgradeLock(execKey, true);

    // 🔥 ONLY ROUTE TO CENTRAL ENGINE
    if (typeof executeFinancialCore !== "function") {
      throw new Error("Core engine missing");
    }

    return executeFinancialCore({
      type: actionType,
      userId: user.userId,
      ...payload
    });

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical(
        "UPGRADE ENGINE ERROR: " + err.message,
        user?.userId || "UNKNOWN",
        "UPGRADE_ENGINE"
      );
    }

    return false;

  } finally {

    if (execKey) {
      setUpgradeLock(execKey, false);
    }
  }
}

window.executeUpgrade = executeUpgrade;

