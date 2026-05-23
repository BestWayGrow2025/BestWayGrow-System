"use strict";

/*
========================================
PERFORMANCE SCHEDULER v1.1 (ENTERPRISE FINAL)
========================================
✔ Centralized runtime scheduling
✔ Prevents UI render flooding
✔ Debounce + throttle protection
✔ Safe task queue execution
✔ Idle-time optimization
✔ Duplicate schedule prevention
✔ Low-priority background execution
✔ Memory-safe timers
✔ Enterprise runtime governance layer
✔ Cleanup-safe lifecycle management
✔ Production LOCKED
========================================
*/

(function () {

  // ========================================
  // DUPLICATE LOAD PROTECTION
  // ========================================
  if (window.__PERFORMANCE_SCHEDULER__) {
    console.log("[PERFORMANCE SCHEDULER] Already Loaded");
    return;
  }

  window.__PERFORMANCE_SCHEDULER__ = {
    loaded: true,
    version: "1.1"
  };

  console.log("[PERFORMANCE SCHEDULER] Initializing");

  // ========================================
  // INTERNAL STATE
  // ========================================
  const TASK_QUEUE = [];
  const ACTIVE_TIMERS = Object.create(null);
  const ACTIVE_FRAMES = Object.create(null);
  const ACTIVE_IDLE = Object.create(null);

  // ========================================
  // SAFE EXECUTION
  // ========================================
  function safeExecute(fn, label = "anonymous") {

    try {

      if (typeof fn !== "function") {
        return;
      }

      return fn();

    } catch (err) {

      console.error(
        "[PERFORMANCE SCHEDULER ERROR]",
        label,
        err
      );
    }
  }

  // ========================================
  // THROTTLE
  // ========================================
  function throttle(key, fn, delay = 250) {

    if (!key || typeof fn !== "function") {
      return;
    }

    if (ACTIVE_TIMERS[key]) {
      return;
    }

    ACTIVE_TIMERS[key] = setTimeout(function () {

      safeExecute(fn, key);

      clearTimeout(ACTIVE_TIMERS[key]);
      delete ACTIVE_TIMERS[key];

    }, delay);
  }

  // ========================================
  // DEBOUNCE
  // ========================================
  function debounce(key, fn, delay = 300) {

    if (!key || typeof fn !== "function") {
      return;
    }

    if (ACTIVE_TIMERS[key]) {
      clearTimeout(ACTIVE_TIMERS[key]);
    }

    ACTIVE_TIMERS[key] = setTimeout(function () {

      safeExecute(fn, key);

      clearTimeout(ACTIVE_TIMERS[key]);
      delete ACTIVE_TIMERS[key];

    }, delay);
  }

  // ========================================
  // REQUEST ANIMATION FRAME
  // ========================================
  function scheduleFrame(key, fn) {

    if (!key || typeof fn !== "function") {
      return;
    }

    if (ACTIVE_FRAMES[key]) {
      cancelAnimationFrame(ACTIVE_FRAMES[key]);
    }

    ACTIVE_FRAMES[key] = requestAnimationFrame(function () {

      safeExecute(fn, key);

      delete ACTIVE_FRAMES[key];
    });
  }

  // ========================================
  // IDLE TASK
  // ========================================
  function scheduleIdle(key, fn, timeout = 1000) {

    if (!key || typeof fn !== "function") {
      return;
    }

    // Prevent duplicate idle jobs
    if (ACTIVE_IDLE[key]) {
      return;
    }

    if (typeof requestIdleCallback === "function") {

      ACTIVE_IDLE[key] = requestIdleCallback(function () {

        safeExecute(fn, key);

        delete ACTIVE_IDLE[key];

      }, { timeout });

    } else {

      ACTIVE_IDLE[key] = setTimeout(function () {

        safeExecute(fn, key);

        delete ACTIVE_IDLE[key];

      }, timeout);
    }
  }

  // ========================================
  // TASK QUEUE
  // ========================================
  function queueTask(fn, priority = "normal") {

    if (typeof fn !== "function") {
      return;
    }

    TASK_QUEUE.push({
      fn,
      priority,
      timestamp: Date.now()
    });
  }

  // ========================================
  // PROCESS QUEUE
  // ========================================
  function processQueue() {

    if (!TASK_QUEUE.length) {
      return;
    }

    const high = TASK_QUEUE.filter(
      t => t.priority === "high"
    );

    const normal = TASK_QUEUE.filter(
      t => t.priority === "normal"
    );

    const low = TASK_QUEUE.filter(
      t => t.priority === "low"
    );

    TASK_QUEUE.length = 0;

    [...high, ...normal, ...low].forEach(task => {
      safeExecute(task.fn, "queued-task");
    });
  }

  // ========================================
  // AUTO PROCESS LOOP
  // ========================================
  const PROCESSOR_INTERVAL = setInterval(
    processQueue,
    250
  );

  // ========================================
  // CLEANUP GOVERNANCE
  // ========================================
  window.addEventListener("beforeunload", function () {

    Object.keys(ACTIVE_TIMERS).forEach(key => {
      clearTimeout(ACTIVE_TIMERS[key]);
    });

    Object.keys(ACTIVE_FRAMES).forEach(key => {
      cancelAnimationFrame(ACTIVE_FRAMES[key]);
    });

    Object.keys(ACTIVE_IDLE).forEach(key => {

      try {

        if (typeof cancelIdleCallback === "function") {
          cancelIdleCallback(ACTIVE_IDLE[key]);
        } else {
          clearTimeout(ACTIVE_IDLE[key]);
        }

      } catch (_) {}

    });

    clearInterval(PROCESSOR_INTERVAL);

  });

  // ========================================
  // GLOBAL HELPERS
  // ========================================
  window.performanceThrottle = throttle;
  window.performanceDebounce = debounce;
  window.performanceFrame = scheduleFrame;
  window.performanceIdle = scheduleIdle;
  window.performanceQueueTask = queueTask;

  // ========================================
  // RUNTIME GOVERNANCE INTEGRATION
  // ========================================
  if (
    window.SYSTEM_EVENTS &&
    typeof window.SYSTEM_EVENTS.on === "function"
  ) {

    window.SYSTEM_EVENTS.on(
      "SYSTEM_READY",
      function () {

        console.log(
          "[PERFORMANCE SCHEDULER] SYSTEM READY LINKED"
        );
      }
    );
  }

  // ========================================
  // FINAL READY
  // ========================================
  console.log("[PERFORMANCE SCHEDULER] READY");

})();
