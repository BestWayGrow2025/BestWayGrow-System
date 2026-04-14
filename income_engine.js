/*
========================================
💰 INCOME ENGINE V8.2 (ABSOLUTE FINAL LOCK 🔒)
========================================
✔ UGLI → No condition (instant)
✔ RLI → Point based + HOLD (external release system)
✔ CTOR → Rank + Point + Active + SYSTEM fallback
✔ External point system (no duplication)
✔ Safe wallet + logging
✔ Zero leakage
✔ Fully production ready
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
// 🔥 SAFE INCOME
// ===================================
function safeIncome(data) {
  try {

    if (!data || !data.userId) return false;

    let user = getUserById(data.userId);

    // ✅ SYSTEM allowed
    if (!user && data.userId !== "SYSTEM") return false;

    let amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) return false;

    if (!canRunIncome(data.type)) return false;

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
// ❤️ CTOR QUALIFICATION
// ===================================
function isCTORQualified(user) {

  if (!user) return false;

  if (user.status !== "active") return false;

  // ❤️ RANK REQUIRED
  if (!user.rankLevel || user.rankLevel <= 0) return false;

  // ❤️ POINT REQUIRED
  if ((user.monthlyPoints || 0) < 1) return false;

  return true;
}

// ===================================
// 🔥 CTOR DISTRIBUTION
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

      if (isCTORQualified(parent)) {

        safeIncome({
          userId: parent.userId,
          type: "ctor",
          amount: amount,
          sourceUser: userId,
          note: `${type.toUpperCase()} CTOR LEVEL ${level}`
        });

      } else {

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
// 🔥 UGLI (NO CONDITION)
// ===================================
function processUpgradeIncome(userId, bv) {

  // ❤️ POINT UPDATE (external system)
  if (typeof updateUserPoints === "function") {
    updateUserPoints(userId, bv, false);
  }

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
// 🔥 RLI (HOLD BASED)
// ===================================
function processRepurchaseIncome(userId, bv) {

  // ❤️ POINT UPDATE
  if (typeof updateUserPoints === "function") {
    updateUserPoints(userId, bv, false);
  }

  let current = getUser(userId);
  if (!current) return false;

  let usableBV = calc(bv, 50);
  let rliPool = calc(usableBV, 40);
  let ctorPool = calc(usableBV, 60);

  let perLevel = parseFloat((rliPool / INCOME_CONFIG.MAX_LEVELS).toFixed(2));

  let users = getUsers();

  let level = 1;

  while (level <= INCOME_CONFIG.MAX_LEVELS) {

    let parent = getIntroducer(current);
    if (!parent) break;

    let index = users.findIndex(u => u.userId === parent.userId);
    if (index === -1) break;

    if (perLevel > 0) {

      if ((parent.monthlyPoints || 0) >= 1) {

        // ✅ GIVE INCOME
        safeIncome({
          userId: parent.userId,
          type: "repurchase",
          amount: perLevel,
          sourceUser: userId,
          note: `RLI LEVEL ${level}`
        });

      } else {

        // ❤️ HOLD INCOME
        users[index].rliHoldBalance =
          (users[index].rliHoldBalance || 0) + perLevel;
      }
    }

    current = parent;
    level++;
  }

  saveUsers(users);

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

    if (type === "upgrade") return processUpgradeIncome(userId, bv);
    if (type === "repurchase") return processRepurchaseIncome(userId, bv);

    console.warn("Unknown income type:", type);
    return false;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("processIncome error: " + err.message);
    }

    return false;
  }
}

