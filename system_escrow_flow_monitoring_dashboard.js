"use strict";

/*
========================================
ESCROW FLOW DASHBOARD V1.0
========================================
✔ Live escrow visualization
✔ Full user → admin → super admin trace
✔ AI decision display support
✔ PIN + Product mapping view
✔ PIN Bank hold tracking
✔ Super Admin monitoring panel
========================================
*/

console.log("[ESCROW FLOW DASHBOARD] LOADED");

/* ================= FETCH ESCROWS ================= */

function getAllEscrowData() {
  if (typeof loadEscrows === "function") {
    return loadEscrows();
  }
  return [];
}

/* ================= FORMAT HELPERS ================= */

function formatTime(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

/* ================= FLOW TRACE BUILDER ================= */

function buildFlowTrace(flow = []) {
  if (!Array.isArray(flow)) return "";

  return flow.map(f => {
    return `
      <div style="margin:4px 0;padding:5px;border-left:3px solid #ff6600;">
        <b>${f.stage || "stage"}</b><br>
        👤 By: ${f.by || "-"}<br>
        ⏱ ${formatTime(f.time)}
      </div>
    `;
  }).join("");
}

/* ================= MAIN DASHBOARD ================= */

function loadEscrowFlowDashboard() {

  const main = document.getElementById("mainContent");
  if (!main) return;

  let escrows = getAllEscrowData();

  main.innerHTML = `
    <h3>📊 ESCROW FLOW DASHBOARD (LIVE)</h3>

    <div style="margin:10px 0;">
      <button onclick="loadEscrowFlowDashboard()">🔄 Refresh</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Escrow ID</th>
          <th>User</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>AI Score</th>
          <th>Trace Flow</th>
        </tr>
      </thead>

      <tbody>
        ${escrows.map(e => {

          let ai = typeof analyzeEscrowRequest === "function"
            ? analyzeEscrowRequest({
                userId: e.userId,
                type: e.type,
                amount: e.amount,
                productId: e.productId,
                pinType: e.pinType
              })
            : null;

          return `
            <tr>
              <td>${e.escrowId}</td>
              <td>${e.userId}</td>
              <td>${e.type}</td>
              <td>${e.amount}</td>
              <td>${e.status}</td>

              <td>
                ${ai ? `
                  <b>${ai.decision}</b><br>
                  Score: ${ai.score}<br>
                  ${ai.flags.join(", ")}
                ` : "N/A"}
              </td>

              <td>
                ${buildFlowTrace(e.flow)}
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

/* ================= SINGLE ESCROW DETAIL ================= */

function viewEscrowDetail(escrowId) {

  let escrows = getAllEscrowData();
  let esc = escrows.find(e => e.escrowId === escrowId);

  if (!esc) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <h3>📦 ESCROW DETAIL VIEW</h3>

    <p><b>Escrow ID:</b> ${esc.escrowId}</p>
    <p><b>User:</b> ${esc.userId}</p>
    <p><b>Type:</b> ${esc.type}</p>
    <p><b>Amount:</b> ${esc.amount}</p>
    <p><b>Status:</b> ${esc.status}</p>
    <p><b>Product ID:</b> ${esc.productId || "-"}</p>
    <p><b>PIN ID:</b> ${esc.pinId || "-"}</p>

    <hr>

    <h4>🔄 FLOW HISTORY</h4>
    ${buildFlowTrace(esc.flow)}

    <hr>

    <button onclick="loadEscrowFlowDashboard()">⬅ Back</button>
  `;
}

/* ================= EXPORT ================= */

window.loadEscrowFlowDashboard = loadEscrowFlowDashboard;
window.viewEscrowDetail = viewEscrowDetail;
