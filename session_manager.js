 "use strict";

console.log(
  "[SESSION MANAGER VERSION CHECK]",
  "V4.1 FINAL FIXED",
  new Date().toISOString()
);

/*
========================================
SESSION MANAGER V4.1 FINAL (ENTERPRISE STABLE)
========================================
✔ One auth engine only
✔ One session source only
✔ Safe validation layer
✔ Expiry protection
✔ Multi-tab sync safe
✔ Role verification
✔ Tree access control integrated
✔ Crash-safe recovery
✔ Production stable
========================================
*/

// =====================
// CONFIG
// =====================
const SESSION_KEY = "APP_SESSION";
const SESSION_EVENT_KEY = "APP_SESSION_EVENT";
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// =====================
// CORE READY CHECK
// =====================
function isSessionCoreReady() {

  try {

    if (!window.__CORE_READY__) return false;
    if (typeof window.getUserById !== "function") return false;
    if (typeof localStorage === "undefined") return false;

    return true;

  } catch (e) {
    console.error("[SESSION CORE READY ERROR]", e);
    return false;
  }
}

// =====================
// STORAGE HELPERS (SAFE WRAP)
// =====================
function safeGet(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (_) {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

// =====================
// CLEAR SESSION
// =====================
function clearSessionStorage() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EVENT_KEY);
    sessionStorage.clear();
  } catch (_) {}
}

// =====================
// TOKEN GENERATOR
// =====================
function generateSessionToken(user) {

  if (!user || !user.userId) return null;

  return btoa([
    user.userId,
    user.role || "user",
    navigator.userAgent.length,
    window.location.host
  ].join("|"));
}

// =====================
// VALIDATION
// =====================
function isValidSessionShape(session) {

  if (!session || typeof session !== "object") return false;

  return !!(
    session.userId &&
    session.role &&
    session.loginTime &&
    session.lastActivity &&
    session.token
  );
}

// =====================
// EXPIRY CHECK
// =====================
function isSessionExpired(session) {
  if (!session?.lastActivity) return true;
  return (Date.now() - Number(session.lastActivity)) > SESSION_TIMEOUT;
}

// =====================
// TREE ACCESS CONTROL
// =====================
function getTreeAccessScope(session) {

  if (!session) return null;

  const role = String(session.role || "").toLowerCase();

  if (role === "user") {
    return {
      scope: "USER_TREE",
      view: "INTRODUCER_ONLY",
      maxLevel: 30
    };
  }

  if (role === "admin") {
    return {
      scope: "ADMIN_TREE",
      view: "FULL_SYSTEM"
    };
  }

  if (role === "super_admin") {
    return {
      scope: "SUPER_ADMIN_TREE",
      view: "UNRESTRICTED",
      auditMode: true
    };
  }

  return null;
}

// =====================
// SET SESSION
// =====================
function setSession(user) {

  try {

    if (!isSessionCoreReady()) return false;
    if (!user?.userId || !user?.role) return false;

    const now = Date.now();

    const sessionData = {
      userId: user.userId,
      role: user.role,
      loginTime: now,
      lastActivity: now,
      token: generateSessionToken(user),
      version: 4,
      initialized: true
    };

    safeSet(SESSION_KEY, sessionData);

    localStorage.setItem(
      SESSION_EVENT_KEY,
      JSON.stringify({
        type: "LOGIN",
        userId: user.userId,
        time: now
      })
    );

    return true;

  } catch (err) {
    console.error("[SESSION] setSession error:", err);
    clearSessionStorage();
    return false;
  }
}

// =====================
// DESTROY SESSION
// =====================
function destroySession() {

  try {

    const old = safeGet(SESSION_KEY, null);

    localStorage.setItem(
      SESSION_EVENT_KEY,
      JSON.stringify({
        type: "LOGOUT",
        userId: old?.userId || null,
        time: Date.now()
      })
    );

  } catch (_) {}

  clearSessionStorage();
}

// =====================
// GET SESSION (MAIN ENGINE)
// =====================
function getSession() {

  try {

    if (!isSessionCoreReady()) return null;

    const session = safeGet(SESSION_KEY, null);

    if (!isValidSessionShape(session)) {
      destroySession();
      return null;
    }

    if (isSessionExpired(session)) {
      destroySession();
      return null;
    }

    if (typeof window.getUserById !== "function") {
      return null;
    }

    let user;

    try {
      user = window.getUserById(session.userId);
    } catch (e) {
      return null;
    }

    if (!user) {
      destroySession();
      return null;
    }

    if (String(user.role || "") !== String(session.role || "")) {
      destroySession();
      return null;
    }

    const expectedToken = generateSessionToken(user);

    if (session.token !== expectedToken) {
      destroySession();
      return null;
    }

    session.lastActivity = Date.now();
    session.treeScope = getTreeAccessScope(session);

    safeSet(SESSION_KEY, session);

    return session;

  } catch (err) {
    console.error("[SESSION] getSession error:", err);
    destroySession();
    return null;
  }
}

// =====================
// CURRENT USER
// =====================
function getCurrentUser() {

  try {
    const session = getSession();
    if (!session) return null;

    return window.getUserById(session.userId);

  } catch (_) {
    return null;
  }
}

// =====================
// ROLE CHECK
// =====================
function hasRole(role) {

  const session = getSession();
  if (!session) return false;

  return String(session.role || "").toLowerCase() === String(role || "").toLowerCase();
}

// =====================
// AUTH CHECK
// =====================
function isAuthenticated() {
  return !!getSession();
}

// =====================
// LOGOUT
// =====================
function logoutSession() {
  destroySession();
  window.location.replace("user_login.html");
}

// =====================
// MULTI TAB SYNC
// =====================
window.addEventListener("storage", function (e) {

  try {

    if (e.key !== SESSION_EVENT_KEY) return;

    const eventData = JSON.parse(e.newValue || "{}");

    if (eventData?.type === "LOGOUT") {
      clearSessionStorage();
      window.location.replace("user_login.html");
    }

  } catch (_) {}
});

// =====================
// EXPORTS
// =====================
window.setSession = setSession;
window.getSession = getSession;
window.getCurrentUser = getCurrentUser;

window.logoutSession = logoutSession;
window.isAuthenticated = isAuthenticated;
window.hasRole = hasRole;
