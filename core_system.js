/* ===============================
   CORE SYSTEM (FINAL CLEAN)
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

// ===================================
// 🔹 SYSTEM SETTINGS
// ===================================
function getSystemSettings() {
  try {
    let stored = JSON.parse(localStorage.getItem("systemSettings") || "{}");

    let defaults = {
      lockMode: false,
      registrationOpen: true
    };

    let merged = { ...defaults, ...stored };
    localStorage.setItem("systemSettings", JSON.stringify(merged));

    return merged;

  } catch {
    let clean = {
      lockMode: false,
      registrationOpen: true
    };

    localStorage.setItem("systemSettings", JSON.stringify(clean));
    return clean;
  }
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

// ⚠️ IMPORTANT → used in tree UI
function getChildren(userId) {
  return getUsers().filter(u => u.sponsorId === userId);
}

// ===================================
// 🔹 USER ID GENERATOR (SAFE)
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

  let user = getUserById(id);
  if (!user) return false;

  return true;
}

// ===================================
// 🔐 PAGE SECURITY
// ===================================
function protectPage(config) {

  const sessionKey = {
    user: "loggedInUser"
  };

  let key = sessionKey[config.role];

  let raw = localStorage.getItem(key);
  let session = raw ? JSON.parse(raw) : null;

  if (!session || !session.userId) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  let user = getUserById(session.userId);

  if (!user) {
    localStorage.removeItem(key);
    window.location.href = "user_login.html";
    return;
  }

  return user;
}

// ===================================
// 🔹 INIT SYSTEM
// ===================================
function initCoreSystem() {

  let settingsCheck = getSystemSettings();

  if (settingsCheck.lockMode === true) {
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

      // 🔥 IMPORTANT
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
      role: "admin",
      introducerId: "BWG000000",
      sponsorId: "BWG000000",
      position: "L",
      createdAt: Date.now(),

      // 🔥 IMPORTANT
      leftChild: null,
      rightChild: null
    });
  }

  saveUsers(users);
}

