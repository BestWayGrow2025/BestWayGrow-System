"use strict";

/*
========================================
SYSTEM OS MODE (GLOBAL RULE ENGINE)
========================================
✔ Controls system state
✔ Handles freeze / monitor / stable modes
✔ Acts as system-level safety switch
========================================
*/

(function () {

  if (window.__SYSTEM_OS_MODE__) return;

  window.__SYSTEM_OS_MODE__ = true;

  document.addEventListener("DOMContentLoaded", initOSMode);

})();

// ================= STATE =================
window.__OS_STATE__ = {
  mode: "STABLE",
  freeze: false,
  lastUpdate: Date.now()
};

// ================= INIT =================
function initOSMode() {

  bindOSListeners();

  console.log("[OS MODE] Initialized");
}

// ================= LISTENERS =================
function bindOSListeners() {

  if (!window.SYSTEM_EVENTS) return;

  window.SYSTEM_EVENTS.on("SYSTEM_FREEZE", activateFreeze);
}

// ================= MODE CONTROL (FIX ADDED) =================
function setMode(mode) {

  window.__OS_STATE__.mode = mode;
  window.__OS_STATE__.lastUpdate = Date.now();

  if (mode === "FROZEN") {
    window.__OS_STATE__.freeze = true;
  }

  if (mode === "MONITOR" || mode === "STABLE") {
    window.__OS_STATE__.freeze = false;
  }

  console.log("[OS MODE] Switched →", mode);
}

// ================= FREEZE HANDLER =================
function activateFreeze(data) {

  window.__OS_STATE__.mode = "FROZEN";
  window.__OS_STATE__.freeze = true;
  window.__OS_STATE__.lastUpdate = Date.now();

  console.warn("[OS MODE] SYSTEM FROZEN:", data?.reason);
}

// ================= GLOBAL ACCESS =================
window.SystemOSMode = {
  setMode,
  getState: () => window.__OS_STATE__
};

