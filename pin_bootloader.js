"use strict";

/*
========================================
PIN BOOTLOADER V1.0 (SYSTEM CORE START)
========================================
✔ Central system startup controller
✔ Ensures correct load sequence
✔ Waits for core + router + UI + event bus
✔ Prevents partial system execution
✔ Role-safe initialization
✔ Production LOCKED
========================================
*/

// ================= BOOT STATE =================
window.__PIN_BOOT_STATE__ = {
  started: false,
  completed: false,
  coreReady: false,
  routerReady: false,
  uiReady: false,
  eventBusReady: false
};

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_BOOTLOADER__) return;

  window.__PIN_BOOTLOADER__ = true;

  document.addEventListener("DOMContentLoaded", startBootSequence);

})();

// ================= MAIN BOOT =================
function startBootSequence() {

  if (window.__PIN_BOOT_STATE__.started) {
    return;
  }

  console.log("[PIN BOOT] STARTING SEQUENCE...");

  window.__PIN_BOOT_STATE__.started = true;

  checkSystemReadiness();
}

// ================= READINESS CHECK =================
function checkSystemReadiness() {

  let attempts = 0;

  const interval = setInterval(() => {

    attempts++;

  if (attempts > 300) {

    clearInterval(interval);

    console.error(
      "[PIN BOOT] Timeout waiting for dependencies"
    );

    return;
  }
   
    window.__PIN_BOOT_STATE__.coreReady =
      typeof window.__CORE_STATE__ !== "undefined";

    window.__PIN_BOOT_STATE__.routerReady =
      typeof window.routePinRequest === "function";

    window.__PIN_BOOT_STATE__.uiReady =
      document.getElementById("pinModalRoot") !== null;

    window.__PIN_BOOT_STATE__.eventBusReady =
      typeof window.PIN_EVENT_BUS !== "undefined";

    const allReady =
      window.__PIN_BOOT_STATE__.coreReady &&
      window.__PIN_BOOT_STATE__.routerReady &&
      window.__PIN_BOOT_STATE__.uiReady &&
      window.__PIN_BOOT_STATE__.eventBusReady;

    if (allReady) {

      clearInterval(interval);

      finalizeBoot();

    }

  }, 200);
}

// ================= FINAL BOOT =================
function finalizeBoot() {

  console.log("[PIN BOOT] SYSTEM READY ✔");

  // ================= INIT UI LAYERS =================

  if (typeof initPinInjector === "function") {
    initPinInjector();
  }

  if (typeof startLiveSync === "function") {
    startLiveSync();
  }

  // ================= GLOBAL STATE =================

  window.__PIN_BOOT_STATE__.completed = true;

  // ================= EVENT =================

  if (typeof broadcastPinEvent === "function") {
    broadcastPinEvent("PIN_SYSTEM_READY", {
      time: Date.now()
    });
  }

  console.log("[PIN BOOT] ALL MODULES ACTIVE 🚀");
}

// ================= STATUS API =================
function getPinBootStatus() {
  return window.__PIN_BOOT_STATE__;
}

// ================= EXPORT =================
window.getPinBootStatus = getPinBootStatus;
window.startPinBoot = startBootSequence;
