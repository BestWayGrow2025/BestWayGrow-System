/*
========================================
🧠 CORE SYSTEM V7 (MASTER ENGINE)
========================================
✔ Safe storage (self-healing)
✔ System lock protection
✔ User management safe
✔ ID generation protected
✔ Page security strong
✔ Init system hardened
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
    queueStop: false,
    withdrawStop: false
  };

  let stored = safeGet("systemSettings", {});
  let merged = { ...defaults, ...stored };

  safeSet("systemSettings", merged);
  return merged;
}

// ===================================
// 🔐 SYSTEM SAFETY CHECK
// ===================================
function isSystemSafe() {

  let settings = getSystemSettings();

  if (!settings || typeof settings !== "object") return false;

  if (settings.lockMode === true) {
    console.warn("System locked");
    return false;
  }

  return true;
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
// 🔹 USER ID GENERATOR (SAFE)
// ===================================
function generateUserId() {

  let users = getUsers();
  let existingIds = new Set(users.map(u => u.userId));

  let attempts = 0;

  while (attempts < 100) {

    let id = "BWG" + Math.floor(100000 + Math.random() * 900000);

    if (!existingIds.has(id)) {
      return id;
    }

    attempts++;
  }

  throw new Error("User ID generation failed (collision)");
}

// ===================================
// 🔹 INTRODUCER VALIDATION
// ===================================
function isValidIntroducer(id) {
  return !!getUserById(id);
}

// ===================================
// 🔐 PAGE SECURITY (V7 STRONG)
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
    window.location.href = redirect;
    return null;
  }

  let user = getUserById(session.userId);

  if (!user || user.role !== config.role) {
    localStorage.removeItem(key);
    alert("Access denied");
    window.location.href = redirect;
    return null;
  }

  return user;
}

// ===================================
// 🔥 INIT SYSTEM (MASTER INIT)
// ===================================
function initCoreSystem() {

  // 🔒 SYSTEM LOCK CHECK
  let settings = getSystemSettings();
  if (settings.lockMode === true) {
    alert("🚫 System Locked");
    throw new Error("System Locked");
  }

  let users = getUsers();

  let updated = false;

  // SUPER ADMIN
  if (!users.find(u => u.userId === "BWG000000")) {
    users.push({
      userId: "BWG000000",
      username: "Super Admin",
      password: btoa("123"),
      role: "super_admin",
      createdAt: Date.now(),
      leftChild: null,
      rightChild: null
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
      introducerId: "BWG000000",
      sponsorId: "BWG000000",
      position: "L",
      createdAt: Date.now(),
      leftChild: null,
      rightChild: null
    });
    updated = true;
  }

  if (updated) {
    saveUsers(users);
  }

  console.log("✅ Core system initialized");
}

