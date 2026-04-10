/*
========================================
INCOME ENGINE V7 (MASTER CLEAN)
========================================
✔ Only calculation
✔ No wallet logic
✔ No duplicate system
✔ Uses income_log_system
========================================
*/

const INCOME_CONFIG = {
  UGLI_LEVEL_1: 23.81,
  UGLI_LEVEL_OTHERS: 1.19,
  MAX_LEVELS: 30,
  CTOR_PERCENT: 25
};

function calc(bv, percent) {
  return parseFloat(((bv * percent) / 100).toFixed(2));
}

function safeIncome(data) {

  if (!data) return;

  const safeData = {
    userId: data.userId || "UNKNOWN",
    type: data.type || "unknown",
    amount: parseFloat(Number(data.amount || 0).toFixed(2)),
    sourceUser: data.sourceUser || "-",
    note: data.note || "",
  };

  if (safeData.amount <= 0) return;

  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();
    if (s && s.lockMode) return;
  }

  if (typeof isIncomeAllowed === "function") {
    if (!isIncomeAllowed(safeData.type)) return;
  }

  if (typeof addIncomeLog === "function") {
    addIncomeLog(safeData);
  }
}

function getUser(userId) {
  return getUsers().find(u => u.userId === userId);
}

function getIntroducer(user) {
  if (!user || !user.introducerId) return null;
  return getUser(user.introducerId);
}

function distributeCTOR(userId, totalCTOR, type) {

  const CTOR_SPLIT = [25,15,12,6,6,6,6,6,6,6,6];

  totalCTOR = parseFloat(Number(totalCTOR).toFixed(2));

  CTOR_SPLIT.forEach((percent, index) => {

    let amount = calc(totalCTOR, percent);
    if (amount <= 0) return;

    safeIncome({
      userId: "SYSTEM",
      type: "ctor",
      amount: amount,
      sourceUser: userId,
      note: `${type.toUpperCase()} CTOR ${index + 1}`
    });

  });
}

function processUpgradeIncome(userId, bv) {

  let current = getUser(userId);
  if (!current) return;

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
}

function processRepurchaseIncome(userId, bv) {

  let current = getUser(userId);
  if (!current) return;

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
}

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

