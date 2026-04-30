<script>

// =====================
// GET USERS (SAFE ALIGNED)
// =====================
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// =====================
// GET CTOR POOL (FIXED)
// =====================
function getCTORPool() {
  let pool = JSON.parse(localStorage.getItem("ctorPool") || "0");
  pool = Number(pool);
  return isNaN(pool) ? 0 : pool;
}

// =====================
// RESET CTOR POOL
// =====================
function resetCTORPool() {
  localStorage.setItem("ctorPool", JSON.stringify(0));
}

// =====================
// PIN SHARE CONFIG
// =====================
const PIN_SHARE = {
  PIN1: 1,
  PIN2: 2,
  PIN3: 4,
  PIN4: 8
};

// =====================
// USER SHARE
// =====================
function getUserShare(user) {
  if (!user || !user.pin) return 0;
  return PIN_SHARE[user.pin] || 0;
}

// =====================
// ACTIVE CHECK
// =====================
function isUserActive(user) {
  return user && user.isActive === true;
}

// =====================
// MAIN CTOR DISTRIBUTION
// =====================
function distributeCTOR() {

  let users = getUsers();
  let pool = getCTORPool();

  if (!pool || pool <= 0) {
    alert("No CTOR pool available");
    return;
  }

  // =====================
  // TOTAL SHARE CALCULATION
  // =====================
  let totalShare = 0;

  users.forEach(u => {
    if (isUserActive(u)) {
      totalShare += getUserShare(u);
    }
  });

  if (totalShare <= 0) {
    alert("No eligible users for CTOR");
    return;
  }

  // =====================
  // DISTRIBUTION
  // =====================
  users.forEach(u => {

    if (!isUserActive(u)) return;

    let share = getUserShare(u);
    if (share <= 0) return;

    let income = (pool * share) / totalShare;

    if (income > 0 && typeof creditWallet === "function") {
      creditWallet(
        u.userId,
        Number(income.toFixed(2)),
        "CTOR Monthly Income"
      );
    }

  });

  // =====================
  // RESET POOL
  // =====================
  resetCTORPool();

  alert("CTOR Distributed Successfully");
}

</script>
