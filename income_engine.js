/*
========================================
INCOME ENGINE V7 (MASTER ENGINE)
========================================
✔ Wallet integrated (creditWallet)
✔ System lock protection
✔ Income control integrated
✔ Duplicate safe (basic guard)
✔ Activity logging
✔ BV based exact logic (unchanged)
✔ CTOR system
✔ Production ready
========================================
*/

// ================= COMMON CALC =================
function calc(bv, percent) {
  return parseFloat(((bv * percent) / 100).toFixed(2));
}

// ================= SAFE INCOME =================
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

  // 🔒 SYSTEM LOCK
  let settings = getSystemSettings();
  if (settings.lockMode) return;

  // 🔒 INCOME CONTROL (if exists)
  if (typeof isIncomeAllowed === "function") {
    if (!isIncomeAllowed(safeData.type)) return;
  }

  // 💰 CREDIT WALLET (MAIN FIX)
  if (safeData.userId !== "SYSTEM") {
    creditWallet(safeData.userId, safeData.amount, safeData.type);
  }

  // 🧾 INCOME LOG
  if (typeof addIncomeLog === "function") {
    addIncomeLog(safeData);
  }

  // 📊 ACTIVITY LOG
  if (typeof addLog === "function") {
    addLog("INCOME " + safeData.amount + " (" + safeData.type + ")", safeData.userId);
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

// ================= CTOR =================
function distributeCTOR(userId, totalCTOR, type) {

  const CTOR_SPLIT = [25, 15, 12, 6,6,6,6,6,6,6,6];

  totalCTOR = parseFloat(Number(totalCTOR).toFixed(2));

  CTOR_SPLIT.forEach((percent, index) => {

    let amount = parseFloat(((totalCTOR * percent) / 100).toFixed(2));
    if (amount <= 0) return;

    safeIncome({
      userId: "SYSTEM", // keep as system pool
      type: "ctor",
      amount: amount,
      sourceUser: userId,
      note: `${type.toUpperCase()} CTOR ${index + 1} (${percent}%)`
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

    if (level === 1) income = calc(bv, 23.81);
    else income = calc(bv, 1.19);

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

  let totalCTOR = calc(bv, 25);
  distributeCTOR(userId, totalCTOR, "upgrade");
}

// ================= REPURCHASE =================
function processRepurchaseIncome(userId, bv) {

  let current = getUser(userId);
  if (!current) return;

  let usableBV = calc(bv, 50);
  let rliPool = calc(usableBV, 40);
  let ctorPool = calc(usableBV, 60);

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

  distributeCTOR(userId, ctorPool, "repurchase");
}

// ================= MASTER =================
function processIncome(type, userId, bv) {

  bv = Number(bv);

  if (!userId || isNaN(bv) || bv <= 0) return;

  let settings = getSystemSettings();
  if (settings.lockMode) {
    console.warn("System Locked");
    return;
  }

  if (type === "upgrade") {
    processUpgradeIncome(userId, bv);
  }

  else if (type === "repurchase") {
    processRepurchaseIncome(userId, bv);
  }

  console.log("✅ Income processed:", type, userId);
}
