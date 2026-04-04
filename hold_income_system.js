<script>

// =====================
// 🔹 GET / SAVE HOLD DATA
// =====================
function getHoldIncome() {
  try {
    return JSON.parse(localStorage.getItem("holdIncome") || "[]");
  } catch {
    localStorage.setItem("holdIncome", "[]");
    return [];
  }
}

function saveHoldIncome(data) {
  localStorage.setItem("holdIncome", JSON.stringify(data));
}

// =====================
// 🔐 DUPLICATE PROTECTION
// =====================
function isDuplicateHold(userId, amount, reason) {
  let holds = getHoldIncome();

  return holds.some(h =>
    h.userId === userId &&
    h.amount === amount &&
    h.reason === reason &&
    (new Date() - new Date(h.time)) < 5000
  );
}

// =====================
// ➕ ADD HOLD INCOME (FIXED)
// =====================
function addHoldIncome(userId, amount, reason) {

  if (!userId || !amount || amount <= 0) return;

  if (isDuplicateHold(userId, amount, reason)) return;

  let holds = getHoldIncome();

  holds.push({
    id: "H" + Date.now(),
    userId,
    amount: Number(amount),
    reason: reason || "",
    time: new Date().toISOString(),
    status: "HOLD"
  });

  saveHoldIncome(holds);
}

// =====================
// 🔄 RELEASE HOLD INCOME
// =====================
function releaseHoldIncome(userId) {

  let holds = getHoldIncome();
  let updated = false;

  holds.forEach(h => {

    if (h.userId === userId && h.status === "HOLD") {

      if (typeof isUserActive === "function" && isUserActive(userId)) {

        creditWallet(userId, h.amount, "Released: " + h.reason);

        h.status = "RELEASED";
        h.releaseTime = new Date().toISOString();

        updated = true;
      }
    }

  });

  if (updated) saveHoldIncome(holds);
}

// =====================
// 🔄 RELEASE ALL
// =====================
function releaseAllHoldIncome() {

  let holds = getHoldIncome();
  let updated = false;

  holds.forEach(h => {

    if (h.status === "HOLD") {

      if (typeof isUserActive === "function" && isUserActive(h.userId)) {

        creditWallet(h.userId, h.amount, "Released: " + h.reason);

        h.status = "RELEASED";
        h.releaseTime = new Date().toISOString();

        updated = true;
      }
    }

  });

  if (updated) saveHoldIncome(holds);
}

// =====================
// ❌ EXPIRE HOLD
// =====================
function expireHoldIncome(days = 30) {

  let holds = getHoldIncome();
  let now = Date.now();
  let updated = false;

  holds.forEach(h => {

    if (h.status === "HOLD") {

      let holdTime = new Date(h.time).getTime();

      if ((now - holdTime) > (days * 86400000)) {
        h.status = "EXPIRED";
        updated = true;
      }
    }

  });

  if (updated) saveHoldIncome(holds);
}

// =====================
// 🔍 USER SUMMARY
// =====================
function getUserHoldSummary(userId) {

  let holds = getHoldIncome();

  let totalHold = 0;
  let totalReleased = 0;
  let totalExpired = 0;

  holds.forEach(h => {

    if (h.userId === userId) {

      if (h.status === "HOLD") totalHold += h.amount;
      if (h.status === "RELEASED") totalReleased += h.amount;
      if (h.status === "EXPIRED") totalExpired += h.amount;

    }

  });

  return {
    hold: totalHold,
    released: totalReleased,
    expired: totalExpired
  };
}

// =====================
// 🔄 AUTO PROCESSOR
// =====================
function startHoldProcessor() {

  setInterval(() => {

    releaseAllHoldIncome();
    expireHoldIncome(30);

  }, 5000);

}

// =====================
// 🚀 START
// =====================
startHoldProcessor();

</script>
