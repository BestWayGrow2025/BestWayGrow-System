"use strict";

/*
========================================
INCOME HISTORY SYSTEM (FINAL V1 - SINGLE PATH RULE)
========================================
✔ Safe session-based user loading
✔ Null-safe income rendering
✔ Ledger-style history output
✔ UI-only responsibility (NO BUSINESS LOGIC)
✔ Fully defensive production-safe design
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  const user =
    typeof getCurrentUser === "function"
      ? getCurrentUser()
      : null;

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

  const history = Array.isArray(user.incomeHistory)
    ? user.incomeHistory
    : [];

  let html = `
    <div class="section-title">Income History</div>

    <table border="1" width="100%">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (history.length === 0) {
    html += `
      <tr>
        <td colspan="4" style="text-align:center;">
          No Income Records Found
        </td>
      </tr>
    `;
  } else {
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
  }

  html += `
      </tbody>
    </table>
  `;

  main.innerHTML = html;
}

// ================= EXPORT =================
window.loadIncomeHistory = loadIncomeHistory;
