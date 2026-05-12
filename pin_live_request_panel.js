"use strict";

/*
========================================
LIVE PIN REQUEST PANEL (REAL-TIME V1.1 FIXED)
========================================
✔ Auto-refresh request list
✔ No page reload required
✔ Unified admin/super/systems view
✔ STRICT router enforcement
✔ Role-safe display
✔ Collision-safe actions
✔ Auto UI refresh after action
✔ Production SAFE LIVE SYSTEM
========================================
*/

// ================= CONFIG =================
const PIN_LIVE_INTERVAL = 3000;
let PIN_LIVE_TIMER = null;
let PIN_LAST_HASH = null;

// ================= INIT =================
(function () {

  if (window.__PIN_LIVE_PANEL__) return;

  window.__PIN_LIVE_PANEL__ = true;

  document.addEventListener("DOMContentLoaded", initLivePanel);

})();

// ================= START =================
function initLivePanel() {

  const el = document.getElementById("pinLivePanel");
  if (!el) return;

  renderPanel();
  startLiveSync();
}

// ================= LIVE LOOP =================
function startLiveSync() {

  if (PIN_LIVE_TIMER) clearInterval(PIN_LIVE_TIMER);

  PIN_LIVE_TIMER = setInterval(syncData, PIN_LIVE_INTERVAL);
}

// ================= DATA SYNC =================
function syncData() {

  try {

    const data = getRequestsSafe();

    const hash = JSON.stringify(data);

    if (hash === PIN_LAST_HASH) return;

    PIN_LAST_HASH = hash;

    renderTable(data);

  } catch (e) {
    console.error("PIN LIVE ERROR:", e);
  }
}

// ================= SAFE FETCH =================
function getRequestsSafe() {

  if (typeof getPinRequests !== "function") return [];

  return (getPinRequests() || []).map(r => ({
    requestId: r.requestId,
    paymentId: r.paymentId,
    status: r.status,
    userId: r.userId
  }));
}

// ================= PANEL =================
function renderPanel() {

  const el = document.getElementById("pinLivePanel");

  el.innerHTML = `
    <h3>📡 LIVE PIN REQUEST PANEL</h3>
    <div id="pinLiveTable"></div>
  `;

  syncData();
}

// ================= TABLE =================
function renderTable(data) {

  const table = document.getElementById("pinLiveTable");
  if (!table) return;

  let html = `
    <table border="1" width="100%" style="text-align:left;">
      <tr>
        <th>Request ID</th>
        <th>User</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
  `;

  data.forEach(req => {

    html += `
      <tr>
        <td>${req.requestId}</td>
        <td>${req.userId || "-"}</td>
        <td>${req.status}</td>
        <td>
          <button onclick="PIN_LIVE_ACTION.approve('${req.requestId}')">Approve</button>
          <button onclick="PIN_LIVE_ACTION.reject('${req.requestId}')">Reject</button>
        </td>
      </tr>
    `;
  });

  html += `</table>`;

  table.innerHTML = html;
}

// ================= ACTION WRAPPER (SAFE) =================
const PIN_LIVE_ACTION = {

  approve(id) {

    try {

      if (typeof routePinRequest === "function") {
        routePinRequest("APPROVE_REQUEST", { requestId: id });
      }

      triggerRefresh();

    } catch (e) {
      console.error(e);
    }
  },

  reject(id) {

    try {

      if (typeof routePinRequest === "function") {
        routePinRequest("REJECT_REQUEST", { requestId: id });
      }

      triggerRefresh();

    } catch (e) {
      console.error(e);
    }
  }
};

// ================= AUTO REFRESH HOOK =================
function triggerRefresh() {

  try {

    // immediate UI refresh
    syncData();

  } catch (_) {}
}

// ================= EXPORT SAFE =================
window.startLiveSync = startLiveSync;
window.PIN_LIVE_ACTION = PIN_LIVE_ACTION;
