/*
========================================
INCOME ENGINE (ENTERPRISE FINAL v3)
========================================
✔ Pure BV based %
✔ Exact business logic match
✔ Rounding fixed (toFixed)
✔ CTOR SYSTEM based (no fake users)
✔ Upgrade + Repurchase
✔ Safe + scalable
========================================
*/

// ================= COMMON CALC =================
function calc(bv, percent) {
  return parseFloat(((bv * percent) / 100).toFixed(2));
}

// ================= SAFE LOG =================
function safeIncome(data) {
  if (typeof addIncomeLog === "function") {
    addIncomeLog(data);
  }
}

// ================= HELPERS =================
function getUser(userId) {
  return getUsers().find(u => u.userId === userId);
}

function getIntroducer(user) {
  if (!user || !user.introducerId) return null;
  return getUser(user.introducerId);
}

// ================= CTOR PIN SPLIT =================
function distributeCTOR(userId, totalCTOR, type) {

  const CTOR_SPLIT = [25, 15, 12, 6,6,6,6,6,6,6,6];

  totalCTOR = parseFloat(totalCTOR.toFixed(2));

  CTOR_SPLIT.forEach((percent, index) => {

    let amount = parseFloat(((totalCTOR * percent) / 100).toFixed(2));

    if (amount <= 0) return;

    safeIncome({
      userId: "SYSTEM",
      type: "ctor",
      amount: amount,
      sourceUser: userId,
      note: `${type.toUpperCase()} CTOR PIN ${index + 1} (${percent}%)`,
      meta: { pin: index + 1 }
    });

  });
}

// ================= UPGRADE =================
function processUpgradeIncome(userId, bv) {

  let current = getUser(userId);
  if (!current) return;

  let level = 1;

  while (level <= 30) {

    let parent = getIntroducer(current);
    if (!parent) break;

    let income = 0;

    // L1 = 23.81%
    if (level === 1) {
      income = calc(bv, 23.81);
    }

    // L2–L30 = 1.19%
    else {
      income = calc(bv, 1.19);
    }

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

  // CTOR = 25%
  let totalCTOR = calc(bv, 25);

  distributeCTOR(userId, totalCTOR, "upgrade");
}

// ================= REPURCHASE =================
function processRepurchaseIncome(userId, bv) {

  let current = getUser(userId);
  if (!current) return;

  // 50% BV used
  let usableBV = calc(bv, 50);

  // RLI = 40% of usable BV
  let rliPool = calc(usableBV, 40);

  // CTOR = 60% of usable BV
  let ctorPool = calc(usableBV, 60);

  // Per level (30 levels)
  let perLevel = parseFloat((rliPool / 30).toFixed(2));

  let level = 1;

  while (level <= 30) {

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

  // CTOR
  distributeCTOR(userId, ctorPool, "repurchase");
}

// ================= MASTER =================
function processIncome(type, userId, bv) {

  bv = Number(bv);

  if (!userId || isNaN(bv) || bv <= 0) return;

  if (type === "upgrade") {
    processUpgradeIncome(userId, bv);
  }

  else if (type === "repurchase") {
    processRepurchaseIncome(userId, bv);
  }

  console.log("✅ Income processed:", type);
}
