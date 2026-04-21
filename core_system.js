/*
========================================
CORE SYSTEM V8 (FINAL STABLE LOCK)
========================================
✔ Safe storage
✔ User management
✔ System settings
✔ SYSTEM user
✔ SYSTEM ADMIN reserved
✔ No syntax error
✔ No dependency break
✔ Login compatible
✔ Production safe
========================================
*/

// ================= SAFE STORAGE =================
function safeGet(key, fallback) {
  try {
    let raw = localStorage.getItem(key);

    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }

    let data = JSON.parse(raw);
    return (data !== null && data !== undefined) ? data : fallback;

  } catch (e) {
    console.error("safeGet error:", e.message);
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("safeSet error:", e.message);
  }
}

// ================= USERS =================
function getUsers() {
  let users = safeGet("users", []);
  return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
  if (!Array.isArray(users)) users = [];
  safeSet("users", users);
}

// ================= SYSTEM SETTINGS =================
function getSystemSettings() {

  let defaults = {
    lockMode: false,
    registrationOpen: true,
    adminAccess: true,
    upgradesOpen: true,
    repurchaseOpen: true,
    withdrawOpen: true
  };

  let stored = safeGet("systemSettings", {});
  let merged = { ...defaults, ...stored };

  safeSet("systemSettings", merged);
  return merged;
}

// ================= SYSTEM SAFE =================
function isSystemSafe() {
  let s = getSystemSettings();
  return !(s.lockMode === true);
}

// ================= HELPERS =================
function getUserById(id) {
  if (!id) return null;
  return getUsers().find(u => u.userId === id) || null;
}

function getDirectUsers(userId) {
  return getUsers().filter(u => u.introducerId === userId);
}

function getChildren(userId) {
  return getUsers().filter(u => u.sponsorId === userId);
}

// ================= INIT =================
function initCoreSystem() {

  try {

    let users = getUsers();
    let updated = false;

    // ensure settings
    getSystemSettings();

    // ================= HIDDEN SUPER ADMIN =================
    if (!users.find(u => u.userId === "SUPERADMIN")) {
      users.push({
        userId: "SUPERADMIN",
        username: "Super Admin",
        password: btoa("123"),
        role: "super_admin",
        status: "active",

        visibleInTree: false,
        allowReferral: false,

        officeType: "super_admin",
        accessType: "full",

        createdAt: Date.now()
      });
      updated = true;
    }

    // ================= SYSTEM ADMIN =================
    if (!users.find(u => u.userId === "BWG000001")) {
      users.push({
        userId: "BWG000001",
        username: "System Admin",
        password: btoa("123456"),
        role: "system_admin",
        status: "active",

        visibleInTree: false,
        allowReferral: false,

        officeType: "system_admin",
        accessType: "full",

        createdBy: "SUPERADMIN",
        createdAt: Date.now()
      });
      updated = true;
    }

    // ================= ROOT ADMIN =================
    if (!users.find(u => u.userId === "BWG000000")) {
      users.push({
        userId: "BWG000000",
        username: "Root Admin",
        password: btoa("123456"),
        role: "admin",
        status: "active",

        officeType: "root_admin",
        accessType: "zero_only_link",

        visibleInTree: true,
        allowReferral: true,

        leftChild: "",
        rightChild: "",

        parentId: "",
        sponsorId: "",
        introducerId: "",

        position: "",

        createdBy: "BWG000001",
        createdAt: Date.now()
      });
      updated = true;
    }

    // ================= REMOVE OLD SYSTEM ADMIN / ADMIN =================
users = users.filter(u =>
  u.userId !== "BWG000002" &&
  u.userId !== "BWG000003"
);

updated = true;

    // ================= SYSTEM USER =================
    if (!users.find(u => u.userId === "SYSTEM")) {
      users.push({
        userId: "SYSTEM",
        username: "System Pool",
        role: "system",
        status: "active",

        visibleInTree: false,
        allowReferral: false,

        wallet: {
          balance: 0,
          totalCredit: 0,
          totalDebit: 0
        },

        totalIncome: 0,
        createdAt: Date.now()
      });
      updated = true;
    }

    if (updated) {
      saveUsers(users);
    }

    console.log("✅ Core system initialized");

  } catch (e) {
    console.error("❌ initCoreSystem failed:", e.message);
  }
}

// ================= SAVE SETTINGS =================
function saveSystemSettings(settings) {
  localStorage.setItem("systemSettings", JSON.stringify(settings));
}


