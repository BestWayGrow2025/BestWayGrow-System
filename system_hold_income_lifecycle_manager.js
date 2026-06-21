"use strict";

/*
========================================
HOLD INCOME SYSTEM V9.0 (FINAL HARDENED)
========================================
✔ Session-manager aligned
✔ Core safety validation
✔ Duplicate hold protection
✔ Release lock hardened
✔ Double-release blocked
✔ Wallet rollback protection
✔ Expiry consistency safe
✔ Atomic release flow
✔ Auto processor safe
✔ Re-entry protected
✔ Production FINAL
========================================
*/

// =====================
// CONFIG
// =====================
const HOLD_KEY = "holdIncome";
const HOLD_LIMIT = 3000;
const HOLD_LOCKS = {};
const HOLD_LOCK_TTL = 10000;

// =====================
// CORE SAFETY
// =====================
function isHoldSystemSafe() {

  try {

    if (
      typeof window.__CORE_STATE__ !== "undefined" &&
      window.__CORE_STATE__ &&
      window.__CORE_STATE__.initialized !== true
    ) {
      return false;
    }

    if (typeof getSession === "function") {
      const session = getSession();

      if (!session || !session.userId) {
        return false;
      }
    }

    if (typeof getSystemSettings === "function") {
      let s = getSystemSettings();

      if (s && s.lockMode === true) {
        return false;
      }
    }

    return true;

  } catch {
    return false;
  }
}

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

  if (!Array.isArray(data)) {
    data = [];
  }

  if (data.length > HOLD_LIMIT) {
    data = data.slice(-HOLD_LIMIT);
  }

  safeSet(HOLD_KEY, data);
}

// =====================
// LOCK
// =====================
function isHoldLocked(userId) {

  let lock = HOLD_LOCKS[userId];

  if (!lock) {
    return false;
  }

  if ((Date.now() - lock) > HOLD_LOCK_TTL) {
    delete HOLD_LOCKS[userId];
    return false;
  }

  return true;
}

function setHoldLock(userId, val) {

  if (val) {
    HOLD_LOCKS[userId] = Date.now();
  } else {
    delete HOLD_LOCKS[userId];
  }
}

// =====================
// DUPLICATE CHECK
// =====================
function isDuplicateHold(userId, amount, reason) {

  let holds = getHoldIncome();

  return holds.some(h => {

    if (h.status !== "HOLD") {
      return false;
    }

    if (h.userId !== userId) {
      return false;
    }

    if (Number(h.amount).toFixed(2) !== Number(amount).toFixed(2)) {
      return false;
    }

    if ((h.reason || "") !== (reason || "")) {
      return false;
    }

    let holdTime = new Date(h.time).getTime();

    return (Date.now() - holdTime) < 5000;
  });
}

// =====================
// ADD HOLD
// =====================
function addHoldIncome(userId, amount, reason) {

  try {

    if (!isHoldSystemSafe()) {
      return false;
    }

    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) {
      return false;
    }

    if (isDuplicateHold(userId, amount, reason)) {
      return false;
    }

    let holds = getHoldIncome();

    let users = typeof getUsers === "function"
      ? getUsers()
      : [];

    let user = users.find(u => u.userId === userId);

    let holdEntry = {
      id: "H_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
      userId,
      amount: parseFloat(amount.toFixed(2)),
      reason: reason || "",
      status: "HOLD",
      time: new Date().toISOString(),
      releaseTime: null,
      expireTime: null
    };

    holds.push(holdEntry);

    if (user) {

      if (!user.wallet || typeof user.wallet !== "object") {
        user.wallet = {};
      }

      user.wallet.holdIncome = parseFloat(
        (
          Number(user.wallet.holdIncome || 0) + amount
        ).toFixed(2)
      );

      saveUsers(users);
    }

    saveHoldIncome(holds);

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("addHoldIncome error: " + err.message);
    }

    return false;
  }
}

// =====================
// SAFE WALLET CREDIT
// =====================
function safeWalletCredit(userId, amount, note) {

  try {

    if (!isHoldSystemSafe()) {
      return false;
    }

    if (typeof creditWallet !== "function") {
      return false;
    }

    return creditWallet(
      userId,
      amount,
      note || "Hold Release"
    );

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("safeWalletCredit error: " + err.message);
    }

    return false;
  }
}

