/*
========================================
INTEGRATION LOCK LAYER V1.0
CENTRAL EXECUTION SAFETY CONTROLLER
========================================
✔ Prevents duplicate execution
✔ Controls CTOR flow safety
✔ Controls PIN flow safety
✔ Unified action dispatcher
✔ System-wide execution guard
✔ Production safe
========================================
*/

"use strict";

// =====================================
// GLOBAL INTEGRATION LOCK STATE
// =====================================
window.INTEGRATION_LOCK = {
  CTOR_RUNNING: false,
  PIN_RUNNING: false,
  ACTION_QUEUE: [],
  LAST_ACTION: null
};

// =====================================
// SAFE EXECUTION WRAPPER
// =====================================
function executeLocked(actionName, fn) {

  if (typeof fn !== "function") {
    console.warn("[LOCK] Invalid function:", actionName);
    return false;
  }

  // log action
  window.INTEGRATION_LOCK.ACTION_QUEUE.push({
    action: actionName,
    time: new Date().toISOString()
  });

  window.INTEGRATION_LOCK.LAST_ACTION = actionName;

  try {
    return fn();
  } catch (err) {
    console.error("[LOCK ERROR]", actionName, err);
    return false;
  }
}

// =====================================
// CTOR SAFE LOCK
// =====================================
function safeRunCTOR() {

  if (window.INTEGRATION_LOCK.CTOR_RUNNING) {
    alert("⚠ CTOR already running. Please wait.");
    return;
  }

  window.INTEGRATION_LOCK.CTOR_RUNNING = true;

  executeLocked("CTOR_DISTRIBUTION", function () {

    if (typeof distributeCTOR === "function") {
      distributeCTOR();
    } else {
      console.warn("distributeCTOR not found");
    }

  });

  setTimeout(() => {
    window.INTEGRATION_LOCK.CTOR_RUNNING = false;
  }, 3000);
}

// =====================================
// PIN SAFE LOCK
// =====================================
function safeGeneratePIN() {

  if (window.INTEGRATION_LOCK.PIN_RUNNING) {
    alert("⚠ PIN process already running.");
    return;
  }

  window.INTEGRATION_LOCK.PIN_RUNNING = true;

  executeLocked("PIN_GENERATION", function () {

    if (typeof createPIN === "function") {
      createPIN();
    } else {
      console.warn("createPIN not found");
    }

  });

  setTimeout(() => {
    window.INTEGRATION_LOCK.PIN_RUNNING = false;
  }, 2000);
}

// =====================================
// SAFE DASHBOARD ACTION CALLER
// =====================================
function safeAction(actionName) {

  const fn = window[actionName];

  if (typeof fn === "function") {
    return executeLocked(actionName, fn);
  }

  console.warn("[LOCK] Action not found:", actionName);
  return false;
}

// =====================================
// DASHBOARD BINDING SYSTEM
// =====================================
function bindIntegrationActions() {

  const buttons = document.querySelectorAll("[data-action]");

  buttons.forEach(btn => {

    btn.addEventListener("click", function () {

      const action = this.getAttribute("data-action");

      safeAction(action);

    });

  });

}

// =====================================
// SYSTEM DEBUG VIEW (OPTIONAL)
// =====================================
function getIntegrationStatus() {

  return {
    CTOR_RUNNING: window.INTEGRATION_LOCK.CTOR_RUNNING,
    PIN_RUNNING: window.INTEGRATION_LOCK.PIN_RUNNING,
    LAST_ACTION: window.INTEGRATION_LOCK.LAST_ACTION,
    QUEUE_SIZE: window.INTEGRATION_LOCK.ACTION_QUEUE.length
  };
}

// =====================================
// GLOBAL EXPORTS
// =====================================
window.executeLocked = executeLocked;
window.safeRunCTOR = safeRunCTOR;
window.safeGeneratePIN = safeGeneratePIN;
window.safeAction = safeAction;
window.bindIntegrationActions = bindIntegrationActions;
window.getIntegrationStatus = getIntegrationStatus;
