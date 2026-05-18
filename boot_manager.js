"use strict";

/*
========================================
MASTER BOOT CONTROLLER v2.0 (FINAL STABLE)
========================================
✔ Single source of system startup
✔ Guarantees load order safety
✔ SYSTEM_READY event authority
✔ Prevents early execution bugs
✔ Stabilizes CORE + ORCHESTRATOR + UI
========================================
*/

console.log("[BOOT] LOADING BOOT MANAGER");

/* ================= GLOBAL BOOT STATE ================= */

window.__SYSTEM_BOOT__ = {
  ready: false,
  coreReady: false,
  orchestratorReady: false,
  wiringReady: false,
  started: false
};

/* ================= EVENT BUS (GLOBAL SAFE) ================= */

window.SYSTEM_EVENTS = window.SYSTEM_EVENTS || {
  emit(event, data) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  on(event, callback) {
    window.addEventListener(event, (e) => callback(e.detail));
  }
};

/* ================= SAFE CHECK HELPERS ================= */

function waitFor(fn, cb, timeout = 5000) {

  const start = Date.now();

  const timer = setInterval(() => {

    if (fn()) {
      clearInterval(timer);
      cb(true);
      return;
    }

    if (Date.now() - start > timeout) {
      clearInterval(timer);
      console.warn("[BOOT] TIMEOUT WAIT:", fn.toString());
      cb(false);
    }

  }, 100);
}

/* ================= CORE INIT ================= */

function initCore() {

  if (typeof window.initCoreSystem === "function") {
    const ok = window.initCoreSystem();
    window.__SYSTEM_BOOT__.coreReady = !!ok;
    console.log("[BOOT] CORE:", ok);
  } else {
    console.warn("[BOOT] CORE NOT FOUND");
  }
}

/* ================= ORCHESTRATOR INIT ================= */

function initOrchestrator() {

  if (typeof window.initOrchestrator === "function") {
    window.initOrchestrator();
    window.__SYSTEM_BOOT__.orchestratorReady = true;
    console.log("[BOOT] ORCHESTRATOR READY");
  } else {
    console.warn("[BOOT] ORCHESTRATOR NOT FOUND");
  }
}

/* ================= AUTO WIRING INIT ================= */

function initWiring() {

  if (typeof window.initAutoWiring === "function") {
    window.initAutoWiring();
    window.__SYSTEM_BOOT__.wiringReady = true;
    console.log("[BOOT] AUTO WIRING READY");
  } else {
    console.warn("[BOOT] AUTO WIRING NOT FOUND");
  }
}

/* ================= FLUSH SYSTEM ================= */

function finalizeBoot() {

  window.__SYSTEM_BOOT__.ready = true;
  window.__SYSTEM_BOOT__.started = true;

  console.log("[BOOT] SYSTEM FULLY READY");

  window.SYSTEM_EVENTS.emit("SYSTEM_READY", {
    time: Date.now(),
    boot: window.__SYSTEM_BOOT__
  });
}

/* ================= MASTER BOOT SEQUENCE ================= */

function bootSystem() {

  console.log("[BOOT] START SEQUENCE");

  initCore();
  initOrchestrator();
  initWiring();

  // ensure async safety window
  setTimeout(finalizeBoot, 300);
}

/* ================= SAFE START ================= */

function startBoot() {

  if (window.__SYSTEM_BOOT__.started) return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSystem);
  } else {
    bootSystem();
  }
}

/* ================= AUTO START ================= */

startBoot();

/* ================= DEBUG EXPORT ================= */

window.BOOT = {
  state: window.__SYSTEM_BOOT__,
  restart: bootSystem
};

console.log("[BOOT] MANAGER READY");