// =====================
// RELEASE USER
// =====================
function releaseHoldIncome(userId) {

  if (!userId) {
    return false;
  }

  if (!isHoldSystemSafe()) {
    return false;
  }

  if (isHoldLocked(userId)) {
    return false;
  }

  setHoldLock(userId, true);

  try {

    let holds = getHoldIncome();

    let users = typeof getUsers === "function"
      ? getUsers()
      : [];

    let user = users.find(u => u.userId === userId);

    let updated = false;

    for (let i = 0; i < holds.length; i++) {

      let h = holds[i];

      if (h.userId !== userId) {
        continue;
      }

      if (h.status !== "HOLD") {
        continue;
      }

      if (
        typeof isUserActive === "function" &&
        !isUserActive(userId)
      ) {
        continue;
      }

      let credited = safeWalletCredit(
        userId,
        h.amount,
        "Released: " + (h.reason || "")
      );

      if (!credited) {
        continue;
      }

      let logOk = true;

      if (typeof addIncomeLog === "function") {

        logOk = addIncomeLog({
          userId,
          type: "hold_release",
          amount: h.amount,
          sourceUser: "-",
          note: h.reason || ""
        });
      }

      if (!logOk) {

        if (typeof debitWallet === "function") {
          debitWallet(
            userId,
            h.amount,
            "Hold rollback"
          );
        }

        continue;
      }

      h.status = "RELEASED";
      h.releaseTime = new Date().toISOString();

      if (user) {

        if (!user.wallet || typeof user.wallet !== "object") {
          user.wallet = {};
        }

        user.wallet.holdIncome = Math.max(
          0,
          parseFloat(
            (
              Number(user.wallet.holdIncome || 0) -
              Number(h.amount || 0)
            ).toFixed(2)
          )
        );
      }

      updated = true;
    }

    if (updated) {

      saveUsers(users);
      saveHoldIncome(holds);
    }

    return updated;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("releaseHoldIncome error: " + err.message);
    }

    return false;

  } finally {

    setHoldLock(userId, false);
  }
}

// =====================
// RELEASE ALL
// =====================
function releaseAllHoldIncome() {

  try {

    if (!isHoldSystemSafe()) {
      return false;
    }

    let processed = {};

    getHoldIncome().forEach(h => {

      if (h.status !== "HOLD") {
        return;
      }

      if (processed[h.userId]) {
        return;
      }

      processed[h.userId] = true;

      releaseHoldIncome(h.userId);
    });

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("releaseAllHoldIncome error: " + err.message);
    }

    return false;
  }
}

// =====================
// EXPIRE
// =====================
function expireHoldIncome(days = 30) {

  try {

    if (!isHoldSystemSafe()) {
      return false;
    }

    let holds = getHoldIncome();

    let users = typeof getUsers === "function"
      ? getUsers()
      : [];

    let now = Date.now();

    let updated = false;

    holds.forEach(h => {

      if (h.status !== "HOLD") {
        return;
      }

      let holdTime = new Date(h.time).getTime();

      if ((now - holdTime) <= (days * 86400000)) {
        return;
      }

      h.status = "EXPIRED";
      h.expireTime = new Date().toISOString();

      let user = users.find(u => u.userId === h.userId);

      if (user) {

        if (!user.wallet || typeof user.wallet !== "object") {
          user.wallet = {};
        }

        user.wallet.holdIncome = Math.max(
          0,
          parseFloat(
            (
              Number(user.wallet.holdIncome || 0) -
              Number(h.amount || 0)
            ).toFixed(2)
          )
        );
      }

      if (typeof addCriticalIncomeLog === "function") {

        addCriticalIncomeLog(
          "Hold expired: " +
          h.userId +
          " | " +
          Number(h.amount).toFixed(2)
        );
      }

      updated = true;
    });

    if (updated) {

      saveUsers(users);
      saveHoldIncome(holds);
    }

    return updated;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("expireHoldIncome error: " + err.message);
    }

    return false;
  }
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

    if (h.userId !== userId) {
      return;
    }

    if (h.status === "HOLD") {
      totalHold += Number(h.amount || 0);
    }

    if (h.status === "RELEASED") {
      totalReleased += Number(h.amount || 0);
    }

    if (h.status === "EXPIRED") {
      totalExpired += Number(h.amount || 0);
    }
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

  if (window.__holdProcessorStarted === true) {
    return;
  }

  window.__holdProcessorStarted = true;

  setInterval(() => {

    try {

      if (!isHoldSystemSafe()) {
        return;
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
// READY
// =====================

window.__HOLD_INCOME_SYSTEM__ = {
  initialized: true,
  ready: true,
  timestamp: Date.now()
};

// =====================
// EXPORTS
// =====================

window.getHoldIncome =
  getHoldIncome;

window.saveHoldIncome =
  saveHoldIncome;

window.addHoldIncome =
  addHoldIncome;

window.releaseHoldIncome =
  releaseHoldIncome;

window.releaseAllHoldIncome =
  releaseAllHoldIncome;

window.expireHoldIncome =
  expireHoldIncome;

window.getUserHoldSummary =
  getUserHoldSummary;

window.startHoldProcessor =
  startHoldProcessor;

window.isHoldSystemSafe =
  isHoldSystemSafe;

// =====================
// HEALTH FLAG
// =====================

window.HOLD_INCOME_SYSTEM_ACTIVE = true;

