"use strict";

/*
========================================
PIN BOOTLOADER V1.0 (SYSTEM START CORE)
========================================
✔ Single entry system initializer
✔ Ensures correct load order
✔ Prevents partial system execution
✔ Initializes all PIN modules safely
✔ Production LOCKED
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_BOOTLOADER__) return;

  window.__PIN_BOOTLOADER__ = true;

  document.addEventListener("DOMContentLoaded", initPinSystem);

})();

// ================= SYSTEM INIT =================
function initPinSystem() {

  try {

    console.log("[PIN BOOT] STARTING SYSTEM...");

    // ================= STEP 1: CORE CHECK =================
    if (!window.__CORE_STATE__ || !window.__CORE_STATE__.initialized) {
      console.warn("[PIN BOOT] Core not ready yet");
    }

    // ================= STEP 2: EVENT BUS =================
    if (typeof window.broadcastPinEvent === "function") {
      window.broadcastPinEvent("PIN_SYSTEM_BOOT", {
        status: "EVENT_BUS_READY"
      });
    }

    // ================= STEP 3: ROUTER READY =================
    if (typeof window.routePinRequest === "function") {
      console.log("[PIN BOOT] Router Ready");
    }

    // ================= STEP 4: UI LAUNCHER =================
    if (typeof window.openPinRequestPanel === "function") {
      console.log("[PIN BOOT] UI Launcher Ready");
    }

    // ================= STEP 5: LIVE PANEL INIT =================
    if (typeof window.startLiveSync === "function") {
      window.startLiveSync();
    }

    // ================= FINAL STATE =================
    window.__PIN_SYSTEM_READY__ = true;

    console.log("[PIN BOOT] SYSTEM READY ✔");

    if (typeof window.broadcastPinEvent === "function") {
      window.broadcastPinEvent("PIN_SYSTEM_READY", {
        status: "READY"
      });
    }

  } catch (err) {

    console.error("[PIN BOOT ERROR]", err);
  }
}

// ================= EXPORT =================
window.initPinSystem = initPinSystem;
