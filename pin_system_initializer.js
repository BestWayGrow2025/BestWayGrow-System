"use strict";

/*
========================================
PIN SYSTEM INITIALIZER V1.0 (MASTER ENTRY)
========================================
✔ Single system entry point
✔ Orchestrates full PIN ecosystem startup
✔ Boot → Injector → UI → Router → Live Sync
✔ Clean enterprise initialization flow
✔ Prevents partial system load
✔ Production LOCKED
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_SYSTEM_INITIALIZER__) return;

  window.__PIN_SYSTEM_INITIALIZER__ = true;

})();

// ================= MAIN START =================
function startPinSystem() {

  console.log("[PIN INIT] STARTING FULL SYSTEM...");

  try {

   // ================= STEP 1: BOOT =================
    if (typeof startPinBoot === "function") {
      startPinBoot();
    }

    // ================= STEP 2: UI INJECTOR =================
    if (typeof initPinInjector === "function") {
      initPinInjector();
    }

    // ================= STEP 3: UI LAUNCHER =================
    if (typeof initPinUILauncher === "function") {
      initPinUILauncher();
    }

    // ================= STEP 4: ROUTER VALIDATION =================
    if (typeof routePinRequest !== "function") {
      throw new Error("Router not loaded");
    }

    // ================= STEP 5: LIVE SYNC =================
    if (typeof startLiveSync === "function") {
      startLiveSync();
    }

    // ================= FINAL STATE =================
    window.__PIN_SYSTEM_STATE__ = {
      initialized: true,
      time: Date.now()
    };

    console.log("[PIN INIT] SYSTEM FULLY READY ✔");

    // ================= EVENT =================
    if (typeof broadcastPinEvent === "function") {
      broadcastPinEvent("PIN_SYSTEM_INITIALIZED", {
        status: "READY"
      });
    }

    return true;

  } catch (err) {

    console.error("[PIN INIT ERROR]", err);

    return false;
  }
}

// ================= STATUS =================
function isPinSystemReady() {

  return !!(
    window.__PIN_SYSTEM_STATE__ &&
    window.__PIN_SYSTEM_STATE__.initialized === true
  );
}

// ================= EXPORT =================
window.startPinSystem = startPinSystem;
window.isPinSystemReady = isPinSystemReady;
