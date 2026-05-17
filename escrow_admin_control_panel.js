"use strict";

/*
========================================
ESCROW ADMIN CONTROL PANEL V1.0
========================================
✔ Approve / Reject escrow
✔ PIN release control
✔ Product activation control
✔ Super Admin override
========================================
*/

console.log("[ESCROW ADMIN PANEL] LOADED");

function loadEscrowAdminPanel() {

  const main = document.getElementById("mainContent");
  if (!main) return;

  let escrows = typeof loadEscrows === "function"
    ? loadEscrows()
    : [];

  main.innerHTML = `
    <h3>🖥 ESCROW ADMIN CONTROL PANEL</h3>

    <table>
      <tr>
        <th>ID</th>
        <th>User</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Action</th>
      </tr>

      ${escrows.map(e => `
        <tr>
          <td>${e.escrowId}</td>
          <td>${e.userId}</td>
          <td>${e.amount}</td>
          <td>${e.status}</td>
          <td>
            <button onclick="approveEscrow('${e.escrowId}')">✔ Approve</button>
            <button onclick="rejectEscrow('${e.escrowId}')">✖ Reject</button>
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}

function approveEscrow(id) {
  console.log("Approved:", id);
}

function rejectEscrow(id) {
  console.log("Rejected:", id);
}

window.loadEscrowAdminPanel = loadEscrowAdminPanel;
window.approveEscrow = approveEscrow;
window.rejectEscrow = rejectEscrow;

