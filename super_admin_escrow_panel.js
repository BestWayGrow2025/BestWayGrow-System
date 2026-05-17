"use strict";

/*
========================================
SUPER ADMIN ESCROW PANEL
========================================
✔ PIN escrow requests view
✔ Product escrow requests view
✔ System approval control
✔ Super admin final approval
✔ Reject flow support
✔ Full trace visibility
✔ Production UI controller
========================================
*/

/* ================= INIT ================= */

function loadEscrowPanel() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  const ledger =
    typeof safeGet === "function"
      ? safeGet("PIN_BANK_LEDGER", [])
      : [];

  const pending = ledger.filter(
    e => e.status === "PENDING"
  );

  let html = `
    <h3>📌 ESCROW CONTROL PANEL (SUPER ADMIN)</h3>

    <div style="margin-bottom:10px;">
      <b>Total Pending Requests:</b> ${pending.length}
    </div>

    <table border="1" width="100%" style="text-align:left;">
      <tr>
        <th>Escrow ID</th>
        <th>Type</th>
        <th>User ID</th>
        <th>Amount</th>
        <th>Status</th>
        <th>System</th>
        <th>Super</th>
        <th>Actions</th>
      </tr>
  `;

  pending.forEach(e => {
    html += `
      <tr>
        <td>${e.escrowId}</td>
        <td>${e.type}</td>
        <td>${e.userId}</td>
        <td>₹${Number(e.amount || 0).toFixed(2)}</td>
        <td>${e.status}</td>
        <td>${e.systemApproved ? "✔" : "❌"}</td>
        <td>${e.superApproved ? "✔" : "❌"}</td>
        <td>
          <button onclick="approveSystemEscrow('${e.escrowId}')">
            System Approve
          </button>

          <button onclick="approveSuperEscrow('${e.escrowId}')">
            Super Approve
          </button>

          <button onclick="rejectEscrow('${e.escrowId}')">
            Reject
          </button>
        </td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

/* ================= ACTIONS ================= */

function approveSystemEscrow(id) {
  if (typeof systemApproveEscrow !== "function") return;

  systemApproveEscrow(id);
  loadEscrowPanel();
}

function approveSuperEscrow(id) {
  if (typeof superApproveEscrow !== "function") return;

  superApproveEscrow(id);
  loadEscrowPanel();
}

function rejectEscrow(id) {
  let ledger =
    typeof safeGet === "function"
      ? safeGet("PIN_BANK_LEDGER", [])
      : [];

  ledger = ledger.map(e => {
    if (e.escrowId === id) {
      e.status = "REJECTED";
      e.updatedAt = Date.now();
    }
    return e;
  });

  if (typeof safeSet === "function") {
    safeSet("PIN_BANK_LEDGER", ledger);
  }

  loadEscrowPanel();
}

/* ================= EXPORT ================= */

window.loadEscrowPanel = loadEscrowPanel;
window.approveSystemEscrow = approveSystemEscrow;
window.approveSuperEscrow = approveSuperEscrow;
window.rejectEscrow = rejectEscrow;

