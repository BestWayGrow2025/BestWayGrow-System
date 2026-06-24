"use strict";

/*
========================================
AUTO REPAIR ENGINE V1.0
SELF-HEALING FINANCIAL RECOVERY
========================================
✔ Detects financial integrity failure
✔ Triggers full ledger replay
✔ Re-runs reconciliation
✔ Re-certifies financial health
✔ Logs all repair attempts
✔ Safe for automated execution
========================================
*/

const AUTO_REPAIR_LOG_KEY =
  "AUTO_REPAIR_LOG";

const AUTO_REPAIR_LOG_LIMIT =
  500;

// ========================================
// LOG STORAGE
// ========================================
function getAutoRepairLog() {
  try {
    const raw = localStorage.getItem(
      AUTO_REPAIR_LOG_KEY
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

function saveAutoRepairLog(log) {
  try {
    const safeLog = Array.isArray(log)
      ? log
      : [];

    const trimmed =
      safeLog.length >
      AUTO_REPAIR_LOG_LIMIT
        ? safeLog.slice(
            -AUTO_REPAIR_LOG_LIMIT
          )
        : safeLog;

    localStorage.setItem(
      AUTO_REPAIR_LOG_KEY,
      JSON.stringify(trimmed)
    );

    return true;
  } catch (e) {
    if (
      typeof logCritical ===
      "function"
    ) {
      logCritical(
        "AUTO_REPAIR_LOG_SAVE_FAILED: " +
          e.message
      );
    }

    return false;
  }
}

function addAutoRepairLog(
  entry = {}
) {
  try {
    const log = getAutoRepairLog();

    log.push({
      action:
        entry.action ||
        "AUTO_REPAIR",
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

    return saveAutoRepairLog(log);
  } catch (err) {
    if (
      typeof logCritical ===
      "function"
    ) {
      logCritical(
        "AUTO_REPAIR_LOG_RECORD_FAILED: " +
          err.message
      );
    }

    return false;
  }
}

// ========================================
// MAIN AUTO REPAIR
// ========================================
function runAutoRepair() {
  try {
    // Verify required APIs
    if (
      typeof runFinancialIntegrityCheck !==
        "function" ||
      typeof replayFullSystem !==
        "function"
    ) {
      const result = {
        repaired: false,
        reason:
          "DEPENDENCIES_MISSING",
        timestamp: Date.now()
      };

      addAutoRepairLog({
        success: false,
        details: result
      });

      return result;
    }

    // Initial integrity check
    const beforeCheck =
      runFinancialIntegrityCheck();

    // Already healthy
    if (
      beforeCheck &&
      beforeCheck.healthy === true &&
      beforeCheck.certified === true
    ) {
      const result = {
        repaired: true,
        reason:
          "NO_REPAIR_NEEDED",
        beforeCheck,
        afterCheck: beforeCheck,
        timestamp: Date.now()
      };

      addAutoRepairLog({
        success: true,
        details: result
      });

      return result;
    }

    // Execute full replay rebuild
    const replayResult =
      replayFullSystem();

    // Re-run integrity check
    const afterCheck =
      runFinancialIntegrityCheck();

    const success =
      !!(
        replayResult &&
        afterCheck &&
        afterCheck.healthy === true &&
        afterCheck.certified === true
      );

    const result = {
      repaired: success,
      reason: success
        ? "REPAIR_SUCCESSFUL"
        : "REPAIR_FAILED",
      beforeCheck,
      replayResult,
      afterCheck,
      timestamp: Date.now()
    };

    addAutoRepairLog({
      success,
      details: {
        reason: result.reason
      }
    });

    return result;
  } catch (err) {
    addAutoRepairLog({
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
        "AUTO_REPAIR_FAILED: " +
          err.message
      );
    }

    return {
      repaired: false,
      reason: err.message,
      timestamp: Date.now()
    };
  }
}

// ========================================
// SIMPLE API
// ========================================
function isAutoRepairSuccessful() {
  const result = runAutoRepair();

  return (
    result &&
    result.repaired === true
  );
}

// ========================================
// STATUS API
// ========================================
function getAutoRepairStatus() {
  const log = getAutoRepairLog();

  return {
    active: true,
    totalRepairs: log.length,
    storageKey: AUTO_REPAIR_LOG_KEY,
    financialIntegrityAvailable:
      typeof runFinancialIntegrityCheck ===
      "function",
    replayAvailable:
      typeof replayFullSystem ===
      "function"
  };
}

// ========================================
// GLOBAL EXPORTS
// ========================================
window.getAutoRepairLog =
  getAutoRepairLog;

window.addAutoRepairLog =
  addAutoRepairLog;

window.runAutoRepair =
  runAutoRepair;

window.isAutoRepairSuccessful =
  isAutoRepairSuccessful;

window.getAutoRepairStatus =
  getAutoRepairStatus;

window.__AUTO_REPAIR_ENGINE_ACTIVE__ =
  true;
