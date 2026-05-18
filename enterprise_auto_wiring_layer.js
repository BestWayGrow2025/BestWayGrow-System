"use strict";

/*
========================================
ENTERPRISE AUTO WIRING LAYER v1.2
ENTERPRISE FINAL STABLE
========================================
✔ Auto module discovery
✔ Core engine registration
✔ UI binding layer
✔ Event auto linking
✔ Navigation execution router
✔ Health monitoring
✔ Duplicate init protection
✔ Global init exposure
✔ Boot Manager controlled startup
========================================
*/

(function () {

  // ========================================
  // DUPLICATE LOAD PROTECTION
  // ========================================
  if (window.__ENTERPRISE_AUTO_WIRING_LAYER__) {
    console.log("[AUTO WIRING LAYER] Already Loaded");
    return;
  }

  console.log("[AUTO WIRING LAYER] LOADING");

  // ========================================
  // GLOBAL STATE
  // ========================================
  window.__ENTERPRISE_AUTO_WIRING_LAYER__ = {
    active: false,
    initialized: false,
    version: "1.2",
    status: "LOADED"
  };

  let healthInterval = null;

  /* ================= CORE SAFE ACCESS ================= */

  function getCore() {
    return (
      window.ENTERPRISE_CORE_ENGINE ||
      window.__ENTERPRISE_CORE_ENGINE__ ||
      null
    );
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

    if (document.__autoWiringClickBound__) return;
    document.__autoWiringClickBound__ = true;

    document.addEventListener("click", function (e) {

      const el = e.target.closest("[data-page]");

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

    if (!CORE || typeof CORE.run !== "function") return;

    window.safeCoreRun = function (name) {
      return CORE.run(name);
    };
  }

  /* ================= HEALTH MONITOR ================= */

  function startHealthMonitor() {

    const CORE = getCore();

    if (!CORE || typeof CORE.healthCheck !== "function") return;

    if (healthInterval) return;

    healthInterval = setInterval(() => {
      try {
        const status = CORE.healthCheck();
        console.log("[AUTO HEALTH]", status);
      } catch (err) {
        console.error("[AUTO HEALTH ERROR]", err);
      }
    }, 10000);
  }

  /* ================= NAVIGATION TRACKING ================= */

  function trackNavigationFlow() {

    const CORE = getCore();

    if (
      !CORE ||
      typeof CORE.emit !== "function" ||
      typeof CORE.on !== "function"
    ) {
      return;
    }

    if (CORE.__navigationTrackingBound__) return;
    CORE.__navigationTrackingBound__ = true;

    CORE.on("NAVIGATION_CLICK", function (data) {

      console.log("[AUTO WIRING] NAV:", data.page);

      CORE.emit("SYSTEM_EVENT", {
        type: "navigation",
        page: data.page,
        time: Date.now()
      });
    });
  }

  /* ================= EXECUTION ROUTER ================= */

  function bindNavigationExecutor() {

    const CORE = getCore();

    if (
      !CORE ||
      typeof CORE.run !== "function" ||
      typeof CORE.on !== "function"
    ) {
      return;
    }

    if (CORE.__navigationExecutorBound__) return;
    CORE.__navigationExecutorBound__ = true;

    CORE.on("NAVIGATION_CLICK", function (data) {

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

    if (window.__ENTERPRISE_AUTO_WIRING_LAYER__.initialized) {
      console.log("[AUTO WIRING] Already Initialized");
      return;
    }

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

    console.log("[AUTO WIRING] ACTIVE & CONNECTED");
  }

  /* ================= GLOBAL EXPORT ================= */

  window.initAutoWiring = initAutoWiring;
  window.getAutoWiringCore = getCore;

  console.log("[AUTO WIRING LAYER] READY");

})();
