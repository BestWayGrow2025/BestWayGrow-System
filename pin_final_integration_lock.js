"use strict";

(function () {

  if (window.__PIN_FINAL_LOCK__) return;

  window.__PIN_FINAL_LOCK__ = true;

})();

// ================= ARCHITECTURE ENFORCEMENT =================
function enforcePinArchitecture() {

  try {

    // ================= REQUIRED FLAGS =================
    const requiredFlags = [
      "__PIN_SYSTEM_INITIALIZER__",
      "__PIN_UI_LAUNCHER__",
      "__PIN_UI_INJECTOR__"
    ];

    // ================= REQUIRED FUNCTIONS =================
    const requiredFunctions = [
      "routePinRequest",
      "startLiveSync"
    ];

    // ================= CHECK FLAGS =================
    for (let i = 0; i < requiredFlags.length; i++) {

      const key = requiredFlags[i];

      if (typeof window[key] === "undefined") {

        console.warn(
          "[PIN FINAL LOCK] MISSING FLAG:",
          key
        );

        return false;
      }
    }

    // ================= CHECK FUNCTIONS =================
    for (let i = 0; i < requiredFunctions.length; i++) {

      const fn = requiredFunctions[i];

      if (typeof window[fn] !== "function") {

        console.warn(
          "[PIN FINAL LOCK] MISSING FUNCTION:",
          fn
        );

        return false;
      }
    }

    // ================= PREVENT MULTIPLE LOCK =================
    if (window.__PIN_LOCK_ACTIVE__) {

      console.warn(
        "[PIN FINAL LOCK] SYSTEM ALREADY LOCKED"
      );

      return true;
    }

    window.__PIN_LOCK_ACTIVE__ = true;

    // ================= FREEZE SYSTEM STATE =================
    if (
      window.__PIN_SYSTEM_STATE__ &&
      typeof window.__PIN_SYSTEM_STATE__ === "object"
    ) {
      Object.freeze(window.__PIN_SYSTEM_STATE__);
    }

    console.log(
      "[PIN FINAL LOCK] SYSTEM ARCHITECTURE LOCKED ✔"
    );

    return true;

  } catch (err) {

    console.error(
      "[PIN FINAL LOCK ERROR]",
      err
    );

    return false;
  }
}

// ================= SAFE MODE =================
function startPinSafeMode() {

  console.log(
    "[PIN SAFE MODE] ACTIVATING..."
  );

  enforcePinArchitecture();

  if (
    typeof window.startRecoveryWatchdog === "function"
  ) {

    window.startRecoveryWatchdog(10000);
  }

  if (
    typeof window.checkSystemHealth === "function"
  ) {

    setInterval(
      window.checkSystemHealth,
      8000
    );
  }
}

// ================= EXPORTS =================
window.enforcePinArchitecture =
  enforcePinArchitecture;

window.startPinSafeMode =
  startPinSafeMode;
