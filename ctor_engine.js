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
// GET CTOR POOL
// =====================
function getCTORPool() {
  return JSON.parse(localStorage.getItem("ctorPool") || "0");
}

function resetCTORPool() {
  localStorage.setItem("ctorPool", JSON.stringify(0));
}

// =====================
// PIN SHARE CONFIG (EASY FUTURE CHANGE)
// =====================
const PIN_SHARE = {
  PIN1: 1,
  PIN2: 2,
  PIN3: 4,
  PIN4: 8
};

// =====================
// GET USER SHARE
// =====================
function getUserShare(user) {
  if (!user.pin) return 0;
  return PIN_SHARE[user.pin] || 0;
}

// =====================
// CHECK ACTIVE
// =====================
function isUserActive(user) {
  return user.isActive === true;
}

// =====================
// MAIN CTOR DISTRIBUTION
// =====================
function distributeCTOR() {

  let users = getUsers();
  let pool = getCTORPool();

  if (pool <= 0) {
    alert("No CTOR pool available");
    return;
  }

  // =====================
  // CALCULATE TOTAL SHARE
  // =====================
  let totalShare = 0;

  users.forEach(u => {
    if (isUserActive(u)) {
      totalShare += getUserShare(u);
    }
  });

  if (totalShare === 0) {
    alert("No eligible users for CTOR");
    return;
  }

  // =====================
  // DISTRIBUTE INCOME
  // =====================
  users.forEach(u => {

    if (!isUserActive(u)) return;

    let share = getUserShare(u);
    if (share <= 0) return;

    let income = (pool * share) / totalShare;

    if (income > 0 && typeof creditWallet === "function") {
      creditWallet(
        u.userId,
        income,
        "CTOR Monthly Income"
      );
    }

  });

  // =====================
  // RESET POOL AFTER PAY
  // =====================
  resetCTORPool();

  alert("CTOR Distributed Successfully");

}
</script>
