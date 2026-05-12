"use strict";

/*
========================================
SYSTEM HEALTH DASHBOARD V1.0 (CONTROL ROOM UI)
========================================
✔ Real-time system health overview
✔ Aggregates Diagnostics + Event Hub + Recovery state
✔ Live module status monitoring
✔ Super Admin control dashboard
✔ No backend dependency required
✔ Read-only SAFE visualization layer
========================================
*/

// ================= GUARD =================
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

// ================= CORE HEALTH ENGINE =================
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
    diagnostics: check(window.__SYSTEM_DIAGNOSTICS__),
    recovery: check(window.__SYSTEM_RECOVERY__),
    backup: check(window.__SYSTEM_BACKUP_MANAGER__),
    audit: check(window.__SYSTEM_AUDIT_TRAIL__),
    pin: check(window.__PIN_LIVE_ORCHESTRATOR__),
    wallet: check(window.walletSystem),
    payout: check(window.payoutController),

    overall: computeOverallStatus(),
    statusColor: computeColor()
  };
}

// ================= STATUS CHECK =================
function check(module) {

  if (!module) return "❌ MISSING";

  return "✅ ACTIVE";
}

// ================= OVERALL STATUS =================
function computeOverallStatus() {

  const modules = [
    window.SYSTEM_EVENTS,
    window.__SYSTEM_RECOVERY__,
    window.__PIN_LIVE_ORCHESTRATOR__
  ];

  const missing = modules.filter(m => !m);

  if (missing.length === 0) return "HEALTHY";
  if (missing.length < 2) return "DEGRADED";

  return "CRITICAL";
}

// ================= COLOR STATUS =================
function computeColor() {

  const status = computeOverallStatus();

  switch (status) {

    case "HEALTHY":
      return "green";

    case "DEGRADED":
      return "orange";

    case "CRITICAL":
      return "red";

    default:
      return "gray";
  }
}

// ================= EXPORT =================
window.renderHealthDashboard = renderDashboard;
window.collectSystemHealth = collectSystemHealth;
