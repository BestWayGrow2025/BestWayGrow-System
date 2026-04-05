/* ===============================
   💸 WITHDRAWAL SYSTEM (FINAL PRO v3)
=============================== */

// =====================
// 🔹 CONSTANTS
// =====================
const WITHDRAW_LIMIT = 3000;

// =====================
// 🔹 SAFE LOAD / SAVE
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

  // 🔒 ARRAY SAFETY (CRITICAL)
  if (!Array.isArray(data)) data = [];

  // 🔒 LIMIT CONTROL
  if (data.length > WITHDRAW_LIMIT) {
    data = data.slice(-WITHDRAW_LIMIT);
  }

  localStorage.setItem("withdrawals", JSON.stringify(data));
}

// =====================
// 🔒 SYSTEM SAFETY
// =====================
function isWithdrawSystemSafe() {

  try {
    let system = JSON.parse(localStorage.getItem("systemSettings") || "{}");
    if (system.withdrawStop === true) {
      console.warn("⛔ Withdraw system stopped by admin");
      return false;
    }
  } catch {}

  return true;
}

// =====================
// 💰 USER REQUEST
// =====================
function requestWithdraw(userId, amount) {

  // 🔒 MULTI-CLICK LOCK
  if (window.withdrawLock) {
    return alert("Processing... please wait");
  }
  window.withdrawLock = true;

  try {

    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) {
      return alert("Invalid amount");
    }

    // 🔒 FAST DUPLICATE BLOCK (CRITICAL)
    let recent = getWithdrawals().find(r =>
      r.userId === userId &&
      (new Date() - new Date(r.time)) < 5000
    );

    if (recent) {
      return alert("Please wait before making another request");
    }

    // 🔒 GLOBAL SAFETY
    if (!isWithdrawSystemSafe()) {
      return alert("Withdraw system temporarily disabled");
    }

    // 🔒 ACTIVE CHECK
    if (typeof isUserActive === "function") {
      if (!isUserActive(userId)) {
        return alert("Activate account first");
      }
    }

    // 🔒 DUPLICATE PENDING CHECK
    let pending = getWithdrawals().find(r =>
      r.userId === userId && r.status === "PENDING"
    );

    if (pending) {
      return alert("You already have a pending request");
    }

    const MIN_WITHDRAW = 500;
    const CHARGE_PERCENT = 10;

    let users = getUsers(); // ✅ CORE
    let user = users.find(u => u.userId === userId);

    if (!user) return alert("User not found");

    if (amount < MIN_WITHDRAW) {
      return alert("Minimum withdraw is ₹ " + MIN_WITHDRAW);
    }

    if ((user.wallet || 0) < amount) {
      return alert("Insufficient balance");
    }

    // 💸 CALCULATION
    let charge = parseFloat(((amount * CHARGE_PERCENT) / 100).toFixed(2));
    let finalAmount = parseFloat((amount - charge).toFixed(2));

    // 💳 SAFE WALLET DEDUCT
    if (typeof debitWallet === "function") {
      if (!debitWallet(userId, amount, "Withdrawal Request")) return;
    } else {
      user.wallet = (user.wallet || 0) - amount;
      localStorage.setItem("users", JSON.stringify(users));
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
    window.withdrawLock = false;
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

  let users = getUsers(); // ✅ CORE
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

