"use strict";

/*
========================================
SYSTEM EXECUTION GOVERNOR (SEG)
========================================
✔ Central execution authority layer
✔ Prevents unsafe execution loops
✔ Controls system priority flow
✔ Manages module execution permission
✔ Works above AI Governor
✔ Final execution decision engine
========================================
*/

(function () {

  if (window.__SYSTEM_EXECUTION_GOVERNOR__) return;

  window.__SYSTEM_EXECUTION_GOVERNOR__ = true;

  initSEG();

})();

// ================= INIT =================
function initSEG() {

  console.log("[SEG] System Execution Governor ACTIVE");

  bindExecutionRules();
  startExecutionMonitor();
}

// ================= RULE ENGINE =================
function bindExecutionRules() {

  if (!window.SYSTEM_EVENTS) return;

  window.SYSTEM_EVENTS.on("SYSTEM_ALERT", evaluateSystemState);
  window.SYSTEM_EVENTS.on("CONTROL_SNAPSHOT", analyzeSnapshot);
}

// ================= EXECUTION ANALYZER =================
function evaluateSystemState(data) {

  if (!data) return;

  if (data.level === "CRITICAL") {
    triggerFreeze("CRITICAL_ALERT");
  }
}

// ================= SNAPSHOT ANALYSIS =================
function analyzeSnapshot(snapshot) {

  if (!snapshot) return;

  if (snapshot.backup && snapshot.health === null) {
    triggerFreeze("SYSTEM_INCOMPLETE_STATE");
  }
}

// ================= MONITOR LOOP =================
function startExecutionMonitor() {

  setInterval(() => {

    if (!window.__SYSTEM_SNAPSHOT__) return;

    const snap = window.__SYSTEM_SNAPSHOT__;

    if (!snap.eventHub || !snap.diagnostics) {
      triggerFreeze("CORE_MODULE_FAILURE");
    }

  }, 7000);
}

// ================= FREEZE ENGINE =================
function triggerFreeze(reason) {

  console.error("[SEG] SYSTEM FREEZE TRIGGERED:", reason);

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("SYSTEM_FREEZE", {
      reason,
      time: Date.now()
    });
  }

  if (window.SYSTEM_RECOVERY) {
    window.SYSTEM_RECOVERY.forceRecovery("FULL");
  }
}

// ================= GLOBAL ACCESS =================
window.SEG = {
  freeze: triggerFreeze
};
