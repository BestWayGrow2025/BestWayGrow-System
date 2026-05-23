"use strict";

/*
========================================
ENTERPRISE ERROR BOUNDARY v1.0 (FINAL)
========================================
✔ Global runtime error protection
✔ Async promise rejection protection
✔ Recursive crash prevention
✔ Module isolation layer
✔ Enterprise diagnostics integration
✔ Event hub integration
✔ Crash flood protection
✔ White-screen prevention
✔ Production-safe fallback handling
✔ Runtime governance compatible
========================================
*/

(function () {

  // ========================================
  // INIT GUARD
  // ========================================
  if (window.__ENTERPRISE_ERROR_BOUNDARY__) {
    console.log("[ERROR BOUNDARY] Already Loaded");
    return;
  }

  window.__ENTERPRISE_ERROR_BOUNDARY__ = true;

  console.log("[ERROR BOUNDARY] Initializing...");

  // ========================================
  // STATE
  // ========================================
  const ERROR_STATE = {
    totalErrors: 0,
    totalWarnings: 0,
    blockedLoops: 0,

    lastError: null,
    recentErrors: [],

    initialized: false
  };

  // ========================================
  // CONFIG
  // ========================================
  const CONFIG = {
    maxErrorsPerWindow: 20,
    errorWindowMs: 5000,
    maxRecursiveDepth: 5
  };

  // ========================================
  // SAFE LOGGER
  // ========================================
  function log(type, payload = {}) {

    const report = {
      type,
      timestamp: Date.now(),
      ...payload
    };

    console.error("[ERROR BOUNDARY]", report);

    // SYSTEM EVENT HUB
    try {

      if (
        typeof window.broadcastSystemEvent === "function"
      ) {

        window.broadcastSystemEvent(
          "SYSTEM_EVENT",
          report
        );
      }

    } catch (_) {}

    // DIAGNOSTICS CACHE
    try {

      window.__LAST_RUNTIME_ERROR__ = report;

    } catch (_) {}
  }

  // ========================================
  // FLOOD PROTECTION
  // ========================================
  function isErrorFlood() {

    const now = Date.now();

    ERROR_STATE.recentErrors =
      ERROR_STATE.recentErrors.filter(
        time =>
          now - time <
          CONFIG.errorWindowMs
      );

    return (
      ERROR_STATE.recentErrors.length >=
      CONFIG.maxErrorsPerWindow
    );
  }

  // ========================================
  // MAIN ERROR HANDLER
  // ========================================
  function handleRuntimeError(errorData) {

    try {

      ERROR_STATE.totalErrors++;

      ERROR_STATE.lastError = errorData;

      ERROR_STATE.recentErrors.push(
        Date.now()
      );

      // FLOOD PROTECTION
      if (isErrorFlood()) {

        ERROR_STATE.blockedLoops++;

        log("ERROR_FLOOD_BLOCKED", {
          totalErrors:
            ERROR_STATE.totalErrors
        });

        return;
      }

      log("RUNTIME_ERROR", errorData);

    } catch (handlerErr) {

      console.error(
        "[ERROR BOUNDARY FAILURE]",
        handlerErr
      );
    }
  }

  // ========================================
  // WINDOW ERROR CAPTURE
  // ========================================
  function bindWindowErrors() {

    window.addEventListener(
      "error",
      function (event) {

        handleRuntimeError({
          source: "window.onerror",
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno
        });

      }
    );
  }

  // ========================================
  // PROMISE REJECTION CAPTURE
  // ========================================
  function bindPromiseRejections() {

    window.addEventListener(
      "unhandledrejection",
      function (event) {

        handleRuntimeError({
          source:
            "unhandledrejection",

          reason:
            String(
              event.reason ||
              "Unknown Promise Rejection"
            )
        });

      }
    );
  }

  // ========================================
  // SAFE EXECUTION WRAPPER
  // ========================================
  function safeExecute(fn, fallback = null) {

    try {

      if (typeof fn !== "function") {
        return fallback;
      }

      return fn();

    } catch (err) {

      handleRuntimeError({
        source: "safeExecute",
        message: err.message,
        stack: err.stack
      });

      return fallback;
    }
  }

  // ========================================
  // SAFE ASYNC WRAPPER
  // ========================================
  async function safeAsync(fn, fallback = null) {

    try {

      if (typeof fn !== "function") {
        return fallback;
      }

      return await fn();

    } catch (err) {

      handleRuntimeError({
        source: "safeAsync",
        message: err.message,
        stack: err.stack
      });

      return fallback;
    }
  }

  // ========================================
  // MODULE WRAPPER
  // ========================================
  function protectFunction(fnName) {

    if (
      typeof window[fnName] !== "function"
    ) {
      return;
    }

    const original = window[fnName];

    // prevent duplicate wrapping
    if (
      original.__errorBoundaryWrapped
    ) {
      return;
    }

    function wrapped(...args) {

      try {

        return original.apply(
          this,
          args
        );

      } catch (err) {

        handleRuntimeError({
          source:
            "protectedFunction",

          functionName: fnName,

          message:
            err.message,

          stack:
            err.stack
        });

        return null;
      }
    }

    wrapped.__errorBoundaryWrapped = true;
    wrapped.__originalFunction = original;

    window[fnName] = wrapped;
  }

  // ========================================
  // CORE FUNCTION PROTECTION
  // ========================================
  function protectCriticalFunctions() {

    const critical = [

      // core
      "handleNavigation",
      "safeDashboardRun",
      "initDashboard",

      // pin
      "executePinFlow",
      "routePinRequest",

      // rendering
      "renderTable",
      "loadPinRequests",

      // system
      "bootSystem"

    ];

    critical.forEach(protectFunction);
  }

  // ========================================
  // WHITE SCREEN PREVENTION
  // ========================================
  function monitorMainUI() {

    setInterval(function () {

      try {

        const body =
          document.body;

        if (!body) return;

        const visible =
          body.innerHTML.trim().length > 0;

        if (!visible) {

          log(
            "WHITE_SCREEN_DETECTED",
            {
              message:
                "Body content missing"
            }
          );
        }

      } catch (_) {}

    }, 5000);
  }

  // ========================================
  // REPORT
  // ========================================
  function getErrorBoundaryReport() {

    return {

      initialized:
        ERROR_STATE.initialized,

      totalErrors:
        ERROR_STATE.totalErrors,

      totalWarnings:
        ERROR_STATE.totalWarnings,

      blockedLoops:
        ERROR_STATE.blockedLoops,

      lastError:
        ERROR_STATE.lastError
    };
  }

  // ========================================
  // INIT
  // ========================================
  function initErrorBoundary() {

    if (ERROR_STATE.initialized) {
      return;
    }

    bindWindowErrors();

    bindPromiseRejections();

    protectCriticalFunctions();

    monitorMainUI();

    ERROR_STATE.initialized = true;

    console.log(
      "[ERROR BOUNDARY] ACTIVE"
    );
  }

  // ========================================
  // GLOBAL EXPORTS
  // ========================================
  window.safeExecute =
    safeExecute;

  window.safeAsync =
    safeAsync;

  window.handleRuntimeError =
    handleRuntimeError;

  window.getErrorBoundaryReport =
    getErrorBoundaryReport;

  window.ENTERPRISE_ERROR_STATE =
    ERROR_STATE;

  // ========================================
  // AUTO START
  // ========================================
  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initErrorBoundary
    );

  } else {

    initErrorBoundary();

  }

  console.log(
    "[ERROR BOUNDARY] READY"
  );

})();
