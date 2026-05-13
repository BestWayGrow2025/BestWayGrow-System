"use strict";

/*
========================================
SYSTEM SELF-COHERENCE LAYER (SCL++) FINAL STABLE
========================================
✔ Tiered system integrity validation
✔ Core system protection (NON-BLOCKING AI LAYERS)
✔ No false system locks
✔ Safe monitoring
✔ Production stable
========================================
*/

(function () {

  if (window.__SYSTEM_SCL__) return;

  window.__SYSTEM_SCL__ = true;

  document.addEventListener("DOMContentLoaded", initSCL);

})();

// ================= INIT =================
function initSCL() {

  console.log("[SCL] Self-Coherence Layer Activated");

  validateSystemIntegrity();
  startContinuousMonitoring();
}

// ================= SYSTEM VALIDATION =================
function validateSystemIntegrity() {

  // ================= CORE (CRITICAL) =================
  const requiredCore = [
    "SYSTEM_EVENTS",
    "__SYSTEM_DIAGNOSTICS__",
    "__SYSTEM_CONTROL_CENTER__",
    "__SYSTEM_LAYER_CONTROLLER__",
    "__SYSTEM_RECOVERY_MANAGER__"
  ];

  // ================= OPTIONAL AI LAYERS =================
  const optionalAI = [
    "SYSTEM_ORCHESTRATOR_AI",
    "SYSTEM_OS_MODE",
    "SYSTEM_AI_GOVERNOR"
  ];

  const missingCore = requiredCore.filter(r => !window[r]);
  const missingAI = optionalAI.filter(r => !window[r]);

  // ❌ ONLY CORE FAILURES CAN LOCK SYSTEM
  if (missingCore.length > 0) {

    console.error("[SCL] CRITICAL MODULES MISSING:", missingCore);

    triggerSystemLock("CRITICAL_MODULES_MISSING", missingCore);

  } else {
    console.log("[SCL] Core system integrity OK");
  }

  // ⚠️ AI MODULES ARE NON-BLOCKING
  if (missingAI.length > 0) {
    console.warn("[SCL] AI modules not loaded (non-critical):", missingAI);
  }

  console.log("[SCL] System integrity check complete");
}

// ================= CONTINUOUS MONITOR =================
function startContinuousMonitoring() {

  setInterval(() => {

    if (!window.SYSTEM_EVENTS) return;

    const snapshot = window.__SYSTEM_SNAPSHOT__ || {};

    window.SYSTEM_EVENTS.emit("SCL_SNAPSHOT", {
      time: Date.now(),
      snapshot
    });

  }, 8000);
}

// ================= SYSTEM LOCK =================
function triggerSystemLock(reason, data) {

  console.error("[SCL] SYSTEM LOCK TRIGGERED:", reason, data);

  if (window.SYSTEM_EVENTS) {

    window.SYSTEM_EVENTS.emit("SYSTEM_LOCK", {
      reason,
      data,
      time: Date.now()
    });
  }

  // Attempt recovery ONLY if available
  if (window.SYSTEM_RECOVERY && window.SYSTEM_RECOVERY.forceRecovery) {
    window.SYSTEM_RECOVERY.forceRecovery("FULL");
  }
}

// ================= GLOBAL ACCESS =================
window.SCL = {
  validate: validateSystemIntegrity,
  lock: triggerSystemLock
};    
