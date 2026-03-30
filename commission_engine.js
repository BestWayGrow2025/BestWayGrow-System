<script src="wallet_system.js"></script>
<script src="active_system.js"></script>

<script>

// =====================
// COMMISSION CONFIG (FINAL SAFE)
// =====================
const COMMISSION_CONFIG = {

  // ✅ UGLI (UPGRADE - INTRODUCER BASED)
  ugliLevels: [
    16.67, // L1
    0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,
    0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,
    0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83,0.83
  ],

  // ✅ CTOR %
  ctorPercent: 25
};

// =====================
// 🔹 SAFE USERS
// =====================
function getAllUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

// =====================
// 🔹 HOLD INCOME (SEPARATE SYSTEM READY)
// =====================
function holdIncome(userId, amount, reason) {

  let holds = JSON.parse(localStorage.getItem("holdIncome") || "[]");

  holds.push({
    userId,
    amount,
    reason,
    time: new Date().toISOString(),
    status: "HOLD"
  });

  localStorage.setItem("holdIncome", JSON.stringify(holds));
}

// =====================
// 🔥 UGLI (UPGRADE INCOME)
// =====================
function payUGLIIncome(userId, bvAmount) {

  let users = getAllUsers();
  let current = users.find(u => u.userId === userId);

  if (!current) return;

  for (let i = 0; i < COMMISSION_CONFIG.ugliLevels.length; i++) {

    if (!current.introducerId) break;

    let parent = users.find(u => u.userId === current.introducerId);
    if (!parent) break;

    let percent = COMMISSION_CONFIG.ugliLevels[i];
    let income = (bvAmount * percent) / 100;

    if (income > 0) {

      if (isUserActive(parent.userId)) {
        creditWallet(parent.userId, income, `UGLI L${i + 1} (${percent}%)`);
      } else {
        holdIncome(parent.userId, income, `UGLI L${i + 1} (${percent}%)`);
      }

    }

    current = parent;
  }
}

// =====================
// 🔥 RLI (REPURCHASE INCOME)
// =====================
function payRLIIncome(userId, totalBV) {

  let users = getAllUsers();
  let current = users.find(u => u.userId === userId);

  if (!current) return;

  let levels = 30;

  // ✅ SAFE: avoid division issue
  let perLevel = levels > 0 ? (totalBV / levels) : 0;

  for (let i = 1; i <= levels; i++) {

    if (!current.introducerId) break;

    let parent = users.find(u => u.userId === current.introducerId);
    if (!parent) break;

    if (perLevel > 0) {

      if (isUserActive(parent.userId)) {
        creditWallet(parent.userId, perLevel, `RLI L${i}`);
      } else {
        holdIncome(parent.userId, perLevel, `RLI L${i}`);
      }

    }

    current = parent;
  }
}

// =====================
// 🔥 CTOR POOL
// =====================
function addToCTORPool(bvAmount) {

  let pool = JSON.parse(localStorage.getItem("ctorPool") || "0");

  let amount = (bvAmount * COMMISSION_CONFIG.ctorPercent) / 100;

  pool += amount;

  localStorage.setItem("ctorPool", JSON.stringify(pool));
}

// =====================
// 🔥 MASTER CONTROLLER (FUTURE SAFE)
// =====================
// 👉 Upgrade → UGLI
// 👉 Repurchase → RLI
function processIncome(type, userId, bvAmount) {

  if (!userId || !bvAmount) return;

  if (type === "upgrade") {
    payUGLIIncome(userId, bvAmount);
    addToCTORPool(bvAmount);
  }

  if (type === "repurchase") {
    let usableBV = bvAmount * 0.5;

    let rliBV = usableBV * 0.4;
    let ctorBV = usableBV * 0.6;

    payRLIIncome(userId, rliBV);
    addToCTORPool(ctorBV);
  }

  console.log("✅ Income processed:", type);
}

</script>

