"use strict";

/*
========================================
EVENT ORCHESTRATOR ENGINE V1.0 (SYSTEM BRAIN)
========================================
✔ Central event decision engine
✔ Routes events to system modules
✔ Detects anomalies + triggers recovery
✔ Connects Income, Ledger, Wallet, Replay
========================================
*/

// ================= EVENT ROUTER =================
function processSystemEvent(event) {
  try {
    if (!event || !event.type) return false;

    switch (event.type) {

      // ================= INCOME EVENTS =================
      case "income_created":
      case "upgrade_income":
      case "repurchase_income":
      case "ctor_income":

        return handleIncomeEvent(event);

      // ================= WALLET EVENTS =================
      case "wallet_credit":
      case "wallet_debit":

        return handleWalletEvent(event);

      // ================= LEDGER EVENTS =================
      case "ledger_write":

        return handleLedgerEvent(event);

      // ================= SYSTEM EVENTS =================
      case "system_error":
      case "system_warning":

        return handleSystemEvent(event);

      // ================= UNKNOWN =================
      default:

        return handleUnknownEvent(event);
    }

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("ORCHESTRATOR_ERROR: " + err.message);
    }
    return false;
  }
}

// ================= INCOME HANDLER =================
function handleIncomeEvent(event) {
  if (event.amount > 100000) {
    triggerAlert("HIGH_INCOME_DETECTED", event);
  }

  if (event.source === "repurchase") {
    // future hook for repurchase analytics
  }

  return true;
}

// ================= WALLET HANDLER =================
function handleWalletEvent(event) {
  if (event.balance < 0) {
    triggerAlert("NEGATIVE_WALLET_DETECTED", event);
  }

  return true;
}

// ================= LEDGER HANDLER =================
function handleLedgerEvent(event) {
  if (!event.txId) {
    triggerAlert("INVALID_LEDGER_ENTRY", event);
  }

  return true;
}

// ================= SYSTEM HANDLER =================
function handleSystemEvent(event) {
  if (event.level === "critical") {
    triggerEmergencyRecovery(event);
  }

  return true;
}

// ================= UNKNOWN =================
function handleUnknownEvent(event) {
  if (typeof console !== "undefined") {
    console.warn("[ORCHESTRATOR] Unknown event:", event);
  }
  return false;
}

// ================= ALERT SYSTEM =================
function triggerAlert(type, event) {
  if (typeof console !== "undefined") {
    console.warn("[ALERT]", type, event);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("SYSTEM_ALERT", {
        detail: { type, event }
      })
    );
  }
}

// ================= EMERGENCY RECOVERY =================
function triggerEmergencyRecovery(event) {
  if (typeof console !== "undefined") {
    console.error("[EMERGENCY RECOVERY TRIGGERED]", event);
  }

  if (typeof replayFullSystem === "function") {
    replayFullSystem();
  }
}

// ================= EXPORT =================
window.processSystemEvent = processSystemEvent;

window.__EVENT_ORCHESTRATOR_ACTIVE__ = true;
