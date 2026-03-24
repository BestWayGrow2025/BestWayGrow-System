<script>
// =====================
// GET WITHDRAW REQUESTS
// =====================
function getWithdrawals() {
  return JSON.parse(localStorage.getItem("withdrawals") || "[]");
}

function saveWithdrawals(data) {
  localStorage.setItem("withdrawals", JSON.stringify(data));
}

// =====================
// USER REQUEST WITHDRAW
// =====================
function requestWithdraw(userId, amount) {

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let user = users.find(u => u.userId === userId);

  if (!user) return alert("User not found");

  if (!amount || amount <= 0) {
    return alert("Invalid amount");
  }

  if ((user.wallet || 0) < amount) {
    return alert("Insufficient balance");
  }

  // 🔥 Deduct instantly
  user.wallet -= amount;
  localStorage.setItem("users", JSON.stringify(users));

  // 🔥 LOG TRANSACTION (IMPORTANT)
  let txns = JSON.parse(localStorage.getItem("transactions") || "[]");

  txns.push({
    userId: userId,
    amount: amount,
    type: "DEBIT",
    reason: "Withdrawal Request",
    time: new Date().toISOString()
  });

  localStorage.setItem("transactions", JSON.stringify(txns));

  // 🔥 Create request
  let requests = getWithdrawals();

  let req = {
    requestId: "WD" + Date.now(),
    userId: userId,
    amount: amount,
    status: "PENDING",
    time: new Date().toISOString()
  };

  requests.push(req);
  saveWithdrawals(requests);

  alert("Withdrawal request submitted");
}

// =====================
// APPROVE WITHDRAW
// =====================
function approveWithdraw(id) {

  let requests = getWithdrawals();
  let req = requests.find(r => r.requestId === id);

  if (!req || req.status !== "PENDING") return;

  req.status = "APPROVED";
  saveWithdrawals(requests);

  alert("Withdrawal Approved");
}

// =====================
// REJECT WITHDRAW
// =====================
function rejectWithdraw(id) {

  let requests = getWithdrawals();
  let req = requests.find(r => r.requestId === id);

  if (!req || req.status !== "PENDING") return;

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let user = users.find(u => u.userId === req.userId);

  // 🔥 Refund wallet
  if (user) {
    user.wallet = (user.wallet || 0) + req.amount;
    localStorage.setItem("users", JSON.stringify(users));
  }

  req.status = "REJECTED";
  saveWithdrawals(requests);

  alert("Withdrawal Rejected & Refunded");
}
</script>

