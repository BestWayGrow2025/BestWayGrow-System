"use strict";

/*
========================================
PIN SYSTEM HEALTH MONITOR V1.0
========================================
✔ Real-time system health tracking
✔ Detects missing module failures
✔ UI + Router + Engine status check
✔ System readiness scoring
✔ Failure diagnostics only
✔ No execution logic
✔ No UI control
✔ Production LOCKED
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_HEALTH_MONITOR__) return;

  window.__PIN_HEALTH_MONITOR__ = true;

  window.__PIN_HEALTH_STATUS__ = {
    boot: false,
    router: false,
    ui: false,
    engine: false,
    live: false
  };

})();

// ================= STATUS CHECK =================
function checkSystemHealth() {

  const status = window.__PIN_HEALTH_STATUS__;

  status.boot = typeof window.__PIN_BOOT_STATE__ !== "undefined";
  status.router = typeof window.routePinRequest === "function";
  status.ui = typeof window.openPinRequestPanel === "function";
  status.engine = typeof window.createPinRequest === "function";
  status.live = typeof window.startLiveSync === "function";

  return generateHealthReport(status);
}

// ================= HEALTH REPORT =================
function generateHealthReport(status) {

  const total = Object.keys(status).length;

  const active = Object.values(status).filter(Boolean).length;

  const score = Math.round((active / total) * 100);

  const report = {
    score: score,
    status: status,
    state:
      score === 100 ? "HEALTHY" :
      score >= 70 ? "DEGRADED" :
      "CRITICAL",
    timestamp: Date.now()
  };

  console.log("[PIN HEALTH]", report.state, "Score:", score);

  return report;
}

// ================= AUTO MONITOR =================
function startHealthMonitor(interval = 5000) {

  setInterval(() => {

    const report = checkSystemHealth();

    // Optional broadcast
    if (typeof broadcastPinEvent === "function") {
      broadcastPinEvent("PIN_HEALTH_UPDATE", report);
    }

  }, interval);
}

// ================= GET STATUS =================
function getSystemHealth() {
  return window.__PIN_HEALTH_STATUS__;
}

// ================= EXPORT =================
window.checkSystemHealth = checkSystemHealth;
window.startHealthMonitor = startHealthMonitor;
window.getSystemHealth = getSystemHealth;

