/*
========================================
SESSION MANAGER V8.1 CLEAN FINAL LOCK
========================================
✔ Multi-role session support
✔ Conflict auto-cleanup
✔ Strong validation
✔ Legacy sync fixed
✔ Safe parsing
✔ Page protection improved
✔ Production ready
========================================
*/

// ================= SESSION KEYS =================
const SESSION_KEYS = {
  super_admin: "loggedInSuperAdmin",
  system_admin: "loggedInSystemAdmin",
  admin: "loggedInAdmin",
  user: "loggedInUser",
  legacy: "appSession"
};

// ================= SAFE PARSE =================
function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ================= GET KEY =================
function getSessionKeyByRole(role) {
  return SESSION_KEYS[role] || null;
}

// ================= CLEAR SESSION =================
function clearSession() {
  Object.values(SESSION_KEYS).forEach(k => localStorage.removeItem(k));
}

// ================= SAVE SESSION =================
function setSession(user) {

  if (!user || !user.userId || !user.role) return false;

  clearSession();

  let key = getSessionKeyByRole(user.role);
  if (!key) return false;

  let sessionData = {
    userId: user.userId,
    username: user.username || "",
    role: user.role,
    loginTime: Date.now()
  };

  localStorage.setItem(key, JSON.stringify(sessionData));

  // legacy sync
  localStorage.setItem(SESSION_KEYS.legacy, JSON.stringify(sessionData));

  return true;
}

// ================= GET ACTIVE SESSION =================
function getSession() {

  let foundSession = null;

  for (let role in SESSION_KEYS) {

    if (role === "legacy") continue;

    let key = SESSION_KEYS[role];
    let raw = localStorage.getItem(key);
    if (!raw) continue;

    let session = safeParse(raw);

    if (
      session &&
      session.userId &&
      session.role === role
    ) {
      // keep only one valid session
      if (!foundSession) {
        foundSession = session;
      } else {
        localStorage.removeItem(key); // remove duplicate session
      }
    } else {
      localStorage.removeItem(key); // cleanup invalid
    }
  }

  // fallback legacy
  if (!foundSession) {
    let legacy = safeParse(localStorage.getItem(SESSION_KEYS.legacy));

    if (legacy && legacy.userId && legacy.role) {
      return legacy;
    }
  }

  return foundSession;
}

// ================= REDIRECT =================
function getLoginRedirect(role) {
  if (role === "super_admin") return "super_admin_login.html";
  if (role === "system_admin") return "system_admin_login.html";
  if (role === "admin") return "admin_login.html";
  if (role === "user") return "user_login.html";
  return "index.html";
}

// ================= PAGE PROTECTION =================
function protectPage(config = {}) {

  let session = getSession();

  if (!session) {
    alert("Login Required");
    window.location.href = config.redirect || "index.html";
    return null;
  }

  let allowedRoles = config.role || [];

  if (!Array.isArray(allowedRoles)) {
    allowedRoles = [allowedRoles];
  }

  if (allowedRoles.length && !allowedRoles.includes(session.role)) {
    alert("Access Denied");
    window.location.href = getLoginRedirect(session.role);
    return null;
  }

  // 🔒 LIVE USER VALIDATION
  if (typeof getUserById === "function") {
    let user = getUserById(session.userId);

    if (!user) {
      clearSession();
      alert("User not found");
      window.location.href = "index.html";
      return null;
    }

    if (user.status && user.status !== "active") {
      clearSession();
      alert("Account inactive");
      window.location.href = getLoginRedirect(user.role);
      return null;
    }
  }

  return session;
}

// ================= ROLE CHECK =================
function hasRole(role) {
  let session = getSession();
  if (!session) return false;

  return Array.isArray(role)
    ? role.includes(session.role)
    : session.role === role;
}

// ================= LOGOUT =================
function logoutSession() {
  clearSession();
  window.location.href = "index.html";
}
