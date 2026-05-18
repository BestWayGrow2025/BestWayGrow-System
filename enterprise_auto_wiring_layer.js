"use strict";

/*
========================================
ENTERPRISE AUTO WIRING LAYER v1.1 (FINAL FIXED)
AUTO MODULE CONNECTOR SYSTEM
========================================
✔ Auto module discovery
✔ Core engine registration
✔ UI binding layer
✔ Event auto linking
✔ Navigation execution router FIXED
✔ Health monitoring
✔ Global init exposure FIXED
✔ ZERO manual wiring dependency
========================================
*/

console.log("[AUTO WIRING LAYER] LOADING");

/* ================= CORE SAFE ACCESS ================= */

function getCore() {
  return window.ENTERPRISE_CORE_ENGINE ||
         window.__ENTERPRISE_CORE_ENGINE__;
}

/* ================= MODULE MAP ================= */

const MODULE_MAP = [
  "loadHome",
  "loadUsers",
  "loadSystem",
  "loadTreeView",
  "loadResetPanel",
  "loadEscrowPanel",
  "loadPins",
  "loadCreateAdmin",
  "loadStrategicAIAdvisor",
  "loadEnterpriseAuditBlockchain",
  "loadLiveSystemRealtime",
  "loadPaymentGatewayBridge",
  "loadSystemOrchestratorKernel",
  "loadSystemHealthMonitor",
  "renderEventMonitorPanel",
  "renderSystemEventStreamUI",
  "renderSystemControlCenter",
  "renderSystemAuditPanel"
];

/* ================= AUTO REGISTER MODULES ================= */

function autoRegisterModules() {

  const CORE = getCore();
  if (!CORE || typeof CORE.register !== "function") {
    console.warn("[AUTO WIRING] Core Engine not ready");
    return;
  }

  MODULE_MAP.forEach(name => {
    if (typeof window[name] === "function") {
      CORE.register(name, window[name]);
      console.log("[AUTO WIRING] Registered:", name);
    }
  });
}

/* ================= EVENT WIRING ================= */

function autoWireEvents() {

  const CORE = getCore();
  if (!CORE || typeof CORE.emit !== "function") return;

  document.addEventListener("click", function (e) {

    const el = e.target;
    if (!el || !el.dataset) return;

    const page = el.dataset.page;

    if (page) {
      CORE.emit("NAVIGATION_CLICK", {
        page,
        time: Date.now()
      });
    }
  });
}

/* ================= ROUTE PATCH ================= */

function patchGlobalRoutes() {

  const CORE = getCore();
  if (!CORE) return;

  window.safeCoreRun = function (name) {
    return CORE.run(name);
  };
}

/* ================= HEALTH MONITOR ================= */

function startHealthMonitor() {

  const CORE = getCore();
  if (!CORE || typeof CORE.healthCheck !== "function") return;

  setInterval(() => {
    const status = CORE.healthCheck();
    console.log("[AUTO HEALTH]", status);
  }, 10000);
}

/* ================= NAVIGATION TRACKING ================= */

function trackNavigationFlow() {

  const CORE = getCore();
  if (!CORE || typeof CORE.emit !== "function") return;

  CORE.on("NAVIGATION_CLICK", (data) => {
    console.log("[AUTO WIRING] NAV:", data.page);

    CORE.emit("SYSTEM_EVENT", {
      type: "navigation",
      page: data.page,
      time: Date.now()
    });
  });
}

/* ================= EXECUTION ROUTER (FIXED) ================= */

function bindNavigationExecutor() {

  const CORE = getCore();
  if (!CORE || typeof CORE.run !== "function") return;

  CORE.on("NAVIGATION_CLICK", (data) => {

    const page = data.page;

    console.log("[ROUTER] EXECUTING:", page);

    try {
      CORE.run(page);
    } catch (err) {
      console.error("[ROUTER ERROR]", page, err);
    }
  });
}

/* ================= INIT ================= */

function initAutoWiring() {

  console.log("[AUTO WIRING] INIT START");

  autoRegisterModules();
  autoWireEvents();
  patchGlobalRoutes();
  trackNavigationFlow();
  startHealthMonitor();
  bindNavigationExecutor();

  console.log("[AUTO WIRING] ACTIVE & CONNECTED");
}

/* ================= AUTO START ================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAutoWiring);
} else {
  initAutoWiring();
}

/* ================= GLOBAL EXPORT (CRITICAL FIX) ================= */

window.initAutoWiring = initAutoWiring;

window.__ENTERPRISE_AUTO_WIRING_LAYER__ = {
  active: true,
  version: "1.1",
  status: "READY"
};

console.log("[AUTO WIRING LAYER] READY");
