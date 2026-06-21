"use strict";

/*
========================================
SYSTEM REPLAY ENGINE V1.0 (BANK CORE RECOVERY)
========================================
✔ Rebuilds wallet balances from ledger
✔ Detects balance inconsistencies
✔ Restores corrupted wallet state
✔ Audit-grade financial reconstruction
✔ Uses ledger_engine.js as source of truth
✔ Uses wallet_engine.js as state layer
========================================
*/

const REPLAY_AUDIT_KEY = "SYSTEM_REPLAY_AUDIT_LOG";
const REPLAY_AUDIT_LIMIT = 500;

// ========================================
// AUDIT STORAGE
// ========================================
function getReplayAuditLog() {
  try {
    const raw = localStorage.getItem(REPLAY_AUDIT_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReplayAuditLog(log) {
  try {
    const safeLog = Array.isArray(log) ? log : [];

    const trimmed =
      safeLog.length > REPLAY_AUDIT_LIMIT
        ? safeLog.slice(-REPLAY_AUDIT_LIMIT)
        : safeLog;

    localStorage.setItem(
      REPLAY_AUDIT_KEY,
      JSON.stringify(trimmed)
    );

    return true;
  } catch (e) {
    if (typeof logCritical === "function") {
      logCritical(
        "REPLAY_AUDIT_SAVE_FAILED: " + e.message
      );
    }

    return false;
  }
}

function addReplayAudit(entry = {}) {
  try {
    const log = getReplayAuditLog();

    log.push({
      action: entry.action || "REPLAY",
      success: entry.success === true,
      details:
        entry.details &&
        typeof entry.details === "object"
          ? entry.details
          : {},
      timestamp: Date.now()
    });

    return saveReplayAuditLog(log);
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical(
        "REPLAY_AUDIT_RECORD_FAILED: " + err.message
      );
    }

    return false;
  }
}

// ========================================
// BUILD BALANCES FROM LEDGER
// ========================================
function buildBalancesFromLedger() {
  try {
    if (typeof getLedger !== "function") {
      return null;
    }

    const ledger = getLedger();

    if (!ledger || typeof ledger !== "object") {
      return {};
    }

    const balances = {};

    Object.keys(ledger).forEach(function (txId) {
      const tx = ledger[txId];

      if (!tx || !tx.userId) {
        return;
      }

      const amount = Number(tx.amount);

      if (isNaN(amount) || amount <= 0) {
        return;
      }

      if (!balances[tx.userId]) {
        balances[tx.userId] = {
          balance: 0
        };
      }

      balances[tx.userId].balance += amount;
    });

    // Normalize to 2 decimal places
    Object.keys(balances).forEach(function (userId) {
      balances[userId].balance = parseFloat(
        Number(balances[userId].balance).toFixed(2)
      );
    });

    return balances;
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical(
        "BUILD_BALANCES_FAILED: " + err.message
      );
    }

    return null;
  }
}

// ========================================
// PREVIEW REPLAY RESULT
// ========================================
function previewReplay() {
  const balances = buildBalancesFromLedger();

  if (!balances) {
    return null;
  }

  return {
    wallets: balances,
    totalWallets: Object.keys(balances).length,
    generatedAt: Date.now()
  };
}

// ========================================
// EXECUTE FULL REPLAY
// ========================================
function replayFullSystem() {
  try {
    if (typeof saveWallets !== "function") {
      addReplayAudit({
        action: "FULL_REPLAY",
        success: false,
        details: {
          reason: "SAVE_WALLETS_NOT_AVAILABLE"
        }
      });

      return false;
    }

    const balances = buildBalancesFromLedger();

    if (!balances) {
      addReplayAudit({
        action: "FULL_REPLAY",
        success: false,
        details: {
          reason: "LEDGER_BUILD_FAILED"
        }
      });

      return false;
    }

    saveWallets(balances);

    addReplayAudit({
      action: "FULL_REPLAY",
      success: true,
      details: {
        totalWallets: Object.keys(balances).length
      }
    });

    return true;
  } catch (err) {
    addReplayAudit({
      action: "FULL_REPLAY",
      success: false,
      details: {
        error: err.message
      }
    });

    if (typeof logCritical === "function") {
      logCritical(
        "SYSTEM_REPLAY_FAILED: " + err.message
      );
    }

    return false;
  }
}

// ========================================
// VERIFY CURRENT WALLET STATE
// ========================================
function verifyWalletIntegrity() {
  try {
    if (
      typeof getWallets !== "function" ||
      typeof getLedger !== "function"
    ) {
      return {
        valid: false,
        reason: "DEPENDENCIES_MISSING"
      };
    }

    const currentWallets = getWallets();
    const expectedWallets = buildBalancesFromLedger();

    if (!expectedWallets) {
      return {
        valid: false,
        reason: "REPLAY_BUILD_FAILED"
      };
    }

    const mismatches = [];

    const allUsers = new Set([
      ...Object.keys(currentWallets || {}),
      ...Object.keys(expectedWallets || {})
    ]);

    allUsers.forEach(function (userId) {
      const current = Number(
        currentWallets[userId]?.balance || 0
      );

      const expected = Number(
        expectedWallets[userId]?.balance || 0
      );

      if (
        parseFloat(current.toFixed(2)) !==
        parseFloat(expected.toFixed(2))
      ) {
        mismatches.push({
          userId,
          current,
          expected
        });
      }
    });

    return {
      valid: mismatches.length === 0,
      mismatchCount: mismatches.length,
      mismatches,
      checkedAt: Date.now()
    };
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical(
        "WALLET_INTEGRITY_CHECK_FAILED: " + err.message
      );
    }

    return {
      valid: false,
      reason: err.message
    };
  }
}

// ========================================
// STATUS API
// ========================================
function getReplayEngineStatus() {
  const audit = getReplayAuditLog();

  return {
    active: true,
    auditEntries: audit.length,
    storageKey: REPLAY_AUDIT_KEY,
    ledgerAvailable:
      typeof getLedger === "function",
    walletAvailable:
      typeof getWallets === "function" &&
      typeof saveWallets === "function"
  };
}

// ========================================
// GLOBAL EXPORTS
// ========================================
window.getReplayAuditLog =
  getReplayAuditLog;

window.addReplayAudit =
  addReplayAudit;

window.buildBalancesFromLedger =
  buildBalancesFromLedger;

window.previewReplay =
  previewReplay;

window.replayFullSystem =
  replayFullSystem;

window.verifyWalletIntegrity =
  verifyWalletIntegrity;

window.getReplayEngineStatus =
  getReplayEngineStatus;

window.__SYSTEM_REPLAY_ENGINE_ACTIVE__ =
  true;
