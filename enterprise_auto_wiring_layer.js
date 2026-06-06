"use strict";

/*
========================================
ENTERPRISE AUTO WIRING LAYER v1.2 (CLEAN PASSIVE)
========================================
✔ Auto module discovery
✔ Core engine registration
✔ UI binding layer
✔ Event auto linking (SAFE ONLY)
✔ Navigation execution router (DISABLED)
✔ Health monitoring
✔ NO system execution responsibility
✔ Boot Controller controlled ONLY
========================================
*/

(function () {

  if (window.__ENTERPRISE_AUTO_WIRING_LAYER__) {
    console.log("[AUTO WIRING LAYER] Already Loaded");
    return;
  }

  console.log("[AUTO WIRING LAYER] LOADING");

  window.__ENTERPRISE_AUTO_WIRING_LAYER__ = {
    active: false,
    initialized: false,
    version: "1.2",
    status: "LOADED"
  };

  let healthInterval = null;

  // ================= CORE =================
  function getCore() {
    return (
      window.ENTERPRISE_CORE_ENGINE ||
      window.__ENTERPRISE_CORE_ENGINE__ ||
      null
    );
  }

  // ================= MODULE REGISTRATION =================
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

  function autoRegisterModules() {

    const CORE = getCore();

    if (!CORE || typeof CORE.register !== "function") {
      console.warn("[AUTO WIRING] Core Engine not ready");
      return;
    }

    MODULE_MAP.forEach(name => {
      if (typeof window[name] === "function") {
        CORE.register(name, window[name]);
      }
    });
  }

  // ================= EVENTS =================
  function autoWireEvents() {

    const CORE = getCore();

    if (!CORE || typeof CORE.emit !== "function") return;

    if (document.__autoWiringClickBound__) return;
    document.__autoWiringClickBound__ = true;

    document.addEventListener("click", function (e) {

      const el = e.target.closest("[data-page]");
      if (!el) return;

      CORE.emit("NAVIGATION_CLICK", {
        page: el.dataset.page,
        time: Date.now()
      });
    });
  }

  // ================= ROUTES =================
  function patchGlobalRoutes() {

    const CORE = getCore();

    if (!CORE || typeof CORE.run !== "function") return;

    window.safeCoreRun = function (name) {
      return CORE.run(name);
    };
  }

  // ================= HEALTH =================
  function startHealthMonitor() {

    const CORE = getCore();

    if (!CORE || typeof CORE.healthCheck !== "function") return;

    if (healthInterval) return;

    healthInterval = setInterval(() => {
      try {
        CORE.healthCheck();
      } catch (err) {
        console.error("[AUTO HEALTH ERROR]", err);
      }
    }, 10000);
  }

  // ================= NAV TRACKING =================
  function trackNavigationFlow() {

    const CORE = getCore();

    if (!CORE || typeof CORE.emit !== "function" || typeof CORE.on !== "function") {
      return;
    }

    if (CORE.__navigationTrackingBound__) return;
    CORE.__navigationTrackingBound__ = true;

    CORE.on("NAVIGATION_CLICK", function (data) {

      CORE.emit("SYSTEM_EVENT", {
        type: "navigation",
        page: data.page,
        time: Date.now()
      });
    });
  }

  // ================= EXECUTION BLOCK =================
  function bindNavigationExecutor() {
    return;
  }

  // ================= INIT =================
  function initAutoWiring() {

    if (window.__ENTERPRISE_AUTO_WIRING_LAYER__.initialized) return;

    console.log("[AUTO WIRING] INIT START");

    autoRegisterModules();
    autoWireEvents();
    patchGlobalRoutes();
    trackNavigationFlow();

    startHealthMonitor();
    bindNavigationExecutor();

    window.__ENTERPRISE_AUTO_WIRING_LAYER__.active = true;
    window.__ENTERPRISE_AUTO_WIRING_LAYER__.initialized = true;
    window.__ENTERPRISE_AUTO_WIRING_LAYER__.status = "READY";

    // 🚨 IMPORTANT: NO DIRECT ORCHESTRATOR CALLS
    window.dispatchEvent(new Event("AUTO_WIRING_READY"));

    console.log("[AUTO WIRING] INIT COMPLETE ✔");
  }

  // ================= EXPORT =================
  window.initAutoWiring = initAutoWiring;

})();
