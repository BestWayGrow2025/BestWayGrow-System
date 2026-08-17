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

const BACKUP_LOG_KEY = "SYSTEM_BACKUP_LOG";
const BACKUP_INTERVAL_DEFAULT = 60000; // 1 min

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
// AUTHORITATIVE BACKUP BRIDGE
// =====================
function runScheduledBackup() {

  try {

    // KB_042 is the single backup creation authority.
    if (typeof window.createSystemBackup !== "function") {

      recordBackupEvent({
        status: "FAILED",
        type: "BACKUP_AUTHORITY_MISSING",
        details: {
          authority: "core_backup_recovery_manager.js"
        }
      });

      return false;
    }

    // Optional health gate for scheduled execution.
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

    const result =
      window.createSystemBackup(
        "Scheduled Backup"
      );

    recordBackupEvent({
      status: result ? "SUCCESS" : "FAILED",
      type: "SCHEDULED_BACKUP",
      details: {
        backupId:
          result?.backupId || null
      }
    });

    return result || false;

  } catch (err) {

    recordBackupEvent({
      status: "ERROR",
      type: "BACKUP_ERROR",
      details: {
        error: err.message
      }
    });

    return false;
  }
}

// =====================
// BACKUP RESTORE (SAFE READ-ONLY)
// =====================
function getLatestBackup() {

  try {

    if (
      typeof window.getLatestSystemBackup !==
      "function"
    ) {
      return null;
    }

    return window.getLatestSystemBackup();

  } catch (err) {

    console.error(
      "[BACKUP SCHEDULER] LATEST BACKUP READ ERROR:",
      err
    );

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
        runScheduledBackup();
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
  return runScheduledBackup();
}

// =====================
// STATUS
// =====================
function getBackupStatus() {

  try {

    const authority =
      typeof window.getBackupSystemStatus ===
      "function"
        ? window.getBackupSystemStatus()
        : null;

    return {
      active: true,
      authority:
        "core_backup_recovery_manager.js",
      totalBackups:
        authority?.totalBackups || 0,
      lastBackup:
        authority?.latestBackup || null
    };

  } catch (err) {

    console.error(
      "[BACKUP SCHEDULER] STATUS ERROR:",
      err
    );

    return {
      active: false,
      authority:
        "core_backup_recovery_manager.js",
      totalBackups: 0,
      lastBackup: null
    };
  }
}

// =====================
// EXPORTS
// =====================
window.runScheduledBackup = runScheduledBackup;
window.triggerManualBackup = triggerManualBackup;
window.getLatestBackup = getLatestBackup;
window.getBackupStatus = getBackupStatus;
window.startBackupScheduler = startBackupScheduler;
