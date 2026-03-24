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

  let MIN_WITHDRAW = 500; // ✅ Minimum ₹500
  let CHARGE_PERCENT = 10; // ✅ 10% charge

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let user = users.find(u => u.userId === userId);

  if (!user) return alert("User not found");

  if (!amount || amount <= 0) {
    return alert("Invalid amount");
  }

  // ❗ Minimum check
  if (amount < MIN_WITHDRAW) {
    return alert("Minimum withdraw is ₹ " + MIN_WITHDRAW);
  }

  if ((user.wallet || 0) < amount) {
    return alert("Insufficient balance");
  }

  // 🔥 Charge calculation
  let charge = Math.round((amount * CHARGE_PERCENT) / 100);
  let finalAmount = amount - charge;

  // 🔥 Deduct wallet
  user.wallet -= amount;
  localStorage.setItem("users", JSON.stringify(users));

  // 🔥 Transaction log
  let txns = JSON.parse(localStorage.getItem("transactions") || "[]");

  txns.push({
    userId,
    amount,
    type: "DEBIT",
    reason: "Withdrawal Request",
    time: new Date().toISOString()
  });

  txns.push({
    userId,
    amount: charge,
    type: "DEBIT",
    reason: "Withdrawal Charge",
    time: new Date().toISOString()
  });

  localStorage.setItem("transactions", JSON.stringify(txns));

  // 🔥 Create request
  let requests = getWithdrawals();

  let req = {
    requestId: "WD" + Date.now(),
    userId: userId,
    amount: amount,
    charge: charge,
    finalAmount: finalAmount,
    status: "PENDING",
    time: new Date().toISOString()
  };

  requests.push(req);
  saveWithdrawals(requests);

  alert("Request submitted. You will receive ₹ " + finalAmount);
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

  // 🔥 Refund full amount
  if (user) {
    user.wallet = (user.wallet || 0) + req.amount;
    localStorage.setItem("users", JSON.stringify(users));
  }

  req.status = "REJECTED";
  saveWithdrawals(requests);

  alert("Withdrawal Rejected & Refunded");
}
