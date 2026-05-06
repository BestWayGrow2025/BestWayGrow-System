/*
========================================
ADMIN PIN PANEL V2.1 (FLOW INTEGRATED)
========================================
✔ Admin PIN request control panel
✔ Uses unified executePinFlow engine
✔ Fully aligned with PIN_ACTION system
✔ No direct engine calls
✔ Clean orchestration only
========================================
*/

let pinAdminLock = false;
let pinRefreshTimer = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initAdminPinPanel();
});

function initAdminPinPanel() {
  if (typeof initCoreSystem === "function") initCoreSystem();

  const user = typeof protectPage === "function"
    ? protectPage({ role: "admin" })
    : null;

  if (!user) {
    window.location.href = "admin_login.html";
    return;
  }

  bindPinPanelEvents();
  refreshPinPanelStatus();
  loadPinRequests();
  startPinPanelAutoRefresh();
}

// ================= EVENTS =================
function bindPinPanelEvents() {
  const filter = document.getElementById("filter");

  if (filter) {
    filter.addEventListener("change", loadPinRequests);
  }
}

function safePinClick(fn) {
  if (pinAdminLock) return;
  pinAdminLock = true;

  try {
    fn();
  } catch (err) {
    console.error("admin_pin_panel:", err);
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

// ================= REQUEST TABLE =================
function loadPinRequests() {
  const filterEl = document.getElementById("filter");
  const table = document.getElementById("reqTable");

  if (!table) return;

  const filter = filterEl ? filterEl.value : "ALL";
  const rows = typeof getPinRequests === "function" ? getPinRequests() : [];

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

// ================= ACTIONS (FLOW CONTROLLED) =================

// APPROVE
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

// REJECT
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

// FORCE PROCESS
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
  const rows = typeof getPinRequests === "function" ? getPinRequests() : [];
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
