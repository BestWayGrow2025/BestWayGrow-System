/*
========================================
WITHDRAW SYSTEM (V1)
========================================
✔ Withdraw request
✔ Wallet deduction check
✔ Request history store
✔ Safe validation
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

// ================= LOAD WITHDRAW PAGE =================
function loadWithdrawSection() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <div class="section-title">Withdraw Request</div>

    <div class="info-box">
      <p><b>Available Balance:</b> ₹${user.wallet?.balance || 0}</p>

      <label>Enter Amount</label>
      <input type="number" id="withdrawAmount" placeholder="Enter amount">

      <button class="action-btn" onclick="submitWithdraw()">Request Withdraw</button>
    </div>
  `;
}

// ================= SUBMIT WITHDRAW =================
function submitWithdraw() {
  const user = getSafeUser();
  if (!user) return;

  const amount = Number(document.getElementById("withdrawAmount").value);

  if (!amount || amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  if ((user.wallet?.balance || 0) < amount) {
    alert("Insufficient Balance");
    return;
  }

  let users = typeof getUsers === "function" ? getUsers() : [];
  let index = users.findIndex(u => u.userId === user.userId);

  if (index === -1) return;

  // Deduct balance
  users[index].wallet.balance -= amount;
  users[index].wallet.totalDebit =
    (users[index].wallet.totalDebit || 0) + amount;

  // Withdraw history
  if (!users[index].withdrawHistory) {
    users[index].withdrawHistory = [];
  }

  users[index].withdrawHistory.push({
    amount,
    status: "PENDING",
    date: new Date().toISOString()
  });

  // Save users
  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  alert("Withdraw Request Submitted");

  loadWithdrawSection();
}

// ================= WITHDRAW HISTORY =================
function loadWithdrawHistory() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const history = user.withdrawHistory || [];

  let html = `
    <div class="section-title">Withdraw History</div>
    <table border="1" width="100%">
      <tr>
        <th>Date</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
  `;

  if (history.length === 0) {
    html += `<tr><td colspan="3">No Withdraw Requests</td></tr>`;
  }

  history.forEach(h => {
    html += `
      <tr>
        <td>${h.date || "-"}</td>
        <td>₹${h.amount || 0}</td>
        <td>${h.status || "-"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

// ================= EXPORT =================
window.loadWithdrawSection = loadWithdrawSection;
window.loadWithdrawHistory = loadWithdrawHistory;
window.submitWithdraw = submitWithdraw;
