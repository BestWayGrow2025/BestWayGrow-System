"use strict";

/*
========================================
CORE AI GOVERNOR
========================================
✔ Controls system behavior
✔ Enforces safety rules
✔ Snapshot-based decision engine
✔ Single initialization path
✔ Single signal binding
✔ Single governor timer
✔ Single CRITICAL freeze authority
========================================
*/

(function () {

  if (window.__AI_GOVERNOR__) return;

  window.__AI_GOVERNOR__ = true;

})();

// ================= INIT =================

function initGovernor() {

  if (window.__AI_GOVERNOR_INITIALIZED__) return;

  if (!window.SYSTEM_EVENTS) {

    console.warn(
      "[CORE AI GOVERNOR] Event Hub missing"
    );

    return;
  }

  window.__AI_GOVERNOR_INITIALIZED__ = true;

  console.log(
    "[CORE AI GOVERNOR] INITIALIZED"
  );

  bindGovernorSignals();

  startGovernorLoop();

}


// ================= SIGNAL BIND =================

function bindGovernorSignals() {

  if (window.__AI_GOVERNOR_SIGNALS_BOUND__) return;

  const hub =
    window.SYSTEM_EVENTS;

  if (
    !hub ||
    typeof hub.on !== "function"
  ) {
    return;
  }

  window.__AI_GOVERNOR_SIGNALS_BOUND__ = true;

  hub.on(
    "SYSTEM_ALERT",
    evaluateRisk
  );

  hub.on(
    "SYSTEM_FAILURE",
    evaluateRisk
  );

  hub.on(
    "SYSTEM_WARNING",
    evaluateRisk
  );

  hub.on(
    "CONTROL_SNAPSHOT",
    handleSnapshot
  );

}


// ================= SNAPSHOT HANDLER =================

function handleSnapshot(snapshot) {

  if (!snapshot) return;

  const health =
    snapshot.health?.overall;


  // ================= CRITICAL =================

  if (health === "CRITICAL") {

    console.warn(
      "[CORE AI GOVERNOR] CRITICAL → SYSTEM FREEZE"
    );

    triggerFreeze(
      "CRITICAL_HEALTH"
    );

    if (window.SYSTEM_EVENTS) {

      window.SYSTEM_EVENTS.emit(
        "GOVERNOR_ACTION",
        {
          type: "THROTTLE",
          reason: "CRITICAL_HEALTH",
          time: Date.now()
        }
      );

    }

  }


  // ================= WARNING =================

  if (health === "WARNING") {

    console.warn(
      "[CORE AI GOVERNOR] WARNING → MONITOR MODE"
    );

    if (
      window.SystemOSMode &&
      typeof window.SystemOSMode.setMode ===
      "function"
    ) {

      window.SystemOSMode.setMode(
        "MONITOR"
      );

    }

  }

}


// ================= LOOP =================

let GOV_TIMER = null;

function startGovernorLoop() {

  if (GOV_TIMER) return;

  GOV_TIMER = setInterval(() => {

    const snapshot =
      window.__SYSTEM_SNAPSHOT__;

    if (!snapshot) return;

    if (
      snapshot.health?.overall ===
      "CRITICAL"
    ) {

      triggerFreeze(
        "CRITICAL STATE DETECTED"
      );

    }

  }, 60000);

}


// ================= RISK =================

function evaluateRisk(data) {

  if (!data) return;

  console.warn(
    "[CORE AI GOVERNOR] RISK CHECK:",
    data
  );

  if (
    data.level === "CRITICAL"
  ) {

    triggerFreeze(
      "CRITICAL EVENT"
    );

  }

}


// ================= FREEZE =================

function triggerFreeze(reason) {

  console.error(
    "[CORE AI GOVERNOR FREEZE]",
    reason
  );

  if (
    window.SYSTEM_EVENTS &&
    typeof window.SYSTEM_EVENTS.emit ===
    "function"
  ) {

    window.SYSTEM_EVENTS.emit(
      "SYSTEM_FREEZE",
      {
        reason
      }
    );

  }

}


// ================= GLOBAL MODULE EXPORT =================

window.system_ai_governor = {

  init:
    initGovernor,

  handleSnapshot:
    handleSnapshot,

  evaluateRisk:
    evaluateRisk,

  triggerFreeze:
    triggerFreeze,

  startGovernorLoop:
    startGovernorLoop

};

