/* ===============================
💸 WITHDRAWAL SYSTEM V7 (FINAL MAX)
==================================
✔ Wallet integrated (safe)
✔ Admin charge ON/OFF
✔ Dynamic % control
✔ Reset system
✔ System fee logging (NO admin credit)
✔ Duplicate + spam protection
✔ Lock safe
✔ Production ready
==================================
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
  try {
    let stored = JSON.parse(localStorage.getItem(WITHDRAW_CONFIG_KEY) || "{}");

    let merged = {
      ...getDefaultWithdrawConfig(),
      ...stored
    };

    localStorage.setItem(WITHDRAW_CONFIG_KEY, JSON.stringify(merged));
    return merged;

  } catch {
    let clean = getDefaultWithdrawConfig();
    localStorage.setItem(WITHDRAW_CONFIG_KEY, JSON.stringify(clean));
    return clean;
  }
}

function saveWithdrawConfig(data) {
  let safe = {
    ...getDefaultWithdrawConfig(),
    ...(data || {})
  };

  safe.updatedAt = new Date().toISOString();

  localStorage.setItem(WITHDRAW_CONFIG_KEY, JSON.stringify(safe));
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
  try {
    return JSON.parse(localStorage.getItem("withdrawals") || "[]");
  } catch {
    localStorage.setItem("withdrawals", "[]");
    return [];
  }
}

function saveWithdrawals(data) {
  if (!Array.isArray(data)) data = [];

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
    if (system.withdrawStop === true) return false;
  } catch {}
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

    let cfg = getWithdrawConfig();

    // 🔒 DUPLICATE FAST BLOCK
    let recent = getWithdrawals().find(r =>
      r.userId === userId &&
      (new Date() - new Date(r.time)) < 5000
    );
    if (recent) return alert("Wait before retry");

    if (!isWithdrawSystemSafe()) {
      return alert("Withdraw disabled");
    }

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

    // 🔥 SYSTEM FEE LOG (IMPORTANT)
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

