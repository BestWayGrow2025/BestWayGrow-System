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
✔ Zero manual wiring layer
========================================
*/

console.log("[AUTO WIRING LAYER] LOADING");

/* ================= SAFE ENGINE REF ================= */

const CORE =
  window.ENTERPRISE_CORE_ENGINE ||
  window.__ENTERPRISE_CORE_ENGINE__;

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

  if (!CORE || typeof CORE.emit !== "function") return;

  document.addEventListener("click", function (e) {

    const target = e.target;

    if (!target || !target.dataset) return;

    const page = target.dataset.page;

    if (page) {
      CORE.emit("NAVIGATION_CLICK", { page });
    }

  });

}

/* ================= AUTO ROUTE PATCH ================= */

function patchGlobalRoutes() {

  if (!CORE) return;

  window.safeCoreRun = function (name) {

    return CORE.run(name);

  };

}

/* ================= HEALTH AUTO CHECK ================= */

function startHealthMonitor() {

  if (!CORE || typeof CORE.healthCheck !== "function") return;

  setInterval(() => {

    const status = CORE.healthCheck();

    console.log("[AUTO HEALTH]", status);

  }, 10000);

}

/* ================= BOOT SEQUENCE ================= */

function initAutoWiring() {

  autoRegisterModules();
  autoWireEvents();
  patchGlobalRoutes();
  startHealthMonitor();

  console.log("[AUTO WIRING LAYER] ACTIVE");

}

/* ================= SAFE INIT ================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAutoWiring);
} else {
  initAutoWiring();
}

/* ================= EXPORT ================= */

window.__ENTERPRISE_AUTO_WIRING_LAYER__ = true;

