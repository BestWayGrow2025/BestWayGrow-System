// ================= INIT =================
initCoreSystem();

// ================= SECURITY =================
let admin = protectPage({
  role: "admin",
  department: "finance"
});

if (!admin) {
  throw new Error("Access Blocked");
}

// ================= SYSTEM CHECK =================
function loadSystemStatus() {
  let s = getSystemSettings() || {};

  document.getElementById("systemStatus").innerHTML = `
    Withdraw System: ${s.withdrawStop ? "STOPPED 🔴" : "RUNNING 🟢"}
  `;
}

// ================= NAV =================
function goBack() {
  window.location.href = "admin_dashboard.html";
}

// ================= COLOR =================
function getStatusColor(status) {
  if (status === "PENDING") return "orange";
  if (status === "APPROVED") return "green";
  if (status === "REJECTED") return "red";
  return "black";
}

// ================= LOAD =================
function loadRequests() {
  let requests = getWithdrawals() || [];
  let table = document.getElementById("withdrawTable");

  table.innerHTML = "";

  if (!requests.length) {
    table.innerHTML = "<tr><td colspan='9'>No requests</td></tr>";
    return;
  }

  requests.slice().reverse().forEach(req => {
    let row = `
      <tr>
        <td>${req.requestId}</td>
        <td>${req.userId}</td>
        <td>₹ ${req.amount}</td>
        <td>₹ ${req.charge || 0}</td>
        <td>₹ ${req.finalAmount || req.amount}</td>
        <td style="color:${getStatusColor(req.status)}">${req.status}</td>
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

    table.innerHTML += row;
  });

  if (typeof logActivity === "function") {
    logActivity(admin.userId, "ADMIN", "Viewed withdrawals");
  }
}

// ================= ACTION =================
function approve(id) {
  let s = getSystemSettings() || {};

  if (s.withdrawStop) {
    alert("🚫 Withdraw system OFF");
    return;
  }

  approveWithdraw(id, admin.userId);

  if (typeof logActivity === "function") {
    logActivity(admin.userId, "ADMIN", "Approved withdrawal " + id);
  }

  alert("✅ Approved");
  loadRequests();
}

function reject(id) {
  let s = getSystemSettings() || {};

  if (s.withdrawStop) {
    alert("🚫 Withdraw system OFF");
    return;
  }

  rejectWithdraw(id, admin.userId);

  if (typeof logActivity === "function") {
    logActivity(admin.userId, "ADMIN", "Rejected withdrawal " + id);
  }

  alert("❌ Rejected");
  loadRequests();
}

// ================= AUTO REFRESH =================
setInterval(() => {
  loadRequests();
  loadSystemStatus();
}, 5000);

// ================= DEFAULT =================
loadRequests();
loadSystemStatus();
