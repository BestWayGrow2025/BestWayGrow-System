"use strict";

console.log("ADMIN_PIN_PANEL_JS LOADED");

/*
========================================
ADMIN PIN PANEL V2.2
FINAL PRODUCTION

Admin PIN request control panel
Uses unified executePinFlow engine
Fully aligned with PIN_ACTION system
No direct engine calls
Safe session validation
Auto refresh (3s)
Clean UI orchestration only

========================================
*/

let pinAdminLock = false;
let pinRefreshTimer = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initAdminPinPanel();
});

// ================= INIT PANEL =================
function initAdminPinPanel() {

  // Core system init
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }

  // Safe auth check (HARD STOP FIXED)
  const user = typeof protectPage === "function"
    ? protectPage({ role: "admin" })
    : null;

  if (!user) return;

  bindPinPanelEvents();
  refreshPinPanelStatus();
  loadPinRequests();
  startPinPanelAutoRefresh();
}

// ================= EVENTS =================
function bindPinPanelEvents() {

  console.log("[PIN PANEL] EVENT BIND START");

  const filter = document.getElementById("filter");

  if (filter) {
    filter.onchange = loadPinRequests;
  }


  const actions = {

    startUpgradeBtn: "START_UPGRADE",
    stopUpgradeBtn: "STOP_UPGRADE",

    startRepurchaseBtn: "START_REPURCHASE",
    stopRepurchaseBtn: "STOP_REPURCHASE"

  };


  Object.keys(actions).forEach(id => {

    const btn = document.getElementById(id);

    if (!btn) {
      console.error("[PIN PANEL] Missing button:", id);
      return;
    }


    btn.onclick = function () {

      console.log("[PIN ACTION]", actions[id]);


      if (typeof executePinFlow !== "function") {

        console.error(
          "[PIN PANEL] executePinFlow NOT FOUND"
        );

        alert("PIN Engine not loaded");
        return;

      }


      const result = executePinFlow(actions[id]);


      console.log(
        "[PIN RESULT]",
        result
      );


      refreshPinPanelStatus();

    };

  });


  console.log("[PIN PANEL] EVENT BIND COMPLETE");

}

// ================= SAFE CLICK WRAPPER =================
function safePinClick(fn) {

  if (pinAdminLock) return;

  pinAdminLock = true;

  try {
    fn();
  } catch (err) {
    console.error("admin_pin_panel error:", err);
    alert(err.message || "Action failed");
  }

  setTimeout(() => {
    pinAdminLock = false;
  }, 500);
}

// ================= STATUS =================
function refreshPinPanelStatus() {

  const up = document.getElementById("upgradeStatus");
  const rp = document.getElementById("repurchaseStatus");

  const upgrade = typeof getActivePinProducts === "function"
    ? getActivePinProducts("upgrade")
    : [];

  const repurchase = typeof getActivePinProducts === "function"
    ? getActivePinProducts("repurchase")
    : [];

  if (up) {
    up.innerText = upgrade.length
      ? `🟢 ACTIVE | ${upgrade.length} Product(s)`
      : "🔴 OFF";
  }

  if (rp) {
    rp.innerText = repurchase.length
      ? `🟢 ACTIVE | ${repurchase.length} Product(s)`
      : "🔴 OFF";
  }
}

// ================= LOAD REQUESTS =================
function loadPinRequests() {

  const filterEl = document.getElementById("filter");
  const table = document.getElementById("reqTable");

  if (!table) return;

  const filter = filterEl ? filterEl.value : "ALL";

  const rows = typeof getPinRequests === "function"
    ? getPinRequests()
    : [];

  table.innerHTML = "";

  if (!rows.length) {
    table.innerHTML = "<tr><td colspan='8'>No Requests</td></tr>";
    return;
  }

  rows.forEach(req => {

    if (filter !== "ALL" && req.status !== filter) return;

    const priority = req.priority || "YELLOW";
    const qty = Number(req.quantity || 1);

    const color =
      priority === "GREEN" ? "green" :
      priority === "RED" ? "red" : "orange";

    let actions = "-";

    if (req.status === "PENDING") {
      actions = `
        <button onclick="approvePinRequest('${req.requestId}')">✔</button>
        <button onclick="rejectAdminPinRequest('${req.requestId}')">✖</button>
        <button onclick="forcePinRequest('${req.requestId}')">⚡</button>
      `;
    }

    table.innerHTML += `
      <tr>
        <td>${req.requestId}</td>
        <td>${req.userId}</td>
        <td>${req.type}</td>
        <td>${qty}</td>
        <td style="color:${color}">${priority}</td>
        <td>${req.status}</td>
        <td>${req.paymentId || "-"}</td>
        <td>${actions}</td>
      </tr>
    `;
  });
}

// ================= APPROVE =================
function approvePinRequest(requestId) {

  safePinClick(() => {

    if (typeof executePinFlow !== "function") {
      throw new Error("Flow engine missing");
    }

    executePinFlow("PROCESS_REQUEST", {
      requestId,
      mode: "APPROVE"
    });

    loadPinRequests();
  });
}

// ================= REJECT =================
function rejectAdminPinRequest(requestId) {

  safePinClick(() => {

    if (!confirm("Reject this request?")) return;

    if (typeof executePinFlow !== "function") {
      throw new Error("Flow engine missing");
    }

    executePinFlow("REJECT_REQUEST", {
      requestId
    });

    loadPinRequests();
  });
}

// ================= FORCE PROCESS =================
function forcePinRequest(requestId) {

  safePinClick(() => {

    if (!confirm("Force process this request?")) return;

    if (typeof executePinFlow !== "function") {
      throw new Error("Flow engine missing");
    }

    executePinFlow("PROCESS_REQUEST", {
      requestId,
      force: true
    });

    loadPinRequests();
  });
}

// ================= DETAILS =================
function viewPinRequestDetails(requestId) {

  const rows = typeof getPinRequests === "function"
    ? getPinRequests()
    : [];

  const req = rows.find(r => r.requestId === requestId);

  if (!req) return;

  alert(
`ID: ${req.requestId}
User: ${req.userId}
Type: ${req.type}
Qty: ${req.quantity || 1}
Amount: ${req.amount || 0}
Payment Ref: ${req.paymentId || "-"}
Priority: ${req.priority || "YELLOW"}
Status: ${req.status}
Retry: ${req.retry || 0}`
  );
}

// ================= AUTO REFRESH =================
function startPinPanelAutoRefresh() {

  if (pinRefreshTimer) clearInterval(pinRefreshTimer);

  pinRefreshTimer = setInterval(loadPinRequests, 3000);
}

// ================= GLOBAL EXPORTS =================
window.loadPinRequests = loadPinRequests;
window.approvePinRequest = approvePinRequest;
window.rejectAdminPinRequest = rejectAdminPinRequest;
window.forcePinRequest = forcePinRequest;
window.viewPinRequestDetails = viewPinRequestDetails;
