
"use strict";

/*
========================================
SUPER ADMIN PIN CONTROL (FINAL FIXED)
========================================
✔ Safe super admin layer
✔ PIN request filtering
✔ Execute flow only (no direct engine calls)
✔ Dashboard integration added
✔ loadPins() exported
✔ UI safe hooks included
========================================
*/

/* ================= SAFE SUPER ADMIN ================= */

function getSafeSuperAdmin() {
  if (typeof getSession !== "function") return null;

  const session = getSession();

  if (!session || session.role !== "super_admin") return null;

  if (typeof getUserById === "function") {
    return getUserById(session.userId);
  }

  return session;
}

/* ================= REQUEST FILTER ================= */

function getSuperAdminPinRequests() {
  if (typeof getPinRequests !== "function") return [];

  return (getPinRequests() || []).filter(req =>
    req &&
    req.paymentId &&
    String(req.paymentId).startsWith("SYSTEM_STOCK_")
  );
}

function getPendingSystemStockRequests() {
  return getSuperAdminPinRequests().filter(req =>
    req.status === "PENDING"
  );
}

/* ================= VALIDATION ================= */

function canReviewSystemStockRequest(requestId) {
  const admin = getSafeSuperAdmin();
  if (!admin) return false;

  const req = getPendingSystemStockRequests().find(
    r => r.requestId === requestId
  );

  return !!req;
}

/* ================= APPROVE ================= */

function approveSystemStockRequest(requestId) {
  if (!canReviewSystemStockRequest(requestId)) {
    alert("Invalid or unauthorized request");
    return;
  }

  if (typeof executePinFlow !== "function") {
    throw new Error("PIN Flow Controller missing");
  }

  return executePinFlow("PROCESS_REQUEST", {
    requestId
  });
}

/* ================= REJECT ================= */

function rejectSystemStockRequest(requestId) {
  if (!canReviewSystemStockRequest(requestId)) {
    alert("Invalid or unauthorized request");
    return;
  }

  if (typeof executePinFlow !== "function") {
    throw new Error("PIN Flow Controller missing");
  }

  return executePinFlow("REJECT_REQUEST", {
    requestId
  });
}

/* ================= PIN DASHBOARD VIEW ================= */

function loadPins() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  const requests = getSuperAdminPinRequests();

  let html = `
    <h3>📌 PIN CONTROL PANEL (SUPER ADMIN)</h3>

    <div style="margin-bottom:10px;">
      <b>Total Requests:</b> ${requests.length}
    </div>

    <table border="1" style="width:100%;text-align:left;">
      <tr>
        <th>Request ID</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
  `;

  requests.forEach(req => {
    html += `
      <tr>
        <td>${req.requestId}</td>
        <td>${req.status}</td>
        <td>
          <button onclick="approveSystemStockRequest('${req.requestId}')">
            Approve
          </button>

          <button onclick="rejectSystemStockRequest('${req.requestId}')">
            Reject
          </button>
        </td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

/* ================= GLOBAL PIN AUTH ================= */

function canCreateGlobalPin(type) {
  const admin = getSafeSuperAdmin();
  return !!admin && ["upgrade", "repurchase"].includes(type);
}

function canDeleteGlobalPin(pin) {
  if (typeof canDeletePin !== "function") return false;
  return canDeletePin(pin, "super_admin");
}

function canOverrideGlobalPin() {
  return !!getSafeSuperAdmin();
}

/* ================= EXPORTS ================= */

window.loadPins = loadPins;
window.approveSystemStockRequest = approveSystemStockRequest;
window.rejectSystemStockRequest = rejectSystemStockRequest;
