"use strict";

/*
========================================
ENTERPRISE AUTO WIRING LAYER v1.0
AUTO MODULE CONNECTOR SYSTEM
========================================
✔ Auto module discovery
✔ Core engine auto registration
✔ UI function binding
✔ Event auto linking
✔ Navigation tracking
✔ Health monitoring
✔ Zero manual wiring layer
========================================
*/

console.log("[AUTO WIRING LAYER] LOADING");

/* ================= CORE (LIVE REFERENCE) ================= */

function getCore() {
  return window.ENTERPRISE_CORE_ENGINE ||
         window.__ENTERPRISE_CORE_ENGINE__;
}

/* ================= MODULE LIST ================= */

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

/* ================= AUTO REGISTER ================= */

function autoRegisterModules() {

  const CORE = getCore();
  if (!CORE || typeof CORE.register !== "function") {
    console.warn("[AUTO WIRING] Core Engine not found");
    return;
  }

  MODULE_MAP.forEach(name => {

    if (typeof window[name] === "function") {
      CORE.register(name, window[name]);
      console.log("[AUTO WIRING] Registered:", name);
    }

  });
}

/* ================= AUTO EVENT WIRING ================= */

function autoWireEvents() {

  const CORE = getCore();
  if (!CORE || typeof CORE.emit !== "function") return;

  document.addEventListener("click", function (e) {

    const target = e.target;
    if (!target || !target.dataset) return;

    const page = target.dataset.page;

    if (page) {
      CORE.emit("NAVIGATION_CLICK", {
        page,
        timestamp: Date.now()
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
    console.log("[AUTO HEALTH STATUS]", status);

  }, 10000);
}

/* ================= NAVIGATION TRACKING ================= */

function trackNavigationFlow() {

  const CORE = getCore();
  if (!CORE || typeof CORE.emit !== "function") return;

  CORE.on("NAVIGATION_CLICK", (data) => {

    console.log("[AUTO WIRING] Navigation:", data.page);

    CORE.emit("SYSTEM_EVENT", {
      type: "navigation",
      page: data.page,
      timestamp: Date.now()
    });

  });
}

/* ================= MAIN INIT ================= */

function initAutoWiring() {

  console.log("[AUTO WIRING] INITIALIZING...");

  autoRegisterModules();
  autoWireEvents();
  patchGlobalRoutes();
  trackNavigationFlow();
  startHealthMonitor();

  console.log("[AUTO WIRING LAYER] ACTIVE & CONNECTED");
}

/* ================= SAFE INIT ================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAutoWiring);
} else {
  initAutoWiring();
}

/* ================= GLOBAL EXPORT FIX ================= */

window.initAutoWiring = initAutoWiring;

window.__ENTERPRISE_AUTO_WIRING_LAYER__ = {
  active: true,
  version: "1.0"
};

console.log("[AUTO WIRING LAYER] READY");
