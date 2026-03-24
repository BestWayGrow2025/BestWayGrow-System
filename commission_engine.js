<script src="wallet_system.js"></script>

<script>

// =====================
// COMMISSION CONFIG (MASTER CONTROL)
// =====================
const COMMISSION_CONFIG = {

  // UGLI LEVEL % (TOTAL ≤ safe limit)
  ugliLevels: [
    10, // L1
    2,2,2,2,2,2,2,2,2, // L2–10
    1,1,1,1,1,1,1,1,1,1, // L11–20
    0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5 // L21–30
  ],

  // CTOR %
  ctorPercent: 25

};

// =====================
// PAY UGLI INCOME (DYNAMIC)
// =====================
function payUGLIIncome(userId, bvAmount) {

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  let current = users.find(u => u.userId === userId);
  if (!current) return;

  for (let i = 0; i < COMMISSION_CONFIG.ugliLevels.length; i++) {

    if (!current.introducerId) break;

    let parent = users.find(u => u.userId === current.introducerId);
    if (!parent) break;

    let percent = COMMISSION_CONFIG.ugliLevels[i];

    let income = (bvAmount * percent) / 100;

    if (income > 0) {
      creditWallet(
        parent.userId,
        income,
        "UGLI L" + (i + 1) + " (" + percent + "%)"
      );
    }

    current = parent;
  }

}

// =====================
// CTOR POOL ADD
// =====================
function addToCTORPool(bvAmount) {

  let pool = JSON.parse(localStorage.getItem("ctorPool") || "0");

  let amount = (bvAmount * COMMISSION_CONFIG.ctorPercent) / 100;

  pool += amount;

  localStorage.setItem("ctorPool", JSON.stringify(pool));
}

</script>
