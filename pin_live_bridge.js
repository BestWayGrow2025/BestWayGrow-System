"use strict";

/*
========================================
PIN LIVE BRIDGE V1.1 (BLINK FIX FINAL)
========================================
✔ Connects Orchestrator ↔ UI Panel
✔ Bridges Router events → Live UI updates
✔ No business logic (SYNC ONLY)
✔ No direct engine calls
✔ Event-driven UI refresh layer
✔ Production-safe bridge connector
✔ FIXED: Prevents PIN Master page blinking
✔ FIXED: Refresh only when relevant UI exists
✔ FIXED: Duplicate route wrapping protection
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_LIVE_BRIDGE__) return;

  window.__PIN_LIVE_BRIDGE__ = true;

  initPinLiveBridge();

})();

// ================= INIT =================
function initPinLiveBridge() {

  bindOrchestratorEvents();
  bindRouterEvents();
  bindGlobalRefreshHooks();

}

// ================= PAGE DETECTION =================
function isPinRequestPageActive() {

  return !!(
    document.getElementById("pinLivePanel") ||
    document.getElementById("pinRequestTable") ||
    document.querySelector("[data-pin-request-table]") ||
    document.querySelector(".pin-request-table")
  );
}

// ================= ORCHESTRATOR SYNC =================
function bindOrchestratorEvents() {

  if (typeof onPinEvent !== "function") return;

  // LIVE REQUEST UPDATE
  onPinEvent("PIN_REQUEST_UPDATED", function (data) {

    // CRITICAL FIX:
    // Do nothing unless a PIN request UI is currently visible.
    if (!isPinRequestPageActive()) return;

    pushToLivePanel(data);
    refreshAdminPanel();

  });

  // FLOW EXECUTION EVENTS
  onPinEvent("PIN_FLOW_EXECUTED", function () {

    if (!isPinRequestPageActive()) return;

    triggerUIRefresh();

  });

  // ROUTER EVENTS
  onPinEvent("PIN_ROUTER_EXECUTED", function () {

    if (!isPinRequestPageActive()) return;

    triggerUIRefresh();

  });
}

// ================= ROUTER SYNC =================
function bindRouterEvents() {

  if (typeof routePinRequest !== "function") return;

  // Prevent duplicate wrapping
  if (window.routePinRequest.__pinLiveBridgeWrapped === true) {
    return;
  }

  const original = window.routePinRequest;

  function wrappedRoutePinRequest(...args) {

    const result = original.apply(this, args);

    if (isPinRequestPageActive()) {
      triggerUIRefresh();
    }

    return result;
  }

  wrappedRoutePinRequest.__pinLiveBridgeWrapped = true;
  wrappedRoutePinRequest.__originalFunction = original;

  window.routePinRequest = wrappedRoutePinRequest;
}

// ================= GLOBAL UI REFRESH =================
function bindGlobalRefreshHooks() {

  window.refreshPinUI = function () {

    if (!isPinRequestPageActive()) return;

    triggerUIRefresh();

  };
}

// ================= UI PUSH =================
function pushToLivePanel(data) {

  if (!isPinRequestPageActive()) {
    return;
  }

  try {
    if (typeof window.renderTable === "function") {
      window.renderTable(data);
    }
  } catch (_) {}

  try {
    const panel = document.getElementById("pinLivePanel");

    if (panel && typeof window.syncData === "function") {
      window.syncData();
    }
  } catch (_) {}
}

// ================= ADMIN PANEL REFRESH =================
function refreshAdminPanel() {

  if (!isPinRequestPageActive()) {
    return;
  }

  try {
    if (typeof window.loadPinRequests === "function") {
      window.loadPinRequests();
    }
  } catch (_) {}

  try {
    if (typeof window.refreshPinPanelStatus === "function") {
      window.refreshPinPanelStatus();
    }
  } catch (_) {}
}

// ================= MASTER UI TRIGGER =================
function triggerUIRefresh() {

  if (!isPinRequestPageActive()) {
    return;
  }

  pushToLivePanel([]);
  refreshAdminPanel();

  // REMOVED:
  // loadPins() was being called unnecessarily and could
  // trigger UI redraws even on non-request pages.
}

// ================= GLOBAL EXPORT =================
window.triggerUIRefresh = triggerUIRefresh;
window.pushToLivePanel = pushToLivePanel;
