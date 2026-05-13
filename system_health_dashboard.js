"use strict";

/*
========================================
SYSTEM HEALTH DASHBOARD V1.0 (CONTROL ROOM UI)
========================================
✔ Real-time system health overview
✔ Aggregates system module flags
✔ Live monitoring
✔ Read-only visualization layer
========================================
*/

(function () {

  if (window.__SYSTEM_HEALTH_DASHBOARD__) return;
  window.__SYSTEM_HEALTH_DASHBOARD__ = true;

  document.addEventListener("DOMContentLoaded", initHealthDashboard);

})();

// ================= INIT =================
function initHealthDashboard() {

  const panel = document.getElementById("systemHealthPanel");
  if (!panel) return;

  renderDashboard();
  startLiveHealthSync();
}

// ================= LIVE SYNC =================
let HEALTH_TIMER = null;

function startLiveHealthSync() {

  if (HEALTH_TIMER) clearInterval(HEALTH_TIMER);
  HEALTH_TIMER = setInterval(renderHealthData, 4000);
}

// ================= DASHBOARD UI =================
function renderDashboard() {

  const panel = document.getElementById("systemHealthPanel");
  if (!panel) return;

  panel.innerHTML = `
    <h3>🩺 SYSTEM HEALTH DASHBOARD</h3>
    <div id="healthContent">Loading system status...</div>
  `;

  renderHealthData();
}

// ================= HEALTH RENDER =================
function renderHealthData() {

  const el = document.getElementById("healthContent");
  if (!el) return;

  const health = collectSystemHealth();

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">

      <div><b>Event Hub:</b> ${health.eventHub}</div>
      <div><b>Diagnostics:</b> ${health.diagnostics}</div>

      <div><b>Recovery:</b> ${health.recovery}</div>
      <div><b>Backup System:</b> ${health.backup}</div>

      <div><b>Audit Trail:</b> ${health.audit}</div>
      <div><b>PIN System:</b> ${health.pin}</div>

      <div><b>Wallet System:</b> ${health.wallet}</div>
      <div><b>Payout System:</b> ${health.payout}</div>

    </div>

    <hr/>

    <b>System Status:</b>
    <span style="color:${health.statusColor};font-weight:bold;">
      ${health.overall}
    </span>
  `;
}

// ================= HEALTH COLLECTOR =================
function collectSystemHealth() {

  return {
    eventHub: check(window.SYSTEM_EVENTS),
    diagnostics: check(window.runDiagnostics),

    recovery: check(window.__RECOVERY_ENGINE_ACTIVE__),
    backup: check(window.__BACKUP_SYSTEM_ACTIVE__),
    audit: check(window.__AUDIT_TRAIL_ACTIVE__),

    pin: check(window.PIN_EVENT_BUS),

    wallet: check(window.__WALLET_SYSTEM_ACTIVE__),
    payout: check(window.__PAYOUT_SYSTEM_ACTIVE__),

    overall: computeOverallStatus(),
    statusColor: computeColor()
  };
}

// ================= STATUS CHECK =================
function check(module) {
  return module ? "✅ ACTIVE" : "❌ MISSING";
}

// ================= OVERALL STATUS =================
function computeOverallStatus() {

  const criticalModules = [
    window.SYSTEM_EVENTS,
    window.runDiagnostics,
    window.__RECOVERY_ENGINE_ACTIVE__,
    window.PIN_EVENT_BUS,
    window.__WALLET_SYSTEM_ACTIVE__,
    window.__PAYOUT_SYSTEM_ACTIVE__
  ];

  const missingCount = criticalModules.filter(m => !m).length;

  if (missingCount === 0) return "HEALTHY";
  if (missingCount <= 2) return "DEGRADED";

  return "CRITICAL";
}

// ================= COLOR =================
function computeColor() {

  const status = computeOverallStatus();

  if (status === "HEALTHY") return "green";
  if (status === "DEGRADED") return "orange";
  return "red";
}

// ================= EXPORT =================
window.renderHealthDashboard = renderDashboard;
window.collectSystemHealth = collectSystemHealth;
