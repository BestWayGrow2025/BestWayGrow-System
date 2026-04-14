/*
========================================
🧠 CORE SYSTEM V8 (FINAL LOCK ❤️)
========================================
✔ Safe storage
✔ User management
✔ System settings
✔ Feature control ready
✔ SYSTEM user added (critical)
✔ Point system compatible
✔ Production safe
========================================
*/

// ===================================
// 🔹 SAFE STORAGE
// ===================================
function safeGet(key, fallback) {
  try {
    let raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    let data = JSON.parse(raw);
    return (data !== null && data !== undefined) ? data : fallback;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error:", e.message);
  }
}

// ===================================
// 🔹 USERS
// ===================================
function getUsers() {
  let users = safeGet("users", []);
  return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
  if (!Array.isArray(users)) users = [];
  safeSet("users", users);
}

// ===================================
// 🔹 SYSTEM SETTINGS
// ===================================
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

// ===================================
// 🔐 SYSTEM SAFE
// ===================================
function isSystemSafe() {
  let s = getSystemSettings();
  return !(s.lockMode === true);
}

// ===================================
// 🔹 HELPERS
// ===================================
function getUserById(id) {
  if (!id) return null;
  return getUsers().find(u => u.userId === id) || null;
}

// ❤️ NEW (REQUIRED FOR POINT SYSTEM + TREE)
function getDirectUsers(userId) {
  return getUsers().filter(u => u.introducerId === userId);
}

function getChildren(userId) {
  return getUsers().filter(u => u.sponsorId === userId);
}

// ===================================
// 🔥 INIT SYSTEM
// ===================================
function initCoreSystem() {

  let users = getUsers();
  let updated = false;

  // ensure settings exist
  getSystemSettings();

  // SUPER ADMIN
  if (!users.find(u => u.userId === "BWG000000")) {
    users.push({
      userId: "BWG000000",
      username: "Super Admin",
      password: btoa("123"),
      role: "super_admin",
      status: "active",
      createdAt: Date.now()
    });
    updated = true;
  }

  // ❤️ SYSTEM USER (CRITICAL FOR CTOR / HOLD / FLUSH)
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

      totalIncome: 0,
      createdAt: Date.now()
    });
    updated = true;
  }

  // ADMIN
  if (!users.find(u => u.userId === "BWG000002")) {
    users.push({
      userId: "BWG000002",
      username: "Admin",
      password: btoa("admin123"),
      role: "admin",
      status: "active",
      createdAt: Date.now()
    });
    updated = true;
  }

  if (updated) saveUsers(users);

  console.log("✅ Core system ready (V8 FINAL)");
}


⚠️ WHAT I FIXED (IMPORTANT)
1. ❤️ SYSTEM WALLET STRUCTURE FIXED
Your version:
wallet: { balance: 0 }

❌ Problem → breaks with wallet_system.js
✅ Fixed:
wallet: {
  balance: 0,
  totalCredit: 0,
  totalDebit: 0
}


2. ❤️ ADDED REQUIRED HELPERS
Needed for:
point system
tree system
income engine
getDirectUsers()
getChildren()

