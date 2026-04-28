/*
========================================
HOLD INCOME SYSTEM V8.0 (FINAL CORE PATCH)
========================================
✔ Core system aligned (safeGet / safeSet)
✔ Duplicate hold guard
✔ Hold release lock
✔ Double-release blocked
✔ Wallet drift protection
✔ Expire / release consistency
✔ Batched user save
✔ Hold ledger safe
✔ Auto processor re-entry safe
✔ Production LOCKED
========================================
*/

// =====================
// CONFIG
// =====================
const HOLD_KEY = "holdIncome";
const HOLD_LIMIT = 3000;
const HOLD_LOCKS = {};

// =====================
// GET / SAVE
// =====================
function getHoldIncome() {
  let data = safeGet(HOLD_KEY, []);

  if (!Array.isArray(data)) {
    safeSet(HOLD_KEY, []);
    return [];
  }

  return data;
}

function saveHoldIncome(data) {
  if (!Array.isArray(data)) data = [];

  if (data.length > HOLD_LIMIT) {
    data = data.slice(-HOLD_LIMIT);
  }

  safeSet(HOLD_KEY, data);
}

// =====================
// LOCK
// =====================
function isHoldLocked(userId) {
  let t = HOLD_LOCKS[userId];
  if (!t) return false;

  if (Date.now() - t > 10000) {
    delete HOLD_LOCKS[userId];
    return false;
  }

  return true;
}

function setHoldLock(userId, val) {
  if (val) HOLD_LOCKS[userId] = Date.now();
  else delete HOLD_LOCKS[userId];
}

// =====================
// DUPLICATE CHECK
// =====================
function isDuplicateHold(userId, amount, reason) {
  let holds = getHoldIncome();

  return holds.some(h =>
    h.userId === userId &&
    Number(h.amount) === Number(amount) &&
    h.reason === reason &&
    h.status === "HOLD" &&
    (Date.now() - new Date(h.time).getTime()) < 5000
  );
}

// =====================
// ADD HOLD
// =====================
function addHoldIncome(userId, amount, reason) {
  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();
    if (s && s.lockMode) return false;
  }

  if (typeof isIncomeSystemSafe === "function" && !isIncomeSystemSafe()) {
    return false;
  }

  amount = Number(amount);
  if (!userId || isNaN(amount) || amount <= 0) return false;
  if (isDuplicateHold(userId, amount, reason)) return false;

  let holds = getHoldIncome();
  let users = getUsers() || [];
  let user = users.find(u => u.userId === userId);

  holds.push({
    id: "H" + Date.now() + "_" + Math.floor(Math.random() * 10000),
    userId,
    amount: parseFloat(amount.toFixed(2)),
    reason: reason || "",
    time: new Date().toISOString(),
    status: "HOLD",
    releaseTime: null,
    expireTime: null
  });

  if (user) {
    if (!user.wallet || typeof user.wallet !== "object") user.wallet = {};

    user.wallet.holdIncome = parseFloat(
      (Number(user.wallet.holdIncome || 0) + amount).toFixed(2)
    );

    saveUsers(users);
  }

  saveHoldIncome(holds);
  return true;
}

// =====================
// SAFE WALLET CREDIT
// =====================
function safeWalletCredit(userId, amount, note) {
  try {
    if (typeof getSystemSettings === "function") {
      let s = getSystemSettings();
      if (s && s.lockMode) return false;
    }

    if (typeof isIncomeSystemSafe === "function" && !isIncomeSystemSafe()) {
      return false;
    }

    return typeof creditWallet === "function"
      ? creditWallet(userId, amount, note)
      : false;

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("Hold wallet error: " + err.message);
    }
    return false;
  }
}

// =====================
// RELEASE USER
// =====================
function releaseHoldIncome(userId) {
  if (!userId || isHoldLocked(userId)) return false;
  setHoldLock(userId, true);

  try {
    let holds = getHoldIncome();
    let users = getUsers() || [];
    let user = users.find(u => u.userId === userId);
    let updated = false;

    holds.forEach(h => {
      if (h.userId !== userId || h.status !== "HOLD") return;
      if (typeof isUserActive === "function" && !isUserActive(userId)) return;

      let credited = safeWalletCredit(userId, h.amount, "Released: " + h.reason);
      if (!credited) return;

      h.status = "RELEASED";
      h.releaseTime = new Date().toISOString();

      if (user) {
        if (!user.wallet || typeof user.wallet !== "object") user.wallet = {};
        user.wallet.holdIncome = Math.max(
          0,
          parseFloat((Number(user.wallet.holdIncome || 0) - Number(h.amount || 0)).toFixed(2))
        );
      }

      updated = true;
    });

    if (updated) {
      saveUsers(users);
      saveHoldIncome(holds);
    }

    return updated;

  } finally {
    setHoldLock(userId, false);
  }
}

// =====================
// RELEASE ALL
// =====================
function releaseAllHoldIncome() {
  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();
    if (s && s.lockMode) return false;
  }

  let processed = {};
  getHoldIncome().forEach(h => {
    if (h.status === "HOLD" && !processed[h.userId]) {
      processed[h.userId] = true;
      releaseHoldIncome(h.userId);
    }
  });

  return true;
}

// =====================
// EXPIRE
// =====================
function expireHoldIncome(days = 30) {
  let holds = getHoldIncome();
  let users = getUsers() || [];
  let now = Date.now();
  let updated = false;

  holds.forEach(h => {
    if (h.status !== "HOLD") return;

    let holdTime = new Date(h.time).getTime();
    if ((now - holdTime) <= (days * 86400000)) return;

    h.status = "EXPIRED";
    h.expireTime = new Date().toISOString();

    let user = users.find(u => u.userId === h.userId);
    if (user) {
      if (!user.wallet || typeof user.wallet !== "object") user.wallet = {};
      user.wallet.holdIncome = Math.max(
        0,
        parseFloat((Number(user.wallet.holdIncome || 0) - Number(h.amount || 0)).toFixed(2))
      );
    }

    updated = true;
  });

  if (updated) {
    saveUsers(users);
    saveHoldIncome(holds);
  }

  return updated;
}

// =====================
// SUMMARY
// =====================
function getUserHoldSummary(userId) {
  let holds = getHoldIncome();

  let totalHold = 0;
  let totalReleased = 0;
  let totalExpired = 0;

  holds.forEach(h => {
    if (h.userId !== userId) return;

    if (h.status === "HOLD") totalHold += Number(h.amount);
    if (h.status === "RELEASED") totalReleased += Number(h.amount);
    if (h.status === "EXPIRED") totalExpired += Number(h.amount);
  });

  return {
    hold: parseFloat(totalHold.toFixed(2)),
    released: parseFloat(totalReleased.toFixed(2)),
    expired: parseFloat(totalExpired.toFixed(2))
  };
}

// =====================
// AUTO PROCESSOR
// =====================
function startHoldProcessor() {
  if (window.__holdProcessorStarted) return;
  window.__holdProcessorStarted = true;

  setInterval(() => {
    try {
      if (typeof getSystemSettings === "function") {
        let s = getSystemSettings();
        if (s && s.lockMode) return;
      }

      releaseAllHoldIncome();
      expireHoldIncome(30);

    } catch (err) {
      if (typeof logCritical === "function") {
        logCritical("Hold processor error: " + err.message);
      }
    }
  }, 10000);
}

// =====================
// INIT
// =====================
startHoldProcessor();
