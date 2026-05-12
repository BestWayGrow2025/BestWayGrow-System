"use strict";

/*
========================================
SYSTEM AUDIT PANEL V1.0 (ENTERPRISE UI)
========================================
✔ Visual audit trail dashboard
✔ Displays latest system actions
✔ Auto-refresh every 5 seconds
✔ Works with system_audit_trail.js
✔ Read-only monitoring interface
✔ Production-grade Super Admin tool
========================================
*/

// ================= CONFIG =================
const AUDIT_REFRESH_INTERVAL = 5000;
let AUDIT_PANEL_TIMER = null;

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_AUDIT_PANEL__) return;

  window.__SYSTEM_AUDIT_PANEL__ = true;

  document.addEventListener("DOMContentLoaded", initAuditPanel);

})();

// ================= INIT =================
function initAuditPanel() {

  const container = document.getElementById("systemAuditPanel");
  if (!container) return;

  renderAuditPanel();
  startAuditRefresh();
}

// ================= START REFRESH =================
function startAuditRefresh() {

  if (AUDIT_PANEL_TIMER) {
    clearInterval(AUDIT_PANEL_TIMER);
  }

  AUDIT_PANEL_TIMER = setInterval(renderAuditTable, AUDIT_REFRESH_INTERVAL);
}

// ================= PANEL =================
function renderAuditPanel() {

  const container = document.getElementById("systemAuditPanel");
  if (!container) return;

  container.innerHTML = `
    <h3>📜 SYSTEM AUDIT TRAIL</h3>
    <div id="systemAuditTable"></div>
  `;

  renderAuditTable();
}

// ================= TABLE =================
function renderAuditTable() {

  const table = document.getElementById("systemAuditTable");
  if (!table) return;

  const logs =
    typeof window.getSystemAuditLogs === "function"
      ? window.getSystemAuditLogs()
      : [];

  const recent = logs.slice(-50).reverse();

  if (!recent.length) {
    table.innerHTML = `
      <p style="color:#777;">No audit records available.</p>
    `;
    return;
  }

  let html = `
    <table border="1" width="100%" style="border-collapse:collapse;">
      <tr>
        <th>Time</th>
        <th>Event</th>
        <th>Details</th>
      </tr>
  `;

  recent.forEach(log => {

    const time = log.timestamp
      ? new Date(log.timestamp).toLocaleString()
      : "-";

    const event = escapeHtml(log.event || "-");
    const details = escapeHtml(
      JSON.stringify(log.data || {}).slice(0, 200)
    );

    html += `
      <tr>
        <td>${time}</td>
        <td>${event}</td>
        <td>${details}</td>
      </tr>
    `;
  });

  html += `</table>`;

  table.innerHTML = html;
}

// ================= ESCAPE HTML =================
function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ================= EXPORT =================
window.renderAuditPanel = renderAuditPanel;
window.renderAuditTable = renderAuditTable
