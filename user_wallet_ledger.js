/*
========================================
USER WALLET LEDGER MODULE (V1)
========================================
✔ Wallet transaction history view
✔ Safe fallback if wallet system missing
✔ No backend dependency crash
✔ Ready for integration with wallet_system.js
========================================
*/

// ================= SAFE USER =================
function getUserSafe() {
  if (typeof getCurrentUser !== "function") return null;
  return getCurrentUser();
}

// ================= SAFE GET USERS =================
function getAllUsersSafe() {
  if (typeof getUsers !== "function") return [];
  return getUsers();
}

// ================= LOAD WALLET LEDGER =================
function loadWalletHistory() {
  const user = getUserSafe();
  const main = document.getElementById("mainContent");

  if (!user || !main) return;

  const users = getAllUsersSafe();
  const current = users.find(u => u.userId === user.userId);

  const history = current?.wallet?.history || [];

  let html = `
    <div class="section-title">Wallet History</div>
    <div class="info-box">
      <p><b>User ID:</b> ${user.userId}</p>
      <p><b>Current Balance:</b> ₹${current?.wallet?.balance || 0}</p>
    </div>

    <table>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Remark</th>
      </tr>
  `;

  if (!history.length) {
    html += `<tr><td colspan="4">No transactions found</td></tr>`;
  } else {
    history.forEach(tx => {
      html += `
        <tr>
          <td>${tx.date || "-"}</td>
          <td>${tx.type || "-"}</td>
          <td>₹${tx.amount || 0}</td>
          <td>${tx.remark || "-"}</td>
        </tr>
      `;
    });
  }

  html += `</table>`;

  main.innerHTML = html;
}

// ================= GLOBAL EXPORT =================
window.loadWalletHistory = loadWalletHistory;
feat(wallet): add user_wallet_ledger module for wallet history view with safe fallback and session protection
