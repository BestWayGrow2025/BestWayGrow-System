"use strict";

/*
========================================
INCOME ENGINE V10 (BANK-GRADE CORE)
========================================
✔ Full V9 logic preserved
✔ 3-layer architecture compliant
✔ No duplicate payout risk
✔ Ledger-first execution
========================================
*/

const INCOME_CONFIG = {
  UGLI_LEVEL_1: 23.81,
  UGLI_LEVEL_OTHERS: 1.19,
  MAX_LEVELS: 30,
  CTOR_PERCENT: 25
};

// ===================================
// SAFE INCOME CORE
// ===================================
function safeIncome(data = {}) {
  try {

    if (!data || !data.userId) return false;

    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) return false;

    const txId =
      data.ref ||
      "INC_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

    // ===============================
    // 1. LEDGER FIRST (TRUTH LAYER)
    // ===============================
    const ledgerOk = recordTransaction({
      txId,
      userId: data.userId,
      amount,
      type: data.type,
      sourceUser: data.sourceUser || "-"
    });

    if (!ledgerOk) return false;

    // ===============================
    // 2. WALLET UPDATE (STATE LAYER)
    // ===============================
    const walletOk = creditWallet(data.userId, amount);

    if (!walletOk) return false;

    // optional rollback safety hook
    if (typeof addIncomeLog === "function") {
      const logged = addIncomeLog({
        userId: data.userId,
        type: data.type,
        amount,
        sourceUser: data.sourceUser || "-",
        note: data.note || "",
        ref: txId
      });

      if (!logged) {
        if (typeof debitWallet === "function") {
          debitWallet(data.userId, amount);
        }
        return false;
      }
    }

    return true;

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("safeIncome error: " + err.message);
    }
    return false;
  }
}

// ===================================
// CTOR QUALIFICATION
// ===================================
function isCTORQualified(user) {
  if (!user) return false;

  if (user.status !== "active") return false;

  if (!user.rankLevel || Number(user.rankLevel) <= 0) return false;

  return Number(user.monthlyPoints || 0) >= 1;
}

// ===================================
// CTOR DISTRIBUTION (FULL PRESERVED LOGIC)
// ===================================
function distributeCTOR(userId, totalCTOR, type) {

  const CTOR_SPLIT = [
    25, 15, 12, 6, 6, 6, 6, 6, 6, 6, 6
  ];

  totalCTOR = parseFloat(Number(totalCTOR).toFixed(2));

  if (isNaN(totalCTOR) || totalCTOR <= 0) return false;

  let current = getUser(userId);
  let level = 1;
  const visited = new Set();

  for (let i = 0; i < CTOR_SPLIT.length; i++) {

    if (!current || visited.has(current.userId)) break;

    visited.add(current.userId);

    const parent = getIntroducer(current);

    if (!parent || visited.has(parent.userId)) break;

    const amount = calc(totalCTOR, CTOR_SPLIT[i]);

    if (amount > 0) {

      safeIncome({
        userId: isCTORQualified(parent) ? parent.userId : "SYSTEM",
        type: "ctor",
        amount,
        sourceUser: userId,
        note: isCTORQualified(parent)
          ? `${type.toUpperCase()} CTOR LEVEL ${level}`
          : `MISS CTOR L${level}`,
        ref: `CTOR_${type}_${userId}_${level}`
      });
    }

    current = parent;
    level++;
  }

  return true;
}

// ===================================
// UPGRADE INCOME (UNCHANGED LOGIC)
// ===================================
function processUpgradeIncome(userId, bv) {

  if (typeof updateUserPoints === "function") {
    updateUserPoints(userId, bv, false);
  }

  let current = getUser(userId);
  if (!current) return false;

  let level = 1;
  const visited = new Set([userId]);

  while (level <= INCOME_CONFIG.MAX_LEVELS) {

    const parent = getIntroducer(current);

    if (!parent || visited.has(parent.userId)) break;

    visited.add(parent.userId);

    const percent =
      level === 1
        ? INCOME_CONFIG.UGLI_LEVEL_1
        : INCOME_CONFIG.UGLI_LEVEL_OTHERS;

    const income = calc(bv, percent);

    if (income > 0) {

      safeIncome({
        userId: parent.userId,
        type: "upgrade",
        amount: income,
        sourceUser: userId,
        note: `LEVEL ${level}`,
        ref: `UPGRADE_${userId}_${level}_${bv}`
      });
    }

    current = parent;
    level++;
  }

  distributeCTOR(
    userId,
    calc(bv, INCOME_CONFIG.CTOR_PERCENT),
    "upgrade"
  );

  return true;
}

// ===================================
// REPURCHASE INCOME (UNCHANGED LOGIC)
// ===================================
function processRepurchaseIncome(userId, bv) {

  if (typeof updateUserPoints === "function") {
    updateUserPoints(userId, bv, false);
  }

  let current = getUser(userId);
  if (!current) return false;

  const usableBV = calc(bv, 50);
  const rliPool = calc(usableBV, 40);
  const ctorPool = calc(usableBV, 60);

  const perLevel = parseFloat(
    (rliPool / INCOME_CONFIG.MAX_LEVELS).toFixed(2)
  );

  let level = 1;
  const visited = new Set([userId]);

  while (level <= INCOME_CONFIG.MAX_LEVELS) {

    const parent = getIntroducer(current);

    if (!parent || visited.has(parent.userId)) break;

    visited.add(parent.userId);

    if (perLevel > 0) {

      if (Number(parent.monthlyPoints || 0) >= 1) {

        safeIncome({
          userId: parent.userId,
          type: "repurchase",
          amount: perLevel,
          sourceUser: userId,
          note: `RLI LEVEL ${level}`,
          ref: `REPURCHASE_${userId}_${level}_${bv}`
        });

      } else if (typeof addHoldIncome === "function") {

        addHoldIncome(parent.userId, perLevel, `RLI LEVEL ${level}`);
      }
    }

    current = parent;
    level++;
  }

  distributeCTOR(userId, ctorPool, "repurchase");

  return true;
}

// ===================================
// MAIN EXECUTION (UNCHANGED SAFETY FLOW)
// ===================================
function processIncome(type, userId, bv, sourceId = "") {

  const execKey = `${type}_${userId}_${Number(bv)}_${sourceId}`;

  try {

    bv = Number(bv);

    if (!userId || isNaN(bv) || bv <= 0) return false;

    if (!canRunIncome(type)) return false;

    if (isTxUsed(execKey)) return false;

    if (isIncomeLocked(execKey)) return false;

    setIncomeLock(execKey, true);
    markTxUsed(execKey);

    if (type === "upgrade") {
      return processUpgradeIncome(userId, bv);
    }

    if (type === "repurchase") {
      return processRepurchaseIncome(userId, bv);
    }

    return false;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("processIncome error: " + err.message);
    }

    return false;

  } finally {
    setIncomeLock(execKey, false);
  }
}
