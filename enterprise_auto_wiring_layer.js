"use strict";

/*
========================================
ENTERPRISE AUTO WIRING LAYER v1.2
PASSIVE MODULE ONLY (BOOT SAFE)
========================================
✔ Auto module discovery (NO AUTO RUN)
✔ Core engine registration (ON DEMAND ONLY)
✔ UI binding layer (SAFE)
✔ Event wiring (LISTENER ONLY)
✔ Health monitor (FUNCTION ONLY)
✔ NO INIT CALLS
✔ NO SELF EXECUTION
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
    return (
      window.ENTERPRISE_CORE_ENGINE ||
      window.__ENTERPRISE_CORE_ENGINE__ ||
      null
    );
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

    document.addEventListener("click", (e) => {
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
        console.error("[AUTO HEALTH ERROR]", err);
      }
    }, 10000);
  }

  function trackNavigationFlow() {

    const CORE = getCore();
    if (!CORE || typeof CORE.emit !== "function" || typeof CORE.on !== "function") return;

    if (CORE.__navigationTrackingBound__) return;
    CORE.__navigationTrackingBound__ = true;

    CORE.on("NAVIGATION_CLICK", (data) => {
      CORE.emit("SYSTEM_EVENT", {
        type: "navigation",
        page: data.page,
        time: Date.now()
      });
    });
  }

  function bindNavigationExecutor() {
    // DISABLED ON PURPOSE (NO AUTO EXECUTION)
    return;
  }

  // ONLY EXPORT FUNCTION (NO INIT)
  window.initAutoWiring = function () {
    autoRegisterModules();
    autoWireEvents();
    patchGlobalRoutes();
    trackNavigationFlow();
    startHealthMonitor();
    bindNavigationExecutor();

    window.__ENTERPRISE_AUTO_WIRING_LAYER__.active = true;
    window.__ENTERPRISE_AUTO_WIRING_LAYER__.initialized = true;
    window.__ENTERPRISE_AUTO_WIRING_LAYER__.status = "READY";
  };

})();
