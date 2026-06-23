"use strict";

/*
========================================
FINANCIAL INTEGRITY ENGINE V1.0
MASTER FINANCIAL TRUST AUTHORITY
========================================
✔ Verifies all core financial engines
✔ Runs reconciliation automatically
✔ Confirms ledger-wallet consistency
✔ Determines if system is safe to operate
✔ Used by income, payout, withdrawal systems
✔ Audit-grade financial certification
========================================
*/

const FINANCIAL_INTEGRITY_LOG_KEY =
  "FINANCIAL_INTEGRITY_LOG";

const FINANCIAL_INTEGRITY_LOG_LIMIT =
  500;

// ========================================
// LOG STORAGE
// ========================================
function getFinancialIntegrityLog() {
  try {
    const raw = localStorage.getItem(
      FINANCIAL_INTEGRITY_LOG_KEY
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveFinancialIntegrityLog(log) {
  try {
    const safeLog = Array.isArray(log)
      ? log
      : [];

    const trimmed =
      safeLog.length >
      FINANCIAL_INTEGRITY_LOG_LIMIT
        ? safeLog.slice(
            -FINANCIAL_INTEGRITY_LOG_LIMIT
          )
        : safeLog;

    localStorage.setItem(
      FINANCIAL_INTEGRITY_LOG_KEY,
      JSON.stringify(trimmed)
    );

    return true;
  } catch (e) {
    if (
      typeof logCritical ===
      "function"
    ) {
      logCritical(
        "FINANCIAL_INTEGRITY_LOG_SAVE_FAILED: " +
          e.message
      );
    }

    return false;
  }
}

function addFinancialIntegrityLog(
  entry = {}
) {
  try {
    const log =
      getFinancialIntegrityLog();

    log.push({
      action:
        entry.action ||
        "INTEGRITY_CHECK",
      success:
        entry.success === true,
      details:
        entry.details &&
        typeof entry.details ===
          "object"
          ? entry.details
          : {},
      timestamp: Date.now()
    });

    return saveFinancialIntegrityLog(
      log
    );
  } catch (err) {
    if (
      typeof logCritical ===
      "function"
    ) {
      logCritical(
        "FINANCIAL_INTEGRITY_LOG_RECORD_FAILED: " +
          err.message
      );
    }

    return false;
  }
}

// ========================================
// CORE MODULE CHECKS
// ========================================
function getFinancialDependencies() {
  return {
    ledgerEngine:
      window.__LEDGER_ENGINE_ACTIVE__ ===
      true,

    walletEngine:
      window.__WALLET_ENGINE_ACTIVE__ ===
      true,

    replayEngine:
      window.__SYSTEM_REPLAY_ENGINE_ACTIVE__ ===
      true,

    reconciliationEngine:
      window.__RECONCILIATION_ENGINE_ACTIVE__ ===
      true,

    ledgerApi:
      typeof getLedger ===
      "function",

    walletApi:
      typeof getWallets ===
        "function" &&
      typeof saveWallets ===
        "function",

    replayApi:
      typeof replayFullSystem ===
      "function",

    reconciliationApi:
      typeof runReconciliation ===
      "function"
  };
}

// ========================================
// MAIN INTEGRITY CHECK
// ========================================
function runFinancialIntegrityCheck() {
  try {
    const deps =
      getFinancialDependencies();

    const failedChecks = [];

    Object.keys(deps).forEach(
      function (key) {
        if (!deps[key]) {
          failedChecks.push(key);
        }
      }
    );

    // Dependency failure
    if (failedChecks.length > 0) {
      const result = {
        healthy: false,
        certified: false,
        reason:
          "DEPENDENCY_FAILURE",
        failedChecks,
        checkedAt: Date.now()
      };

      addFinancialIntegrityLog({
        action:
          "INTEGRITY_CHECK",
        success: false,
        details: result
      });

      return result;
    }

    // Run reconciliation
    const reconciliation =
      runReconciliation();

    if (
      !reconciliation ||
      reconciliation.valid !== true
    ) {
      const result = {
        healthy: false,
        certified: false,
        reason:
          "RECONCILIATION_FAILED",
        reconciliation,
        checkedAt: Date.now()
      };

      addFinancialIntegrityLog({
        action:
          "INTEGRITY_CHECK",
        success: false,
        details: {
          mismatchCount:
            reconciliation &&
            reconciliation.mismatchCount
              ? reconciliation.mismatchCount
              : 0
        }
      });

      return result;
    }

    // Full certification success
    const result = {
      healthy: true,
      certified: true,
      reason: "OK",
      reconciliation,
      checkedAt: Date.now()
    };

    addFinancialIntegrityLog({
      action:
        "INTEGRITY_CHECK",
      success: true,
      details: {
        certified: true
      }
    });

    return result;
  } catch (err) {
    addFinancialIntegrityLog({
      action:
        "INTEGRITY_CHECK",
      success: false,
      details: {
        error: err.message
      }
    });

    if (
      typeof logCritical ===
      "function"
    ) {
      logCritical(
        "FINANCIAL_INTEGRITY_CHECK_FAILED: " +
          err.message
      );
    }

    return {
      healthy: false,
      certified: false,
      reason: err.message,
      checkedAt: Date.now()
    };
  }
}

// ========================================
// SIMPLE HEALTH API
// ========================================
function isFinancialSystemHealthy() {
  const result =
    runFinancialIntegrityCheck();

  return (
    result &&
    result.healthy === true &&
    result.certified === true
  );
}

// ========================================
// STATUS API
// ========================================
function getFinancialIntegrityStatus() {
  const log =
    getFinancialIntegrityLog();

  return {
    active: true,
    totalChecks: log.length,
    storageKey:
      FINANCIAL_INTEGRITY_LOG_KEY,
    dependencies:
      getFinancialDependencies()
  };
}

// ========================================
// GLOBAL EXPORTS
// ========================================
window.getFinancialIntegrityLog =
  getFinancialIntegrityLog;

window.addFinancialIntegrityLog =
  addFinancialIntegrityLog;

window.getFinancialDependencies =
  getFinancialDependencies;

window.runFinancialIntegrityCheck =
  runFinancialIntegrityCheck;

window.isFinancialSystemHealthy =
  isFinancialSystemHealthy;

window.getFinancialIntegrityStatus =
  getFinancialIntegrityStatus;

window.__FINANCIAL_INTEGRITY_ENGINE_ACTIVE__ =
  true;
