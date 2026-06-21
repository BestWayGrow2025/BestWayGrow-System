"use strict";

/*
========================================
ENTERPRISE AUTOPILOT ENGINE v1.0
AI DECISION + SELF CONTROL LAYER
========================================
✔ Intelligent routing
✔ Auto module execution
✔ Self-healing system
✔ Event-based decision engine
✔ Enterprise OS behavior control
========================================
*/

console.log("[AUTOPILOT ENGINE] LOADED");

/* ================= CORE ENGINE LINK ================= */

const CORE =
  window.ENTERPRISE_CORE_ENGINE ||
  window.__ENTERPRISE_CORE_ENGINE__;

/* ================= AUTOPILOT STATE ================= */

const AUTOPILOT = {
  mode: "MANUAL", // MANUAL | AUTO
  lastAction: null,
  systemLoad: 0,
  activeModule: null
};

/* ================= SYSTEM ANALYZER ================= */

function analyzeSystem() {

  if (!CORE || typeof CORE.status !== "function") {
    return { health: "UNKNOWN" };
  }

  const status = CORE.status();

  AUTOPILOT.systemLoad = status.events || 0;

  return status;
}

/* ================= DECISION ENGINE ================= */

function decide(nextEvent) {

  const status = analyzeSystem();

  // If system degraded → force safe mode
  if (status.health === "DEGRADED") {
    return {
      action: "SAFE_MODE",
      module: "loadHome"
    };
  }

  // Navigation logic
  if (nextEvent?.type === "NAVIGATION_CLICK") {
    return {
      action: "LOAD_MODULE",
      module: nextEvent.payload.page
    };
  }

  // Default fallback
  return {
    action: "LOAD_HOME",
    module: "loadHome"
  };
}

/* ================= EXECUTION ENGINE ================= */

function execute(decision) {

  try {

    if (!CORE) return;

    if (decision.action === "SAFE_MODE") {
      console.warn("[AUTOPILOT] SAFE MODE ACTIVATED");
      CORE.run("loadHome");
      return;
    }

    if (decision.action === "LOAD_MODULE") {

      AUTOPILOT.activeModule = decision.module;

      console.log("[AUTOPILOT] Loading:", decision.module);

      CORE.run(decision.module);

      return;
    }

    if (decision.action === "LOAD_HOME") {
      CORE.run("loadHome");
    }

  } catch (e) {
    console.error("[AUTOPILOT ERROR]", e);
    CORE.run("loadHome");
  }
}

/* ================= EVENT LISTENER ================= */

function initAutopilotListener() {

  if (!CORE || typeof CORE.emit !== "function") return;

  document.addEventListener("click", function (e) {

    const target = e.target;

    if (!target || !target.dataset) return;

    const page = target.dataset.page;

    if (!page) return;

    const event = {
      type: "NAVIGATION_CLICK",
      payload: { page }
    };

    const decision = decide(event);

    execute(decision);

  });

}

/* ================= AUTO RECOVERY SYSTEM ================= */

function autoRecover() {

  setInterval(() => {

    const status = analyzeSystem();

    if (status.health === "DEGRADED") {

      console.warn("[AUTOPILOT] RECOVERY TRIGGERED");

      if (CORE && typeof CORE.run === "function") {
        CORE.run("loadHome");
      }

    }

  }, 8000);

}

/* ================= INIT ================= */

function initAutopilot() {

  AUTOPILOT.mode = "AUTO";

  initAutopilotListener();
  autoRecover();

  console.log("[AUTOPILOT ENGINE] ACTIVE");

}

/* ================= BOOT ================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAutopilot);
} else {
  initAutopilot();
}

/* ================= EXPORT ================= */

window.__ENTERPRISE_AUTOPILOT_ENGINE__ = AUTOPILOT;
