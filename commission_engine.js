<script src="wallet_system.js"></script>
<script src="active_system.js"></script>

<script>

// =====================
// COMMISSION CONFIG
// =====================
const COMMISSION_CONFIG = {

  ugliLevels: [
    10,
    2,2,2,2,2,2,2,2,2,
    1,1,1,1,1,1,1,1,1,1,
    0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5
  ],

  ctorPercent: 25
};

// =====================
// 🔹 SAFE GET USERS
// =====================
function getAllUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

// =====================
// 🔹 HOLD INCOME SYSTEM
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
// 🔥 UGLI INCOME (INTRODUCER TREE ONLY)
// =====================
function payUGLIIncome(userId, bvAmount) {

  let users = getAllUsers();

  let current = users.find(u => u.userId === userId);
  if (!current) return;

  for (let i = 0; i < COMMISSION_CONFIG.ugliLevels.length; i++) {

    // 👉 ONLY INTRODUCER TREE
    if (!current.introducerId) break;

    let parent = users.find(u => u.userId === current.introducerId);
    if (!parent) break;

    let percent = COMMISSION_CONFIG.ugliLevels[i];
    let income = (bvAmount * percent) / 100;

    if (income > 0) {

      if (isUserActive(parent.userId)) {

        creditWallet(
          parent.userId,
          income,
          `UGLI L${i + 1} (${percent}%)`
        );

      } else {

        holdIncome(
          parent.userId,
          income,
          `UGLI L${i + 1} (${percent}%)`
        );

      }

    }

    current = parent;
  }
}

// =====================
// 🔥 CTOR POOL SYSTEM
// =====================
function addToCTORPool(bvAmount) {

  let pool = JSON.parse(localStorage.getItem("ctorPool") || "0");

  let amount = (bvAmount * COMMISSION_CONFIG.ctorPercent) / 100;

  pool += amount;

  localStorage.setItem("ctorPool", JSON.stringify(pool));
}

// =====================
// 🔥 MASTER INCOME TRIGGER
// =====================
function processIncome(userId, bvAmount) {

  if (!userId || !bvAmount) return;

  // 1️⃣ UGLI (Introducer based)
  payUGLIIncome(userId, bvAmount);

  // 2️⃣ CTOR Pool
  addToCTORPool(bvAmount);

  console.log("✅ Income Distributed Successfully");
}

</script>
