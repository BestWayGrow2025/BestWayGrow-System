"use strict";

/*
========================================
PERFORMANCE SCHEDULER v1.0 (FINAL CORE)
========================================
✔ Throttle + debounce engine
✔ Frame scheduling (RAF)
✔ Idle task support
✔ Queue-based execution
✔ Prevents UI flood + render spikes
✔ Memory-safe timers
✔ Duplicate call protection
✔ Production LOCKED
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.__PERFORMANCE_SCHEDULER__) return;

  window.__PERFORMANCE_SCHEDULER__ = {
    loaded: true,
    version: "1.0"
  };

  console.log("[SCHEDULER] ACTIVE");

  // ================= INTERNAL STATE =================
  const timers = Object.create(null);
  const frames = Object.create(null);
  const idleTasks = Object.create(null);
  const queue = [];

  let processing = false;

  // ================= SAFE EXEC =================
  function safe(fn, label = "task") {
    try {
      return typeof fn === "function" ? fn() : null;
    } catch (err) {
      console.error("[SCHEDULER ERROR]", label, err);
    }
  }

  // ================= THROTTLE =================
  function throttle(key, fn, delay = 200) {
    if (!key || typeof fn !== "function") return;
    if (timers[key]) return;

    timers[key] = setTimeout(() => {
      safe(fn, key);
      clearTimeout(timers[key]);
      delete timers[key];
    }, delay);
  }

  // ================= DEBOUNCE =================
  function debounce(key, fn, delay = 250) {
    if (!key || typeof fn !== "function") return;

    if (timers[key]) {
      clearTimeout(timers[key]);
    }

    timers[key] = setTimeout(() => {
      safe(fn, key);
      clearTimeout(timers[key]);
      delete timers[key];
    }, delay);
  }

  // ================= RAF =================
  function frame(key, fn) {
    if (!key || typeof fn !== "function") return;

    if (frames[key]) {
      cancelAnimationFrame(frames[key]);
    }

    frames[key] = requestAnimationFrame(() => {
      safe(fn, key);
      delete frames[key];
    });
  }

  // ================= IDLE =================
  function idle(key, fn, timeout = 1000) {
    if (!key || typeof fn !== "function") return;

    if (idleTasks[key]) return;

    const run = () => {
      safe(fn, key);
      delete idleTasks[key];
    };

    if (typeof requestIdleCallback === "function") {
      idleTasks[key] = requestIdleCallback(run, { timeout });
    } else {
      idleTasks[key] = setTimeout(run, timeout);
    }
  }

  // ================= QUEUE =================
  function queueTask(fn, priority = "normal") {
    if (typeof fn !== "function") return;

    queue.push({
      fn,
      priority,
      time: Date.now()
    });
  }

  // ================= PROCESS QUEUE =================
  function processQueue() {
    if (processing || queue.length === 0) return;

    processing = true;

    const high = queue.filter(t => t.priority === "high");
    const normal = queue.filter(t => t.priority === "normal");
    const low = queue.filter(t => t.priority === "low");

    queue.length = 0;

    [...high, ...normal, ...low].forEach(task => {
      safe(task.fn, "queue");
    });

    processing = false;
  }

  // ================= LOOP =================
  setInterval(processQueue, 250);

  // ================= GLOBAL API =================
  window.performanceThrottle = throttle;
  window.performanceDebounce = debounce;
  window.performanceFrame = frame;
  window.performanceIdle = idle;
  window.performanceQueueTask = queueTask;

  // ================= SYSTEM READY HOOK =================
  if (window.SYSTEM_EVENTS?.on) {
    window.SYSTEM_EVENTS.on("SYSTEM_READY", () => {
      console.log("[SCHEDULER] SYSTEM READY LINKED");
    });
  }

  console.log("[SCHEDULER] READY");

})();
