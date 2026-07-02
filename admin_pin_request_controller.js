"use strict";

let session = null;
let currentUser = null;
let lock = false;
let refreshTimer = null;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();

  if (!currentUser) return;

  bindEvents();
  loadRequests();
  startAutoRefresh();
});

// ================= INIT =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }

  session = typeof getSession === "function"
    ? getSession()
    : null;
}

// ================= AUTH =================
function checkAuth() {

  session = getSession();

  if (!session || session.role !== "admin") {
    redirectLogin();
    throw new Error("UNAUTHORIZED");
  }

  if (typeof getUserById !== "function") {
    redirectLogin();
    throw new Error("USER_SYSTEM_MISSING");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "admin") {
    redirectLogin();
    throw new Error("INVALID_USER");
  }

  if ((currentUser.status || "active") !== "active") {
    redirectLogin();
    throw new Error("INACTIVE");
  }
}


// ================= REDIRECT =================
function redirectLogin() {

  if (typeof destroySession === "function") {
    destroySession();
  }

  window.location.href = "admin_auth.html";
}

// ================= EVENTS =================
function bindEvents() {

  const refreshBtn = document.getElementById("refreshBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadRequests);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// ================= LOAD REQUESTS =================
function loadRequests() {

  const table = document.getElementById("requestTable");

  if (!table) return;

  table.innerHTML = "";

  let requests = [];

  try {
    requests = typeof getPinRequests === "function"
      ? (getPinRequests() || [])
      : [];
  } catch {
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

// ================= STATUS CLASS =================
function getStatusClass(status) {
  if (status === "pending") return "pending";
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  if (status === "rejected") return "rejected";
  return "";
}

// ================= AUTO PROCESS =================
function autoProcess(requestId) {

  if (lock) return;
  lock = true;

  try {

    if (typeof executePinFlow === "function") {
      executePinFlow("PROCESS_REQUEST", {
        requestId,
        mode: "AUTO"
      });
    } else if (typeof processPinRequestAuto === "function") {
      processPinRequestAuto(requestId);
    } else {
      throw new Error("Processing system missing");
    }

    if (typeof logActivity === "function" && currentUser) {
      logActivity(
        currentUser.userId || "ADMIN",
        "ADMIN",
        "Auto processed PIN request " + requestId
      );
    }

    alert("✅ Auto processed");
    loadRequests();

  } catch (err) {
    alert(err.message || "Processing failed");
  }

  setTimeout(() => {
    lock = false;
  }, 500);
}

// ================= REJECT =================
function rejectReq(requestId) {

  if (lock) return;
  lock = true;

  try {

    if (!confirm("Reject this request?")) {
      lock = false;
      return;
    }

    if (typeof executePinFlow === "function") {
      executePinFlow("REJECT_REQUEST", {
        requestId,
        adminId: currentUser ? currentUser.userId : "ADMIN"
      });
    } else if (typeof rejectPinRequest === "function") {
      rejectPinRequest(
        requestId,
        currentUser ? currentUser.userId : "ADMIN"
      );
    } else {
      throw new Error("Reject system missing");
    }

    if (typeof logActivity === "function" && currentUser) {
      logActivity(
        currentUser.userId || "ADMIN",
        "ADMIN",
        "Rejected PIN request " + requestId
      );
    }

    alert("❌ Request Rejected");
    loadRequests();

  } catch (err) {
    alert(err.message || "Reject failed");
  }

  setTimeout(() => {
    lock = false;
  }, 500);
}

// ================= AUTO REFRESH =================
function startAutoRefresh() {
  refreshTimer = setInterval(function () {
    loadRequests();
  }, 3000);
}

// ================= LOGOUT =================
function logout() {

  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

 if (typeof destroySession === "function") {
  destroySession();
}

window.location.href = "admin_auth.html";
}
