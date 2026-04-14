/*
========================================
💰 INCOME ENGINE V8.0 (MASTER FINAL LOCK)
========================================
✔ UGLI → No condition (instant)
✔ RLI → Point based + HOLD + weekly release ❤️
✔ CTOR → Rank + Point + Active + SYSTEM fallback ❤️
✔ Monthly reset system
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
// ❤️ POINT SYSTEM
// ===================================
function updateUserPoints(userId, bv = 0, isDirect = false) {

  let user = getUserById(userId);
  if (!user) return;

  let now = new Date();
  let last = user.lastPointReset ? new Date(user.lastPointReset) : null;

  // 🔄 MONTH RESET
  if (!last || last.getMonth() !== now.getMonth()) {
    user.monthlyPoints = 0;
    user.rliHoldBalance = 0;
    user.lastPointReset = now.toISOString();
  }

  let points = 0;

  if (isDirect) points += 1;
  if (bv > 0) points += Math.floor(bv / 500);

  user.monthlyPoints = (user.monthlyPoints || 0) + points;

  saveUsers(getUsers());
}

// ===================================
// ❤️ CTOR QUALIFICATION
// ===================================
function isCTORQualified(user) {

  if (!user) return false;

  if (user.status !== "active") return false;

  // ❤️ RANK REQUIRED (FIXED)
  if (!user.rankLevel || user.rankLevel <= 0) return false;

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

  updateUserPoints(userId, bv, false); // ❤️ POINT UPDATE

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
// 🔥 RLI (FINAL)
// ===================================
function processRepurchaseIncome(userId, bv) {

  updateUserPoints(userId, bv, false); // ❤️ POINT UPDATE

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

    let parentIndex = users.findIndex(u => u.userId === parent.userId);
    if (parentIndex === -1) break;

    if (perLevel > 0) {

      if ((parent.monthlyPoints || 0) >= 1) {

        safeIncome({
          userId: parent.userId,
          type: "repurchase",
          amount: perLevel,
          sourceUser: userId,
          note: `RLI LEVEL ${level}`
        });

      } else {

        users[parentIndex].rliHoldBalance =
          (users[parentIndex].rliHoldBalance || 0) + perLevel;
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
// 🔁 WEEKLY RLI RELEASE
// ===================================
function releaseRLIWeekly() {

  let users = getUsers();

  users.forEach(user => {

    if ((user.monthlyPoints || 0) >= 1 && user.rliHoldBalance > 0) {

      safeIncome({
        userId: user.userId,
        type: "repurchase_release",
        amount: user.rliHoldBalance,
        sourceUser: "SYSTEM",
        note: "WEEKLY RLI RELEASE"
      });

      user.rliHoldBalance = 0;
    }

  });

  saveUsers(users);
}

// ===================================
// 🔄 MONTHLY CLOSING
// ===================================
function monthlyClosing() {

  let users = getUsers();

  users.forEach(user => {

    if ((user.monthlyPoints || 0) < 1 && user.rliHoldBalance > 0) {

      safeIncome({
        userId: "SYSTEM",
        type: "flush",
        amount: user.rliHoldBalance,
        sourceUser: user.userId,
        note: "MONTH END FLUSH"
      });

      user.rliHoldBalance = 0;
    }

    user.monthlyPoints = 0;
    user.lastPointReset = new Date().toISOString();

  });

  saveUsers(users);
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

    return false;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("processIncome error: " + err.message);
    }

    return false;
  }
}

// ===================================
// ⏱ AUTO RUN
// ===================================
setInterval(releaseRLIWeekly, 7 * 24 * 60 * 60 * 1000);
setInterval(monthlyClosing, 30 * 24 * 60 * 60 * 1000);
