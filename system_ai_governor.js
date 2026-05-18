"use strict";

/*
========================================
AI GOVERNOR CORE (TOP LAYER)
========================================
✔ Controls system behavior
✔ Enforces safety rules
✔ Snapshot-based decision engine
========================================
*/

(function () {

  if (window.__AI_GOVERNOR__) return;

  window.__AI_GOVERNOR__ = true;

  document.addEventListener("DOMContentLoaded", initGovernor);

})();

// ================= INIT =================
function initGovernor() {

  console.log("[AI GOVERNOR] INITIALIZED");

  if (!window.SYSTEM_EVENTS) {
    console.warn("[GOVERNOR] Event Hub missing");
    return;
  }

  bindGovernorSignals();
  startGovernorLoop();
}

// ================= SIGNAL BIND =================
function bindGovernorSignals() {

  const hub = window.SYSTEM_EVENTS;

  hub.on("SYSTEM_ALERT", evaluateRisk);
  hub.on("SYSTEM_FAILURE", evaluateRisk);
  hub.on("SYSTEM_WARNING", evaluateRisk);
  hub.on("CONTROL_SNAPSHOT", handleSnapshot);
}

// ================= SNAPSHOT HANDLER =================
function handleSnapshot(snapshot) {

  if (!snapshot) return;

  const health = snapshot.health?.overall;

  if (health === "CRITICAL") {

    console.warn("[GOVERNOR] CRITICAL → SYSTEM THROTTLE");

    if (window.SystemOSMode) {
      window.SystemOSMode.setMode("FROZEN");
    }

    if (window.SYSTEM_EVENTS) {
      window.SYSTEM_EVENTS.emit("GOVERNOR_ACTION", {
        type: "THROTTLE",
        reason: "CRITICAL_HEALTH",
        time: Date.now()
      });
    }
  }

  if (health === "WARNING") {

    console.warn("[GOVERNOR] WARNING → MONITOR MODE");

    if (window.SystemOSMode) {
      window.SystemOSMode.setMode("MONITOR");
    }
  }
}

// ================= LOOP =================
let GOV_TIMER = null;

function startGovernorLoop() {

  GOV_TIMER = setInterval(() => {

    const snapshot = window.__SYSTEM_SNAPSHOT__;
    if (!snapshot) return;

    if (snapshot.health?.overall === "CRITICAL") {
      triggerFreeze("CRITICAL STATE DETECTED");
    }

  }, 60000);
}

// ================= RISK =================
function evaluateRisk(data) {

  if (!data) return;

  console.warn("[GOVERNOR] RISK CHECK:", data);

  if (data.level === "CRITICAL") {
    triggerFreeze("CRITICAL EVENT");
  }
}

// ================= FREEZE =================
function triggerFreeze(reason) {

  console.error("[GOVERNOR FREEZE]", reason);

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("SYSTEM_FREEZE", { reason });
  }
}

// ================= GLOBAL MODULE EXPORT (IMPORTANT FIX) =================
window.system_ai_governor = {
  init: initGovernor,
  handleSnapshot,
  evaluateRisk,
  triggerFreeze,
  startGovernorLoop
};
