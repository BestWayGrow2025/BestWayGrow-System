// ===============================
// CORE SYSTEM (MASTER FILE)
// ===============================


// ===================================
// 🔹 STORAGE HELPERS
// ===================================
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "[]");
  } catch {
    localStorage.setItem("users", "[]");
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getSystemSettings() {
  try {
    return JSON.parse(localStorage.getItem("systemSettings") || "{}");
  } catch {
    localStorage.setItem("systemSettings", "{}");
    return {};
  }
}


// ===================================
// 🔹 USER SYSTEM
// ===================================

// ===== RANDOM USER ID =====
function generateUserId() {
  let users = getUsers();
  let existingIds = users.map(u => u.userId);

  let newId;
  do {
    let randomNum = Math.floor(1 + Math.random() * 999999);
    newId = "BWG" + String(randomNum).padStart(6, "0");
  } while (existingIds.includes(newId));

  return newId;
}

// ===== INTRODUCER VALIDATION =====
function isValidIntroducer(id) {
  if (!id) return false;
  let users = getUsers();
  return users.some(u => u.userId === id);
}

// ===== REGISTER USER =====
function registerUser(username, password, introducerId) {

  let users = getUsers();

  if (!username || !password) {
    alert("Fill all fields");
    return null;
  }

  if (!isValidIntroducer(introducerId)) {
    alert("Invalid Introducer");
    return null;
  }

  let newUser = {
    userId: generateUserId(),
    username: username.trim(),
    password: password.trim(),
    role: "user",
    introducerId: introducerId,
    createdAt: new Date().toISOString(),

    // SYSTEM FIELDS
    status: "inactive",
    isActive: false,
    wallet: 0,
    activeTill: null
  };

  users.push(newUser);
  saveUsers(users);

  alert("User Created: " + newUser.userId);

  return newUser;
}


// ===================================
// 🔹 USER ACTIVE SYSTEM
// ===================================

// CHECK ACTIVE
function isUserActive(userId) {
  let users = getUsers();
  let user = users.find(u => u.userId === userId);
  if (!user) return false;

  let now = new Date();
  let activeTill = new Date(user.activeTill || 0);

  return activeTill > now;
}

// ACTIVATE USER
function activateUser(userId) {
  let users = getUsers();
  let user = users.find(u => u.userId === userId);
  if (!user) return;

  let now = new Date();
  let nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  user.activeTill = nextMonth.toISOString();
  user.isActive = true;

  saveUsers(users);

  console.log("User Activated:", userId);
}


// ===================================
// 🔹 HOLD INCOME SYSTEM
// ===================================

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

// RELEASE HOLD
function releaseHoldIncome(userId) {
  let holds = JSON.parse(localStorage.getItem("holdIncome") || "[]");
  let updated = [];

  holds.forEach(h => {
    if (h.userId === userId && h.status === "HOLD") {

      if (isUserActive(userId)) {
        if (typeof creditWallet === "function") {
          creditWallet(userId, h.amount, "Released: " + h.reason);
        }
        h.status = "RELEASED";
      }
    }
    updated.push(h);
  });

  localStorage.setItem("holdIncome", JSON.stringify(updated));
}


// ===================================
// 🔹 MONTHLY PROCESS
// ===================================
function monthlyProcess() {

  let users = getUsers();

  users.forEach(u => {

    // RELEASE
    releaseHoldIncome(u.userId);

    // EXPIRE
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


// ===================================
// 🔹 SECURITY SYSTEM
// ===================================

// COPY PROTECTION
function enableCopyProtection() {
  document.addEventListener("contextmenu", e => e.preventDefault());

  document.addEventListener("keydown", function (e) {
    if (
      (e.ctrlKey && e.key === "c") ||
      (e.ctrlKey && e.key === "u") ||
      (e.ctrlKey && e.key === "s")
    ) {
      e.preventDefault();
    }
  });
}

// SYSTEM LOCK
function isSystemLocked() {
  let settings = getSystemSettings();
  return settings.lockMode === true;
}

function checkSystemLock() {
  if (isSystemLocked()) {
    document.body.innerHTML = "<h2>System Locked by Admin</h2>";
  }
}

// EXPORT BACKUP
function exportData() {
  let data = {
    users: localStorage.getItem("users"),
    pins: localStorage.getItem("pins"),
    transactions: localStorage.getItem("transactions"),
    pinTransactions: localStorage.getItem("pinTransactions"),
    holdIncome: localStorage.getItem("holdIncome"),
    ctorPool: localStorage.getItem("ctorPool"),
    systemSettings: localStorage.getItem("systemSettings"),
    admins: localStorage.getItem("admins"),
    pinRequests: localStorage.getItem("pinRequests")
  };

  let blob = new Blob([JSON.stringify(data)], { type: "application/json" });

  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "BWG_backup.json";
  a.click();
}

// IMPORT BACKUP
function importData(file) {
  if (!file) {
    alert("Select file");
    return;
  }

  let reader = new FileReader();

  reader.onload = function (e) {
    try {
      let data = JSON.parse(e.target.result);

      for (let key in data) {
        localStorage.setItem(key, data[key]);
      }

      alert("Backup restored");
      location.reload();

    } catch {
      alert("Invalid backup file");
    }
  };

  reader.readAsText(file);
}


// ===================================
// 🔹 INIT SYSTEM
// ===================================
function initCoreSystem() {
  enableCopyProtection();
  checkSystemLock();
}


