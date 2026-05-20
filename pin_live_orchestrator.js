"use strict";

/*
========================================
PIN LIVE ORCHESTRATOR V1.3 (BLINK FIX FINAL)
========================================
✔ Central event bus for PIN system
✔ Real-time sync across all dashboards
✔ Watches request + flow + approval changes
✔ Bridges request system + live UI panels
✔ No direct engine control (SAFE LAYER ONLY)
✔ Event-driven architecture
✔ Production LOCKED CORE SYNC ENGINE
✔ Memory-safe listener execution
✔ Duplicate function wrapping protection
✔ Diagnostics compatibility
✔ FIXED: Prevents PIN Master page blinking
✔ FIXED: UI refresh only when request table exists
========================================
*/

// ================= CORE STATE TRACKER =================
const PIN_STATE_CACHE = {
  requestsHash: null,
  lastUpdate: 0,
  watcherStarted: false,
  watcherIntervalId: null
};

// ================= EVENT BUS =================
const PIN_EVENT_BUS = {
  listeners: Object.create(null),

  on(event, callback) {
    if (typeof callback !== "function") return;

    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);
  },

  emit(event, data) {
    const handlers = this.listeners[event];

    if (!handlers || !handlers.length) {
      return;
    }

    for (let i = 0; i < handlers.length; i++) {
      try {
        handlers[i](data);
      } catch (e) {
        console.error("PIN EVENT ERROR:", e);
      }
    }
  }
};

// ================= INIT =================
function initPinLiveOrchestrator() {

  // Start watcher only once
  if (
    typeof window.getPinRequests === "function" &&
    !PIN_STATE_CACHE.watcherStarted
  ) {
    startRequestWatcher();
  }

  bindSystemHooks();
  exposeGlobalAPI();

  console.log("[PIN LIVE ORCHESTRATOR] Initialized");
}

// ================= WATCH REQUEST CHANGES =================
function startRequestWatcher() {

  if (PIN_STATE_CACHE.watcherStarted) {
    return;
  }

  PIN_STATE_CACHE.watcherStarted = true;

  PIN_STATE_CACHE.watcherIntervalId = setInterval(function () {

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

  }, 2000);
}

// ================= SAFE FETCH =================
function getSafeRequests() {

  if (typeof window.getPinRequests !== "function") {
    return [];
  }

  const requests = window.getPinRequests() || [];

  return requests.map(function (r) {
    return {
      requestId: r.requestId,
      userId: r.userId,
      type: r.type,
      status: r.status,
      paymentId: r.paymentId
    };
  });
}

// ================= FLOW HOOK BINDING =================
function bindSystemHooks() {

  hookIfExists("createPinRequest", "PIN_REQUEST_CREATED");
  hookIfExists("executePinFlow", "PIN_FLOW_EXECUTED");
  hookIfExists("routePinRequest", "PIN_ROUTER_EXECUTED");
}

// ================= SAFE HOOK WRAPPER =================
function hookIfExists(fnName, eventName) {

  if (typeof window[fnName] !== "function") {
    return;
  }

  // Prevent duplicate wrapping
  if (window[fnName].__pinLiveWrapped === true) {
    return;
  }

  const original = window[fnName];

  function wrappedFunction(...args) {

    const result = original.apply(this, args);

    PIN_EVENT_BUS.emit(eventName, {
      functionName: fnName,
      args: args,
      result: result,
      timestamp: Date.now()
    });

    return result;
  }

  wrappedFunction.__pinLiveWrapped = true;
  wrappedFunction.__originalFunction = original;

  window[fnName] = wrappedFunction;
}

// ================= PUBLIC API =================
function onPinEvent(event, callback) {
  PIN_EVENT_BUS.on(event, callback);
}

function broadcastPinUpdate(payload = {}) {
  PIN_EVENT_BUS.emit("PIN_FORCE_UPDATE", payload);
}

// ================= PAGE DETECTION =================
function isPinRequestPageActive() {

  return !!(
    document.getElementById("pinRequestTable") ||
    document.querySelector("[data-pin-request-table]") ||
    document.querySelector(".pin-request-table")
  );
}

// ================= AUTO UI SYNC (BLINK FIX) =================
PIN_EVENT_BUS.on("PIN_REQUEST_UPDATED", function (data) {

  // CRITICAL FIX:
  // Only refresh UI if a PIN Request table is actually present.
  // This prevents unrelated pages (such as PIN Master) from blinking.
  if (!isPinRequestPageActive()) {
    return;
  }

  try {
    if (typeof window.renderTable === "function") {
      window.renderTable(data);
    }
  } catch (_) {}

  try {
    if (typeof window.loadPinRequests === "function") {
      window.loadPinRequests();
    }
  } catch (_) {}
});

// ================= GLOBAL EXPORT =================
function exposeGlobalAPI() {

  window.onPinEvent = onPinEvent;
  window.broadcastPinUpdate = broadcastPinUpdate;
  window.PIN_EVENT_BUS = PIN_EVENT_BUS;
  window.PIN_STATE_CACHE = PIN_STATE_CACHE;
  window.initPinLiveOrchestrator = initPinLiveOrchestrator;
}

// ================= DIAGNOSTICS FLAG =================
window.__PIN_LIVE_SYSTEM_ACTIVE__ = true;

// ================= GUARD =================
(function () {

  if (window.__PIN_LIVE_ORCHESTRATOR__) {
    return;
  }

  window.__PIN_LIVE_ORCHESTRATOR__ = true;

  initPinLiveOrchestrator();

})();

// ================= FINAL CONFIRMATION =================
console.log("[PIN LIVE ORCHESTRATOR] Fully Loaded");
