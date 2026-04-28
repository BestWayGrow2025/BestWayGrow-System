let admin = null;
let refreshTimer = null;
let actionLock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
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
  if (typeof protectPage !== "function") {
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }

  admin = protectPage({
    role: "admin",
    department: "finance"
  });

  if (!admin) {
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }

  if ((admin.accountStatus || admin.status || "active") !== "active") {
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("backBtn").addEventListener("click", goBack);
  document.getElementById("refreshBtn").addEventListener("click", loadPage);
}

function loadPage() {
  loadSystemStatus();
  loadRequests();
}

function goBack() {
  window.location.href = "admin_dashboard.html";
}

function loadSystemStatus() {
  let s = (typeof getSystemSettings === "function")
    ? getSystemSettings()
    : {};

  document.getElementById("systemStatus").innerHTML =
    `Withdraw System: ${s.withdrawStop ? "STOPPED 🔴" : "RUNNING 🟢"}`;
}

function getStatusColor(status) {
  if (status === "PENDING") return "orange";
  if (status === "APPROVED") return "green";
  if (status === "REJECTED") return "red";
  return "black";
}

function loadRequests() {
  let requests = (typeof getWithdrawals === "function")
    ? getWithdrawals()
    : [];

  let table = document.getElementById("withdrawTable");

  if (!requests.length) {
    table.innerHTML = "<tr><td colspan='9'>No requests</td></tr>";
    return;
  }

  table.innerHTML = requests.slice().reverse().map(function (req) {
    return `
      <tr>
        <td>${req.requestId || "-"}</td>
        <td>${req.userId || "-"}</td>
        <td>₹ ${Number(req.amount || 0).toFixed(2)}</td>
        <td>₹ ${Number(req.charge || 0).toFixed(2)}</td>
        <td>₹ ${Number(req.finalAmount || req.amount || 0).toFixed(2)}</td>
        <td style="color:${getStatusColor(req.status)}">${req.status || "-"}</td>
        <td>${req.time ? new Date(req.time).toLocaleString() : "-"}</td>
        <td>${req.processedAt ? new Date(req.processedAt).toLocaleString() : "-"}</td>
        <td>
          ${req.status === "PENDING"
            ? `
              <button onclick="approve('${req.requestId}')">Approve</button>
              <button onclick="reject('${req.requestId}')">Reject</button>
            `
            : "✔ Done"}
        </td>
      </tr>
    `;
  }).join("");

  if (typeof logActivity === "function") {
    logActivity(admin.userId, "ADMIN", "Viewed withdrawals");
  }
}

function approve(id) {
  if (actionLock) return;
  actionLock = true;

  try {
    let s = (typeof getSystemSettings === "function")
      ? getSystemSettings()
      : {};

    if (s.withdrawStop) {
      alert("🚫 Withdraw system OFF");
      return;
    }

    if (typeof approveWithdraw !== "function") {
      alert("Approve system missing");
      return;
    }

    approveWithdraw(id, admin.userId);

    if (typeof logActivity === "function") {
      logActivity(admin.userId, "ADMIN", "Approved withdrawal " + id);
    }

    alert("✅ Approved");
    loadRequests();
  } finally {
    actionLock = false;
  }
}

function reject(id) {
  if (actionLock) return;
  actionLock = true;

  try {
    let s = (typeof getSystemSettings === "function")
      ? getSystemSettings()
      : {};

    if (s.withdrawStop) {
      alert("🚫 Withdraw system OFF");
      return;
    }

    if (typeof rejectWithdraw !== "function") {
      alert("Reject system missing");
      return;
    }

    rejectWithdraw(id, admin.userId);

    if (typeof logActivity === "function") {
      logActivity(admin.userId, "ADMIN", "Rejected withdrawal " + id);
    }

    alert("❌ Rejected");
    loadRequests();
  } finally {
    actionLock = false;
  }
}

function startAutoRefresh() {
  refreshTimer = setInterval(function () {
    loadPage();
  }, 5000);
}
