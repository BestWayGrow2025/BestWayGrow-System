let session = null;
let currentUser = null;
let lock = false;
let refreshTimer = null;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
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
    throw new Error("Access denied");
  }

  session = {
    userId: currentUser.userId,
    role: currentUser.role
  };
}

function bindEvents() {
  document.getElementById("refreshBtn").addEventListener("click", loadRequests);
  document.getElementById("logoutBtn").addEventListener("click", logout);
}

function loadRequests() {
  let table = document.getElementById("requestTable");
  table.innerHTML = "";

  let requests = [];

  try {
    requests = typeof getPinRequests === "function"
      ? (getPinRequests() || [])
      : [];
  } catch (e) {
    requests = [];
  }

  if (!requests.length) {
    table.innerHTML = "<tr><td colspan='7'>No Requests</td></tr>";
    return;
  }

  requests.slice().reverse().forEach(function (request) {
    let status = (request.status || "pending").toLowerCase();
    let statusClass = getStatusClass(status);
    let actions = "-";

    if (status === "pending") {
      actions = `
        <button onclick="autoProcess('${request.requestId}')">AUTO</button>
        <button onclick="rejectReq('${request.requestId}')">REJECT</button>
      `;
    }

    let row = document.createElement("tr");

    row.innerHTML = `
      <td>${request.requestId || "-"}</td>
      <td>${request.userId || "-"}</td>
      <td>${request.type || "-"}</td>
      <td>${request.quantity || 1}</td>
      <td>₹${Number(request.amount || 0).toFixed(2)}</td>
      <td class="${statusClass}">${status.toUpperCase()}</td>
      <td>${actions}</td>
    `;

    table.appendChild(row);
  });
}

function getStatusClass(status) {
  if (status === "pending") return "pending";
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  if (status === "rejected") return "rejected";
  return "";
}

function autoProcess(requestId) {
  if (lock) return;
  lock = true;

  if (typeof processPinRequestAuto !== "function") {
    alert("Processing system missing");
    lock = false;
    return;
  }

  try {
    processPinRequestAuto(requestId);
    alert("✅ Auto processed");
    loadRequests();
  } catch (err) {
    alert(err.message || "Processing failed");
  }

  setTimeout(function () {
    lock = false;
  }, 500);
}

function rejectReq(requestId) {
  if (lock) return;
  lock = true;

  if (!confirm("Reject this request?")) {
    lock = false;
    return;
  }

  if (typeof rejectPinRequest !== "function") {
    alert("Reject system missing");
    lock = false;
    return;
  }

  try {
    rejectPinRequest(requestId, currentUser.userId);
    alert("❌ Request Rejected");
    loadRequests();
  } catch (err) {
    alert(err.message || "Reject failed");
  }

  setTimeout(function () {
    lock = false;
  }, 500);
}

function startAutoRefresh() {
  refreshTimer = setInterval(function () {
    loadRequests();
  }, 3000);
}

function logout() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  localStorage.removeItem("loggedInAdmin");
  window.location.href = "admin_login.html";
}
