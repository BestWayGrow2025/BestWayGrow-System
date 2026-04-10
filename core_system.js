/* ===============================
   CORE SYSTEM V2 (MASTER FINAL)
=============================== */

// ===================================
// 🔹 SAFE STORAGE HELPERS
// ===================================
function safeGet(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function safeSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===================================
// 🔹 USERS
// ===================================
function getUsers() {
  return safeGet("users", []);
}

function saveUsers(users) {
  safeSet("users", users);
}

// ===================================
// 🔹 SYSTEM SETTINGS (EXPANDED)
// ===================================
function getSystemSettings() {

  let defaults = {
    lockMode: false,
    registrationOpen: true,
    adminAccess: true,
    upgradesOpen: true,
    repurchaseOpen: true,
    queueStop: false
  };

  let stored = safeGet("systemSettings", {});
  let merged = { ...defaults, ...stored };

  safeSet("systemSettings", merged);
  return merged;
}

// ===================================
// 🔹 ACTIVITY LOG SYSTEM (NEW)
// ===================================
function getLogs() {
  return safeGet("activityLogs", []);
}

function addLog(action, userId) {
  let logs = getLogs();

  logs.push({
    action,
    userId,
    time: new Date().toISOString()
  });

  safeSet("activityLogs", logs);
}

// ===================================
// 🔹 COMMON HELPERS
// ===================================
function getUserById(id) {
  return getUsers().find(u => u.userId === id);
}

function getDirectUsers(userId) {
  return getUsers().filter(u => u.introducerId === userId);
}

function getChildren(userId) {
  return getUsers().filter(u => u.sponsorId === userId);
}

// ===================================
// 🔹 USER ID GENERATOR
// ===================================
function generateUserId() {

  let users = getUsers();
  let existingIds = users.map(u => u.userId);

  let newId;
  let attempts = 0;

  do {
    let randomNum = Math.floor(100000 + Math.random() * 900000);
    newId = "BWG" + randomNum;
    attempts++;

    if (attempts > 50) {
      throw new Error("User ID generation failed");
    }

  } while (existingIds.includes(newId));

  return newId;
}

// ===================================
// 🔹 INTRODUCER VALIDATION
// ===================================
function isValidIntroducer(id) {
  if (!id) return false;
  return !!getUserById(id);
}

// ===================================
// 🔐 PAGE SECURITY (IMPROVED)
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
// 🔹 INIT SYSTEM (MASTER INIT)
// ===================================
function initCoreSystem() {

  let settings = getSystemSettings();

  if (settings.lockMode === true) {
    alert("🚫 System Locked");
    throw new Error("System Locked");
  }

  let users = getUsers();

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
  }

  saveUsers(users);
}


