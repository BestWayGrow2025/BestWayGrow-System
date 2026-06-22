"use strict";

/*
========================================
SYSTEM BACKUP PANEL V1.0 (ADMIN UI)
========================================
✔ Visual backup management interface
✔ Create backup
✔ Restore backup
✔ Delete backup
✔ View backup history
✔ Status summary
✔ Super Admin operational panel
✔ Production LOCKED
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_BACKUP_PANEL__) return;

  window.__SYSTEM_BACKUP_PANEL__ = true;

  document.addEventListener("DOMContentLoaded", initSystemBackupPanel);

})();

// ================= INIT =================
function initSystemBackupPanel() {

  // Auto-render only if dedicated container exists
  const panel = document.getElementById("systemBackupPanel");

  if (!panel) return;

  renderSystemBackupPanel("systemBackupPanel");
}

// ================= RENDER PANEL =================
function renderSystemBackupPanel(containerId = "systemBackupPanel") {

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <h3>💾 SYSTEM BACKUP MANAGER</h3>

    <div style="margin-bottom:15px;">
      <button onclick="SYSTEM_BACKUP_UI.create()">
        ➕ Create Backup
      </button>

      <button onclick="SYSTEM_BACKUP_UI.refresh()" style="margin-left:10px;">
        🔄 Refresh
      </button>
    </div>

    <div id="backupStatusBox" style="margin-bottom:20px;"></div>

    <div id="backupListBox"></div>
  `;

  SYSTEM_BACKUP_UI.refresh();
}

// ================= UI CONTROLLER =================
const SYSTEM_BACKUP_UI = {

  // ---------- CREATE ----------
  create() {

    try {

      const label = prompt(
        "Enter backup label:",
        "Manual Backup " + new Date().toLocaleString()
      );

      if (label === null) return;

      const result = window.createSystemBackup
        ? window.createSystemBackup(label)
        : null;

      if (result) {
        alert("Backup created successfully.");
      } else {
        alert("Backup creation failed.");
      }

      this.refresh();

    } catch (err) {

      console.error("BACKUP UI CREATE ERROR:", err);

      alert("Backup creation failed.");
    }
  },

  // ---------- RESTORE ----------
  restore(backupId) {

    try {

      const confirmed = confirm(
        "Restore this backup?\n\nCurrent data will be replaced."
      );

      if (!confirmed) return;

      const success = window.restoreSystemBackup
        ? window.restoreSystemBackup(backupId)
        : false;

      if (success) {
        alert(
          "Backup restored successfully.\n\nPlease reload the page."
        );
      } else {
        alert("Backup restore failed.");
      }

    } catch (err) {

      console.error("BACKUP UI RESTORE ERROR:", err);

      alert("Backup restore failed.");
    }
  },

  // ---------- DELETE ----------
  remove(backupId) {

    try {

      const confirmed = confirm(
        "Delete this backup permanently?"
      );

      if (!confirmed) return;

      const success = window.deleteSystemBackup
        ? window.deleteSystemBackup(backupId)
        : false;

      if (success) {
        alert("Backup deleted.");
      } else {
        alert("Backup deletion failed.");
      }

      this.refresh();

    } catch (err) {

      console.error("BACKUP UI DELETE ERROR:", err);

      alert("Backup deletion failed.");
    }
  },

  // ---------- REFRESH ----------
  refresh() {

    this.renderStatus();
    this.renderList();
  },

  // ---------- STATUS ----------
  renderStatus() {

    const box = document.getElementById("backupStatusBox");
    if (!box) return;

    const status = window.getBackupSystemStatus
      ? window.getBackupSystemStatus()
      : null;

    if (!status) {
      box.innerHTML = `
        <p>⚠️ Backup manager not available.</p>
      `;
      return;
    }

    box.innerHTML = `
      <div style="
        background:#f8f9fa;
        padding:12px;
        border-radius:8px;
        border:1px solid #ddd;
      ">
        <strong>Total Backups:</strong> ${status.totalBackups}<br>
        <strong>Maximum Retained:</strong> ${status.maxBackups}<br>
        <strong>Latest Backup:</strong>
        ${
          status.latestBackup
            ? new Date(status.latestBackup.timestamp).toLocaleString()
            : "None"
        }
      </div>
    `;
  },

  // ---------- LIST ----------
  renderList() {

    const box = document.getElementById("backupListBox");
    if (!box) return;

    const backups = window.listSystemBackups
      ? window.listSystemBackups()
      : [];

    if (!backups.length) {
      box.innerHTML = `
        <p>No backups available.</p>
      `;
      return;
    }

    let html = `
      <table border="1" width="100%" style="border-collapse:collapse;">
        <tr>
          <th>Label</th>
          <th>Date</th>
          <th>Keys</th>
          <th>Size (KB)</th>
          <th>Actions</th>
        </tr>
    `;

    backups.forEach(item => {

      const sizeKB = (item.sizeBytes / 1024).toFixed(2);

      html += `
        <tr>
          <td>${escapeHtml(item.label || "Unnamed Backup")}</td>
          <td>${new Date(item.timestamp).toLocaleString()}</td>
          <td>${item.keyCount}</td>
          <td>${sizeKB}</td>
          <td>
            <button onclick="SYSTEM_BACKUP_UI.restore('${item.backupId}')">
              ♻️ Restore
            </button>
            <button
              onclick="SYSTEM_BACKUP_UI.remove('${item.backupId}')"
              style="margin-left:6px;"
            >
              🗑 Delete
            </button>
          </td>
        </tr>
      `;
    });

    html += `</table>`;

    box.innerHTML = html;
  }
};

// ================= SAFE HTML =================
function escapeHtml(value) {

  const div = document.createElement("div");
  div.textContent = String(value || "");
  return div.innerHTML;
}

// ================= EXPORT =================
window.renderSystemBackupPanel = renderSystemBackupPanel;
window.SYSTEM_BACKUP_UI = SYSTEM_BACKUP_UI;

