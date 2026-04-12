/*
========================================
💸 WITHDRAWAL SYSTEM V7 (CORE ALIGNED)
========================================
✔ Core system integrated
✔ Safe storage (self-healing)
✔ System lock protected
✔ Admin charge control
✔ Duplicate + spam protection
✔ Wallet safe debit/credit
✔ Production ready
========================================
*/

// =====================
// 🔹 CONFIG
// =====================
const WITHDRAW_LIMIT = 3000;
const WITHDRAW_CONFIG_KEY = "withdrawConfig";

// =====================
// 🔹 DEFAULT CONFIG
// =====================
function getDefaultWithdrawConfig() {
  return {
    chargeEnabled: true,
    chargePercent: 10,
    minWithdraw: 500,
    updatedAt: new Date().toISOString()
  };
}

// =====================
// 🔹 LOAD / SAVE CONFIG
// =====================
function getWithdrawConfig() {

  let stored = safeGet(WITHDRAW_CONFIG_KEY, {});
  let merged = {
    ...getDefaultWithdrawConfig(),
    ...stored
  };

  safeSet(WITHDRAW_CONFIG_KEY, merged);
  return merged;
}

function saveWithdrawConfig(data) {

  let safe = {
    ...getDefaultWithdrawConfig(),
    ...(data || {})
  };

  safe.updatedAt = new Date().toISOString();

  safeSet(WITHDRAW_CONFIG_KEY, safe);
}

// =====================
// 🔘 ADMIN CONTROLS
// =====================
function toggleWithdrawCharge(adminId = "ADMIN") {

  let cfg = getWithdrawConfig();
  cfg.chargeEnabled = !cfg.chargeEnabled;

  saveWithdrawConfig(cfg);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Withdraw Charge → " + (cfg.chargeEnabled ? "ON" : "OFF"));
  }
}

function updateWithdrawChargePercent(percent, adminId = "ADMIN") {

  percent = Number(percent);

  if (isNaN(percent) || percent < 0 || percent > 100) {
    alert("Invalid percent");
    return;
  }

  let cfg = getWithdrawConfig();
  cfg.chargePercent = percent;

  saveWithdrawConfig(cfg);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Withdraw Charge % → " + percent);
  }
}

function resetWithdrawConfig(adminId = "ADMIN") {

  let clean = getDefaultWithdrawConfig();
  saveWithdrawConfig(clean);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Withdraw config RESET");
  }
}

// =====================
// 🔹 STORAGE
// =====================
function getWithdrawals() {
  return safeGet("withdrawals", []);
}

function saveWithdrawals(data) {

  if (!Array.isArray(data)) data = [];

  if (data.length > WITHDRAW_LIMIT) {
    data = data.slice(-WITHDRAW_LIMIT);
  }

  safeSet("withdrawals", data);
}

// =====================
// 🔒 SYSTEM SAFETY
// =====================
function isWithdrawSystemSafe() {

  let settings = getSystemSettings();

  if (!settings || settings.withdrawStop === true) {
    return false;
  }

  if (typeof isSystemSafe === "function") {
    return isSystemSafe();
  }

  return true;
}

// =====================
// 💰 REQUEST WITHDRAW
// =====================
function requestWithdraw(userId, amount) {

  if (window.withdrawLock) {
    return alert("Processing...");
  }
  window.withdrawLock = true;

  try {

    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) {
      return alert("Invalid amount");
    }

    if (!isWithdrawSystemSafe()) {
      return alert("Withdraw disabled");
    }

    let cfg = getWithdrawConfig();

    // 🔒 DUPLICATE BLOCK
    let recent = getWithdrawals().find(r =>
      r.userId === userId &&
      (new Date() - new Date(r.time)) < 5000
    );
    if (recent) return alert("Wait before retry");

    if (typeof isUserActive === "function" && !isUserActive(userId)) {
      return alert("Activate account first");
    }

    let pending = getWithdrawals().find(r =>
      r.userId === userId && r.status === "PENDING"
    );
    if (pending) return alert("Pending request exists");

    let users = getUsers();
    let user = users.find(u => u.userId === userId);

    if (!user) return alert("User not found");

    if (amount < cfg.minWithdraw) {
      return alert("Minimum withdraw ₹" + cfg.minWithdraw);
    }

    if ((user.wallet || 0) < amount) {
      return alert("Insufficient balance");
    }

    // =====================
    // 💸 CALCULATION
    // =====================
    let charge = 0;

    if (cfg.chargeEnabled) {
      charge = parseFloat(((amount * cfg.chargePercent) / 100).toFixed(2));
    }

    let finalAmount = parseFloat((amount - charge).toFixed(2));

    // 💳 WALLET DEBIT
    if (typeof debitWallet === "function") {
      if (!debitWallet(userId, amount, "Withdrawal")) return;
    }

    // =====================
    // 📦 SAVE REQUEST
    // =====================
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

    let requests = getWithdrawals();
    requests.push(req);

    saveWithdrawals(requests);

    // =====================
    // 📜 LOGGING
    // =====================
    if (typeof logActivity === "function") {
      logActivity(userId, "USER", `Withdraw ₹${amount} | Fee ₹${charge}`);
    }

    if (charge > 0 && typeof addLog === "function") {
      addLog(`SYSTEM FEE ₹${charge} from ${userId}`, "SYSTEM");
    }

    alert("Request submitted ₹" + finalAmount);

  } finally {
    window.withdrawLock = false;
  }
}

// =====================
// ✅ APPROVE
// =====================
function approveWithdraw(id, adminId = "ADMIN") {

  let reqs = getWithdrawals();
  let r = reqs.find(x => x.requestId === id);

  if (!r || r.status !== "PENDING") return;

  r.status = "APPROVED";
  r.processedAt = new Date().toISOString();

  saveWithdrawals(reqs);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Withdraw Approved " + id);
  }

  alert("Approved");
}

// =====================
// ❌ REJECT
// =====================
function rejectWithdraw(id, adminId = "ADMIN") {

  let reqs = getWithdrawals();
  let r = reqs.find(x => x.requestId === id);

  if (!r || r.status !== "PENDING") return;

  if (typeof creditWallet === "function") {
    creditWallet(r.userId, r.amount, "Withdraw Refund");
  }

  r.status = "REJECTED";
  r.processedAt = new Date().toISOString();

  saveWithdrawals(reqs);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Withdraw Rejected " + id);
  }

  alert("Rejected & Refunded");
}
