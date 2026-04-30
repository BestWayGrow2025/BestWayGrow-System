/*
========================================
CORE SYSTEM V8 (FINAL STABLE LOCK - FIXED)
========================================
*/

// ================= SAFE STORAGE =================
function safeGet(key, fallback) {
  try {
    let raw = localStorage.getItem(key);

    if (!raw) return fallback;

    let data = JSON.parse(raw);
    return (data !== null && data !== undefined) ? data : fallback;

  } catch (e) {
    console.error("safeGet error:", e.message);
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
  if (!Array.isArray(users)) return false;
  safeSet("users", users);
  return true;
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
  let s = getSystemSettings() || {};
  let session = null;

  try {
    if (typeof getSession === "function") {
      session = getSession();
    }
  } catch (e) {}

  if (
    s.lockMode === true &&
    session &&
    session.role !== "super_admin"
  ) {
    alert("System Locked");
    return false;
  }

  return true;
}

// ================= HELPERS =================
function getUserById(id) {
  if (!id) return null;
  return getUsers().find(u => u.userId === id) || null;
}

function getDirectUsers(userId) {
  if (!userId) return [];
  return getUsers().filter(u => u.introducerId === userId);
}

function getChildren(userId) {
  if (!userId) return [];
  return getUsers().filter(u => u.sponsorId === userId);
}

// ================= INIT =================
function initCoreSystem() {
  try {
    let users = getUsers();
    let updated = false;

    users.forEach(u => {
      if (!u.status) u.status = "active";
      if (!u.accountStatus) u.accountStatus = "active";
      if (!u.blockStatus) u.blockStatus = "unblocked";

      if (u.userId === "BWG000000") {
        u.username = "User Root Admin";
        u.role = "admin";
        u.adminType = "user_root_admin";
        u.tree = "field";
        u.accessType = "full_user_tree_control";
        u.visibleInTree = true;
        u.allowReferral = true;
        updated = true;
      }

      if (u.userId === "BWG000001") {
        u.username = "System Admin";
        u.role = "system_admin";
        u.hiddenAccount = true;
        updated = true;
      }

      if (
        u.userId === "SUPERADMIN" ||
        u.userId === "BWG000001" ||
        u.userId === "SYSTEM"
      ) {
        u.hiddenAccount = true;
      }
    });

    // SYSTEM USERS
    if (!users.find(u => u.userId === "SUPERADMIN")) {
      users.push({
        userId: "SUPERADMIN",
        username: "Super Admin",
        password: btoa("123"),
        role: "super_admin",
        status: "active",
        createdAt: Date.now()
      });
    }

    if (!users.find(u => u.userId === "BWG000001")) {
      users.push({
        userId: "BWG000001",
        username: "System Admin",
        password: btoa("123456"),
        role: "system_admin",
        status: "active",
        createdAt: Date.now()
      });
    }

    if (!users.find(u => u.userId === "BWG000000")) {
      users.push({
        userId: "BWG000000",
        username: "User Root Admin",
        password: btoa("123456"),
        role: "admin",
        status: "active",
        introducerId: "",
        sponsorId: "",
        createdAt: Date.now()
      });
    }

    if (!users.find(u => u.userId === "SYSTEM")) {
      users.push({
        userId: "SYSTEM",
        username: "System Pool",
        role: "system",
        status: "active",
        wallet: {
          balance: 0,
          totalCredit: 0,
          totalDebit: 0
        },
        createdAt: Date.now()
      });
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
  safeSet("systemSettings", settings);
}
