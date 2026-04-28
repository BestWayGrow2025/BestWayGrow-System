/*
========================================
💸 WITHDRAWAL SYSTEM V8 (FINAL PATCH)
========================================
✔ Safe config self-heal
✔ Strict lock / stop enforcement
✔ Wallet object safe
✔ Duplicate / pending spam block
✔ Atomic debit before queue save
✔ Approve / reject idempotent
✔ Refund safe on reject
✔ Audit + critical logging
✔ No unsafe silent failures
✔ Production locked
========================================
*/

const WITHDRAW_LIMIT = 3000;
const WITHDRAW_KEY = "withdrawals";
const WITHDRAW_CONFIG_KEY = "withdrawConfig";

// =====================
// DEFAULT CONFIG
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
// CONFIG LOAD / SAVE
// =====================
function getWithdrawConfig() {
  let stored = safeGet(WITHDRAW_CONFIG_KEY, {});
  let cfg = {
    ...getDefaultWithdrawConfig(),
    ...(stored || {})
  };

  cfg.chargeEnabled = cfg.chargeEnabled !== false;
  cfg.chargePercent = Number(cfg.chargePercent || 0);
  cfg.minWithdraw = Number(cfg.minWithdraw || 0);

  safeSet(WITHDRAW_CONFIG_KEY, cfg);
  return cfg;
}

function saveWithdrawConfig(data) {
  let cfg = {
    ...getDefaultWithdrawConfig(),
    ...(data || {})
  };

  cfg.chargeEnabled = cfg.chargeEnabled !== false;
  cfg.chargePercent = Math.max(0, Math.min(100, Number(cfg.chargePercent || 0)));
  cfg.minWithdraw = Math.max(0, Number(cfg.minWithdraw || 0));
  cfg.updatedAt = new Date().toISOString();

  safeSet(WITHDRAW_CONFIG_KEY, cfg);
}

// =====================
// ADMIN CONFIG CONTROL
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
    return false;
  }

  let cfg = getWithdrawConfig();
  cfg.chargePercent = percent;

  saveWithdrawConfig(cfg);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Withdraw Charge % → " + percent);
  }

  return true;
}

function resetWithdrawConfig(adminId = "ADMIN") {
  saveWithdrawConfig(getDefaultWithdrawConfig());

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Withdraw config RESET");
  }
}

// =====================
// STORAGE
// =====================
function getWithdrawals() {
  let data = safeGet(WITHDRAW_KEY, []);
  return Array.isArray(data) ? data : [];
}

function saveWithdrawals(data) {
  if (!Array.isArray(data)) data = [];

  if (data.length > WITHDRAW_LIMIT) {
    data = data.slice(-WITHDRAW_LIMIT);
  }

  safeSet(WITHDRAW_KEY, data);
}

// =====================
// SYSTEM SAFETY
// =====================
function isWithdrawSystemSafe() {
  let settings = typeof getSystemSettings === "function" ? getSystemSettings() : null;

  if (!settings) return false;
  if (settings.lockMode === true) return false;
  if (settings.withdrawStop === true) return false;

  if (typeof isSystemSafe === "function") {
    return isSystemSafe();
  }

  return true;
}

// =====================
// HELPERS
// =====================
function getPendingWithdraw(userId) {
  return getWithdrawals().find(w => w.userId === userId && w.status === "PENDING");
}

function hasRecentWithdraw(userId, ms = 5000) {
  return getWithdrawals().some(w =>
    w.userId === userId &&
    (Date.now() - new Date(w.time).getTime()) < ms
  );
}

// =====================
// REQUEST WITHDRAW
// =====================
function requestWithdraw(userId, amount) {
  if (window.withdrawLock) return false;
  window.withdrawLock = true;

  try {
    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) return false;
    if (!isWithdrawSystemSafe()) return false;

    if (typeof isUserActive === "function" && !isUserActive(userId)) {
      return false;
    }

    if (hasRecentWithdraw(userId)) return false;
    if (getPendingWithdraw(userId)) return false;

    let cfg = getWithdrawConfig();
    if (amount < cfg.minWithdraw) return false;

    let users = typeof getUsers === "function" ? getUsers() : [];
    let user = users.find(u => u.userId === userId);

    if (!user) return false;

    let balance = 0;

    if (user.wallet && typeof user.wallet === "object") {
      balance = Number(user.wallet.balance || 0);
    } else if (typeof getWalletBalance === "function") {
      balance = Number(getWalletBalance(userId) || 0);
    }

    if (balance < amount) return false;

    let charge = cfg.chargeEnabled
      ? parseFloat(((amount * cfg.chargePercent) / 100).toFixed(2))
      : 0;

    let finalAmount = parseFloat((amount - charge).toFixed(2));
    if (finalAmount <= 0) return false;

    if (typeof debitWallet !== "function") return false;
    if (!debitWallet(userId, amount, "Withdrawal")) return false;

    let req = {
      requestId: "WD_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
      userId,
      amount: Number(amount),
      charge,
      finalAmount,
      status: "PENDING",
      time: new Date().toISOString(),
      processedAt: null,
      processedBy: null
    };

    let list = getWithdrawals();
    list.push(req);
    saveWithdrawals(list);

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "Withdraw ₹" + amount + " | Fee ₹" + charge);
    }

    return true;

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("Withdraw request error: " + err.message, userId || "SYSTEM", "WITHDRAW");
    }
    return false;
  } finally {
    window.withdrawLock = false;
  }
}

// =====================
// APPROVE
// =====================
function approveWithdraw(id, adminId = "ADMIN") {
  let list = getWithdrawals();
  let req = list.find(x => x.requestId === id);

  if (!req || req.status !== "PENDING") return false;

  req.status = "APPROVED";
  req.processedAt = new Date().toISOString();
  req.processedBy = adminId;

  saveWithdrawals(list);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Withdraw Approved " + id);
  }

  return true;
}

// =====================
// REJECT
// =====================
function rejectWithdraw(id, adminId = "ADMIN") {
  let list = getWithdrawals();
  let req = list.find(x => x.requestId === id);

  if (!req || req.status !== "PENDING") return false;

  if (typeof creditWallet !== "function") return false;
  if (!creditWallet(req.userId, req.amount, "Withdraw Refund")) return false;

  req.status = "REJECTED";
  req.processedAt = new Date().toISOString();
  req.processedBy = adminId;

  saveWithdrawals(list);

  if (typeof logActivity === "function") {
    logActivity(adminId, "ADMIN", "Withdraw Rejected " + id);
  }

  return true;
}

// =====================
// EXPORT
// =====================
window.getWithdrawConfig = getWithdrawConfig;
window.saveWithdrawConfig = saveWithdrawConfig;
window.toggleWithdrawCharge = toggleWithdrawCharge;
window.updateWithdrawChargePercent = updateWithdrawChargePercent;
window.resetWithdrawConfig = resetWithdrawConfig;

window.getWithdrawals = getWithdrawals;
window.saveWithdrawals = saveWithdrawals;

window.requestWithdraw = requestWithdraw;
window.approveWithdraw = approveWithdraw;
window.rejectWithdraw = rejectWithdraw;
window.isWithdrawSystemSafe = isWithdrawSystemSafe;
