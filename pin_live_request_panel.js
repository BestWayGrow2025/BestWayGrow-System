"use strict";

/*
========================================
LIVE PIN REQUEST PANEL V1.2 (FINAL OPTIMIZED)
========================================
✔ Auto-refresh request list
✔ No page reload required
✔ Unified admin/super/system view
✔ STRICT routePinRequest() enforcement
✔ Collision-safe actions
✔ Immediate UI refresh after action
✔ Event-driven sync via PIN_EVENT_BUS
✔ Polling fallback if event bus unavailable
✔ Production LOCKED
========================================
*/

// ================= CONFIG =================
const PIN_LIVE_INTERVAL = 3000;
let PIN_LIVE_TIMER = null;
let PIN_LAST_HASH = null;

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_LIVE_PANEL__) return;

  window.__PIN_LIVE_PANEL__ = true;

  document.addEventListener("DOMContentLoaded", initLivePanel);

})();

// ================= INIT =================
function initLivePanel() {

  const el = document.getElementById("pinLivePanel");
  if (!el) return;

  renderPanel();

  // Priority 1: Event-driven live sync (preferred)
  if (typeof onPinEvent === "function") {

    onPinEvent("PIN_REQUEST_UPDATED", function (data) {
      updateIfChanged(data);
    });

    onPinEvent("PIN_FORCE_UPDATE", function () {
      syncData();
    });

    // Initial load
    syncData();

  } else {

    // Priority 2: Polling fallback
    startLiveSync();
  }
}

// ================= POLLING FALLBACK =================
function startLiveSync() {

  if (PIN_LIVE_TIMER) {
    clearInterval(PIN_LIVE_TIMER);
  }

  PIN_LIVE_TIMER = setInterval(syncData, PIN_LIVE_INTERVAL);

  syncData();
}

// ================= SYNC =================
function syncData() {

  try {

    const data = getRequestsSafe();

    updateIfChanged(data);

  } catch (err) {
    console.error("PIN LIVE ERROR:", err);
  }
}

// ================= HASH CHECK =================
function updateIfChanged(data) {

  const hash = JSON.stringify(data || []);

  if (hash === PIN_LAST_HASH) {
    return;
  }

  PIN_LAST_HASH = hash;

  renderTable(data || []);
}

// ================= SAFE FETCH =================
function getRequestsSafe() {

  if (typeof getPinRequests !== "function") {
    return [];
  }

  return (getPinRequests() || []).map(function (r) {
    return {
      requestId: r.requestId,
      userId: r.userId || "-",
      paymentId: r.paymentId || "-",
      status: r.status || "UNKNOWN"
    };
  });
}

// ================= PANEL =================
function renderPanel() {

  const el = document.getElementById("pinLivePanel");
  if (!el) return;

  el.innerHTML = `
    <h3>📡 LIVE PIN REQUEST PANEL</h3>
    <div id="pinLiveTable"></div>
  `;
}

// ================= TABLE =================
function renderTable(data) {

  const table = document.getElementById("pinLiveTable");
  if (!table) return;

  if (!Array.isArray(data) || data.length === 0) {
    table.innerHTML = `
      <p>No PIN requests found.</p>
    `;
    return;
  }

  let html = `
    <table border="1" width="100%" style="text-align:left;">
      <tr>
        <th>Request ID</th>
        <th>User</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
  `;

  data.forEach(function (req) {

    const status = String(req.status || "").toUpperCase();

    let actions = "-";

    if (status === "PENDING") {
      actions = `
        <button onclick="PIN_LIVE_ACTION.approve('${req.requestId}')">
          Approve
        </button>
        <button onclick="PIN_LIVE_ACTION.reject('${req.requestId}')">
          Reject
        </button>
      `;
    }

    html += `
      <tr>
        <td>${req.requestId}</td>
        <td>${req.userId}</td>
        <td>${req.status}</td>
        <td>${actions}</td>
      </tr>
    `;
  });

  html += `</table>`;

  table.innerHTML = html;
}

// ================= ACTION API =================
const PIN_LIVE_ACTION = {

  approve(requestId) {
    executeLiveAction("APPROVE_REQUEST", requestId);
  },

  reject(requestId) {
    executeLiveAction("REJECT_REQUEST", requestId);
  }
};

// ================= EXECUTION =================
function executeLiveAction(actionType, requestId) {

  try {

    if (typeof routePinRequest !== "function") {
      throw new Error("routePinRequest not available");
    }

    const result = routePinRequest(actionType, {
      requestId: requestId
    });

    // Immediate refresh
    triggerRefresh();

    return result;

  } catch (err) {

    console.error("PIN LIVE ACTION ERROR:", err);

    return false;
  }
}

// ================= FORCE REFRESH =================
function triggerRefresh() {

  try {

    // Event-driven refresh if available
    if (typeof broadcastPinUpdate === "function") {
      broadcastPinUpdate({
        source: "pin_live_request_panel"
      });
    }

    // Direct refresh fallback
    syncData();

  } catch (_) {}
}

// ================= EXPORT =================
window.startLiveSync = startLiveSync;
window.PIN_LIVE_ACTION = PIN_LIVE_ACTION;
window.triggerPinLiveRefresh = triggerRefresh;
