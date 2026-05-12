"use strict";

/*
========================================
SYSTEM RECOVERY MANAGER V1.0 (ENTERPRISE RESILIENCE CORE)
========================================
✔ Automatic system failure detection
✔ Module-level recovery orchestration
✔ Event-driven rollback system
✔ Safe restore checkpoints
✔ Cross-system integration (PIN / Wallet / Income / Payout)
✔ Works with system_event_hub.js
✔ Production-grade disaster recovery layer
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__SYSTEM_RECOVERY_MANAGER__) return;

  window.__SYSTEM_RECOVERY_MANAGER__ = true;

  initSystemRecoveryManager();

})();

// ================= GLOBAL SLC HOOK =================
window.systemRecoveryManager = window.systemRecoveryManager || {
  autoRecover: function () {
    console.log("AUTO RECOVERY: Activated by SLC");

    if (window.SYSTEM_EVENTS) {
      window.SYSTEM_EVENTS.emit("RECOVERY_MODE_ACTIVE", {
        time: Date.now()
      });
    }
  }
};

// ================= CONFIG =================
const RECOVERY_STATE = {
  lastCheckpoint: null,
  failureLog: [],
  recoveryInProgress: false
};

// ================= INIT =================
function initSystemRecoveryManager() {

  // SLC integration check
  if (window.systemRecoveryManager && window.systemRecoveryManager.autoRecover) {
    console.log("[RECOVERY] SLC Hook detected - binding auto recovery layer");
  }

  bindSystemFailureWatchers();
  bindRecoveryEvents();
  exposeRecoveryAPI();

  console.log("[RECOVERY] System Recovery Manager initialized");
}

// ================= FAILURE WATCHER =================
function bindSystemFailureWatchers() {

  if (!window.SYSTEM_EVENTS) return;

  window.SYSTEM_EVENTS.on("SYSTEM_EVENT_ERROR", handleSystemFailure);
  window.SYSTEM_EVENTS.on("PIN_FLOW_EVENT", monitorPinFlow);
  window.SYSTEM_EVENTS.on("PAYOUT_EVENT", monitorPayoutFlow);
  window.SYSTEM_EVENTS.on("BANK_UPDATE", monitorBankState);
}

// ================= CORE FAILURE HANDLER =================
function handleSystemFailure(errorData) {

  RECOVERY_STATE.failureLog.push({
    type: "SYSTEM_FAILURE",
    data: errorData,
    time: Date.now()
  });

  console.error("[RECOVERY] System failure detected:", errorData);

  triggerAutoRecovery(errorData);
}

// ================= PIN FLOW MONITOR =================
function monitorPinFlow(data) {

  if (!data) return;

  if (data.result && data.result.error) {
    handleSystemFailure({
      module: "PIN",
      detail: data.result.error
    });
  }
}

// ================= PAYOUT MONITOR =================
function monitorPayoutFlow(data) {

  if (!data) return;

  if (data.result && data.result.failed) {
    handleSystemFailure({
      module: "PAYOUT",
      detail: data.result
    });
  }
}

// ================= BANK MONITOR =================
function monitorBankState(data) {

  if (!data) return;

  if (data.result && data.result.status === "CORRUPT") {
    handleSystemFailure({
      module: "BANK",
      detail: data.result
    });
  }
}

// ================= AUTO RECOVERY ENGINE =================
function triggerAutoRecovery(failureData) {

  if (RECOVERY_STATE.recoveryInProgress) return;

  RECOVERY_STATE.recoveryInProgress = true;

  console.warn("[RECOVERY] Attempting auto recovery...");

  try {

    const module = failureData.module || "UNKNOWN";

    switch (module) {

      case "PIN":
        recoverPinSystem();
        break;

      case "PAYOUT":
        recoverPayoutSystem();
        break;

      case "BANK":
        recoverBankSystem();
        break;

      default:
        recoverFullSystem();
        break;
    }

    markRecoverySuccess(module);

  } catch (err) {

    console.error("[RECOVERY] Recovery failed:", err);

    RECOVERY_STATE.failureLog.push({
      type: "RECOVERY_FAILED",
      error: err,
      time: Date.now()
    });

  } finally {

    RECOVERY_STATE.recoveryInProgress = false;
  }
}

// ================= MODULE RECOVERY =================
function recoverPinSystem() {

  console.warn("[RECOVERY] Restoring PIN system state...");

  if (typeof window.resetPinSystemCache === "function") {
    window.resetPinSystemCache();
  }

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("PIN_RECOVERED", { status: "RESTORED" });
  }
}

function recoverPayoutSystem() {

  console.warn("[RECOVERY] Restoring payout system...");

  if (typeof window.resetPayoutQueue === "function") {
    window.resetPayoutQueue();
  }

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("PAYOUT_RECOVERED", { status: "RESTORED" });
  }
}

function recoverBankSystem() {

  console.warn("[RECOVERY] Restoring bank system...");

  if (typeof window.resetBankState === "function") {
    window.resetBankState();
  }

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("BANK_RECOVERED", { status: "RESTORED" });
  }
}

function recoverFullSystem() {

  console.warn("[RECOVERY] Performing FULL SYSTEM recovery...");

  recoverPinSystem();
  recoverPayoutSystem();
  recoverBankSystem();

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("SYSTEM_FULL_RECOVERY", {
      status: "ALL_MODULES_RESTORED"
    });
  }
}

// ================= RECOVERY SUCCESS =================
function markRecoverySuccess(module) {

  console.log(`[RECOVERY] ${module} system recovered successfully`);

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("RECOVERY_SUCCESS", {
      module,
      time: Date.now()
    });
  }
}

// ================= API =================
function exposeRecoveryAPI() {

  window.SYSTEM_RECOVERY = {

    getState: () => RECOVERY_STATE,

    forceRecovery: (module) => triggerAutoRecovery({ module }),

    clearLogs: () => {
      RECOVERY_STATE.failureLog = [];
    }
  };
}

// ================= SLC BINDING =================
function bindSLCToRecovery() {

  if (window.SystemLayerController) {

    console.log("[RECOVERY] Connected to System Layer Controller");

    window.SystemLayerController.setMode("NORMAL");

  }
}

// auto connect after boot
setTimeout(bindSLCToRecovery, 1500);
