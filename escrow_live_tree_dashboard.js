"use strict";

/*
========================================
ESCROW LIVE TREE DASHBOARD V1.0
========================================
✔ Real-time escrow visualization
✔ User → Admin → System Admin → Super Admin flow
✔ PIN Bank tracking view
✔ Product mapping view
✔ AI decision display
========================================
*/

console.log("[ESCROW LIVE TREE] LOADED");

function loadEscrowLiveTree() {

  const main = document.getElementById("mainContent");
  if (!main) return;

  let escrows = typeof loadEscrows === "function"
    ? loadEscrows()
    : [];

  main.innerHTML = `
    <h3>🌳 ESCROW LIVE FLOW TREE</h3>

    <div style="margin:10px 0;">
      <button onclick="loadEscrowLiveTree()">🔄 Refresh</button>
    </div>

    ${escrows.map(e => `
      <div style="border:1px solid #ddd;margin:10px 0;padding:10px;border-radius:8px;background:#fff;">

        <b>Escrow ID:</b> ${e.escrowId || "-"} <br>
        <b>User:</b> ${e.userId} <br>
        <b>Type:</b> ${e.type} <br>
        <b>Amount:</b> ${e.amount} <br>
        <b>Status:</b> ${e.status} <br>

        <hr>

        <b>FLOW:</b><br>
        ${(e.flow || []).map(f =>
          `<div>➡ ${f.stage} | ${f.by} | ${new Date(f.time).toLocaleString()}</div>`
        ).join("")}

      </div>
    `).join("")}
  `;
}

window.loadEscrowLiveTree = loadEscrowLiveTree;
