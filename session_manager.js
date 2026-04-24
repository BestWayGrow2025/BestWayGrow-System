/*
========================================
SESSION MANAGER FINAL LOCK (QUEUE ALIGNED)
========================================
✔ Single source of truth
✔ Role + Status validation
✔ Dashboard safe access
✔ Multi-tab safe
✔ Clean + minimal (NO mismatch)
✔ Production LOCKED
========================================
*/

// ================= SESSION KEY =================
const SESSION_KEY = "APP_SESSION";

// ================= SAFE PARSE =================
function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ================= CLEAR =================
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ================= SET SESSION =================
function setSession(user) {

  if (!user || !user.userId || !user.role) return false;

  let sessionData = {
    userId: user.userId,
    role: user.role,
    loginTime: Date.now()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

  return true;
}

// ================= GET SESSION =================
function getSession() {

  let raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  let session = safeParse(raw);

  if (!session || !session.userId || !session.role) {
    clearSession();
    return null;
  }

  return session;
}

// ================= GET CURRENT USER =================
function getCurrentUser() {

  let session = getSession();
  if (!session) return null;

  if (typeof getUserById !== "function") return null;

  let user = getUserById(session.userId);

  // 🔒 STRICT VALIDATION (FINAL RULE)
  if (!user) {
    clearSession();
    return null;
  }

  if (user.role !== "user") {
    clearSession();
    return null;
  }

  if (user.status !== "active") {
    clearSession();
    return null;
  }

  return user;
}

// ================= PROTECT PAGE =================
function protectUserPage() {

  let user = getCurrentUser();

  if (!user) {
    alert("Login Required");
    window.location.href = "user_login.html";
    return null;
  }

  return user;
}

// ================= LOGOUT =================
function logoutSession() {
  clearSession();
  window.location.href = "user_login.html";
}
