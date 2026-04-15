/*
========================================
SESSION MANAGER V8 FINAL LOCK
========================================
✔ Multi-role session support
✔ Backward compatible
✔ Session migration safe
✔ Invalid session cleanup
✔ Page protection
✔ Flexible redirect support
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

// ================= SAVE SESSION =================
function setSession(user) {

  if (!user || !user.userId || !user.role) return false;

  clearSession();

  let key = getSessionKeyByRole(user.role);

  if (!key) return false;

  let sessionData = {
    userId: user.userId,
    role: user.role,
    loginTime: Date.now()
  };

  localStorage.setItem(key, JSON.stringify(sessionData));

  // legacy support
  localStorage.setItem(SESSION_KEYS.legacy, JSON.stringify(sessionData));

  return true;
}

// ================= GET KEY =================
function getSessionKeyByRole(role) {
  if (role === "super_admin") return SESSION_KEYS.super_admin;
  if (role === "system_admin") return SESSION_KEYS.system_admin;
  if (role === "admin") return SESSION_KEYS.admin;
  if (role === "user") return SESSION_KEYS.user;
  return null;
}

// ================= GET ACTIVE SESSION =================
function getSession() {
  
  let keys = [
    SESSION_KEYS.super_admin,
    SESSION_KEYS.system_admin,
    SESSION_KEYS.admin,
    SESSION_KEYS.user
  ];

  for (let key of keys) {
    try {
      let raw = localStorage.getItem(key);
      if (!raw) continue;

      let session = JSON.parse(raw);

      if (
        session &&
        typeof session === "object" &&
        session.userId &&
        session.role
      ) {
        return session;
      }
    } catch (err) {
      localStorage.removeItem(key);
    }
  }

  // legacy fallback only if no active role session found
  try {
    let legacyRaw = localStorage.getItem(SESSION_KEYS.legacy);

    if (legacyRaw) {
      let legacySession = JSON.parse(legacyRaw);

      if (
        legacySession &&
        typeof legacySession === "object" &&
        legacySession.userId &&
        legacySession.role
      ) {
        return legacySession;
      }
    }
  } catch (err) {
    localStorage.removeItem(SESSION_KEYS.legacy);
  }

  return null;
}
  for (let key of keys) {
    try {
      let raw = localStorage.getItem(key);
      if (!raw) continue;

      let session = JSON.parse(raw);

      if (
        session &&
        typeof session === "object" &&
        session.userId &&
        session.role
      ) {
        return session;
      }
    } catch (err) {
      localStorage.removeItem(key);
    }
  }

  return null;
}

// ================= CLEAR SESSION =================
function clearSession() {
  localStorage.removeItem(SESSION_KEYS.super_admin);
  localStorage.removeItem(SESSION_KEYS.system_admin);
  localStorage.removeItem(SESSION_KEYS.admin);
  localStorage.removeItem(SESSION_KEYS.user);
  localStorage.removeItem(SESSION_KEYS.legacy);
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

    let fallback = config.redirect || "index.html";
    window.location.href = fallback;
    return null;
  }

  let allowedRoles = config.role || [];

  if (!Array.isArray(allowedRoles)) {
    allowedRoles = [allowedRoles];
  }

  if (allowedRoles.length && !allowedRoles.includes(session.role)) {
    alert("Access Denied");

    let redirectPage = getLoginRedirect(session.role);
    window.location.href = redirectPage;
    return null;
  }

  // optional live user validation
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

  if (Array.isArray(role)) {
    return role.includes(session.role);
  }

  return session.role === role;
}

// ================= LOGOUT =================
function logoutSession() {
  clearSession();
  window.location.href = "index.html";
}
