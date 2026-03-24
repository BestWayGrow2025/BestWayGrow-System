<script>

// =====================
// GET USERS
// =====================
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// =====================
// CHECK ACTIVE STATUS
// =====================
function isUserActive(userId) {

  let users = getUsers();
  let user = users.find(u => u.userId === userId);

  if (!user) return false;

  let now = new Date();
  let activeTill = new Date(user.activeTill || 0);

  return activeTill > now;
}

// =====================
// ACTIVATE USER
// =====================
function activateUser(userId) {

  let users = getUsers();
  let user = users.find(u => u.userId === userId);

  if (!user) return;

  let now = new Date();
  let nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  user.activeTill = nextMonth.toISOString();

  saveUsers(users);

  console.log("User Activated:", userId);
}

// =====================
// HOLD INCOME
// =====================
function holdIncome(userId, amount, reason) {

  let holds = JSON.parse(localStorage.getItem("holdIncome") || "[]");

  holds.push({
    userId: userId,
    amount: amount,
    reason: reason,
    time: new Date().toISOString(),
    status: "HOLD"
  });

  localStorage.setItem("holdIncome", JSON.stringify(holds));
}

// =====================
// RELEASE HOLD INCOME
// =====================
function releaseHoldIncome(userId) {

  let holds = JSON.parse(localStorage.getItem("holdIncome") || "[]");

  let updated = [];

  holds.forEach(h => {

    if (h.userId === userId && h.status === "HOLD") {

      if (isUserActive(userId)) {

        creditWallet(userId, h.amount, "Released: " + h.reason);

        h.status = "RELEASED";

      }

    }

    updated.push(h);

  });

  localStorage.setItem("holdIncome", JSON.stringify(updated));
}

// =====================
// MONTHLY RESET
// =====================
function monthlyProcess() {

  let users = getUsers();

  users.forEach(u => {

    // RELEASE if active
    releaseHoldIncome(u.userId);

    // EXPIRE if inactive
    let now = new Date();
    let activeTill = new Date(u.activeTill || 0);

    if (activeTill < now) {

      let holds = JSON.parse(localStorage.getItem("holdIncome") || "[]");

      holds.forEach(h => {
        if (h.userId === u.userId && h.status === "HOLD") {
          h.status = "EXPIRED";
        }
      });

      localStorage.setItem("holdIncome", JSON.stringify(holds));
    }

  });

  console.log("Monthly process completed");
}

</script>
