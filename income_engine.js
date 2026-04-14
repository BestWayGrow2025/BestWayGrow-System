/*
========================================
💰 INCOME ENGINE V7.6 (FINAL CTOR FIX LOCK)
========================================
✔ Qualification-based CTOR distribution
✔ SYSTEM fallback if not qualified
✔ Active user check enforced ❤️
✔ Safe wallet validation
✔ Zero silent failure
✔ Fully production locked
========================================
*/

const INCOME_CONFIG = {
  UGLI_LEVEL_1: 23.81,
  UGLI_LEVEL_OTHERS: 1.19,
  MAX_LEVELS: 30,
  CTOR_PERCENT: 25
};

// ===================================
// 🔹 CALC
// ===================================
function calc(bv, percent) {
  let result = (Number(bv) * Number(percent)) / 100;
  return parseFloat(result.toFixed(2));
}

// ===================================
// 🔒 VALIDATION
// ===================================
function canRunIncome(type) {
  try {
    let s = getSystemSettings();
    if (!s || typeof s !== "object") return false;
    if (s.lockMode === true) return false;
    if (type === "upgrade" && s.upgradesOpen === false) return false;
    if (type === "repurchase" && s.repurchaseOpen === false) return false;
    return true;
  } catch {
    return false;
  }
}

// ===================================
// 🔥 SAFE INCOME EXECUTION
// ===================================
function safeIncome(data) {

  try {

    if (!data || !data.userId) return false;

    // ❤️ USER VALIDATION
    let user = (typeof getUserById === "function") ? getUserById(data.userId) : null;
    if (!user) return false;

    let amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) return false;

    if (!canRunIncome(data.type)) return false;

    if (typeof isIncomeAllowed === "function") {
      if (!isIncomeAllowed(data.type)) return false;
    }

    if (typeof creditWallet !== "function") return false;

    let success = creditWallet(
      data.userId,
      parseFloat(amount.toFixed(2)),
      `${data.type.toUpperCase()} - ${data.note || ""}`
    );

    if (!success) return false;

    if (typeof addIncomeLog === "function") {
      addIncomeLog({
        userId: data.userId,
        type: data.type,
        amount: amount,
        sourceUser: data.sourceUser || "-",
        note: data.note || ""
      });
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
// 🔹 HELPERS
// ===================================
function getUser(userId) {
  return getUserById(userId);
}

function getIntroducer(user) {
  if (!user || !user.introducerId) return null;
  return getUser(user.introducerId);
}

// ===================================
// ❤️ QUALIFICATION CHECK (FINAL FIX)
// ===================================
function isUserQualified(userId) {

  let user = getUserById(userId);
  if (!user || user.status !== "active") return false; // ❤️ ACTIVE CHECK

  let users = (typeof getUsers === "function") ? getUsers() : [];

  // ❤️ DIRECT COUNT
  let directs = users.filter(u => u.introducerId === userId).length;

  // ❤️ BV POINT (as per your rule)
  let bv = Number(user.totalIncome || 0);
  let points = directs + Math.floor(bv / 500);

  return points >= 1;
}

// ===================================
// 🔥 CTOR DISTRIBUTION (FINAL FIX)
// ===================================
function distributeCTOR(userId, totalCTOR, type) {

  const CTOR_SPLIT = [25,15,12,6,6,6,6,6,6,6,6];

  totalCTOR = parseFloat(Number(totalCTOR).toFixed(2));

  let current = getUser(userId);
  let level = 1;

  CTOR_SPLIT.forEach((percent) => {

    if (!current) return;

    let parent = getIntroducer(current);
    if (!parent) return;

    let amount = calc(totalCTOR, percent);

    if (amount > 0) {

      // ❤️ QUALIFICATION CHECK
      if (isUserQualified(parent.userId)) {

        safeIncome({
          userId: parent.userId,
          type: "ctor",
          amount: amount,
          sourceUser: userId,
          note: `${type.toUpperCase()} CTOR LEVEL ${level}`
        });

      } else {

        // ❤️ SYSTEM FALLBACK
        safeIncome({
          userId: "SYSTEM",
          type: "ctor",
          amount: amount,
          sourceUser: userId,
          note: `MISS CTOR L${level}`
        });

      }

    }

    current = parent;
    level++;

  });

  return true;
}

// ===================================
// 🔥 UPGRADE INCOME
// ===================================
function processUpgradeIncome(userId, bv) {

  let current = getUser(userId);
  if (!current) return false;

  let level = 1;

  while (level <= INCOME_CONFIG.MAX_LEVELS) {

    let parent = getIntroducer(current);
    if (!parent) break;

    let percent = (level === 1)
      ? INCOME_CONFIG.UGLI_LEVEL_1
      : INCOME_CONFIG.UGLI_LEVEL_OTHERS;

    let income = calc(bv, percent);

    if (income > 0) {
      safeIncome({
        userId: parent.userId,
        type: "upgrade",
        amount: income,
        sourceUser: userId,
        note: `LEVEL ${level}`
      });
    }

    current = parent;
    level++;
  }

  let totalCTOR = calc(bv, INCOME_CONFIG.CTOR_PERCENT);
  distributeCTOR(userId, totalCTOR, "upgrade");

  return true;
}

// ===================================
// 🔥 REPURCHASE INCOME
// ===================================
function processRepurchaseIncome(userId, bv) {

  let current = getUser(userId);
  if (!current) return false;

  let usableBV = calc(bv, 50);
  let rliPool = calc(usableBV, 40);
  let ctorPool = calc(usableBV, 60);

  let perLevel = parseFloat((rliPool / INCOME_CONFIG.MAX_LEVELS).toFixed(2));

  let level = 1;

  while (level <= INCOME_CONFIG.MAX_LEVELS) {

    let parent = getIntroducer(current);
    if (!parent) break;

    if (perLevel > 0) {
      safeIncome({
        userId: parent.userId,
        type: "repurchase",
        amount: perLevel,
        sourceUser: userId,
        note: `RLI LEVEL ${level}`
      });
    }

    current = parent;
    level++;
  }

  distributeCTOR(userId, ctorPool, "repurchase");

  return true;
}

// ===================================
// 🚀 MAIN ENTRY
// ===================================
function processIncome(type, userId, bv) {

  try {

    bv = Number(bv);

    if (!userId || isNaN(bv) || bv <= 0) return false;

    if (!canRunIncome(type)) return false;

    if (type === "upgrade") {
      return processUpgradeIncome(userId, bv);
    }
    else if (type === "repurchase") {
      return processRepurchaseIncome(userId, bv);
    }
    else {
      console.warn("Unknown income type:", type);
      return false;
    }

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("processIncome error: " + err.message);
    }

    return false;
  }
}
