"use strict";

/*
========================================
PIN LIVE BRIDGE V1.0 (SYNC LAYER CORE)
========================================
✔ Connects Orchestrator ↔ UI Panel
✔ Bridges Router events → Live UI updates
✔ No business logic (SYNC ONLY)
✔ No direct engine calls
✔ Event-driven UI refresh layer
✔ Production-safe bridge connector
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

// ================= ORCHESTRATOR SYNC =================
function bindOrchestratorEvents() {

  if (typeof onPinEvent !== "function") return;

  // LIVE REQUEST UPDATE
  onPinEvent("PIN_REQUEST_UPDATED", function (data) {

    pushToLivePanel(data);

    refreshAdminPanel();

  });

  // FLOW EXECUTION EVENTS
  onPinEvent("PIN_FLOW_EXECUTED", function () {

    triggerUIRefresh();

  });

  // ROUTER EVENTS
  onPinEvent("PIN_ROUTER_EXECUTED", function () {

    triggerUIRefresh();

  });
}

// ================= ROUTER SYNC =================
function bindRouterEvents() {

  if (typeof routePinRequest !== "function") return;

  const original = window.routePinRequest;

  window.routePinRequest = function (...args) {

    const result = original.apply(this, args);

    triggerUIRefresh();

    return result;
  };
}

// ================= GLOBAL UI REFRESH =================
function bindGlobalRefreshHooks() {

  window.refreshPinUI = function () {

    triggerUIRefresh();

  };
}

// ================= UI PUSH =================
function pushToLivePanel(data) {

  if (typeof window.renderTable === "function") {
    window.renderTable(data);
  }

  const panel = document.getElementById("pinLivePanel");

  if (panel && typeof window.syncData === "function") {
    window.syncData();
  }
}

// ================= ADMIN PANEL REFRESH =================
function refreshAdminPanel() {

  if (typeof window.loadPinRequests === "function") {
    window.loadPinRequests();
  }

  if (typeof window.refreshPinPanelStatus === "function") {
    window.refreshPinPanelStatus();
  }
}

// ================= MASTER UI TRIGGER =================
function triggerUIRefresh() {

  pushToLivePanel([]);

  refreshAdminPanel();

  if (typeof window.loadPins === "function") {
    window.loadPins();
  }
}

// ================= GLOBAL EXPORT =================
window.triggerUIRefresh = triggerUIRefresh;
window.pushToLivePanel = pushToLivePanel;
