"use strict";

/*
========================================
USER WALLET DASHBOARD vFINAL (PHASE 11)
========================================
✔ Safe session handling
✔ Wallet + history rendering
✔ PIN system compatible
✔ No crash fallback layer
✔ UI safe rendering
✔ Production stable
========================================
*/

// ================= SAFE USER =================

function getSafeUser() {

  const user = window.getCurrentUser?.() || null;

  if (!user) {

    const main = document.getElementById("mainContent");

    if (main) {
      main.innerHTML =
        "<div class='info-box'>Login Required</div>";
    }

    return null;
  }

  return user;
}

// ================= LOAD WALLET =================

function loadWallet() {

  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const wallet = user.wallet || {};

  main.innerHTML = `
    <div class="section-title">Wallet Overview</div>

    <div class="info-box">
      <p><b>Balance:</b> ₹${wallet.balance || 0}</p>
      <p><b>Total Credit:</b> ₹${wallet.totalCredit || 0}</p>
      <p><b>Total Debit:</b> ₹${wallet.totalDebit || 0}</p>
      <p><b>Income Balance:</b> ₹${wallet.incomeBalance || 0}</p>
    </div>
  `;
}

// ================= LOAD WALLET HISTORY =================

function loadWalletHistory() {

  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const history =
    typeof window.getUserTransactions === "function"
      ? window.getUserTransactions(user.userId)
      : [];

  let html = `
    <div class="section-title">Wallet History</div>

    <table border="1" width="100%">
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
      </tr>
  `;

  if (!Array.isArray(history) || history.length === 0) {

    html += `
      <tr>
        <td colspan="3">No Transactions Found</td>
      </tr>
    `;

  } else {

    history.forEach(tx => {

      html += `
        <tr>
          <td>${tx.date || "-"}</td>
          <td>${tx.type || "-"}</td>
          <td>₹${tx.amount || 0}</td>
        </tr>
      `;
    });
  }

  html += `</table>`;

  main.innerHTML = html;
}

// ================= EXPORTS =================

window.loadWallet = loadWallet;
window.loadWalletHistory = loadWalletHistory;

console.log("[USER WALLET DASHBOARD] READY");
