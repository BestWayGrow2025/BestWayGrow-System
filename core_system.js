/* ===============================
   CORE SYSTEM (MASTER FINAL PRO++)
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

// 🔥 SAFE SYSTEM SETTINGS (FIXED)
function getSystemSettings() {
  try {
    let stored = JSON.parse(localStorage.getItem("systemSettings") || "{}");

    let defaults = {
      lockMode: false,
      adminAccess: true,
      franchiseAccess: true,
      registrationOpen: true
    };

    let merged = { ...defaults, ...stored };

    localStorage.setItem("systemSettings", JSON.stringify(merged));

    return merged;

  } catch {
    let clean = {
      lockMode: false,
      adminAccess: true,
      franchiseAccess: true,
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

  } while (
    existingIds.includes(newId) ||
    newId === "BWG000000"
  );

  return newId;
}

// ===================================
// 🔹 INTRODUCER VALIDATION
// ===================================
function isValidIntroducer(id) {
  if (!id) return false;

  let user = getUserById(id);
  if (!user) return false;

  if (user.role === "admin" || user.role === "super_admin") {
    return true;
  }

  return user.isActive === true;
}

// ===================================
// 🌳 TREE SYSTEM (SAFE)
// ===================================
let placementLock = false;

function findPositionBFS(sponsorId, position) {
  let users = getUsers();
  let queue = [sponsorId];
  let visited = new Set();

  while (queue.length > 0) {
    let current = queue.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    let children = users.filter(u => u.sponsorId === current);

    let left = children.find(c => c.position === "LEFT");
    let right = children.find(c => c.position === "RIGHT");

    if (position === "LEFT" && !left) return current;
    if (position === "RIGHT" && !right) return current;

    if (left) queue.push(left.userId);
    if (right) queue.push(right.userId);
  }

  return sponsorId;
}

function getSafeSponsor(sponsorId, position) {
  let finalSponsor = findPositionBFS(sponsorId, position);

  let users = getUsers();

  let exists = users.find(u =>
    u.sponsorId === finalSponsor &&
    u.position === position
  );

  if (exists) {
    finalSponsor = findPositionBFS(finalSponsor, position);
  }

  return finalSponsor;
}

// ===================================
// 🔥 FULL DOWNLINE
// ===================================
function getDownline(userId) {
  let users = getUsers();
  let result = [];

  function find(id) {
    let children = users.filter(u => u.sponsorId === id);

    children.forEach(child => {
      result.push(child);
      find(child.userId);
    });
  }

  find(userId);
  return result;
}

// ===================================
// 🔹 REGISTER USER (FINAL SAFE)
// ===================================
function registerUser(
  username,
  password,
  mobile,
  introducerId,
  sponsorId,
  position,
  role = "user"
) {

  let users = getUsers();

  if (!username || !password || !mobile) {
    alert("Fill all fields");
    return null;
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    alert("Invalid mobile");
    return null;
  }

  if (!isValidIntroducer(introducerId)) {
    alert("Invalid Introducer");
    return null;
  }

  if (!sponsorId || !position) {
    alert("Invalid tree input");
    return null;
  }

  let duplicate = users.find(u => u.mobile === mobile);
  if (duplicate) {
    alert("Mobile already exists");
    return null;
  }

  if (placementLock) {
    alert("System busy, try again...");
    return null;
  }

  placementLock = true;

  try {

    let pos = position === "L" ? "LEFT" : "RIGHT";

    let finalSponsor = getSafeSponsor(sponsorId, pos);

    let newUser = {
      userId: generateUserId(),
      username: username.trim(),
      password: btoa(password.trim()),
      role: role,
      mobile: mobile,
      introducerId: introducerId,
      sponsorId: finalSponsor,
      position: pos,
      createdAt: new Date().toISOString(),

      status: "active",
      isActive: true,

      wallet: 0,
      activeTill: null
    };

    users.push(newUser);
    saveUsers(users);

    return newUser;

  } catch (err) {
    console.error("Register error:", err);
    return null;
  } finally {
    placementLock = false;
  }
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
// 🔐 PAGE SECURITY (FIXED)
// ===================================
function protectPage(config) {

  const sessionKey = {
    super_admin: "loggedInSuperAdmin",
    system_admin: "loggedInSystemAdmin",
    admin: "loggedInAdmin",
    franchise: "loggedInFranchise",
    user: "loggedInUser"
  };

  let key = sessionKey[config.role];

  let raw = localStorage.getItem(key);
  let session = raw ? JSON.parse(raw) : null;

  if (!session || !session.userId) {
    alert("Login required");
    window.location.href = config.role + "_login.html";
    return;
  }

  let user = getUserById(session.userId);

  if (!user || user.role !== config.role) {
    localStorage.removeItem(key);
    window.location.href = config.role + "_login.html";
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
    alert("🚫 System is locked by Super Admin");
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
      status: "active",
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  // SYSTEM ADMIN
  if (!users.find(u => u.userId === "BWG000001")) {
    users.push({
      userId: "BWG000001",
      username: "System Admin",
      password: btoa("1234"),
      role: "admin",
      status: "active",
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  saveUsers(users);
}
