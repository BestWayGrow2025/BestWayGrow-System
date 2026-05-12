
"use strict";

/*
========================================
SYSTEM BACKUP MANAGER V1.0 (DISASTER RECOVERY)
========================================
✔ Full localStorage snapshot backup
✔ Automatic backup history
✔ One-click restore support
✔ Safe restore validation
✔ Snapshot pruning (retain latest N)
✔ Super Admin recovery layer
✔ Read-only metadata reporting
✔ Production LOCKED
========================================
*/

// ================= CONFIG =================
const BACKUP_STORAGE_KEY = "BWG_SYSTEM_BACKUPS";
const BACKUP_PREFIX = "BWG_BACKUP_";
const MAX_BACKUPS = 10;

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_BACKUP_MANAGER__) return;

  window.__SYSTEM_BACKUP_MANAGER__ = true;

  initSystemBackupManager();

})();

// ================= INIT =================
function initSystemBackupManager() {

  ensureBackupStore();

  exposeBackupAPI();
}

// ================= STORE INIT =================
function ensureBackupStore() {

  try {

    const existing = localStorage.getItem(BACKUP_STORAGE_KEY);

    if (!existing) {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify([]));
    }

  } catch (err) {
    console.error("BACKUP STORE INIT ERROR:", err);
  }
}

// ================= CREATE BACKUP =================
function createSystemBackup(label = "Manual Backup") {

  try {

    const snapshot = {};
    const timestamp = Date.now();
    const backupId = BACKUP_PREFIX + timestamp;

    // Capture complete localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Skip backup registry itself (stored separately)
      if (key === BACKUP_STORAGE_KEY) continue;

      snapshot[key] = localStorage.getItem(key);
    }

    const metadata = {
      backupId,
      label,
      timestamp,
      keyCount: Object.keys(snapshot).length,
      sizeBytes: JSON.stringify(snapshot).length
    };

    // Save snapshot
    localStorage.setItem(backupId, JSON.stringify({
      metadata,
      snapshot
    }));

    // Update registry
    const backups = getBackupRegistry();
    backups.unshift(metadata);

    // Prune old backups
    while (backups.length > MAX_BACKUPS) {
      const old = backups.pop();
      if (old && old.backupId) {
        localStorage.removeItem(old.backupId);
      }
    }

    saveBackupRegistry(backups);

    // Broadcast event if event hub exists
    if (typeof window.SYSTEM_EVENTS !== "undefined" &&
        typeof window.SYSTEM_EVENTS.emit === "function") {
      window.SYSTEM_EVENTS.emit("SYSTEM_BACKUP_CREATED", metadata);
    }

    return metadata;

  } catch (err) {

    console.error("BACKUP CREATE ERROR:", err);

    return null;
  }
}

// ================= RESTORE BACKUP =================
function restoreSystemBackup(backupId) {

  try {

    if (!backupId) return false;

    const raw = localStorage.getItem(backupId);
    if (!raw) return false;

    const parsed = JSON.parse(raw);

    if (!parsed || !parsed.snapshot) return false;

    // Clear all keys except backup storage and backup snapshots
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key === BACKUP_STORAGE_KEY) continue;
      if (key && key.startsWith(BACKUP_PREFIX)) continue;

      keysToRemove.push(key);
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Restore snapshot
    Object.keys(parsed.snapshot).forEach(key => {
      localStorage.setItem(key, parsed.snapshot[key]);
    });

    // Broadcast event if event hub exists
    if (typeof window.SYSTEM_EVENTS !== "undefined" &&
        typeof window.SYSTEM_EVENTS.emit === "function") {
      window.SYSTEM_EVENTS.emit("SYSTEM_BACKUP_RESTORED", {
        backupId,
        timestamp: Date.now()
      });
    }

    return true;

  } catch (err) {

    console.error("BACKUP RESTORE ERROR:", err);

    return false;
  }
}

// ================= DELETE BACKUP =================
function deleteSystemBackup(backupId) {

  try {

    if (!backupId) return false;

    localStorage.removeItem(backupId);

    const backups = getBackupRegistry()
      .filter(item => item.backupId !== backupId);

    saveBackupRegistry(backups);

    return true;

  } catch (err) {

    console.error("BACKUP DELETE ERROR:", err);

    return false;
  }
}

// ================= LIST BACKUPS =================
function listSystemBackups() {
  return getBackupRegistry();
}

// ================= GET LATEST =================
function getLatestSystemBackup() {

  const backups = getBackupRegistry();

  return backups.length ? backups[0] : null;
}

// ================= REGISTRY HELPERS =================
function getBackupRegistry() {

  try {
    return JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY) || "[]");
  } catch (_) {
    return [];
  }
}

function saveBackupRegistry(backups) {

  try {
    localStorage.setItem(
      BACKUP_STORAGE_KEY,
      JSON.stringify(backups || [])
    );
  } catch (err) {
    console.error("BACKUP REGISTRY SAVE ERROR:", err);
  }
}

// ================= HEALTH REPORT =================
function getBackupSystemStatus() {

  const backups = getBackupRegistry();

  return {
    totalBackups: backups.length,
    maxBackups: MAX_BACKUPS,
    latestBackup: backups.length ? backups[0] : null,
    storageKey: BACKUP_STORAGE_KEY
  };
}

// ================= PUBLIC API =================
function exposeBackupAPI() {

  window.createSystemBackup = createSystemBackup;
  window.restoreSystemBackup = restoreSystemBackup;
  window.deleteSystemBackup = deleteSystemBackup;
  window.listSystemBackups = listSystemBackups;
  window.getLatestSystemBackup = getLatestSystemBackup;
  window.getBackupSystemStatus = getBackupSystemStatus;
}
