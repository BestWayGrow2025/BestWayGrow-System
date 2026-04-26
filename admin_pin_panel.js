let session = null;
let currentUser = null;
let lock = false;
let refreshTimer = null;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  refreshStatus();
  loadRequests();
  startAutoRefresh();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

function authPage() {
  currentUser = typeof protectPage === "function"
    ? protectPage({ role: "admin" })
    : null;

  if (!currentUser) {
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }

  session = {
    userId: currentUser.userId,
    role: currentUser.role
  };
}

function bindEvents() {
  document.getElementById("startUpgradeBtn").addEventListener("click", function () {
    safeClick(startUpgrade);
  });

  document.getElementById("stopUpgradeBtn").addEventListener("click", function () {
    safeClick(stopUpgrade);
  });

  document.getElementById("startRepurchaseBtn").addEventListener("click", function () {
    safeClick(startRepurchase);
  });

  document.getElementById("stopRepurchaseBtn").addEventListener("click", function () {
    safeClick(stopRepurchase);
  });

  document.getElementById("filter").addEventListener("change", loadRequests);
}

function safeClick(fn) {
  if (lock) return;
  lock = true;

  try {
    fn();
  } catch (err) {
    console.error(err);
  }

  setTimeout(function () {
    lock = false;
  }, 500);
}

function isSystemSafe() {
  let settings = typeof getSystemSettings === "function"
    ? (getSystemSettings() || {})
    : {};

  if (settings.adminAccess === false) {
    alert("Admin access OFF");
    return false;
  }

  if (settings.lockMode === true) {
    alert("System locked");
    return false;
  }

  return true;
}

function canManualProcess() {
  let settings = typeof getSystemSettings === "function"
    ? (getSystemSettings() || {})
    : {};

  let queue = settings.pinQueue || { enabled: true };
  return queue.enabled === false;
}

function getPinSafeSettings() {
  let settings = typeof getPinSettings === "function"
    ? (getPinSettings() || {})
    : {};

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
