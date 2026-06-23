"use strict";

/*
========================================
FINANCIAL GUARDIAN ENGINE V1.0
AUTONOMOUS FINANCIAL PROTECTION LAYER
========================================
✔ Performs final pre-transaction safety check
✔ Verifies financial integrity certification
✔ Runs automatic repair when needed
✔ Blocks unsafe financial operations
✔ Used by income, withdrawal, payout systems
✔ Bank-grade operational gatekeeper
========================================
*/

const FINANCIAL_GUARDIAN_LOG_KEY =
  "FINANCIAL_GUARDIAN_LOG";

const FINANCIAL_GUARDIAN_LOG_LIMIT =
  500;

// ========================================
// LOG STORAGE
// ========================================
function getFinancialGuardianLog() {
  try {
    const raw = localStorage.getItem(
      FINANCIAL_GUARDIAN_LOG_KEY
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

function saveFinancialGuardianLog(log) {
  try {
    const safeLog = Array.isArray(log)
      ? log
      : [];

    const trimmed =
      safeLog.length >
      FINANCIAL_GUARDIAN_LOG_LIMIT
        ? safeLog.slice(
            -FINANCIAL_GUARDIAN_LOG_LIMIT
          )
        : safeLog;

    localStorage.setItem(
      FINANCIAL_GUARDIAN_LOG_KEY,
      JSON.stringify(trimmed)
    );

    return true;
  } catch (e) {
    if (
      typeof logCritical ===
      "function"
    ) {
      logCritical(
        "FINANCIAL_GUARDIAN_LOG_SAVE_FAILED: " +
          e.message
      );
    }

    return false;
  }
}

function addFinancialGuardianLog(
  entry = {}
) {
  try {
    const log =
      getFinancialGuardianLog();

    log.push({
      operation:
        entry.operation ||
        "UNKNOWN_OPERATION",
      approved:
        entry.approved === true,
      details:
        entry.details &&
        typeof entry.details ===
          "object"
          ? entry.details
          : {},
      timestamp: Date.now()
    });

    return saveFinancialGuardianLog(
      log
    );
  } catch (err) {
    if (
      typeof logCritical ===
      "function"
    ) {
      logCritical(
        "FINANCIAL_GUARDIAN_LOG_RECORD_FAILED: " +
          err.message
      );
    }

    return false;
  }
}

// ========================================
// MAIN APPROVAL GATE
// ========================================
function approveFinancialOperation(
  operation = "GENERAL"
) {
  try {
    // Verify required APIs
    if (
      typeof runFinancialIntegrityCheck !==
        "function" ||
      typeof runAutoRepair !==
        "function"
    ) {
      addFinancialGuardianLog({
        operation,
        approved: false,
        details: {
          reason:
            "DEPENDENCIES_MISSING"
        }
      });

      return false;
    }

    // Initial integrity check
    const integrity =
      runFinancialIntegrityCheck();

    // Healthy and certified
    if (
      integrity &&
      integrity.healthy === true &&
      integrity.certified === true
    ) {
      addFinancialGuardianLog({
        operation,
        approved: true,
        details: {
          reason:
            "INTEGRITY_CERTIFIED"
        }
      });

      return true;
    }

    // Attempt automatic repair
    const repair =
      runAutoRepair();

    if (
      repair &&
      repair.repaired === true
    ) {
      addFinancialGuardianLog({
        operation,
        approved: true,
        details: {
          reason:
            "AUTO_REPAIR_SUCCESSFUL"
        }
      });

      return true;
    }

    // Final rejection
    addFinancialGuardianLog({
      operation,
      approved: false,
      details: {
        reason:
          "SYSTEM_UNSAFE"
      }
    });

    return false;
  } catch (err) {
    addFinancialGuardianLog({
      operation,
      approved: false,
      details: {
        error: err.message
      }
    });

    if (
      typeof logCritical ===
      "function"
    ) {
      logCritical(
        "FINANCIAL_GUARDIAN_FAILED: " +
          err.message
      );
    }

    return false;
  }
}

// ========================================
// STATUS API
// ========================================
function getFinancialGuardianStatus() {
  const log =
    getFinancialGuardianLog();

  return {
    active: true,
    totalChecks: log.length,
    storageKey:
      FINANCIAL_GUARDIAN_LOG_KEY,
    integrityAvailable:
      typeof runFinancialIntegrityCheck ===
      "function",
    autoRepairAvailable:
      typeof runAutoRepair ===
      "function"
  };
}

// ========================================
// GLOBAL EXPORTS
// ========================================
window.getFinancialGuardianLog =
  getFinancialGuardianLog;

window.addFinancialGuardianLog =
  addFinancialGuardianLog;

window.approveFinancialOperation =
  approveFinancialOperation;

window.getFinancialGuardianStatus =
  getFinancialGuardianStatus;

window.__FINANCIAL_GUARDIAN_ENGINE_ACTIVE__ =
  true;
