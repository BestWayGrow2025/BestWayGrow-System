    "use strict";

/*
========================================
SYSTEM CONTROL CENTER V1.0 (MASTER ORCHESTRATOR)
========================================
✔ Unifies all system modules
✔ Event Hub + Diagnostics + Backup + Audit + Health
✔ Central monitoring brain
✔ Real-time system coordination layer
✔ Safe read-only orchestration
✔ No business logic override (ONLY monitoring/control signals)
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
}

// ================= SIGNAL REGISTRY =================
function bindSystemSignals() {

  const hub = window.SYSTEM_EVENTS;

  if (!hub) return;

  hub.on("PIN_REQUEST_EVENT", logSignal);
  hub.on("PAYOUT_EVENT", logSignal);
  hub.on("BANK_UPDATE", logSignal);
  hub.on("BANK_DEBIT", logSignal);
  hub.on("BANK_CREDIT", logSignal);

  hub.on("SYSTEM_FAILURE", alertSignal);
  hub.on("SYSTEM_WARNING", warnSignal);
}

// ================= CONTROL LOOP =================
let CONTROL_TIMER = null;

function startControlLoop() {

  if (CONTROL_TIMER) clearInterval(CONTROL_TIMER);

  CONTROL_TIMER = setInterval(() => {

    runHealthCheck();
    runDependencyCheck();
    runSystemSnapshot();

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
}

// ================= DEPENDENCY CHECK =================
function runDependencyCheck() {

  const required = [
    "SYSTEM_EVENTS",
    "__SYSTEM_DIAGNOSTICS__",
    "__PIN_LIVE_ORCHESTRATOR__"
  ];

  const missing = required.filter(r => !window[r]);

  if (missing.length > 0) {
    emitWarning("Missing Modules: " + missing.join(", "));
  }
}

// ================= SNAPSHOT =================
function runSystemSnapshot() {

  window.__SYSTEM_SNAPSHOT__ = {
    time: Date.now(),
    eventHub: !!window.SYSTEM_EVENTS,
    diagnostics: !!window.__SYSTEM_DIAGNOSTICS__,
    backup: !!window.__SYSTEM_BACKUP_MANAGER__,
    audit: !!window.__SYSTEM_AUDIT_TRAIL__,
    health: window.collectSystemHealth ? window.collectSystemHealth() : null
  };
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

// ================= EMITTER HELPERS =================
function emitAlert(msg) {

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("SYSTEM_ALERT", { msg, level: "CRITICAL" });
  }
}

function emitWarning(msg) {

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("SYSTEM_ALERT", { msg, level: "WARNING" });
  }
}

// ================= GLOBAL ACCESS =================
window.runSystemSnapshot = runSystemSnapshot;
window.initControlCenter = initControlCenter;
