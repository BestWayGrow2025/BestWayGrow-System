/*
========================================
INCOME HISTORY SYSTEM (V1)
========================================
✔ Income ledger display
✔ Safe user handling
✔ Table-based history
✔ MLM ready structure
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

// ================= LOAD INCOME HISTORY =================
function loadIncomeHistory() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const history = user.incomeHistory || [];

  let html = `
    <div class="section-title">Income History</div>

    <table border="1" width="100%">
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Description</th>
      </tr>
  `;

  if (history.length === 0) {
    html += `<tr><td colspan="4">No Income Records Found</td></tr>`;
  }

  history.forEach(item => {
    html += `
      <tr>
        <td>${item.date || "-"}</td>
        <td>${item.type || "-"}</td>
        <td>₹${item.amount || 0}</td>
        <td>${item.description || "-"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

// ================= ADD INCOME (UTILITY FUTURE USE) =================
function addIncome(userId, type, amount, description = "") {
  let users = typeof getUsers === "function" ? getUsers() : [];
  let index = users.findIndex(u => u.userId === userId);

  if (index === -1) return;

  if (!users[index].incomeHistory) {
    users[index].incomeHistory = [];
  }

  users[index].incomeHistory.push({
    type,
    amount,
    description,
    date: new Date().toISOString()
  });

  // wallet update sync
  users[index].wallet = users[index].wallet || {};
  users[index].wallet.incomeBalance =
    (users[index].wallet.incomeBalance || 0) + amount;

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }
}

// ================= EXPORT =================
window.loadIncomeHistory = loadIncomeHistory;
window.addIncome = addIncome;
