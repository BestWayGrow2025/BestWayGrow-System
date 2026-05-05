/*
========================================
ADMIN PIN PANEL V2.0 (LIVE REQUEST CONTROL)
========================================
✔ Admin PIN request control panel
✔ Reads from pin_product_master.js
✔ Reads from pin_request_system.js
✔ Queue aware
✔ Auto / force / reject handling
✔ Product-safe status rendering
✔ No auth duplication
✔ One session flow only
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

  setTimeout(function () {
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

  rows.forEach(function (req) {
    if (filter !== "ALL" && req.status !== filter) return;

    const priority = req.priority || "YELLOW";
    const qty = Number(req.quantity || 1);

    const color =
      priority === "GREEN" ? "green" :
      priority === "RED" ? "red" : "orange";

    let actions = "-";

    if (req.status === "PENDING") {
      actions = `
        <button onclick="event.stopPropagation(); approvePinRequest('${req.requestId}')">✔</button>
        <button onclick="event.stopPropagation(); rejectAdminPinRequest('${req.requestId}')">✖</button>
        <button onclick="event.stopPropagation(); forcePinRequest('${req.requestId}')">⚡</button>
      `;
    }

    table.innerHTML += `
      <tr onclick="viewPinRequestDetails('${req.requestId}')">
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

// ================= ACTIONS =================
function approvePinRequest(requestId) {
  safePinClick(function () {
    if (typeof processPinRequestAuto !== "function") {
      throw new Error("PIN request engine missing");
    }

    processPinRequestAuto(requestId);
    loadPinRequests();
  });
}

function rejectAdminPinRequest(requestId) {
  safePinClick(function () {
    if (!confirm("Reject this request?")) return;

    if (typeof rejectPinRequest !== "function") {
      throw new Error("Reject engine missing");
    }

    rejectPinRequest(requestId, "ADMIN");
    loadPinRequests();
  });
}

function forcePinRequest(requestId) {
  safePinClick(function () {
    if (!confirm("Force process this request?")) return;

    if (typeof processPinRequestAuto !== "function") {
      throw new Error("PIN request engine missing");
    }

    processPinRequestAuto(requestId);
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

  pinRefreshTimer = setInterval(function () {
    loadPinRequests();
  }, 3000);
}
  return {
    upgrade: settings.upgrade || {},
    repurchase: settings.repurchase || {}
  };
}

function refreshStatus() {
  let settings = getPinSafeSettings();

  document.getElementById("upgradeStatus").innerText =
    settings.upgrade.active
      ? `🟢 ACTIVE | BV: ${settings.upgrade.bv || 0} | ₹${settings.upgrade.amount || 0}`
      : "🔴 OFF";

  document.getElementById("repurchaseStatus").innerText =
    settings.repurchase.active
      ? `🟢 ACTIVE | BV: ${settings.repurchase.bv || 0} | ₹${settings.repurchase.amount || 0}`
      : "🔴 OFF";
}

function validateInput(bv, amount) {
  if (bv <= 0 || amount <= 0) {
    alert("Invalid BV or Amount");
    return false;
  }
  return true;
}

function startUpgrade() {
  if (!isSystemSafe()) return;

  let bv = Number(document.getElementById("up_bv").value);
  let amount = Number(document.getElementById("up_amount").value);
  let gst = Number(document.getElementById("up_gst").value || 0);

  if (!validateInput(bv, amount)) return;

  enablePin("upgrade", { bv, amount, gst });
  refreshStatus();
}

function stopUpgrade() {
  disablePin("upgrade");
  refreshStatus();
}

function startRepurchase() {
  if (!isSystemSafe()) return;

  let bv = Number(document.getElementById("re_bv").value);
  let amount = Number(document.getElementById("re_amount").value);
  let gst = Number(document.getElementById("re_gst").value || 0);

  if (!validateInput(bv, amount)) return;

  enablePin("repurchase", { bv, amount, gst });
  refreshStatus();
}

function stopRepurchase() {
  disablePin("repurchase");
  refreshStatus();
}

function loadRequests() {
  let filter = document.getElementById("filter").value;
  let data = typeof getPinRequests === "function" ? (getPinRequests() || []) : [];
  let table = document.getElementById("reqTable");

  table.innerHTML = "";

  if (!data.length) {
    table.innerHTML = "<tr><td colspan='7'>No Requests</td></tr>";
    return;
  }

  data.forEach(function (req) {
    if (filter !== "ALL" && req.status !== filter) return;

    let priority = req.priority || "YELLOW";
    let qty = req.quantity || 1;
    let color =
      priority === "GREEN" ? "green" :
      priority === "YELLOW" ? "orange" : "red";

    let actions = "-";

    if (req.status === "PENDING") {
      actions = `
        <button onclick="event.stopPropagation(); approve('${req.requestId}')">✔</button>
        <button onclick="event.stopPropagation(); rejectReq('${req.requestId}')">✖</button>
        <button onclick="event.stopPropagation(); forceProcess('${req.requestId}')">⚡</button>
      `;
    }

    table.innerHTML += `
      <tr onclick="viewDetails('${req.requestId}')">
        <td>${req.requestId}</td>
        <td>${req.userId}</td>
        <td>${req.type}</td>
        <td>${qty}</td>
        <td style="color:${color}">${priority}</td>
        <td>${req.status}</td>
        <td>${actions}</td>
      </tr>
    `;
  });
}

function approve(id) {
  safeClick(function () {
    if (!isSystemSafe()) return;

    if (!canManualProcess()) {
      alert("Queue is ON. Use auto processing.");
      return;
    }

    processPinRequestAuto(id);
    loadRequests();
  });
}

function rejectReq(id) {
  safeClick(function () {
    if (!confirm("Reject this request?")) return;
    rejectPinRequest(id);
    loadRequests();
  });
}

function forceProcess(id) {
  safeClick(function () {
    if (!isSystemSafe()) return;
    if (!confirm("Force process this request?")) return;

    processPinRequestAuto(id);
    loadRequests();
  });
}

function viewDetails(id) {
  let requests = typeof getPinRequests === "function" ? (getPinRequests() || []) : [];
  let req = requests.find(function (item) {
    return item.requestId === id;
  });

  if (!req) return;

  alert(
`ID: ${req.requestId}
User: ${req.userId}
Type: ${req.type}
Status: ${req.status}
Qty: ${req.quantity || 1}
Priority: ${req.priority || "YELLOW"}
Retry: ${req.retry || 0}`
  );
}

function startAutoRefresh() {
  refreshTimer = setInterval(function () {
    loadRequests();
  }, 3000);
}
