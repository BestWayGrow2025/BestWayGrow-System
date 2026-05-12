"use strict";

/*
========================================
SYSTEM CONTROL ROOM UI V1.0 (VISUAL OPS CENTER)
========================================
✔ Live system monitoring dashboard
✔ Connects to Control Center + Event Hub
✔ Real-time health + backup + audit visualization
✔ Admin-level operations room UI
✔ Read-only safe monitoring layer
✔ Production-safe rendering engine
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__SYSTEM_CONTROL_ROOM_UI__) return;

  window.__SYSTEM_CONTROL_ROOM_UI__ = true;

  document.addEventListener("DOMContentLoaded", initControlRoomUI);

})();

// ================= INIT =================
function initControlRoomUI() {

  const container = document.getElementById("systemControlRoomPanel");

  if (!container) return;

  renderUI(container);
  startLiveFeed();
}

// ================= UI RENDER =================
function renderUI(container) {

  container.innerHTML = `
    <div style="padding:15px;">
      <h3>🧠 CONTROL ROOM (LIVE OPS CENTER)</h3>

      <div id="crmHealth"></div>
      <div id="crmEvents"></div>
      <div id="crmBackup"></div>
      <div id="crmAudit"></div>
      <div id="crmAlerts"></div>
    </div>
  `;

  refreshUI();
}

// ================= LIVE LOOP =================
let UI_TIMER = null;

function startLiveFeed() {

  if (UI_TIMER) clearInterval(UI_TIMER);

  UI_TIMER = setInterval(refreshUI, 3000);
}

// ================= REFRESH =================
function refreshUI() {

  renderHealth();
  renderEvents();
  renderBackup();
  renderAudit();
  renderAlerts();
}

// ================= HEALTH =================
function renderHealth() {

  const el = document.getElementById("crmHealth");
  if (!el) return;

  const health = window.collectSystemHealth
    ? window.collectSystemHealth()
    : null;

  el.innerHTML = `
    <h4>🩺 System Health</h4>
    <pre>${JSON.stringify(health || {}, null, 2)}</pre>
  `;
}

// ================= EVENTS =================
function renderEvents() {

  const el = document.getElementById("crmEvents");
  if (!el) return;

  const snapshot = window.__SYSTEM_SNAPSHOT__ || {};

  el.innerHTML = `
    <h4>📡 Live Snapshot</h4>
    <pre>${JSON.stringify(snapshot, null, 2)}</pre>
  `;
}

// ================= BACKUP =================
function renderBackup() {

  const el = document.getElementById("crmBackup");
  if (!el) return;

  el.innerHTML = `
    <h4>💾 Backup Status</h4>
    <div>${window.__SYSTEM_BACKUP_MANAGER__ ? "ACTIVE" : "MISSING"}</div>
  `;
}

// ================= AUDIT =================
function renderAudit() {

  const el = document.getElementById("crmAudit");
  if (!el) return;

  el.innerHTML = `
    <h4>📜 Audit Trail</h4>
    <div>${window.__SYSTEM_AUDIT_TRAIL__ ? "ACTIVE" : "MISSING"}</div>
  `;
}

// ================= ALERTS =================
function renderAlerts() {

  const el = document.getElementById("crmAlerts");
  if (!el) return;

  const hub = window.SYSTEM_EVENTS;

  el.innerHTML = `
    <h4>🚨 System Alerts</h4>
    <div>${hub ? "LISTENING" : "DISCONNECTED"}</div>
  `;
}

// ================= GLOBAL =================
window.refreshControlRoomUI = refreshUI;
window.initControlRoomUI = initControlRoomUI;
