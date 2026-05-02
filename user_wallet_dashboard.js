/*
========================================
WALLET SYSTEM (UI LAYER V1)
========================================
✔ Balance display
✔ Credit / Debit view
✔ Safe user load
✔ Clean dashboard UI
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  const user = getCurrentUser();

  if (!user) {
    document.getElementById("mainContent").innerHTML =
      "<div class='info-box'>Login Required</div>";
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

// ================= WALLET HISTORY (BASIC) =================
function loadWalletHistory() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const history = user.walletHistory || [];

  let html = `
    <div class="section-title">Wallet History</div>
    <table border="1" width="100%">
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
      </tr>
  `;

  if (history.length === 0) {
    html += `<tr><td colspan="3">No Transactions</td></tr>`;
  }

  history.forEach(h => {
    html += `
      <tr>
        <td>${h.date || "-"}</td>
        <td>${h.type || "-"}</td>
        <td>${h.amount || 0}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

// ================= EXPORT =================
window.loadWallet = loadWallet;
window.loadWalletHistory = loadWalletHistory;

