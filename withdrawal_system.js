// =====================
// 💸 WITHDRAWAL SYSTEM (FINAL SAFE)
// =====================

// =====================
// 🔹 GET / SAVE
// =====================
function getWithdrawals() {
  return JSON.parse(localStorage.getItem("withdrawals") || "[]");
}

function saveWithdrawals(data) {
  localStorage.setItem("withdrawals", JSON.stringify(data));
}


// =====================
// 🔒 SYSTEM SAFETY (NEW 🔥)
// =====================
function isWithdrawSystemSafe() {

  let system = JSON.parse(localStorage.getItem("systemSettings") || "{}");

  if (system.withdrawStop === true) {
    console.warn("⛔ Withdraw system stopped by admin");
    return false;
  }

  return true;
}


// =====================
// 💰 USER REQUEST
// =====================
function requestWithdraw(userId, amount) {

  // 🔒 GLOBAL SAFETY
  if (!isWithdrawSystemSafe()) {
    alert("Withdraw system temporarily disabled");
    return;
  }

  let MIN_WITHDRAW = 500;
  let CHARGE_PERCENT = 10;

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let user = users.find(u => u.userId === userId);

  if (!user) return alert("User not found");

  if (!amount || amount <= 0) {
    return alert("Invalid amount");
  }

  if (amount < MIN_WITHDRAW) {
    return alert("Minimum withdraw is ₹ " + MIN_WITHDRAW);
  }

  if ((user.wallet || 0) < amount) {
    return alert("Insufficient balance");
  }

  // 💸 CALCULATION
  let charge = Math.round((amount * CHARGE_PERCENT) / 100);
  let finalAmount = amount - charge;

  // 💳 WALLET DEDUCT
  user.wallet -= amount;
  localStorage.setItem("users", JSON.stringify(users));

  // 📜 TRANSACTION LOG
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

  // 📦 CREATE REQUEST
  let requests = getWithdrawals();

  let req = {
    requestId: "WD" + Date.now(),
    userId,
    amount,
    charge,
    finalAmount,
    status: "PENDING",
    time: new Date().toISOString(),
    processedAt: null
  };

  requests.push(req);
  saveWithdrawals(requests);

  // 📜 ACTIVITY LOG
  if (typeof logActivity === "function") {
    logActivity(userId, "USER", "Withdrawal requested ₹" + amount);
  }

  alert("Request submitted. You will receive ₹ " + finalAmount);
}


// =====================
// ✅ APPROVE
// =====================
function approveWithdraw(id, adminId = "ADMIN") {

  let requests = getWithdrawals();
  let req = requests.find(r => r.requestId === id);

  if (!req || req.status !== "PENDING") return;

  req.status = "APPROVED";
  req.processedAt = new Date().toISOString();

  saveWithdrawals(requests);

  // 📜 LOG
  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Approved withdrawal " + id);
  }

  alert("Withdrawal Approved");
}


// =====================
// ❌ REJECT
// =====================
function rejectWithdraw(id, adminId = "ADMIN") {

  let requests = getWithdrawals();
  let req = requests.find(r => r.requestId === id);

  if (!req || req.status !== "PENDING") return;

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let user = users.find(u => u.userId === req.userId);

  // 🔁 REFUND
  if (user) {
    user.wallet = (user.wallet || 0) + req.amount;
    localStorage.setItem("users", JSON.stringify(users));
  }

  req.status = "REJECTED";
  req.processedAt = new Date().toISOString();

  saveWithdrawals(requests);

  // 📜 LOG
  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Rejected withdrawal " + id);
  }

  alert("Withdrawal Rejected & Refunded");
}



