"use strict";

/*
========================================
SYSTEM DIAGNOSTICS V1.0 (HEALTH MONITOR)
========================================
✔ Enterprise system health monitoring
✔ Module presence verification
✔ Event hub validation
✔ Live diagnostics dashboard
✔ Missing module detection
✔ Runtime status overview
✔ Safe read-only monitoring
✔ Production LOCKED
========================================
*/

// ================= CONFIG =================
const DIAGNOSTIC_INTERVAL = 5000;
let DIAGNOSTIC_TIMER = null;

// ================= MODULE REGISTRY =================
const DIAGNOSTIC_MODULES = [
  // Core
  "SYSTEM_EVENTS",
  "onSystemEvent",

  // PIN
  "routePinRequest",
  "handlePinAction",
  "PIN_EVENT_BUS",

  // Event Bridges
  "broadcastUpgradeEvent",
  "broadcastWalletEvent",
  "broadcastIncomeEvent",
  "broadcastPayoutEvent",

  // Tree
  "getTreeData",

  // Session
  "getCurrentUser"
];

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_DIAGNOSTICS__) return;

  window.__SYSTEM_DIAGNOSTICS__ = true;

  document.addEventListener("DOMContentLoaded", initSystemDiagnostics);

})();

// ================= INIT =================
function initSystemDiagnostics() {

  const panel = document.getElementById("eventMonitorPanel");
  if (!panel) return;

  renderDiagnostics();
  startDiagnosticsLoop();
  bindEventMonitoring();
}

// ================= LOOP =================
function startDiagnosticsLoop() {

  if (DIAGNOSTIC_TIMER) clearInterval(DIAGNOSTIC_TIMER);

  DIAGNOSTIC_TIMER = setInterval(renderDiagnostics, DIAGNOSTIC_INTERVAL);
}

// ================= EVENT MONITOR =================
function bindEventMonitoring() {

  if (typeof window.onSystemEvent !== "function") return;

  const importantEvents = [
    "PIN_EVENT",
    "PIN_REQUEST_EVENT",
    "PIN_ROUTE_EVENT",
    "UPGRADE_EVENT",
    "WALLET_EVENT",
    "INCOME_EVENT",
    "PAYOUT_EVENT",
    "BANK_UPDATE"
  ];

  importantEvents.forEach(eventName => {
    try {
      window.onSystemEvent(eventName, function () {
        updateLastEvent(eventName);
      });
    } catch (_) {}
  });
}

// ================= LAST EVENT =================
function updateLastEvent(eventName) {

  window.__LAST_SYSTEM_EVENT__ = {
    name: eventName,
    timestamp: Date.now()
  };

  renderDiagnostics();
}

// ================= MAIN RENDER =================
function renderDiagnostics() {

  const panel = document.getElementById("eventMonitorPanel");
  if (!panel) return;

  const report = runDiagnostics();

  panel.innerHTML = `
    <h3>🩺 SYSTEM DIAGNOSTICS</h3>

    <p><strong>Overall Health:</strong>
      ${report.overallHealthy ? "✅ HEALTHY" : "⚠️ ATTENTION REQUIRED"}
    </p>

    <p><strong>Modules Loaded:</strong>
      ${report.loadedCount} / ${report.totalCount}
    </p>

    <p><strong>Missing Modules:</strong>
      ${report.missing.length ? report.missing.join(", ") : "None"}
    </p>

    <p><strong>System Event Hub:</strong>
      ${report.eventHubReady ? "✅ ACTIVE" : "❌ NOT AVAILABLE"}
    </p>

    <p><strong>PIN Live System:</strong>
      ${report.pinLiveReady ? "✅ ACTIVE" : "❌ NOT AVAILABLE"}
    </p>

    <p><strong>Last Event:</strong>
      ${report.lastEvent}
    </p>

    <p><strong>Last Check:</strong>
      ${new Date().toLocaleString()}
    </p>
  `;
}

// ================= DIAGNOSTIC ENGINE =================
function runDiagnostics() {

  const missing = [];

  DIAGNOSTIC_MODULES.forEach(name => {
    if (typeof window[name] === "undefined") {
      missing.push(name);
    }
  });

  const eventHubReady =
    typeof window.SYSTEM_EVENTS !== "undefined" &&
    typeof window.onSystemEvent === "function";

  const pinLiveReady =
    typeof window.PIN_EVENT_BUS !== "undefined" ||
    typeof window.broadcastPinUpdate === "function";

  const lastEventInfo = window.__LAST_SYSTEM_EVENT__;

  let lastEvent = "No events yet";

  if (lastEventInfo) {
    lastEvent =
      `${lastEventInfo.name} @ ${new Date(lastEventInfo.timestamp).toLocaleTimeString()}`;
  }

  return {
    totalCount: DIAGNOSTIC_MODULES.length,
    loadedCount: DIAGNOSTIC_MODULES.length - missing.length,
    missing,
    eventHubReady,
    pinLiveReady,
    overallHealthy: missing.length === 0,
    lastEvent
  };
}

// ================= PUBLIC API =================
window.runSystemDiagnostics = runDiagnostics;
window.renderSystemDiagnostics = renderDiagnostics;
window.startSystemDiagnostics = startDiagnosticsLoop;

