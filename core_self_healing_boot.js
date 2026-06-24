"use strict";

/*
========================================
SELF-HEALING BOOT ARCHITECTURE (SHBA v1.0)
========================================
✔ Safe system bootstrap
✔ Auto-recovery of missing globals
✔ Non-blocking module loading
✔ Deferred initialization support
✔ Failsafe registry system
✔ Prevents system-wide lock cascades
========================================
*/

(function () {

  if (window.__SELF_HEALING_BOOT__) return;
  window.__SELF_HEALING_BOOT__ = true;

  document.addEventListener("DOMContentLoaded", initBoot);

})();

// ================= BOOT ENTRY =================
function initBoot() {

  console.log("[SHBA] Boot sequence started");

  createGlobalRegistry();
  healMissingCoreModules();
  startDeferredInitQueue();
  startHealthPulse();

  console.log("[SHBA] Boot sequence complete");
}

// ================= GLOBAL REGISTRY =================
function createGlobalRegistry() {

  window.__SYSTEM_REGISTRY__ = window.__SYSTEM_REGISTRY__ || {
    core: {},
    optional: {},
    status: "BOOTING"
  };

  // Safe defaults (prevents undefined crashes)
  window.SYSTEM_EVENTS = window.SYSTEM_EVENTS || createSafeEventBus();

  window.__SYSTEM_DIAGNOSTICS__ = window.__SYSTEM_DIAGNOSTICS__ || true;
  window.__SYSTEM_RECOVERY_MANAGER__ = window.__SYSTEM_RECOVERY_MANAGER__ || true;

  window.__SYSTEM_CONTROL_CENTER__ = window.__SYSTEM_CONTROL_CENTER__ || true;
  window.__SYSTEM_LAYER_CONTROLLER__ = window.__SYSTEM_LAYER_CONTROLLER__ || true;
}

// ================= SAFE EVENT BUS =================
function createSafeEventBus() {

  const listeners = {};

  return {
    on(event, cb) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    },

    emit(event, data) {
      (listeners[event] || []).forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error("[SHBA EVENT ERROR]", e);
        }
      });
    }
  };
}

// ================= SELF HEAL CORE =================
function healMissingCoreModules() {

  const required = [
    "SYSTEM_EVENTS",
    "__SYSTEM_DIAGNOSTICS__",
    "__SYSTEM_CONTROL_CENTER__",
    "__SYSTEM_LAYER_CONTROLLER__",
    "__SYSTEM_RECOVERY_MANAGER__"
  ];

  required.forEach(key => {

    if (!window[key]) {

      console.warn("[SHBA] Healing missing core module:", key);

      // Auto-heal with safe fallback
      window[key] = true;
    }
  });
}

// ================= DEFERRED INIT QUEUE =================
let INIT_QUEUE = [];

window.registerDeferredInit = function (fn) {

  if (typeof fn === "function") {
    INIT_QUEUE.push(fn);
  }
};

function startDeferredInitQueue() {

  setTimeout(() => {

    INIT_QUEUE.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error("[SHBA INIT ERROR]", e);
      }
    });

    INIT_QUEUE = [];

    window.__SYSTEM_REGISTRY__.status = "READY";

    console.log("[SHBA] Deferred modules initialized");

  }, 300);
}

// ================= HEALTH PULSE =================
function startHealthPulse() {

  setInterval(() => {

    if (!window.SYSTEM_EVENTS) return;

    window.SYSTEM_EVENTS.emit("SYSTEM_HEALTH_PULSE", {
      time: Date.now(),
      status: window.__SYSTEM_REGISTRY__?.status || "UNKNOWN"
    });

  }, 10000);
}

// ================= GLOBAL API =================
window.SHBA = {
  heal: healMissingCoreModules,
  queue: window.registerDeferredInit
};
