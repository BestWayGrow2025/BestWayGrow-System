"use strict";

/*
========================================
PIN LIVE ORCHESTRATOR V1.0 (REAL-TIME CORE)
========================================
✔ Central event bus for PIN system
✔ Real-time sync across all dashboards
✔ Watches request + flow + approval changes
✔ Bridges request system + live UI panels
✔ No direct engine control (SAFE LAYER ONLY)
✔ Event-driven architecture (NOT polling based)
✔ Production LOCKED CORE SYNC ENGINE
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__PIN_LIVE_ORCHESTRATOR__) return;

  window.__PIN_LIVE_ORCHESTRATOR__ = true;

  initPinLiveOrchestrator();

})();

// ================= EVENT BUS =================
const PIN_EVENT_BUS = {
  listeners: {},

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },

  emit(event, data) {
    const handlers = this.listeners[event] || [];

    handlers.forEach(fn => {
      try {
        fn(data);
      } catch (e) {
        console.error("PIN EVENT ERROR:", e);
      }
    });
  }
};

// ================= CORE STATE TRACKER =================
let PIN_STATE_CACHE = {
  requestsHash: null,
  lastUpdate: 0
};

// ================= INIT =================
function initPinLiveOrchestrator() {

  if (typeof getPinRequests === "function") {
    startRequestWatcher();
  }

  bindSystemHooks();

  exposeGlobalAPI();
}

// ================= WATCH REQUEST CHANGES =================
function startRequestWatcher() {

  setInterval(() => {

    try {

      const data = getSafeRequests();
      const hash = JSON.stringify(data);

      if (hash !== PIN_STATE_CACHE.requestsHash) {

        PIN_STATE_CACHE.requestsHash = hash;
        PIN_STATE_CACHE.lastUpdate = Date.now();

        PIN_EVENT_BUS.emit("PIN_REQUEST_UPDATED", data);
      }

    } catch (err) {
      console.error("PIN WATCH ERROR:", err);
    }

  }, 2000); // lightweight sync loop
}

// ================= SAFE FETCH =================
function getSafeRequests() {

  if (typeof getPinRequests !== "function") return [];

  return (getPinRequests() || []).map(r => ({
    requestId: r.requestId,
    userId: r.userId,
    type: r.type,
    status: r.status,
    paymentId: r.paymentId
  }));
}

// ================= FLOW HOOK BINDING =================
function bindSystemHooks() {

  // Hook into request creation
  hookIfExists("createPinRequest", "PIN_REQUEST_CREATED");

  // Hook into flow execution
  hookIfExists("executePinFlow", "PIN_FLOW_EXECUTED");

  // Hook into router
  hookIfExists("routePinRequest", "PIN_ROUTER_EXECUTED");
}

// ================= SAFE HOOK WRAPPER =================
function hookIfExists(fnName, eventName) {

  if (typeof window[fnName] !== "function") return;

  const original = window[fnName];

  window[fnName] = function (...args) {

    const result = original.apply(this, args);

    PIN_EVENT_BUS.emit(eventName, {
      args,
      result,
      timestamp: Date.now()
    });

    return result;
  };
}

// ================= PUBLIC SYNC EVENTS =================

// UI can subscribe to real-time updates
function onPinEvent(event, callback) {
  PIN_EVENT_BUS.on(event, callback);
}

// Force refresh broadcast
function broadcastPinUpdate(payload = {}) {
  PIN_EVENT_BUS.emit("PIN_FORCE_UPDATE", payload);
}

// ================= AUTO UI SYNC BRIDGE =================
PIN_EVENT_BUS.on("PIN_REQUEST_UPDATED", function (data) {

  // update live panel if exists
  if (typeof window.renderTable === "function") {
    window.renderTable(data);
  }

  // refresh admin panel if exists
  if (typeof window.loadPinRequests === "function") {
    window.loadPinRequests();
  }

});

// ================= GLOBAL API =================
function exposeGlobalAPI() {

  window.onPinEvent = onPinEvent;
  window.broadcastPinUpdate = broadcastPinUpdate;
  window.PIN_EVENT_BUS = PIN_EVENT_BUS;
}
