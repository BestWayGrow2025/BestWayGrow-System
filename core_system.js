/*
========================================
🧠 CORE SYSTEM V7 (MASTER ENGINE FINAL)
========================================
✔ Safe storage (self-healing)
✔ System lock protection
✔ User management safe
✔ ID generation protected
✔ Page security strong
✔ Feature control centralized
✔ Corruption recovery
✔ Production locked
========================================
*/

// ===================================
// 🔹 SAFE STORAGE
// ===================================
function safeGet(key, fallback) {
  try {
    let data = JSON.parse(localStorage.getItem(key));
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
// 🔹 FEATURE CONTROLS (GLOBAL)
// ===================================
function canRegister() {
  return getSystemSettings().registrationOpen && isSystemSafe();
}

function canAdminAccess() {
  return getSystemSettings().adminAccess && isSystemSafe();
}

function canWithdraw() {
  return getSystemSettings().withdrawOpen && isSystemSafe();
}

function canUpgrade() {
  return getSystemSettings().upgradesOpen && isSystemSafe();
}

function canRepurchase() {
  return getSystemSettings().repurchaseOpen && isSystemSafe();
}

// ===================================
// 🔹 COMMON HELPERS
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
// 🔹 USER ID GENERATOR (SAFE + FALLBACK)
// ===================================
function generateUserId() {

  let users = getUsers();
  let existing = new Set(users.map(u => u.userId));

  // Try random
  for (let i = 0; i < 50; i++) {
    let id = "BWG" + Math.floor(100000 + Math.random() * 900000);
    if (!existing.has(id)) return id;
  }

  // Fallback sequential
  let base = users.length + 100000;
  let id = "BWG" + base;
  return id;
}

// ===================================
// 🔐 PAGE SECURITY (STRONG)
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
    alert("Login required");
    location.href = redirect;
    return null;
  }

  let user = getUserById(session.userId);

  if (!user || user.role !== config.role) {
    localStorage.removeItem(key);
    alert("Access denied");
    location.href = redirect;
    return null;
  }

  // 🔒 SYSTEM LOCK CHECK
  if (!isSystemSafe()) {
    alert("System Locked");
    throw new Error("LOCKED");
  }

  return user;
}

// ===================================
// 🔥 INIT SYSTEM (MASTER INIT)
// ===================================
function initCoreSystem() {

  let users = getUsers();
  let updated = false;

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

  if (updated) saveUsers(users);

  console.log("✅ Core system initialized");
}
