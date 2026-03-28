/* ===============================
   CORE SYSTEM (MASTER FILE)
=============================== */


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
// 🔹 COMMON HELPERS
// ===================================
function getUserById(id) {
  return getUsers().find(u => u.userId === id);
}


// ===================================
// 🔹 USER SYSTEM
// ===================================
function generateUserId() {
  let users = getUsers();
  let existingIds = users.map(u => u.userId);

  let newId;
  do {
    let randomNum = Math.floor(1 + Math.random() * 999999);
    newId = "BWG" + String(randomNum).padStart(6, "0");
  } while (
    existingIds.includes(newId) ||
    newId === "BWG000000"
  );

  return newId;
}

function isValidIntroducer(id) {
  if (!id) return false;
  let user = getUserById(id);
  return user && user.isActive === true;
}

function registerUser(username, password, introducerId, role = "user") {

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
    password: btoa(password.trim()),
    role: role,
    introducerId: introducerId,
    createdAt: new Date().toISOString(),

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
// 🔹 ACTIVE SYSTEM
// ===================================
function isUserActive(userId) {
  let user = getUserById(userId);
  if (!user) return false;

  let now = new Date();
  let activeTill = new Date(user.activeTill || 0);

  return activeTill > now;
}

function activateUser(userId) {
  let users = getUsers();
  let user = users.find(u => u.userId === userId);
  if (!user) return;

  let now = new Date();
  let nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  user.activeTill = nextMonth.toISOString();
  user.isActive = true;
  user.status = "active";

  saveUsers(users);
}


// ===================================
// 🔹 HOLD INCOME SYSTEM
// ===================================
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

function releaseHoldIncome(userId) {
  let holds = JSON.parse(localStorage.getItem("holdIncome") || "[]");

  holds.forEach(h => {
    if (h.userId === userId && h.status === "HOLD") {

      if (isUserActive(userId)) {
        if (typeof creditWallet === "function") {
          creditWallet(userId, h.amount, "Released: " + h.reason);
        }
        h.status = "RELEASED";
      }
    }
  });

  localStorage.setItem("holdIncome", JSON.stringify(holds));
}


// ===================================
// 🔹 MONTHLY PROCESS
// ===================================
function monthlyProcess() {

  let users = getUsers();

  users.forEach(u => {

    releaseHoldIncome(u.userId);

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

function isSystemLocked() {
  return getSystemSettings().lockMode === true;
}


// ===================================
// 🔹 FINAL LOCK SYSTEM (ROLE BASED)
// ===================================
function checkSystemLock() {

  let settings = getSystemSettings();

  if (!settings.lockMode) return;

  let superSession = JSON.parse(localStorage.getItem("loggedInSuperAdmin"));
  if (superSession) return;

  let sysSession = JSON.parse(localStorage.getItem("loggedInSystemAdmin"));
  if (sysSession) return;

  document.body.innerHTML = "<h2>🚫 System Locked by Super Admin</h2>";
}


// ===================================
// 🔐 GLOBAL PAGE SECURITY (MASTER)
// ===================================
function protectPage(config) {

  let sessionKey = {
    super_admin: "loggedInSuperAdmin",
    system_admin: "loggedInSystemAdmin",
    admin: "loggedInAdmin",
    franchise: "loggedInFranchise",
    user: "loggedInUser"
  };

  let key = sessionKey[config.role];

  if (!key) {
    alert("🚫 Invalid role config");
    return;
  }

  let session = JSON.parse(localStorage.getItem(key));

  if (!session) {
    alert("🚫 Login required");
    window.location.href = config.role + "_login.html";
    return;
  }

  let user = getUserById(session.userId);

  if (!user || user.role !== config.role) {
    alert("🚫 Invalid session");
    localStorage.removeItem(key);
    window.location.href = config.role + "_login.html";
    return;
  }

  if (config.role !== "super_admin") {
    if (user.status !== "active") {
      alert("🚫 Account inactive");
      localStorage.removeItem(key);
      window.location.href = config.role + "_login.html";
      return;
    }
  }

  let s = getSystemSettings();

  if (config.role === "admin" && s.adminAccess === false) {
    alert("🚫 Admin access OFF by Super Admin");
    localStorage.removeItem(key);
    window.location.href = "admin_login.html";
    return;
  }

  if (config.role !== "super_admin" && s.lockMode === true) {
    alert("🚫 System locked by Super Admin");
    localStorage.removeItem(key);
    window.location.href = config.role + "_login.html";
    return;
  }

  if (config.role === "admin" && config.department) {
    if (user.type === "B") {
      let depts = user.departments || [];

      if (!depts.includes(config.department)) {
        alert("🚫 No permission for this page");
        window.location.href = "admin_dashboard.html";
        return;
      }
    }
  }

  return user;
}


// ===================================
// 🔹 BACKUP SYSTEM
// ===================================
function exportData() {

  let data = {
    users: localStorage.getItem("users"),
    systemSettings: localStorage.getItem("systemSettings")
  };

  let blob = new Blob([JSON.stringify(data)], { type: "application/json" });

  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "BWG_backup.json";
  a.click();
}

function importData(file) {
  if (!file) return alert("Select file");

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
// 🔹 INIT SYSTEM (MASTER FINAL)
// ===================================
function initCoreSystem() {

  enableCopyProtection();
  checkSystemLock();

  let users = getUsers();

  let settings = getSystemSettings();

  if (Object.keys(settings).length === 0) {

    settings = {
      lockMode: false,

      adminAccess: true,
      franchiseAccess: true,

      registrationOpen: true,
      upgradesOpen: true,

      finance: false,
      franchise: false,
      kyc: false
    };

    localStorage.setItem("systemSettings", JSON.stringify(settings));

    console.log("✅ Default System Settings Created");
  }

  let exists = users.find(u => u.role === "super_admin");

  if (!exists) {
    let superAdmin = {
      userId: "BWG000000",
      username: "Super Admin",
      password: btoa("123"),
      role: "super_admin",
      status: "active",
      createdAt: new Date().toISOString()
    };

    users.push(superAdmin);
    saveUsers(users);

    console.log("✅ Default Super Admin Created");
  }
}
