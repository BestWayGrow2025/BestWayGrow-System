"use strict";

/*
========================================
SUPER ADMIN ESCROW PANEL V1.0 FINAL
========================================
✔ Escrow dashboard UI controller
✔ System + Super approval workflow
✔ PIN + Product escrow visibility
✔ Safe render engine
✔ Live ledger sync
✔ Admin control actions
========================================
*/

console.log("[ESCROW PANEL] LOADED");

let escrowLock = false;

// ================= INIT =================

window.addEventListener("load", function () {
  bindEscrowMenu();
});

// ================= MENU BIND =================

function bindEscrowMenu() {
  document.querySelectorAll('.menu button[data-page="escrow"]').forEach(btn => {
    btn.addEventListener("click", loadEscrowPanel);
  });
}

// ================= MAIN PANEL =================

function loadEscrowPanel() {
  const box = document.getElementById("mainContent");

  if (!box) return;

  const ledger = typeof safeGet === "function"
    ? safeGet("PIN_BANK_LEDGER", [])
    : [];

  const data = Array.isArray(ledger) ? ledger : [];

  const total = data.length;
  const pending = data.filter(e => e.status === "PENDING").length;
  const approved = data.filter(e => e.status === "APPROVED").length;
  const rejected = data.filter(e => e.status === "REJECTED").length;

  box.innerHTML = `
    <h3>📦 ESCROW CONTROL PANEL</h3>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
      <div style="background:#ff9800;color:#fff;padding:12px;border-radius:8px;">
        Total: ${total}
      </div>

      <div style="background:#2196f3;color:#fff;padding:12px;border-radius:8px;">
        Pending: ${pending}
      </div>

      <div style="background:#4caf50;color:#fff;padding:12px;border-radius:8px;">
        Approved: ${approved}
      </div>

      <div style="background:#f44336;color:#fff;padding:12px;border-radius:8px;">
        Rejected: ${rejected}
      </div>
    </div>

    <br>

    <h4>📜 ESCROW LIST</h4>

    <div>
      ${renderEscrowTable(data)}
    </div>
  `;
}

// ================= RENDER TABLE =================

function renderEscrowTable(data) {
  if (!data.length) {
    return "<p>No escrow records found</p>";
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Escrow ID</th>
          <th>User ID</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>System</th>
          <th>Super</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        ${data.map(e => `
          <tr>
            <td>${e.escrowId}</td>
            <td>${e.userId}</td>
            <td>${e.type}</td>
            <td>₹${Number(e.amount || 0).toFixed(2)}</td>
            <td>${e.status}</td>
            <td>${e.systemApproved ? "✅" : "❌"}</td>
            <td>${e.superApproved ? "✅" : "❌"}</td>

            <td>
              ${renderActions(e)}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// ================= ACTION BUTTONS =================

function renderActions(e) {
  if (e.status === "APPROVED" || e.status === "REJECTED") {
    return "<small>Locked</small>";
  }

  return `
    <button onclick="approveSystemEscrowUI('${e.escrowId}')">
      System Approve
    </button>

    <button onclick="approveSuperEscrowUI('${e.escrowId}')">
      Super Approve
    </button>

    <button onclick="rejectEscrowUI('${e.escrowId}')">
      Reject
    </button>
  `;
}

// ================= ACTION WRAPPERS =================

function approveSystemEscrowUI(id) {
  if (escrowLock) return;
  escrowLock = true;

  try {
    if (typeof systemApproveEscrow === "function") {
      systemApproveEscrow(id);
      alert("System Approved");
    }
    loadEscrowPanel();
  } catch (e) {
    console.error(e);
  } finally {
    escrowLock = false;
  }
}

function approveSuperEscrowUI(id) {
  if (escrowLock) return;
  escrowLock = true;

  try {
    if (typeof superApproveEscrow === "function") {
      superApproveEscrow(id);
      alert("Super Approved");
    }
    loadEscrowPanel();
  } catch (e) {
    console.error(e);
  } finally {
    escrowLock = false;
  }
}

function rejectEscrowUI(id) {
  if (escrowLock) return;
  escrowLock = true;

  try {
    if (typeof rejectEscrow === "function") {
      rejectEscrow(id);
      alert("Escrow Rejected");
    }
    loadEscrowPanel();
  } catch (e) {
    console.error(e);
  } finally {
    escrowLock = false;
  }
}

// ================= EXPORT =================

window.loadEscrowPanel = loadEscrowPanel;
window.approveSystemEscrowUI = approveSystemEscrowUI;
window.approveSuperEscrowUI = approveSuperEscrowUI;
window.rejectEscrowUI = rejectEscrowUI;
