<script src="wallet_system.js"></script>
<script src="active_system.js"></script>
<script src="income_log_system.js"></script> <!-- ✅ ADDED -->

<script>

// =====================
// COMMISSION CONFIG
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
// GET USERS
// =====================
function getAllUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

// =====================
// SAFE LOG FUNCTION
// =====================
function safeLog(data) {
  if (typeof addIncomeLog === "function") {
    addIncomeLog(data);
  }
}

// =====================
// HOLD INCOME
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

  // ✅ LOG
  safeLog({
    userId,
    type: "hold",
    amount,
    note: reason
  });
}

// =====================
// UGLI
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

        safeLog({
          userId: parent.userId,
          type: "upgrade",
          amount: income,
          sourceUser: userId,
          note: `UGLI L${i + 1}`
        });

      } else {
        holdIncome(parent.userId, income, `UGLI L${i + 1}`);
      }
    }

    current = parent;
  }
}

// =====================
// RLI
// =====================
function payRLIIncome(userId, totalBV) {

  let users = getAllUsers();
  let current = users.find(u => u.userId === userId);
  if (!current) return;

  let levels = 30;
  let perLevel = totalBV / levels;

  if (perLevel <= 0) return;

  for (let i = 1; i <= levels; i++) {

    if (!current.introducerId) break;

    let parent = users.find(u => u.userId === current.introducerId);
    if (!parent) break;

    if (isUserActive(parent.userId)) {

      creditWallet(parent.userId, perLevel, `RLI L${i}`);

      safeLog({
        userId: parent.userId,
        type: "repurchase",
        amount: perLevel,
        sourceUser: userId,
        note: `RLI L${i}`
      });

    } else {
      holdIncome(parent.userId, perLevel, `RLI L${i}`);
    }

    current = parent;
  }
}

// =====================
// CTOR POOL
// =====================
function addToCTORPool(bvAmount) {

  let pool = JSON.parse(localStorage.getItem("ctorPool") || "0");

  let amount = (bvAmount * COMMISSION_CONFIG.ctorPercent) / 100;

  pool += amount;

  localStorage.setItem("ctorPool", JSON.stringify(pool));

  // ✅ LOG CTOR
  safeLog({
    userId: "SYSTEM",
    type: "ctor",
    amount: amount,
    note: "CTOR Pool Added"
  });
}

// =====================
// MASTER
// =====================
function processIncome(type, userId, bvAmount) {

  if (!userId || !bvAmount || bvAmount <= 0) return;

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

</script>

