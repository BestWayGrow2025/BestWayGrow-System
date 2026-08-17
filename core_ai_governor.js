"use strict";

/*
========================================
CORE AI GOVERNOR
========================================
✔ Single AI risk/governance authority
✔ Evaluates system alerts/failures/warnings
✔ Evaluates control snapshots
✔ Requests system freeze through SYSTEM_EVENTS
✔ Delegates system state to SystemOSMode
✔ Protected single initialization
✔ Protected single governor loop
✔ No UI / routing / authentication logic
========================================
*/

(function () {

  if (window.__AI_GOVERNOR__) return;

  window.__AI_GOVERNOR__ = true;

  document.addEventListener(
    "DOMContentLoaded",
    initGovernor,
    { once: true }
  );

})();

// ================= STATE =================

let GOV_TIMER = null;
let GOV_SIGNALS_BOUND = false;

// ================= INIT =================

function initGovernor() {

  console.log(
    "[CORE AI GOVERNOR] INITIALIZED"
  );

  if (!window.SYSTEM_EVENTS) {

    console.warn(
      "[CORE AI GOVERNOR] Event Hub missing"
    );

    return;

  }

  bindGovernorSignals();
  startGovernorLoop();

}

// ================= SIGNAL BIND =================

function bindGovernorSignals() {

  if (GOV_SIGNALS_BOUND) return;

  const hub = window.SYSTEM_EVENTS;

  if (
    !hub ||
    typeof hub.on !== "function"
  ) {

    console.warn(
      "[CORE AI GOVERNOR] Event Hub unavailable"
    );

    return;

  }

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

  GOV_SIGNALS_BOUND = true;

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

    if (
      window.SYSTEM_EVENTS &&
      typeof window.SYSTEM_EVENTS.emit ===
        "function"
    ) {

      window.SYSTEM_EVENTS.emit(
        "GOVERNOR_ACTION",
        {
          type: "THROTTLE",
          reason: "CRITICAL_HEALTH",
          time: Date.now()
        }
      );

    }

    return;

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

function startGovernorLoop() {

  if (GOV_TIMER !== null) return;

  GOV_TIMER = setInterval(
    function () {

      const snapshot =
        window.__SYSTEM_SNAPSHOT__;

      if (!snapshot) return;

      if (
        snapshot.health?.overall ===
        "CRITICAL"
      ) {

        triggerFreeze(
          "CRITICAL_STATE_DETECTED"
        );

      }

    },
    60000
  );

}

// ================= RISK =================

function evaluateRisk(data) {

  if (!data) return;

  console.warn(
    "[CORE AI GOVERNOR] RISK CHECK:",
    data
  );

  if (
    String(data.level || "")
      .toUpperCase() === "CRITICAL"
  ) {

    triggerFreeze(
      "CRITICAL_EVENT"
    );

  }

}

// ================= FREEZE REQUEST =================

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
        reason,
        source: "CORE_AI_GOVERNOR",
        time: Date.now()
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
