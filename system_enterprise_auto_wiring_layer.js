"use strict";

/*
========================================
ENTERPRISE AUTO WIRING LAYER v1.2
PASSIVE MODULE (BOOT CONTROLLER ONLY)
========================================
✔ Auto module discovery
✔ Core engine registration
✔ UI binding layer
✔ Event wiring (SAFE ONLY)
✔ Health monitoring (manual trigger only)
✔ NO AUTO INIT
========================================
*/

(function () {

  if (window.__ENTERPRISE_AUTO_WIRING_LAYER__) return;

  window.__ENTERPRISE_AUTO_WIRING_LAYER__ = {
    active: false,
    initialized: false,
    version: "1.2",
    status: "LOADED"
  };

  let healthInterval = null;

  function getCore() {
    return window.ENTERPRISE_CORE_ENGINE ||
           window.__ENTERPRISE_CORE_ENGINE__ ||
           null;
  }

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
    if (!CORE || typeof CORE.register !== "function") return;

    MODULE_MAP.forEach(name => {
      if (typeof window[name] === "function") {
        CORE.register(name, window[name]);
      }
    });
  }

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

  function patchGlobalRoutes() {

    const CORE = getCore();
    if (!CORE || typeof CORE.run !== "function") return;

    window.safeCoreRun = function (name) {
      return CORE.run(name);
    };
  }

  function startHealthMonitor() {

    const CORE = getCore();
    if (!CORE || typeof CORE.healthCheck !== "function") return;

    if (healthInterval) return;

    healthInterval = setInterval(() => {
      try {
        CORE.healthCheck();
      } catch (err) {
        console.error(err);
      }
    }, 10000);
  }

  function trackNavigationFlow() {

    const CORE = getCore();
    if (!CORE || typeof CORE.emit !== "function") return;

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

  function bindNavigationExecutor() {
    // DISABLED (SAFE ARCHITECTURE RULE)
  }

  // ================= PURE INIT (NO SIDE EFFECTS) =================
  function initAutoWiring() {

    if (window.__ENTERPRISE_AUTO_WIRING_LAYER__.initialized) return;

    autoRegisterModules();
    autoWireEvents();
    patchGlobalRoutes();
    trackNavigationFlow();
    startHealthMonitor();
    bindNavigationExecutor();

    window.__ENTERPRISE_AUTO_WIRING_LAYER__.active = true;
    window.__ENTERPRISE_AUTO_WIRING_LAYER__.initialized = true;
    window.__ENTERPRISE_AUTO_WIRING_LAYER__.status = "READY";
  }

  window.initAutoWiring = initAutoWiring;

})();
