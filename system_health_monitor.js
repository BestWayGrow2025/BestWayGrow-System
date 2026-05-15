"use strict";

/*
========================================
SYSTEM HEALTH MONITOR V1.0
REAL-TIME FINANCIAL SAFETY LAYER
========================================
✔ Live system integrity tracking
✔ Income / Wallet / Ledger health checks
✔ Audit + payout safety signals
✔ Corruption detection layer
✔ Auto-fail-safe trigger support
✔ Works with:
   - audit_compliance_engine.js
   - income_engine.js
   - payout_controller.js
   - withdrawal_system.js
========================================
*/

const HEALTH_LOG_KEY = "SYSTEM_HEALTH_LOG";
const HEALTH_STATE_KEY = "SYSTEM_HEALTH_STATE";
const HEALTH_LIMIT = 500;

// =====================
// STATE
// =====================
function getHealthState() {
  try {
    return (
      safeGet(HEALTH_STATE_KEY, {
        healthy: true,
        lastCheck: null,
        issues: []
      }) || {}
    );
  } catch {
    return {
      healthy: false,
      lastCheck: null,
      issues: ["STATE_READ_ERROR"]
    };
  }
}

function saveHealthState(state) {
  try {
    safeSet(HEALTH_STATE_KEY, state);
    return true;
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("HEALTH_STATE_SAVE_FAILED: " + err.message);
    }
    return false;
  }
}

// =====================
// LOGGING
// =====================
function getHealthLog() {
  try {
    const log = safeGet(HEALTH_LOG_KEY, []);
    return Array.isArray(log) ? log : [];
  } catch {
    return [];
  }
}

function saveHealthLog(log) {
  try {
    if (!Array.isArray(log)) log = [];

    if (log.length > HEALTH_LIMIT) {
      log = log.slice(-HEALTH_LIMIT);
    }

    safeSet(HEALTH_LOG_KEY, log);
    return true;
  } catch (err) {
    return false;
  }
}

function recordHealthEvent(entry = {}) {
  try {
    const log = getHealthLog();

    log.push({
      timestamp: Date.now(),
      type: entry.type || "HEALTH_CHECK",
      status: entry.status || "UNKNOWN",
      details: entry.details || {}
    });

    return saveHealthLog(log);
  } catch {
    return false;
  }
}

// =====================
// CORE CHECKS
// =====================

// Wallet health
function checkWalletHealth() {
  try {
    if (typeof getWallets !== "function") return true;

    const wallets = getWallets();
    let issues = [];

    for (let uid in wallets) {
      const bal = wallets[uid]?.balance;

      if (typeof bal !== "number") {
        issues.push({ uid, issue: "INVALID_BALANCE_TYPE" });
      }

      if (bal < 0) {
        issues.push({ uid, issue: "NEGATIVE_BALANCE" });
      }
    }

    return issues;
  } catch (err) {
    return [{ issue: "WALLET_CHECK_ERROR", error: err.message }];
  }
}

// Withdrawal health
function checkWithdrawalHealth() {
  try {
    if (typeof getWithdrawals !== "function") return [];

    const w = getWithdrawals();

    return w
      .filter(x => !x.requestId || !x.userId)
      .map(x => ({
        issue: "INVALID_WITHDRAWAL",
        data: x
      }));
  } catch (err) {
    return [{ issue: "WITHDRAWAL_CHECK_ERROR",

