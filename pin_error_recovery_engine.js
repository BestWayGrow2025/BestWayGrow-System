"use strict";

/*
========================================
PIN ERROR RECOVERY ENGINE V1.0
========================================
✔ Auto-detect system failure states
✔ UI recovery (dashboard fix)
✔ Router repair
✔ Boot re-trigger safety
✔ Module reinitialization
✔ Crash-safe recovery loop
✔ No business logic
✔ Production LOCKED
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_RECOVERY_ENGINE__) return;

  window.__PIN_RECOVERY_ENGINE__ = true;

})();

// ================= MAIN RECOVERY =================
function runPinRecovery() {

  console.log("[PIN RECOVERY] SCANNING SYSTEM...");

  try {

    // ================= CHECK UI =================
    if (!document.getElementById("pinLivePanel")) {

      console.warn("[PIN RECOVERY] UI MISSING → REBUILDING");

      rebuildUIPanels();
    }

    // ================= CHECK ROUTER =================
    if (typeof window.routePinRequest !== "function") {

      console.warn("[PIN RECOVERY] ROUTER MISSING → REINIT");

      tryReinitRouter();
    }

    // ================= CHECK BOOT =================
    if (
      typeof window.__PIN_BOOT_STATE__ === "undefined" ||
      !window.__PIN_BOOT_STATE__.completed
    ) {

      console.warn("[PIN RECOVERY] BOOT INCOMPLETE → RESTART");

      restartBoot();
    }

    // ================= CHECK LIVE SYSTEM =================
    if (typeof window.startLiveSync !== "function") {

      console.warn("[PIN RECOVERY] LIVE SYSTEM MISSING → RESTART");

      restartLiveSystem();
    }

    console.log("[PIN RECOVERY] SYSTEM STABLE ✔");

    return true;

  } catch (err) {

    console.error("[PIN RECOVERY ERROR]", err);

    return false;
  }
}

// ================= UI RECOVERY =================
function rebuildUIPanels() {

  const container = document.querySelector(".container");

  if (!container) return;

  const panel = document.createElement("div");

  panel.id = "pinLivePanel";

  panel.className = "card";

  panel.innerHTML = `
    <h3>📡 RECOVERED PIN PANEL</h3>
    <div id="pinLiveTable">Rebuilding...</div>
  `;

  container.prepend(panel);
}

// ================= ROUTER RECOVERY =================
function tryReinitRouter() {

  if (typeof window.initPinSystem === "function") {
    window.initPinSystem();
  }
}

// ================= BOOT RECOVERY =================
function restartBoot() {

  if (typeof window.startPinBoot === "function") {
    window.startPinBoot();
  }

  if (typeof window.startPinSystem === "function") {
    window.startPinSystem();
  }
}

// ================= LIVE SYSTEM RECOVERY =================
function restartLiveSystem() {

  if (typeof window.startLiveSync === "function") {
    window.startLiveSync();
  }
}

// ================= AUTO MONITOR LOOP =================
function startRecoveryWatchdog(interval = 8000) {

  setInterval(() => {

    runPinRecovery();

  }, interval);
}

// ================= EXPORT =================
window.runPinRecovery = runPinRecovery;
window.startRecoveryWatchdog = startRecoveryWatchdog;

