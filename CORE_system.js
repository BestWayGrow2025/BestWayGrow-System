/* ===============================
   CORE SYSTEM (MASTER FINAL + TREE SAFE)
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

// ===================================
// 🌳 TREE SYSTEM (AUTO + SAFE)
// ===================================

// 🔍 Find bottom position (LEFT / RIGHT)
function findPosition(sponsorId, position) {

  let users = getUsers();

  function findSlot(parentId) {

    let children = users.filter(u => u.sponsorId === parentId);

    let left = children.find(c => c.position === "LEFT");
    let right = children.find(c => c.position === "RIGHT");

    if (position === "LEFT") {
      if (!left) return parentId;
      return findSlot(left.userId);
    }

    if (position === "RIGHT") {
      if (!right) return parentId;
      return findSlot(right.userId);
    }
  }

  return findSlot(sponsorId);
}

// 🔐 Safe placement (ANTI-CONFLICT)
function getSafeSponsor(sponsorId, position) {

  let finalSponsor = findPosition(sponsorId, position);

  let users = getUsers();

  let exists = users.find(u =>
    u.sponsorId === finalSponsor &&
    u.position === position
  );

  if (exists) {
    finalSponsor = findPosition(finalSponsor, position);
  }

  return finalSponsor;
}

// ===================================
// 🔹 REGISTER (UPDATED WITH TREE)
// ===================================
function registerUser(username, password, introducerId, sponsorId, position, role = "user") {

  let users = getUsers();

  if (!username || !password) {
    alert("Fill all fields");
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

  // 🔥 AUTO TREE PLACEMENT
  let finalSponsor = getSafeSponsor(sponsorId, position);

  let newUser = {
    userId: generateUserId(),
    username: username.trim(),
    password: btoa(password.trim()),
    role: role,

    introducerId: introducerId,
    sponsorId: finalSponsor,
    position: position,

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
// 🔹 SECURITY
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

// ===================================
// 🔐 PAGE SECURITY
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
  let session = JSON.parse(localStorage.getItem(key));

  if (!session) {
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

  enableCopyProtection();

  let users = getUsers();
  let settings = getSystemSettings();

  if (Object.keys(settings).length === 0) {
    settings = {
      lockMode: false,
      adminAccess: true,
      franchiseAccess: true,
      registrationOpen: true
    };

    localStorage.setItem("systemSettings", JSON.stringify(settings));
  }

  let exists = users.find(u => u.role === "super_admin");

  if (!exists) {
    users.push({
      userId: "BWG000000",
      username: "Super Admin",
      password: btoa("123"),
      role: "super_admin",
      status: "active",
      createdAt: new Date().toISOString()
    });

    saveUsers(users);
  }
}
