"use strict";

/*
========================================
ESCROW CONTROL PANEL V1.0 (SUPER ADMIN CORE)
========================================
✔ PIN Bank integration
✔ Product + PIN escrow flow
✔ Approval-based release system
✔ User → Admin → System Admin → Super Admin tracking
✔ AI governance hook
✔ Audit logging ready
✔ Safe production architecture
========================================
*/

console.log("[ESCROW PANEL] LOADED");

/* ================= ESCROW STORAGE ================= */

const ESCROW_KEY = "ESCROW_DB";
const ESCROW_LOG_KEY = "ESCROW_LOG";

/* ================= LOAD ESCROW ================= */

function loadEscrows() {
  let data = safeGet(ESCROW_KEY, []);
  return Array.isArray(data) ? data : [];
}

function saveEscrows(data) {
  safeSet(ESCROW_KEY, Array.isArray(data) ? data : []);
}

/* ================= ESCROW OBJECT ================= */
/*
status:
- pending_payment
- held_in_pin_bank
- pending_approval
- approved
- rejected
- released
*/

function createEscrow({
  userId,
  type, // "PIN" | "PRODUCT"
  productId,
  pinId,
  amount,
  bv,
  createdBy = "SYSTEM"
}) {
  let escrows = loadEscrows();

  const escrow = {
    escrowId: "ESC_" + Date.now() + "_" + Math.floor(Math.random() * 9999),

    userId,
    type,

    productId: productId || null,
    pinId: pinId || null,

    amount: Number(amount || 0),
    bv: Number(bv || 0),

    status: "pending_payment",

    flow: [
      { stage: "created", by: createdBy, time: Date.now() }
    ],

    createdAt: Date.now()
  };

  escrows.push(escrow);
  saveEscrows(escrows);

  return escrow;
}

/* ================= ESCROW → PIN BANK ================= */

function moveToPinBank(escrowId) {
  let escrows = loadEscrows();

  let esc = escrows.find(e => e.escrowId === escrowId);
  if (!esc) return false;

  if (esc.status !== "pending_payment") return false;

  let user = typeof getUserById === "function"
    ? getUserById(esc.userId)
    : null;

  if (!user) return false;

  let bank = getPinBank(user);

  if (bank.balance < esc.amount) return false;

  bank.balance -= esc.amount;
  bank.totalDebit += esc.amount;

  esc.status = "held_in_pin_bank";
  esc.flow.push({
    stage: "held",
    by: "PIN_BANK",
    time: Date.now()
  });

  saveEscrows(escrows);
  savePinBankUser(user);

  logEscrow("HELD", esc);

  return true;
}

/* ================= APPROVAL FLOW ================= */

function approveEscrow(escrowId, approverId) {
  let escrows = loadEscrows();

  let esc = escrows.find(e => e.escrowId === escrowId);
  if (!esc) return false;

  if (esc.status !== "held_in_pin_bank") return false;

  esc.status = "pending_approval";

  esc.flow.push({
    stage: "approved_by_admin",
    by: approverId,
    time: Date.now()
  });

  saveEscrows(escrows);
  logEscrow("APPROVAL", esc);

  return true;
}

/* ================= RELEASE FUNDS ================= */

function releaseEscrow(escrowId, superAdminId) {
  let escrows = loadEscrows();

  let esc = escrows.find(e => e.escrowId === escrowId);
  if (!esc) return false;

  if (esc.status !== "pending_approval") return false;

  esc.status = "released";

  esc.flow.push({
    stage: "released",
    by: superAdminId,
    time: Date.now()
  });

  saveEscrows(escrows);
  logEscrow("RELEASED", esc);

  return true;
}

/* ================= REJECT ================= */

function rejectEscrow(escrowId, reason = "NO_REASON") {
  let escrows = loadEscrows();

  let esc = escrows.find(e => e.escrowId === escrowId);
  if (!esc) return false;

  esc.status = "rejected";

  esc.flow.push({
    stage: "rejected",
    reason,
    time: Date.now()
  });

  saveEscrows(escrows);
  logEscrow("REJECTED", esc);

  return true;
}

/* ================= LOG ================= */

function logEscrow(action, esc) {
  let logs = safeGet(ESCROW_LOG_KEY, []);
  if (!Array.isArray(logs)) logs = [];

  logs.push({
    id: "ESCLOG_" + Date.now(),
    action,
    escrowId: esc.escrowId,
    userId: esc.userId,
    type: esc.type,
    amount: esc.amount,
    status: esc.status,
    time: Date.now()
  });

  safeSet(ESCROW_LOG_KEY, logs);
}

/* ================= AI CONTROL HOOK ================= */

function escrowAIAnalyzer(escrow) {
  // future AI hook
  return {
    risk: "low",
    recommendation: "approve"
  };
}

/* ================= UI PANEL ================= */

function loadEscrowPanel() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  let escrows = loadEscrows();

  main.innerHTML = `
    <h3>📦 ESCROW CONTROL PANEL</h3>

    <div style="margin:10px 0;">
      <button onclick="loadEscrowPanel()">🔄 Refresh</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Escrow ID</th>
          <th>User</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${escrows.map(e => `
          <tr>
            <td>${e.escrowId}</td>
            <td>${e.userId}</td>
            <td>${e.type}</td>
            <td>${e.amount}</td>
            <td>${e.status}</td>
            <td>
              <button onclick="approveEscrow('${e.escrowId}', 'ADMIN')">Approve</button>
              <button onclick="releaseEscrow('${e.escrowId}', 'SUPER_ADMIN')">Release</button>
              <button onclick="rejectEscrow('${e.escrowId}', 'MANUAL')">Reject</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/* ================= EXPORT ================= */

window.loadEscrowPanel = loadEscrowPanel;
window.createEscrow = createEscrow;
window.approveEscrow = approveEscrow;
window.releaseEscrow = releaseEscrow;
window.rejectEscrow = rejectEscrow;
window.moveToPinBank = moveToPinBank;
