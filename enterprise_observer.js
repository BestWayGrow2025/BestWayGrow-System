"use strict";

/*
========================================
ENTERPRISE OBSERVER v1.0 (FINAL GOVERNANCE LAYER)
========================================
✔ Central state observation engine
✔ Prevents duplicate UI re-renders
✔ Watches SYSTEM_EVENTS + PIN + SESSION changes
✔ Debounced global change detection
✔ Safe subscription model
✔ Memory-safe listener registry
✔ Integrates with SYSTEM_EVENT_HUB
✔ Works with DIAGNOSTICS + PIN LIVE SYSTEM
✔ Prevents dashboard blinking loops
✔ Production LOCKED CORE
========================================
*/

(function () {

  // ========================================
  // DUPLICATE LOAD GUARD
  // ========================================
  if (window.__ENTERPRISE_OBSERVER__) {
    console.log("[OBSERVER] Already Loaded");
    return;
  }

  window.__ENTERPRISE_OBSERVER__ = {
    loaded: true,
    version: "1.0"
  };

  console.log("[OBSERVER] Initializing Enterprise Observer");

  // ========================================
  // INTERNAL STATE
  // ========================================
  const OBSERVERS = {};
  const CHANGE_QUEUE = [];
  let PROCESSING = false;
  let TIMER = null;

  // ========================================
  // SAFE EXECUTION WRAPPER
  // ========================================
  function safeRun(fn, label = "observer") {
    try {
      if (typeof fn !== "function") return null;
      return fn();
    } catch (err) {
      console.error("[OBSERVER ERROR]", label, err);
      return null;
    }
  }

  // ========================================
  // STATE HASH GENERATOR
  // ========================================
  function createHash(obj) {
    try {
      return JSON.stringify(obj);
    } catch (_) {
      return String(Date.now());
    }
  }

  // ========================================
  // REGISTER OBSERVER
  // ========================================
  function observe(key, selectorFn, callback, options = {}) {

    if (typeof selectorFn !== "function") return;
    if (typeof callback !== "function") return;

    OBSERVERS[key] = {
      selectorFn,
      callback,
      lastHash: null,
      debounce: options.debounce || 200
    };

    console.log("[OBSERVER] Registered:", key);
  }

  // ========================================
  // REMOVE OBSERVER
  // ========================================
  function unobserve(key) {
    delete OBSERVERS[key];
  }

  // ========================================
  // QUEUE CHANGE
  // ========================================
  function queueChange(change) {
    CHANGE_QUEUE.push(change);
  }

  // ========================================
  // PROCESS QUEUE (BATCH SAFE)
  // ========================================
  function processQueue() {

    if (PROCESSING) return;
    PROCESSING = true;

    const batch = CHANGE_QUEUE.splice(0, CHANGE_QUEUE.length);

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];

      safeRun(() => {
        item.callback(item.data);
      }, item.key);
    }

    PROCESSING = false;
  }

  // ========================================
  // DETECT CHANGES
  // ========================================
  function detectChanges() {

    Object.keys(OBSERVERS).forEach((key) => {

      const observer = OBSERVERS[key];
      if (!observer) return;

      const data = safeRun(observer.selectorFn, key);
      const hash = createHash(data);

      if (observer.lastHash !== hash) {

        observer.lastHash = hash;

        queueChange({
          key,
          data,
          callback: observer.callback
        });
      }
    });

    processQueue();
  }

  // ========================================
  // SCHEDULE DETECTION (DEBOUNCE)
  // ========================================
  function scheduleDetection() {

    if (TIMER) clearTimeout(TIMER);

    TIMER = setTimeout(() => {
      detectChanges();
    }, 250);
  }

  // ========================================
  // GLOBAL SYSTEM HOOKS
  // ========================================
  function bindSystemHooks() {

    if (window.SYSTEM_EVENTS?.on) {

      window.SYSTEM_EVENTS.on("SYSTEM_READY", () => {
        console.log("[OBSERVER] SYSTEM READY detected");
        detectChanges();
      });

      window.SYSTEM_EVENTS.on("PIN_REQUEST_EVENT", scheduleDetection);
      window.SYSTEM_EVENTS.on("PIN_FLOW_EXECUTED", scheduleDetection);
      window.SYSTEM_EVENTS.on("BANK_UPDATE", scheduleDetection);
      window.SYSTEM_EVENTS.on("PAYOUT_EVENT", scheduleDetection);
    }

    // session / storage sync trigger
    window.addEventListener("storage", scheduleDetection);
  }

  // ========================================
  // PUBLIC API
  // ========================================
  function getObserverState() {
    return {
      observerCount: Object.keys(OBSERVERS).length,
      queueSize: CHANGE_QUEUE.length,
      processing: PROCESSING
    };
  }

  function forceCheck() {
    detectChanges();
  }

  // ========================================
  // INIT
  // ========================================
  function init() {

    bindSystemHooks();

    // initial safe scan
    setTimeout(() => {
      detectChanges();
    }, 500);

    console.log("[OBSERVER] READY");
  }

  // ========================================
  // AUTO START
  // ========================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ========================================
  // EXPORT GLOBALS
  // ========================================
  window.observe = observe;
  window.unobserve = unobserve;
  window.forceObserverCheck = forceCheck;
  window.getObserverState = getObserverState;

})();
