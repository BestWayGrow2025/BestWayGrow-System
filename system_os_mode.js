"use strict";

/*
========================================
SYSTEM OS MODE (GLOBAL RULE ENGINE)
========================================
- Defines system-wide behavior rules
- Prevents conflicts between modules
- Enforces stability
========================================
*/

(function () {

  if (window.__SYSTEM_OS_MODE__) return;
  window.__SYSTEM_OS_MODE__ = true;

  document.addEventListener("DOMContentLoaded", initOSMode);

})();

function initOSMode() {

  window.__OS_STATE__ = {
    mode: "STABLE",
    freeze: false,
    lastUpdate: Date.now()
  };

  bindOSListeners();
}

// ================= LISTENERS =================
function bindOSListeners() {

  if (!window.SYSTEM_EVENTS) return;

  window.SYSTEM_EVENTS.on("SYSTEM_FREEZE", activateFreeze);
}

// ================= MODE CONTROL =================
function activateFreeze(data) {

  window.__OS_STATE__.mode = "FROZEN";
  window.__OS_STATE__.freeze = true;

  console.warn("🧊 OS MODE: SYSTEM FROZEN", data.reason);
}

// ================= GLOBAL ACCESS =================
window.getOSState = () => window.__OS_STATE__;
