"use strict";

/*
========================================
SYSTEM CONTROL CENTER V2.0 (MASTER ORCHESTRATOR)
========================================
✔ Unified system observability layer
✔ Event Hub integration
✔ Diagnostics + Health + Recovery + Backup + Audit
✔ Real-time snapshot engine
✔ SLC + Governor readiness
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__SYSTEM_CONTROL_CENTER__) return;

  window.__SYSTEM_CONTROL_CENTER__ = true;

  document.addEventListener("DOMContentLoaded", initControlCenter);

})();

// ================= INIT =================
function initControlCenter() {

  if (!window.SYSTEM_EVENTS) {
    console.warn("CONTROL CENTER: Event Hub missing");
    return;
  }

  bindSystemSignals();
  startControlLoop();

  // IMPORTANT: wire event hub
  wireControlCenterToEventHub();

  // SLC connection
  connectToSLC();
}

// ================= SIGNAL REGISTRY =================
function bindSystemSignals() {

  const hub = window.SYSTEM_EVENTS;
  if (!hub) return;

  hub.on("PIN_REQUEST_EVENT", logSignal);
  hub.on("PIN_ROUTE_EVENT", logSignal);
  hub.on("PAYOUT_EVENT", logSignal);
  hub.on("BANK_UPDATE", logSignal);
  hub.on("BANK_DEBIT", logSignal);
  hub.on("BANK_CREDIT", logSignal);

  hub.on("SYSTEM_FAILURE", alertSignal);
  hub.on("SYSTEM_WARNING", warnSignal);
  hub.on("SYSTEM_RECOVERY", logSignal);

  hub.on("AUDIT_EVENT", logSignal);
  hub.on("DIAGNOSTIC_EVENT", logSignal);
}

// ================= EVENT HUB WIRING =================
function wireControlCenterToEventHub() {

  if (!window.SYSTEM_EVENTS) return;

  window.SYSTEM_EVENTS.on("SYSTEM_ALERT", (data) => {
    console.warn("CONTROL CENTER ALERT:", data);
  });

  window.SYSTEM_EVENTS.on("RECOVERY_SUCCESS", (data) => {
    console.log("CONTROL CENTER RECOVERY OK:", data);
  });
}

// ================= CONTROL LOOP =================
let CONTROL_TIMER = null;

function startControlLoop() {

  if (CONTROL_TIMER) clearInterval(CONTROL_TIMER);

  CONTROL_TIMER = setInterval(() => {

    runHealthCheck();
    runDependencyCheck();
    runSystemSnapshot();
    runRecoveryCheck();

  }, 5000);
}

// ================= HEALTH CHECK =================
function runHealthCheck() {

  const health = window.collectSystemHealth
    ? window.collectSystemHealth()
    : null;

  if (!health) return;

  if (health.overall === "CRITICAL") {
    emitAlert("CRITICAL SYSTEM STATE DETECTED");
  }

  if (health.overall === "WARNING") {
    emitWarning("SYSTEM HEALTH WARNING STATE");
  }
}

// ================= DEPENDENCY CHECK =================
function runDependencyCheck() {

  const required = [
    "SYSTEM_EVENTS",
    "__SYSTEM_DIAGNOSTICS__",
    "__PIN_LIVE_ORCHESTRATOR__",
    "__SYSTEM_BACKUP_MANAGER__",
    "__SYSTEM_AUDIT_TRAIL__",
    "collectSystemHealth",
    "runRecoveryCheck"
  ];

  const missing = required.filter(r => !window[r]);

  if (missing.length > 0) {
    emitWarning("Missing Modules: " + missing.join(", "));
  }
}

// ================= RECOVERY CHECK =================
function runRecoveryCheck() {

  if (typeof window.runSystemRecovery === "function") {
    try {
      window.runSystemRecovery();
    } catch (e) {
      emitAlert("Recovery system failure detected");
    }
  }
}

// ================= SNAPSHOT ENGINE =================
function runSystemSnapshot() {

  window.__SYSTEM_SNAPSHOT__ = {
    time: Date.now(),

    eventHub: !!window.SYSTEM_EVENTS,
    diagnostics: !!window.__SYSTEM_DIAGNOSTICS__,
    backup: !!window.__SYSTEM_BACKUP_MANAGER__,
    audit: !!window.__SYSTEM_AUDIT_TRAIL__,
    health: typeof window.collectSystemHealth === "function"
      ? window.collectSystemHealth()
      : null,

    recovery: typeof window.runSystemRecovery === "function"
      ? true
      : false
  };

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("CONTROL_SNAPSHOT", window.__SYSTEM_SNAPSHOT__);
  }
}

// ================= SIGNAL HANDLERS =================
function logSignal(data) {
  console.log("📡 CONTROL SIGNAL:", data);
}

function alertSignal(data) {
  console.error("🚨 SYSTEM ALERT:", data);
}

function warnSignal(data) {
  console.warn("⚠️ SYSTEM WARNING:", data);
}

// ================= ALERT HELPERS =================
function emitAlert(msg) {
  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("SYSTEM_ALERT", {
      msg,
      level: "CRITICAL",
      time: Date.now()
    });
  }
}

function emitWarning(msg) {
  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("SYSTEM_ALERT", {
      msg,
      level: "WARNING",
      time: Date.now()
    });
  }
}

// ================= SLC CONNECTION =================
function connectToSLC() {

  if (window.SystemLayerController) {
    window.SystemLayerController.setMode("NORMAL");
    console.log("CONTROL CENTER: Connected to SLC");
  }
}

// ================= GLOBAL ACCESS =================
window.runSystemSnapshot = runSystemSnapshot;
window.initControlCenter = initControlCenter;
