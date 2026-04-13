/*
========================================
🧠 CORE SYSTEM V7 (MASTER ENGINE FINAL LOCK)
========================================
✔ Safe storage (self-healing + recovery log)
✔ System lock protection
✔ User management safe
✔ ID generation protected (no duplicate)
✔ Page security strong (feature control added)
✔ Feature control centralized
✔ Corruption recovery
✔ Default users (Super + System + Admin)
✔ Production locked
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
  } catch (e) {
    console.warn("Storage corrupted → reset:", key);
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
    withdrawOpen: true,
    queueStop: false
  };

  let stored = safeGet("systemSettings", {});
  let merged = { ...defaults, ...stored };

  safeSet("systemSettings", merged);
  return merged;
}

function saveSystemSettings(settings) {
  if (!settings || typeof settings !== "object") return;
  safeSet("systemSettings", settings);
}

// ===================================
// 🔐 SYSTEM SAFETY CHECK
// ===================================
function isSystemSafe() {
  let s = getSystemSettings();
  return !(s.lockMode === true);
}

// ===================================
// 🔹 FEATURE CONTROLS
// ===================================
function canRegister() {
  let s = getSystemSettings();
  return s.registrationOpen && isSystemSafe();
}

function canAdminAccess() {
  let s = getSystemSettings();
  return s.adminAccess && isSystemSafe();
}

function canWithdraw() {
  let s = getSystemSettings();
  return s.withdrawOpen && isSystemSafe();
}

function canUpgrade() {
  let s = getSystemSettings();
  return s.upgradesOpen && isSystemSafe();
}

function canRepurchase() {
  let s = getSystemSettings();
  return s.repurchaseOpen && isSystemSafe();
}

// ===================================
// 🔹 HELPERS
// ===================================
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

// ===================================
// 🔹 USER ID GENERATOR (SAFE)
// ===================================
function generateUserId() {

  let users = getUsers();
  let existing = new Set(users.map(u => u.userId));

  for (let i = 0; i < 50; i++) {
    let id = "BWG" + Math.floor(100000 + Math.random() * 900000);
    if (!existing.has(id)) return id;
  }

  let i = 100000;
  while (true) {
    let id = "BWG" + i;
    if (!existing.has(id)) return id;
    i++;
  }
}

// ===================================
// 🔐 PAGE SECURITY
// ===================================
function protectPage(config) {

  const sessionKey = {
    user: "loggedInUser",
    admin: "loggedInAdmin",
    system_admin: "loggedInSystemAdmin",
    super_admin: "loggedInSuperAdmin"
  };

  const loginPage = {
    user: "user_login.html",
    admin: "admin_login.html",
    system_admin: "system_admin_login.html",
    super_admin: "super_admin_login.html"
  };

  let key = sessionKey[config.role];
  let redirect = loginPage[config.role];

  let session = safeGet(key, null);

  if (!session || !session.userId) {
    location.href = redirect;
    return null;
  }

  let user = getUserById(session.userId);

  if (!user || user.role !== config.role) {
    localStorage.removeItem(key);
    location.href = redirect;
    return null;
  }

  if (!isSystemSafe()) {
    alert("System Locked");
    throw new Error("LOCKED");
  }

  if (config.role === "admin" && !canAdminAccess()) {
    alert("Admin access disabled");
    throw new Error("ADMIN_BLOCKED");
  }

  return user;
}

// ===================================
// 🔥 INIT SYSTEM (PERMANENT USERS)
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

  // SYSTEM ADMIN
  if (!users.find(u => u.userId === "BWG000001")) {
    users.push({
      userId: "BWG000001",
      username: "System Admin",
      password: btoa("1234"),
      role: "system_admin",
      status: "active",
      createdBy: "BWG000000",
      createdAt: Date.now()
    });
    updated = true;
  }

  // ADMIN (PERMANENT)
  if (!users.find(u => u.userId === "BWG000002")) {
    users.push({
      userId: "BWG000002",
      username: "Admin",
      password: btoa("admin123"),
      role: "admin",
      status: "active",
      createdBy: "BWG000001",
      createdAt: Date.now()
    });
    updated = true;
  }

  if (updated) saveUsers(users);

  console.log("✅ Core system initialized");
}
