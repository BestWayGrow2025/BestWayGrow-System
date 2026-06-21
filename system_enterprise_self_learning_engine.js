"use strict";

/*
========================================
ENTERPRISE SELF-LEARNING ENGINE v1.0
ADAPTIVE AI BEHAVIOR LAYER
========================================
✔ User behavior tracking
✔ Predictive module routing
✔ Adaptive UI intelligence
✔ Memory learning system
✔ Continuous optimization loop
========================================
*/

console.log("[SELF LEARNING ENGINE] LOADED");

/* ================= CORE LINK ================= */

const CORE =
  window.ENTERPRISE_CORE_ENGINE ||
  window.__ENTERPRISE_CORE_ENGINE__;

/* ================= MEMORY STORE ================= */

const LEARNING = {
  clicks: {},
  history: [],
  predictionCache: {}
};

/* ================= TRACK USER ACTION ================= */

function track(page) {

  if (!page) return;

  // count clicks
  LEARNING.clicks[page] =
    (LEARNING.clicks[page] || 0) + 1;

  // history log
  LEARNING.history.push({
    page,
    time: Date.now()
  });

  console.log("[LEARNING] tracked:", page);
}

/* ================= PREDICTION ENGINE ================= */

function predictNext() {

  let topPage = null;
  let max = 0;

  Object.keys(LEARNING.clicks).forEach(page => {
    if (LEARNING.clicks[page] > max) {
      max = LEARNING.clicks[page];
      topPage = page;
    }
  });

  return topPage || "home";
}

/* ================= AUTO PRELOAD ENGINE ================= */

function preload(page) {

  if (!CORE) return;

  console.log("[LEARNING] preloading:", page);

  // optional preload via core engine
  if (typeof CORE.run === "function") {
    // silent preload (safe execution)
    try {
      CORE.run(page);
    } catch (e) {
      console.warn("[LEARNING PRELOAD FAILED]", e);
    }
  }
}

/* ================= SMART ROUTER ================= */

function smartRoute(event) {

  track(event.page);

  const next = predictNext();

  console.log("[LEARNING] predicted next:", next);

  // preload next likely module
  preload(next);
}

/* ================= EVENT LISTENER ================= */

function initLearning() {

  document.addEventListener("click", function (e) {

    const target = e.target;

    if (!target || !target.dataset) return;

    const page = target.dataset.page;

    if (!page) return;

    smartRoute({ page });

  });

}

/* ================= PERIODIC OPTIMIZATION ================= */

function optimize() {

  setInterval(() => {

    console.log("[LEARNING] optimizing system...");

    const prediction = predictNext();

    if (prediction) {
      preload(prediction);
    }

  }, 15000);

}

/* ================= INIT ================= */

function initSelfLearning() {

  initLearning();
  optimize();

  console.log("[SELF LEARNING ENGINE] ACTIVE");

}

/* ================= BOOT ================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSelfLearning);
} else {
  initSelfLearning();
}

/* ================= EXPORT ================= */

window.__ENTERPRISE_SELF_LEARNING_ENGINE__ = LEARNING;

