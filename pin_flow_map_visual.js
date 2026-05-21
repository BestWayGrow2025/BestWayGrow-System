"use strict";

/*
========================================
PIN FLOW MAP VISUALIZER V1.0
========================================
✔ Visual system flow tracker
✔ Debug + monitoring tool only
✔ Shows execution layer status
✔ No business logic
✔ No routing logic
✔ No UI control logic
✔ PURE OBSERVABILITY LAYER
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_FLOW_MAP__) return;

  window.__PIN_FLOW_MAP__ = true;

  window.__PIN_FLOW_TRACE__ = [];

})();

// ================= TRACE LOGGER =================
function tracePinFlow(layer, status, data = null) {

  const entry = {
    layer: layer,
    status: status,
    time: Date.now(),
    data: data || null
  };

  window.__PIN_FLOW_TRACE__.push(entry);

  console.log(
    "[PIN FLOW]",
    layer,
    "=>",
    status
  );

  // Optional event broadcast
  if (typeof broadcastPinEvent === "function") {
    broadcastPinEvent("PIN_FLOW_TRACE", entry);
  }
}

// ================= LAYER TRACKERS =================

// Boot layer
function traceBoot(status) {
  tracePinFlow("BOOTLOADER", status);
}

// Router layer
function traceRouter(status, action) {
  tracePinFlow("ROUTER", status, action);
}

// UI layer
function traceUI(status, component) {
  tracePinFlow("UI", status, component);
}

// Engine layer
function traceEngine(status, engine) {
  tracePinFlow("ENGINE", status, engine);
}

// Live sync layer
function traceLive(status) {
  tracePinFlow("LIVE_SYNC", status);
}

// ================= GET FULL TRACE =================
function getPinFlowTrace() {
  return window.__PIN_FLOW_TRACE__ || [];
}

// ================= RESET TRACE =================
function resetPinFlowTrace() {
  window.__PIN_FLOW_TRACE__ = [];
}

// ================= EXPORT =================
window.tracePinFlow = tracePinFlow;
window.traceBoot = traceBoot;
window.traceRouter = traceRouter;
window.traceUI = traceUI;
window.traceEngine = traceEngine;
window.traceLive = traceLive;

window.getPinFlowTrace = getPinFlowTrace;
window.resetPinFlowTrace = resetPinFlowTrace;

