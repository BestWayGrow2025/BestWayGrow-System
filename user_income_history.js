"use strict";

/*
========================================
INCOME HISTORY SYSTEM (V1)
========================================
✔ Income ledger display
✔ Safe user handling
✔ Table-based history
✔ MLM ready structure
✔ NULL SAFETY FIXED (PRODUCTION READY)
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  const user = getCurrentUser();

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

  if (!history.length) {
    html += `<tr><td colspan="4">No Income Records Found</td></tr>`;
  }

  history.forEach(item => {

    const dateSafe = item?.date || "-";
    const typeSafe = item?.type || "-";
    const amountSafe = Number(item?.amount || 0);
    const descSafe = item?.description || "-";

    html += `
      <tr>
        <td>${dateSafe}</td>
        <td>${typeSafe}</td>
        <td>₹${amountSafe}</td>
        <td>${descSafe}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

// ================= EXPORT =================
window.loadIncomeHistory = loadIncomeHistory;
