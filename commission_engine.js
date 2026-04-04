/*
========================================
COMMISSION ENGINE (FINAL SAFE v2)
========================================
✔ Decimal safe
✔ Memory safe
✔ Duplicate protected
✔ CORE integrated
✔ Production ready
========================================
*/

// =====================
// 🔹 CONFIG
// =====================
const COMMISSION_CONFIG = {
  ugliLevels: [
    16.67,
    0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,
    0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,
    0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83
  ],
  ctorPercent: 25
};

const HOLD_LIMIT = 3000;

// =====================
// 🔹 SAFE LOAD
// =====================
function loadSafe(key, def = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || def;
  } catch {
    localStorage.setItem(key, JSON.stringify(def));
    return def;
  }
}

// =====================
// 🔹 SAFE SAVE
// =====================
function saveSafe(key, data, limit = null) {

  if (!Array.isArray(data)) {
    localStorage.setItem(key, JSON.stringify(data));
    return;
  }

  if (limit && data.length > limit) {
    data = data.slice(-limit);
  }

  localStorage.setItem(key, JSON.stringify(data));
}

// =====================
// 🔹 SAFE LOG
// =====================
function safeLog(data) {
  if (typeof addIncomeLog === "function") {
    addIncomeLog(data);
  }
}

// =====================
// 🔐 HOLD DUPLICATE CHECK
// =====================
function isDuplicateHold(userId, amount, reason) {

  let holds = loadSafe("holdIncome", []);

  return holds.some(h =>
    h.userId === userId &&
    Number(h.amount) === Number(amount) &&
    h.reason === reason &&
    (new Date() - new Date(h.time)) < 5000
  );
}

// =====================
// 🔹 HOLD INCOME (UPDATED ✅)
// =====================
function addHoldIncome(userId, amount, reason) {

  amount = Number(amount);
  if (!userId || isNaN(amount) || amount <= 0) return;

  if (isDuplicateHold(userId, amount, reason)) return;

  let holds = loadSafe("holdIncome", []);

  holds.push({
    userId,
    amount,
    reason,
    time: new Date().toISOString(),
    status: "HOLD"
  });

  saveSafe("holdIncome", holds, HOLD_LIMIT);

  safeLog({
    userId,
    type: "hold",
    amount,
    note: reason
  });
}

// =====================
// 🔹 UGLI
// =====================
function payUGLIIncome(userId, bvAmount) {

  let users = getUsers();
  let current = users.find(u => u.userId === userId);
  if (!current) return;

  for (let i = 0; i < COMMISSION_CONFIG.ugliLevels.length; i++) {

    if (!current.introducerId) break;

    let parent = users.find(u => u.userId === current.introducerId);
    if (!parent) break;

    let percent = COMMISSION_CONFIG.ugliLevels[i];

    let income = parseFloat(((bvAmount * percent) / 100).toFixed(2));

    if (income > 0) {

      if (typeof isUserActive === "function" && isUserActive(parent.userId)) {

        creditWallet(parent.userId, income, `UGLI L${i + 1} (${percent}%)`);

        safeLog({
          userId: parent.userId,
          type: "upgrade",
          amount: income,
          sourceUser: userId,
          note: `UGLI L${i + 1}`
        });

      } else {
        addHoldIncome(parent.userId, income, `UGLI L${i + 1}`);
      }
    }

    current = parent;
  }
}

// =====================
// 🔹 RLI
// =====================
function payRLIIncome(userId, totalBV) {

  let users = getUsers();
  let current = users.find(u => u.userId === userId);
  if (!current) return;

  let levels = 30;

  let perLevel = parseFloat((totalBV / levels).toFixed(2));
  if (perLevel <= 0) return;

  for (let i = 1; i <= levels; i++) {

    if (!current.introducerId) break;

    let parent = users.find(u => u.userId === current.introducerId);
    if (!parent) break;

    if (typeof isUserActive === "function" && isUserActive(parent.userId)) {

      creditWallet(parent.userId, perLevel, `RLI L${i}`);

      safeLog({
        userId: parent.userId,
        type: "repurchase",
        amount: perLevel,
        sourceUser: userId,
        note: `RLI L${i}`
      });

    } else {
      addHoldIncome(parent.userId, perLevel, `RLI L${i}`);
    }

    current = parent;
  }
}

// =====================
// 🔹 CTOR POOL
// =====================
function addToCTORPool(bvAmount) {

  let pool = loadSafe("ctorPool", 0);

  let amount = Number((bvAmount * COMMISSION_CONFIG.ctorPercent) / 100);

  pool = parseFloat((Number(pool) + amount).toFixed(2));

  localStorage.setItem("ctorPool", JSON.stringify(pool));

  safeLog({
    userId: "SYSTEM",
    type: "ctor",
    amount,
    note: "CTOR Pool Added"
  });
}

// =====================
// 🔥 MASTER CONTROLLER
// =====================
function processIncome(type, userId, bvAmount) {

  bvAmount = Number(bvAmount);

  if (!userId || isNaN(bvAmount) || bvAmount <= 0) return;

  if (typeof isIncomeSystemSafe === "function") {
    if (!isIncomeSystemSafe()) {
      console.warn("⚠ Income system disabled");
      return;
    }
  }

  if (type === "upgrade") {

    if (typeof isUGLIEnabled === "function" && !isUGLIEnabled()) return;

    payUGLIIncome(userId, bvAmount);
    addToCTORPool(bvAmount);

  } 
  else if (type === "repurchase") {

    if (typeof isRLIEnabled === "function" && !isRLIEnabled()) return;

    let usableBV = bvAmount * 0.5;

    let rliBV = usableBV * 0.4;
    let ctorBV = usableBV * 0.6;

    payRLIIncome(userId, rliBV);
    addToCTORPool(ctorBV);
  }

  console.log("✅ Income processed:", type);
}

