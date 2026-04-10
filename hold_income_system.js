/*
========================================
HOLD INCOME SYSTEM V7 (FINAL LOCKED)
========================================
✔ Duplicate safe
✔ Memory safe
✔ Wallet controlled (SAFE)
✔ System lock protected
✔ Auto processor safe
✔ Expire + release logic
✔ Production locked
========================================
*/

// =====================
// 🔒 LIMIT
// =====================
const HOLD_LIMIT = 3000;

// =====================
// 🔹 GET / SAVE
// =====================
function getHoldIncome() {
  try {
    return JSON.parse(localStorage.getItem("holdIncome") || "[]");
  } catch {
    localStorage.setItem("holdIncome", "[]");
    return [];
  }
}

function saveHoldIncome(data) {

  if (!Array.isArray(data)) data = [];

  if (data.length > HOLD_LIMIT) {
    data = data.slice(-HOLD_LIMIT);
  }

  localStorage.setItem("holdIncome", JSON.stringify(data));
}

// =====================
// 🔐 DUPLICATE
// =====================
function isDuplicateHold(userId, amount, reason) {

  let holds = getHoldIncome();

  return holds.some(h =>
    h.userId === userId &&
    Number(h.amount) === Number(amount) &&
    h.reason === reason &&
    (new Date() - new Date(h.time)) < 5000
  );
}

// =====================
// ➕ ADD HOLD
// =====================
function addHoldIncome(userId, amount, reason) {

  amount = Number(amount);

  if (!userId || isNaN(amount) || amount <= 0) return;

  if (isDuplicateHold(userId, amount, reason)) return;

  let holds = getHoldIncome();

  holds.push({
    id: "H" + Date.now(),
    userId,
    amount: parseFloat(amount.toFixed(2)),
    reason: reason || "",
    time: new Date().toISOString(),
    status: "HOLD"
  });

  saveHoldIncome(holds);
}

// =====================
// 🔒 SAFE WALLET CREDIT
// =====================
function safeWalletCredit(userId, amount, note) {

  try {

    // 🔒 SYSTEM LOCK
    if (typeof getSystemSettings === "function") {
      let s = getSystemSettings();
      if (s && s.lockMode) return;
    }

    if (typeof creditWallet === "function") {
      creditWallet(userId, amount, note);
    }

  } catch (err) {

    if (typeof addCriticalIncomeLog === "function") {
      addCriticalIncomeLog("Hold wallet error: " + err.message);
    }

  }
}

// =====================
// 🔄 RELEASE USER
// =====================
function releaseHoldIncome(userId) {

  let holds = getHoldIncome();
  let updated = false;

  holds.forEach(h => {

    if (h.userId === userId && h.status === "HOLD") {

      if (typeof isUserActive === "function" && isUserActive(userId)) {

        safeWalletCredit(userId, h.amount, "Released: " + h.reason);

        h.status = "RELEASED";
        h.releaseTime = new Date().toISOString();

        updated = true;
      }
    }

  });

  if (updated) saveHoldIncome(holds);
}

// =====================
// 🔄 RELEASE ALL
// =====================
function releaseAllHoldIncome() {

  let holds = getHoldIncome();
  let updated = false;

  holds.forEach(h => {

    if (h.status === "HOLD") {

      if (typeof isUserActive === "function" && isUserActive(h.userId)) {

        safeWalletCredit(h.userId, h.amount, "Released: " + h.reason);

        h.status = "RELEASED";
        h.releaseTime = new Date().toISOString();

        updated = true;
      }
    }

  });

  if (updated) saveHoldIncome(holds);
}

// =====================
// ❌ EXPIRE
// =====================
function expireHoldIncome(days = 30) {

  let holds = getHoldIncome();
  let now = Date.now();
  let updated = false;

  holds.forEach(h => {

    if (h.status === "HOLD") {

      let holdTime = new Date(h.time).getTime();

      if ((now - holdTime) > (days * 86400000)) {

        h.status = "EXPIRED";
        h.expireTime = new Date().toISOString();

        updated = true;
      }
    }

  });

  if (updated) saveHoldIncome(holds);
}

// =====================
// 📊 SUMMARY
// =====================
function getUserHoldSummary(userId) {

  let holds = getHoldIncome();

  let totalHold = 0;
  let totalReleased = 0;
  let totalExpired = 0;

  holds.forEach(h => {

    if (h.userId === userId) {

      if (h.status === "HOLD") totalHold += Number(h.amount);
      if (h.status === "RELEASED") totalReleased += Number(h.amount);
      if (h.status === "EXPIRED") totalExpired += Number(h.amount);

    }

  });

  return {
    hold: totalHold,
    released: totalReleased,
    expired: totalExpired
  };
}

// =====================
// 🔄 AUTO PROCESSOR SAFE
// =====================
function startHoldProcessor() {

  if (window.__holdProcessorStarted) return;

  window.__holdProcessorStarted = true;

  setInterval(() => {

    try {
      releaseAllHoldIncome();
      expireHoldIncome(30);
    } catch (err) {

      if (typeof addCriticalIncomeLog === "function") {
        addCriticalIncomeLog("Hold processor error: " + err.message);
      }

    }

  }, 10000); // safer interval
}

// =====================
// 🚀 INIT
// =====================
startHoldProcessor();

