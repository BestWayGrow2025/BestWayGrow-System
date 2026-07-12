"use strict";

 /*
========================================
CORE FINANCIAL RECONCILIATION AUTHORITY
========================================
✔ Compares ledger-derived balances with live wallets
✔ Detects mismatches and missing accounts
✔ Generates reconciliation reports
✔ Optional auto-repair using replay engine
✔ Audit-grade verification layer
========================================
*/

const RECONCILIATION_LOG_KEY = "RECONCILIATION_LOG";
const RECONCILIATION_LOG_LIMIT = 500;

// ========================================
// LOG STORAGE
// ========================================
function getReconciliationLog() {
  try {
    const raw = localStorage.getItem(RECONCILIATION_LOG_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReconciliationLog(log) {
  try {
    const safeLog = Array.isArray(log) ? log : [];

    const trimmed =
      safeLog.length > RECONCILIATION_LOG_LIMIT
        ? safeLog.slice(-RECONCILIATION_LOG_LIMIT)
        : safeLog;

    localStorage.setItem(
      RECONCILIATION_LOG_KEY,
      JSON.stringify(trimmed)
    );

    return true;
  } catch (e) {
    if (typeof logCritical === "function") {
      logCritical(
        "RECONCILIATION_LOG_SAVE_FAILED: " + e.message
      );
    }

    return false;
  }
}

function addReconciliationLog(entry = {}) {
  try {
    const log = getReconciliationLog();

    log.push({
      action:
        entry.action || "RECONCILIATION",
      success: entry.success === true,
      details:
        entry.details &&
        typeof entry.details === "object"
          ? entry.details
          : {},
      timestamp: Date.now()
    });

    return saveReconciliationLog(log);
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical(
        "RECONCILIATION_LOG_RECORD_FAILED: " +
          err.message
      );
    }

    return false;
  }
}

// ========================================
// RUN RECONCILIATION
// ========================================
function runReconciliation() {
  try {
    if (
      typeof verifyWalletIntegrity !==
      "function"
    ) {
      return {
        valid: false,
        reason:
          "VERIFY_WALLET_INTEGRITY_NOT_AVAILABLE"
      };
    }

    const result = verifyWalletIntegrity();

    addReconciliationLog({
      action: "RUN_RECONCILIATION",
      success: result.valid === true,
      details: {
        mismatchCount:
          result.mismatchCount || 0
      }
    });

    return result;
  } catch (err) {
    addReconciliationLog({
      action: "RUN_RECONCILIATION",
      success: false,
      details: {
        error: err.message
      }
    });

    if (typeof logCritical === "function") {
      logCritical(
        "RECONCILIATION_FAILED: " +
          err.message
      );
    }

    return {
      valid: false,
      reason: err.message
    };
  }
}

// ========================================
// AUTO REPAIR
// ========================================
function reconcileAndRepair() {
  try {
    const report = runReconciliation();

    if (report.valid === true) {
      return {
        repaired: false,
        alreadyBalanced: true,
        report
      };
    }

    if (
      typeof replayFullSystem !==
      "function"
    ) {
      return {
        repaired: false,
        alreadyBalanced: false,
        reason:
          "REPLAY_ENGINE_NOT_AVAILABLE",
        report
      };
    }

    const repaired =
      replayFullSystem();

    addReconciliationLog({
      action: "AUTO_REPAIR",
      success: repaired === true,
      details: {
        mismatchCount:
          report.mismatchCount || 0
      }
    });

    return {
      repaired: repaired === true,
      alreadyBalanced: false,
      report
    };
  } catch (err) {
    addReconciliationLog({
      action: "AUTO_REPAIR",
      success: false,
      details: {
        error: err.message
      }
    });

    if (typeof logCritical === "function") {
      logCritical(
        "RECONCILIATION_REPAIR_FAILED: " +
          err.message
      );
    }

    return {
      repaired: false,
      reason: err.message
    };
  }
}

// ========================================
// STATUS API
// ========================================
function getReconciliationStatus() {
  const log = getReconciliationLog();

  return {
    active: true,
    totalRuns: log.length,
    storageKey:
      RECONCILIATION_LOG_KEY,
    replayAvailable:
      typeof replayFullSystem ===
      "function",
    verificationAvailable:
      typeof verifyWalletIntegrity ===
      "function"
  };
}

// ========================================
// GLOBAL EXPORTS
// ========================================
window.getReconciliationLog =
  getReconciliationLog;

window.addReconciliationLog =
  addReconciliationLog;

window.runReconciliation =
  runReconciliation;

window.reconcileAndRepair =
  reconcileAndRepair;

window.getReconciliationStatus =
  getReconciliationStatus;

window.__RECONCILIATION_ENGINE_ACTIVE__ =
  true;
