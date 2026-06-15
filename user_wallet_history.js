"use strict";

/*
========================================
USER WALLET HISTORY MODULE (FINAL CLEAN)
========================================
✔ Single-path safe rendering
✔ Session-based user resolution
✔ Safe transaction fallback
✔ No crash behavior
✔ Production stable UI module
========================================
*/

// ================= SAFE USER =================

function getSafeUser() {

  const user = window.getCurrentUser?.() || null;

  return user;
}

// ================= LOAD HISTORY =================

function loadUserWalletHistory() {

  const user = getSafeUser();
  const main = document.getElementById("mainContent");

  if (!user || !main) return;

  const users = window.getUsers?.() || [];

  const current = users.find(
    u => u.userId === user.userId
  );

  const history =
    window.getUserTransactions?.(user.userId) || [];

  let html = `
    <div class="section-title">
      Wallet History
    </div>

    <div class="info-box">
      <p><b>User ID:</b> ${user.userId}</p>
      <p><b>Balance:</b> ₹${current?.wallet?.balance || 0}</p>
    </div>

    <table>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Remark</th>
      </tr>
  `;

  if (!Array.isArray(history) || history.length === 0) {

    html += `
      <tr>
        <td colspan="4">No transactions found</td>
      </tr>
    `;

  } else {

    history.forEach(tx => {

      html += `
        <tr>
          <td>${tx.time || "-"}</td>
          <td>${tx.type || "-"}</td>
          <td>₹${tx.amount || 0}</td>
          <td>${tx.reason || "-"}</td>
        </tr>
      `;
    });
  }

  html += `</table>`;

  main.innerHTML = html;
}

// ================= EXPORT =================

window.loadUserWalletHistory = loadUserWalletHistory;
