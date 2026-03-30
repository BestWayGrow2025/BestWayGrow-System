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
// ➕ ADD HOLD INCOME
// =====================
function holdIncome(userId, amount, reason) {

  let holds = getHoldIncome();

  holds.push({
    id: "H" + Date.now(), // unique id 🔥
    userId,
    amount,
    reason,
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

      // ✅ check active
      if (isUserActive(userId)) {

        creditWallet(
          userId,
          h.amount,
          "Released: " + h.reason
        );

        h.status = "RELEASED";
        h.releaseTime = new Date().toISOString();

        updated = true;
      }
    }

  });

  if (updated) {
    saveHoldIncome(holds);
  }
}

// =====================
// 🔄 RELEASE ALL (SYSTEM WIDE)
// =====================
function releaseAllHoldIncome() {

  let holds = getHoldIncome();
  let updated = false;

  holds.forEach(h => {

    if (h.status === "HOLD") {

      if (isUserActive(h.userId)) {

        creditWallet(
          h.userId,
          h.amount,
          "Released: " + h.reason
        );

        h.status = "RELEASED";
        h.releaseTime = new Date().toISOString();

        updated = true;
      }
    }

  });

  if (updated) {
    saveHoldIncome(holds);
  }
}

// =====================
// ❌ EXPIRE HOLD INCOME
// =====================
function expireHoldIncome(days = 30) {

  let holds = getHoldIncome();
  let now = Date.now();
  let updated = false;

  holds.forEach(h => {

    if (h.status === "HOLD") {

      let holdTime = new Date(h.time).getTime();

      if ((now - holdTime) > (days * 24 * 60 * 60 * 1000)) {
        h.status = "EXPIRED";
        updated = true;
      }
    }

  });

  if (updated) {
    saveHoldIncome(holds);
  }
}

// =====================
// 🔍 GET USER HOLD SUMMARY
// =====================
function getUserHoldSummary(userId) {

  let holds = getHoldIncome();

  let totalHold = 0;
  let totalReleased = 0;
  let totalExpired = 0;

  holds.forEach(h => {

    if (h.userId === userId) {

      if (h.status === "HOLD") {
        totalHold += h.amount;
      }

      if (h.status === "RELEASED") {
        totalReleased += h.amount;
      }

      if (h.status === "EXPIRED") {
        totalExpired += h.amount;
      }
    }

  });

  return {
    hold: totalHold,
    released: totalReleased,
    expired: totalExpired
  };
}

// =====================
// 🔄 AUTO PROCESSOR (VERY IMPORTANT 🔥)
// =====================
function startHoldProcessor() {

  setInterval(() => {

    releaseAllHoldIncome(); // release if active
    expireHoldIncome(30);   // expire after 30 days

  }, 5000); // every 5 sec

}

// =====================
// 🚀 AUTO START
// =====================
startHoldProcessor();

</script>
