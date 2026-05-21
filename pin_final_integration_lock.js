"use strict";

(function () {

  if (window.__PIN_FINAL_LOCK__) return;

  window.__PIN_FINAL_LOCK__ = true;

})();

function enforcePinArchitecture() {

  try {

    // ================= FLOW ENFORCEMENT =================
    const required = [
      "__PIN_SYSTEM_INITIALIZER__",
      "__PIN_UI_LAUNCHER__",
      "__PIN_UI_INJECTOR__",
      "routePinRequest",
      "startLiveSync"
    ];

    for (let i = 0; i < required.length; i++) {

      const key = required[i];

      if (!window[key] && typeof window[key] !== "function") {

        console.warn("[PIN FINAL LOCK] MISSING:", key);

        return false;
      }
    }

    // ================= PREVENT MULTIPLE INIT =================
    if (window.__PIN_LOCK_ACTIVE__) {

      console.warn("[PIN FINAL LOCK] SYSTEM ALREADY LOCKED");

      return true;
    }

    window.__PIN_LOCK_ACTIVE__ = true;

    // ================= FREEZE CRITICAL FLOW =================
    Object.freeze(window.__PIN_SYSTEM_STATE__ || {});

    console.log("[PIN FINAL LOCK] SYSTEM ARCHITECTURE LOCKED ✔");

    return true;

  } catch (err) {

    console.error("[PIN FINAL LOCK ERROR]", err);

    return false;
  }
}

function startPinSafeMode() {

  console.log("[PIN SAFE MODE] ACTIVATING...");

  enforcePinArchitecture();

  if (typeof startRecoveryWatchdog === "function") {
    startRecoveryWatchdog(10000);
  }

  if (typeof checkSystemHealth === "function") {
    setInterval(checkSystemHealth, 8000);
  }
}

window.enforcePinArchitecture = enforcePinArchitecture;
window.startPinSafeMode = startPinSafeMode;

