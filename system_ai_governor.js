 "use strict";

/*
========================================
AI GOVERNOR CORE (TOP LAYER)
========================================
- Controls system evolution
- Enforces global safety rules
- Tunes system behavior
- NEVER touches business logic
========================================
*/

(function () {

  if (window.__AI_GOVERNOR__) return;
  window.__AI_GOVERNOR__ = true;

  document.addEventListener("DOMContentLoaded", initGovernor);

})();

// ================= INIT =================
function initGovernor() {

  if (!window.SYSTEM_EVENTS) {
    console.warn("AI GOVERNOR: Event Hub missing");
    return;
  }

  bindGovernorSignals();
  startGovernorLoop();
}

// ================= SIGNALS =================
function bindGovernorSignals() {

  const hub = window.SYSTEM_EVENTS;

  hub.on("SYSTEM_ALERT", evaluateSystemRisk);
  hub.on("SYSTEM_FAILURE", evaluateSystemRisk);
  hub.on("SYSTEM_WARNING", evaluateSystemRisk);
}

// ================= GOVERNOR LOOP =================
let GOV_TIMER = null;

function startGovernorLoop() {

  GOV_TIMER = setInterval(() => {

    const snapshot = window.__SYSTEM_SNAPSHOT__;
    if (!snapshot) return;

    runGlobalEvaluation(snapshot);
    runEvolutionCheck(snapshot);
    runSafetyAudit(snapshot);

  }, 60000); // 1 min governor cycle
}

// ================= GLOBAL EVALUATION =================
function runGlobalEvaluation(snapshot) {

  if (!snapshot.health) return;

  if (snapshot.health.overall === "CRITICAL") {
    triggerSystemFreeze("CRITICAL STATE DETECTED");
  }
}

// ================= EVOLUTION ENGINE =================
function runEvolutionCheck(snapshot) {

  // placeholder safe evolution logic
  if (snapshot.eventHub && snapshot.diagnostics) {
    console.log("🧠 GOVERNOR: System stable - evolution allowed");
  }
}

// ================= SAFETY AUDIT =================
function runSafetyAudit(snapshot) {

  const issues = [];

  if (!snapshot.eventHub) issues.push("EVENT_HUB");
  if (!snapshot.diagnostics) issues.push("DIAGNOSTICS");

  if (issues.length > 0) {
    triggerSystemFreeze("Missing Core Modules: " + issues.join(", "));
  }
}

// ================= RISK EVALUATION =================
function evaluateSystemRisk(data) {

  console.warn("🧠 GOVERNOR RISK CHECK:", data);

  if (data.level === "CRITICAL") {
    triggerSystemFreeze("CRITICAL EVENT TRIGGERED");
  }
}

// ================= FREEZE ENGINE =================
function triggerSystemFreeze(reason) {

  console.error("🛑 SYSTEM FREEZE:", reason);

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("SYSTEM_FREEZE", { reason });
  }
}

// ================= GLOBAL ACCESS =================
window.runGovernorCheck = runGlobalEvaluation;                 

