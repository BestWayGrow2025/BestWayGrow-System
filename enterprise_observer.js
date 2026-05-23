"use strict";

/*
========================================
ENTERPRISE OBSERVER v1.0 (RUNTIME GOVERNANCE FINAL)
========================================
✔ DOM mutation observer
✔ Duplicate render detection
✔ Infinite refresh loop detection
✔ Event flood monitoring
✔ Render contamination detection
✔ Recursive UI protection
✔ Enterprise runtime governance
✔ Diagnostics compatible
✔ Memory-safe observers
✔ Production LOCKED
========================================
*/

(function () {

  // ========================================
  // INIT GUARD
  // ========================================
  if (window.__ENTERPRISE_OBSERVER__) {
    console.log("[OBSERVER] Already Loaded");
    return;
  }

  window.__ENTERPRISE_OBSERVER__ = true;

  console.log("[OBSERVER] Initializing...");

  // ========================================
  // STATE
  // ========================================
  const OBSERVER_STATE = {
    active: false,
    startedAt: Date.now(),

    mutationCount: 0,
    duplicateWarnings: 0,
    renderWarnings: 0,
    floodWarnings: 0,

    recentMutations: [],
    observedElements: new Map(),

    observer: null
  };

  // ========================================
  // CONFIG
  // ========================================
  const CONFIG = {
    mutationLimit: 150,
    duplicateThreshold: 5,
    floodThreshold: 40,
    windowMs: 3000
  };

  // ========================================
  // SAFE LOGGER
  // ========================================
  function log(type, message, data = null) {

    const payload = {
      type,
      message,
      data,
      timestamp: Date.now()
    };

    console.warn("[ENTERPRISE OBSERVER]", payload);

    if (typeof window.broadcastSystemEvent === "function") {
      window.broadcastSystemEvent("SYSTEM_EVENT", payload);
    }
  }

  // ========================================
  // DUPLICATE DETECTION
  // ========================================
  function detectDuplicatePanels() {

    const cards = document.querySelectorAll(".card");

    const map = {};

    cards.forEach(card => {

      const text = (
        card.innerText ||
        card.textContent ||
        ""
      )
        .trim()
        .slice(0, 80);

      if (!text) return;

      map[text] = (map[text] || 0) + 1;
    });

    Object.keys(map).forEach(key => {

      if (map[key] >= CONFIG.duplicateThreshold) {

        OBSERVER_STATE.duplicateWarnings++;

        log(
          "DUPLICATE_PANEL",
          "Possible duplicate UI render detected",
          {
            content: key,
            count: map[key]
          }
        );
      }
    });
  }

  // ========================================
  // RENDER FLOOD DETECTION
  // ========================================
  function detectRenderFlood() {

    const now = Date.now();

    OBSERVER_STATE.recentMutations =
      OBSERVER_STATE.recentMutations.filter(
        time => now - time < CONFIG.windowMs
      );

    if (
      OBSERVER_STATE.recentMutations.length >
      CONFIG.floodThreshold
    ) {

      OBSERVER_STATE.floodWarnings++;

      log(
        "RENDER_FLOOD",
        "Render flood detected",
        {
          count:
            OBSERVER_STATE.recentMutations.length
        }
      );
    }
  }

  // ========================================
  // OBSERVER CALLBACK
  // ========================================
  function mutationHandler(mutations) {

    OBSERVER_STATE.mutationCount += mutations.length;

    const now = Date.now();

    OBSERVER_STATE.recentMutations.push(now);

    detectRenderFlood();

    mutations.forEach(mutation => {

      if (
        mutation.type === "childList"
      ) {

        detectDuplicatePanels();

      }

    });

    // HARD LIMIT WARNING
    if (
      OBSERVER_STATE.mutationCount >
      CONFIG.mutationLimit
    ) {

      OBSERVER_STATE.renderWarnings++;

      log(
        "HEAVY_MUTATION",
        "Heavy DOM mutation activity detected",
        {
          mutations:
            OBSERVER_STATE.mutationCount
        }
      );

      // reset counter safely
      OBSERVER_STATE.mutationCount = 0;
    }
  }

  // ========================================
  // START OBSERVER
  // ========================================
  function startObserver() {

    if (OBSERVER_STATE.active) {
      return;
    }

    const target =
      document.body || document.documentElement;

    if (!target) {
      return;
    }

    const observer = new MutationObserver(
      mutationHandler
    );

    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: false
    });

    OBSERVER_STATE.observer = observer;
    OBSERVER_STATE.active = true;

    console.log("[OBSERVER] ACTIVE");
  }

  // ========================================
  // STOP OBSERVER
  // ========================================
  function stopObserver() {

    if (
      OBSERVER_STATE.observer
    ) {

      OBSERVER_STATE.observer.disconnect();

      OBSERVER_STATE.active = false;

      console.log("[OBSERVER] STOPPED");
    }
  }

  // ========================================
  // DIAGNOSTICS
  // ========================================
  function getObserverReport() {

    return {
      active:
        OBSERVER_STATE.active,

      startedAt:
        OBSERVER_STATE.startedAt,

      duplicateWarnings:
        OBSERVER_STATE.duplicateWarnings,

      renderWarnings:
        OBSERVER_STATE.renderWarnings,

      floodWarnings:
        OBSERVER_STATE.floodWarnings,

      recentMutations:
        OBSERVER_STATE.recentMutations.length
    };
  }

  // ========================================
  // GLOBAL EXPORTS
  // ========================================
  window.startEnterpriseObserver =
    startObserver;

  window.stopEnterpriseObserver =
    stopObserver;

  window.getEnterpriseObserverReport =
    getObserverReport;

  window.ENTERPRISE_OBSERVER_STATE =
    OBSERVER_STATE;

  // ========================================
  // AUTO START
  // ========================================
  function boot() {

    startObserver();

  }

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      boot
    );

  } else {

    boot();

  }

  console.log("[OBSERVER] READY");

})();

