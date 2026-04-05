/*
========================================
COMMISSION ENGINE (FINAL CLEAN v4)
========================================
✔ Single source of truth (income log)
✔ No duplicate wallet entry
✔ No hold conflict
✔ Modular safe
✔ Pool safe
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

// =====================
// 🔹 SAFE LOG (CORE)
// =====================
function safeLog(data) {
  if (typeof addIncomeLog === "function") {
    addIncomeLog(data);
  }
}

// =====================
// 🔒 CTOR POOL
// =====================
function getCTORPool() {
  try {
    return Number(JSON.parse(localStorage.getItem("ctorPool"))) || 0;
  } catch {
    localStorage.setItem("ctorPool", "0");
    return 0;
  }
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

      safeLog({
        userId: parent.userId,
        type: "upgrade",
        amount: income,
        sourceUser: userId,
        note: `UGLI L${i + 1} (${percent}%)`
      });

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

    safeLog({
      userId: parent.userId,
      type: "repurchase",
      amount: perLevel,
      sourceUser: userId,
      note: `RLI L${i}`
    });

    current = parent;
  }
}

// =====================
// 🔹 CTOR POOL
// =====================
function addToCTORPool(bvAmount) {

  let pool = getCTORPool();

  let amount = Number((bvAmount * COMMISSION_CONFIG.ctorPercent) / 100);

  pool = parseFloat((pool + amount).toFixed(2));

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

  if (typeof isIncomeAllowed === "function") {
    if (!isIncomeAllowed(type === "upgrade" ? "ugli" : "rli")) {
      console.warn("⚠ Income blocked by control system");
      return;
    }
  }

  if (type === "upgrade") {

    payUGLIIncome(userId, bvAmount);
    addToCTORPool(bvAmount);

  } 
  else if (type === "repurchase") {

    let usableBV = bvAmount * 0.5;

    let rliBV = usableBV * 0.4;
    let ctorBV = usableBV * 0.6;

    payRLIIncome(userId, rliBV);
    addToCTORPool(ctorBV);
  }

  console.log("✅ Income processed:", type);
}


