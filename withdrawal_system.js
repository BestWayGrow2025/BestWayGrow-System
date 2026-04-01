/* ===============================
   💸 WITHDRAWAL SYSTEM (FINAL PRO)
=============================== */

// =====================
// 🔹 GET / SAVE (SAFE)
// =====================
function getWithdrawals() {
  try {
    return JSON.parse(localStorage.getItem("withdrawals") || "[]");
  } catch {
    localStorage.setItem("withdrawals", "[]");
    return [];
  }
}

function saveWithdrawals(data) {
  localStorage.setItem("withdrawals", JSON.stringify(data));
}

// =====================
// 🔒 SYSTEM SAFETY
// =====================
function isWithdrawSystemSafe() {

  let system;
  try {
    system = JSON.parse(localStorage.getItem("systemSettings") || "{}");
  } catch {
    system = {};
  }

  if (system.withdrawStop === true) {
    console.warn("⛔ Withdraw system stopped by admin");
    return false;
  }

  return true;
}

// =====================
// 💰 USER REQUEST (FINAL SAFE)
// =====================
function requestWithdraw(userId, amount) {

  // 🔒 MULTI-CLICK LOCK
  if (window.withdrawLock) {
    return alert("Processing... please wait");
  }
  window.withdrawLock = true;

  try {

    // 🔒 GLOBAL SAFETY
    if (!isWithdrawSystemSafe()) {
      alert("Withdraw system temporarily disabled");
      return;
    }

    // 🔒 ACTIVE CHECK
    if (typeof isUserActive === "function") {
      if (!isUserActive(userId)) {
        return alert("Activate account first");
      }
    }

    // 🔒 DUPLICATE REQUEST BLOCK
    let pending = getWithdrawals().find(r => 
      r.userId === userId && r.status === "PENDING"
    );

    if (pending) {
      return alert("You already have a pending request");
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

    // 💳 SAFE WALLET DEDUCT
    if (typeof debitWallet === "function") {
      if (!debitWallet(userId, amount, "Withdrawal Request")) return;
    } else {
      user.wallet -= amount;
      localStorage.setItem("users", JSON.stringify(users));
    }

    // 📜 SAFE TRANSACTION LOG
    if (typeof logTransaction === "function") {
      logTransaction(userId, amount, "DEBIT", "Withdrawal Request");
      logTransaction(userId, charge, "DEBIT", "Withdrawal Charge");
    }

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

  } finally {
    window.withdrawLock = false; // 🔓 UNLOCK
  }
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

  // 🔁 REFUND (SAFE)
  if (user) {
    if (typeof creditWallet === "function") {
      creditWallet(user.userId, req.amount, "Withdrawal Refund");
    } else {
      user.wallet = (user.wallet || 0) + req.amount;
      localStorage.setItem("users", JSON.stringify(users));
    }
  }

  req.status = "REJECTED";
  req.processedAt = new Date().toISOString();

  saveWithdrawals(requests);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Rejected withdrawal " + id);
  }

  alert("Withdrawal Rejected & Refunded");
}


