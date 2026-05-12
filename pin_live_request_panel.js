"use strict";

/*
========================================
LIVE PIN REQUEST PANEL (REAL-TIME)
========================================
✔ Auto-refresh request list
✔ No page reload required
✔ Unified admin/super/systems view
✔ Safe executePinFlow integration
✔ Lightweight polling engine
✔ Production-safe live UI
========================================
*/

// ================= CONFIG =================
const PIN_LIVE_INTERVAL = 3000; // 3 sec refresh
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

  if (!document.getElementById("pinLivePanel")) return;

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

    // skip update if no change
    if (hash === PIN_LAST_HASH) return;

    PIN_LAST_HASH = hash;

    renderTable(data);

  } catch (e) {
    console.error("PIN LIVE ERROR:", e);
  }
}

// ================= SAFE REQUEST FETCH =================
function getRequestsSafe() {

  if (typeof getPinRequests !== "function") return [];

  return (getPinRequests() || []).map(r => ({
    requestId: r.requestId,
    paymentId: r.paymentId,
    status: r.status,
    userId: r.userId
  }));
}

// ================= RENDER PANEL =================
function renderPanel() {

  const el = document.getElementById("pinLivePanel");

  if (!el) return;

  el.innerHTML = `
    <h3>📡 LIVE PIN REQUEST PANEL</h3>
    <div id="pinLiveTable"></div>
  `;

  syncData();
}

// ================= RENDER TABLE =================
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
          <button onclick="approve('${req.requestId}')">Approve</button>
          <button onclick="reject('${req.requestId}')">Reject</button>
        </td>
      </tr>
    `;
  });

  html += `</table>`;

  table.innerHTML = html;
}

// ================= ACTIONS =================
function approve(id) {

  if (typeof routePinRequest === "function") {
    routePinRequest("APPROVE_REQUEST", { requestId: id });
  } else if (typeof executePinFlow === "function") {
    executePinFlow("PROCESS_REQUEST", { requestId: id });
  }
}

function reject(id) {

  if (typeof routePinRequest === "function") {
    routePinRequest("REJECT_REQUEST", { requestId: id });
  } else if (typeof executePinFlow === "function") {
    executePinFlow("REJECT_REQUEST", { requestId: id });
  }
}

// ================= EXPORT =================
window.startLiveSync = startLiveSync;
window.approve = approve;
window.reject = reject;
