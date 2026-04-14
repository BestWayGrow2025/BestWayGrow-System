/*
========================================
📊 POINT SYSTEM V1.1 (FINAL LOCK ❤️)
========================================
✔ Monthly points tracking
✔ Direct + BV logic
✔ RLI hold system
✔ Weekly release engine
✔ Monthly closing reset
✔ No carry forward
✔ SYSTEM fallback safe
✔ Fully aligned with income engine
✔ Production safe (no crash)
========================================
*/

// ===================================
// 🔹 UPDATE USER POINTS
// ===================================
function updateUserPoints(userId, bv = 0, isDirect = false) {

  let users = (typeof getUsers === "function") ? getUsers() : [];
  let user = users.find(u => u.userId === userId);
  if (!user) return;

  // 🔒 SAFE INIT
  if (typeof user.monthlyPoints !== "number") user.monthlyPoints = 0;
  if (typeof user.rliHoldBalance !== "number") user.rliHoldBalance = 0;

  let now = new Date();
  let last = user.lastPointReset ? new Date(user.lastPointReset) : null;

  // 🔄 MONTH RESET (SAFE YEAR CHECK)
  if (!last || last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear()) {
    user.monthlyPoints = 0;
    user.rliHoldBalance = 0;
    user.lastPointReset = now.toISOString();
  }

  let points = 0;

  // ❤️ DIRECT POINT
  if (isDirect === true) {
    points += 1;
  }

  // ❤️ BV POINT
  if (bv > 0) {
    points += Math.floor(Number(bv) / 500);
  }

  user.monthlyPoints += points;

  saveUsers(users);
}

// ===================================
// 🔹 CHECK USER POINT ELIGIBILITY
// ===================================
function hasValidPoints(user) {
  if (!user) return false;
  return Number(user.monthlyPoints || 0) >= 1;
}

// ===================================
// 🔹 WEEKLY RLI RELEASE
// ===================================
function releaseRLIWeekly() {

  let users = (typeof getUsers === "function") ? getUsers() : [];

  users.forEach(user => {

    if (hasValidPoints(user) && Number(user.rliHoldBalance || 0) > 0) {

      if (typeof safeIncome === "function") {
        safeIncome({
          userId: user.userId,
          type: "repurchase_release",
          amount: Number(user.rliHoldBalance),
          sourceUser: "SYSTEM",
          note: "WEEKLY RLI RELEASE"
        });
      }

      user.rliHoldBalance = 0;
    }

  });

  saveUsers(users);
}

// ===================================
// 🔹 MONTHLY CLOSING
// ===================================
function monthlyClosing() {

  let users = (typeof getUsers === "function") ? getUsers() : [];

  users.forEach(user => {

    let hold = Number(user.rliHoldBalance || 0);

    // ❌ NOT QUALIFIED → FLUSH TO SYSTEM
    if (!hasValidPoints(user) && hold > 0) {

      if (typeof safeIncome === "function") {
        safeIncome({
          userId: "SYSTEM",
          type: "flush",
          amount: hold,
          sourceUser: user.userId,
          note: "MONTH END FLUSH"
        });
      }

      user.rliHoldBalance = 0;
    }

    // 🔄 RESET MONTH
    user.monthlyPoints = 0;
    user.lastPointReset = new Date().toISOString();

  });

  saveUsers(users);
}

// ===================================
// 🔁 AUTO RUN ENGINES (SAFE INIT)
// ===================================
if (typeof window !== "undefined") {

  // prevent duplicate intervals
  if (!window.__pointSystemInitialized) {

    setInterval(releaseRLIWeekly, 7 * 24 * 60 * 60 * 1000);
    setInterval(monthlyClosing, 30 * 24 * 60 * 60 * 1000);

    window.__pointSystemInitialized = true;
  }

}


