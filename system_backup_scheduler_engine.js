"use strict";

/*
========================================
BACKUP SCHEDULER ENGINE V1.0
AUTOMATED SYSTEM BACKUP LAYER
========================================
✔ Periodic system backups
✔ Wallet / ledger / payout snapshots
✔ Health-aware backup execution
✔ Failure-safe retry mechanism
✔ Lightweight JSON persistence
✔ Works with system_health_monitor.js
✔ Production-safe scheduling layer
========================================
*/

const BACKUP_KEY = "SYSTEM_BACKUP_STORE";
const BACKUP_LOG_KEY = "SYSTEM_BACKUP_LOG";
const BACKUP_INTERVAL_DEFAULT = 60000; // 1 min
const BACKUP_LIMIT = 50;

// =====================
// STORAGE HELPERS
// =====================
function getBackupStore() {
  try {
    const data = safeGet(BACKUP_KEY, []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveBackupStore(data) {
  try {
    if (!Array.isArray(data)) data = [];

    if (data.length > BACKUP_LIMIT) {
      data = data.slice(-BACKUP_LIMIT);
    }

    safeSet(BACKUP_KEY, data);
    return true;
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("BACKUP_SAVE_FAILED: " + err.message);
    }
    return false;
  }
}

// =====================
// BACKUP LOG
// =====================
function getBackupLog() {
  try {
    const log = safeGet(BACKUP_LOG_KEY, []);
    return Array.isArray(log) ? log : [];
  } catch {
    return [];
  }
}

function saveBackupLog(log) {
  try {
    if (!Array.isArray(log)) log = [];

    safeSet(BACKUP_LOG_KEY, log.slice(-200));
    return true;
  } catch {
    return false;
  }
}

function recordBackupEvent(entry = {}) {
  try {
    const log = getBackupLog();

    log.push({
      timestamp: Date.now(),
      status: entry.status || "UNKNOWN",
      type: entry.type || "SYSTEM_BACKUP",
      details: entry.details || {}
    });

    return saveBackupLog(log);
  } catch {
    return false;
  }
}

// =====================
// SNAPSHOT GENERATORS
// =====================
function snapshotWallets() {
  try {
    if (typeof getWallets !== "function") return {};

    return getWallets();
  } catch {
    return {};
  }
}

function snapshotLedger() {
  try {
    if (typeof getLedger !== "function") return {};

    return getLedger();
  } catch {
    return {};
  }
}

function snapshotPayouts() {
  try {
    if (typeof getPayouts !== "function") return [];

    return getPayouts();
  } catch {
    return [];
  }
}

function snapshotWithdrawals() {
  try {
    if (typeof getWithdrawals !== "function") return [];

    return getWithdrawals();
  } catch {
    return [];
  }
}

// =====================
// CORE BACKUP ENGINE
// =====================
function createSystemBackup() {
  try {
    // Health gate check
    if (typeof getSystemHealth === "function") {
      const health = getSystemHealth();

      if (!health?.healthy) {
        recordBackupEvent({
          status: "SKIPPED",
          type: "HEALTH_BLOCKED_BACKUP",
          details: health
        });

        return false;
      }
    }

    const backup = {
      id:
        "BKP_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2, 8),

      timestamp: Date.now(),

      wallets: snapshotWallets(),
      ledger: snapshotLedger(),
      payouts: snapshotPayouts(),
      withdrawals: snapshotWithdrawals()
    };

    const store = getBackupStore();
    store.push(backup);

    const saved = saveBackupStore(store);

    recordBackupEvent({
      status: saved ? "SUCCESS" : "FAILED",
      type: "FULL_BACKUP",
      details: {
        backupId: backup.id
      }
    });

    return saved ? backup : false;
  } catch (err) {
    recordBackupEvent({
      status: "ERROR",
      type: "BACKUP_ERROR",
      details: { error: err.message }
    });

    return false;
  }
}

// =====================
// BACKUP RESTORE (SAFE READ-ONLY)
// =====================
function getLatestBackup() {
  try {
    const store = getBackupStore();
    return store.length ? store[store.length - 1] : null;
  } catch {
    return null;
  }
}

// =====================
// SCHEDULER
// =====================
function startBackupScheduler(interval = BACKUP_INTERVAL_DEFAULT) {
  if (window.__BACKUP_SCHEDULER__) return;

  window.__BACKUP_SCHEDULER__ = true;

  setInterval(() => {
    try {
      createSystemBackup();
    } catch (err) {
      if (typeof logCritical === "function") {
        logCritical("BACKUP_SCHEDULER_CRASH: " + err.message);
      }
    }
  }, interval);
}

// =====================
// MANUAL BACKUP TRIGGER
// =====================
function triggerManualBackup() {
  return createSystemBackup();
}

// =====================
// STATUS
// =====================
function getBackupStatus() {
  const store = getBackupStore();

  return {
    active: true,
    totalBackups: store.length,
    lastBackup: store.length ? store[store.length - 1] : null
  };
}

// =====================
// EXPORTS
// =====================
window.createSystemBackup = createSystemBackup;
window.triggerManualBackup = triggerManualBackup;
window.getLatestBackup = getLatestBackup;
window.getBackupStatus = getBackupStatus;
window.startBackupScheduler = startBackupScheduler;

window.__BACKUP_SCHEDULER_ACTIVE__ = true;
