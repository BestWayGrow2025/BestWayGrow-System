/*
========================================
SESSION MANAGER V3 (HARDENED)
STEP 6 SECURITY UPGRADE
========================================
*/

const SESSION_KEY = "APP_SESSION";

// ================= CONFIG =================
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// ================= STORAGE =================
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.clear();
}

// ================= SET SESSION =================
function setSession(user) {

  if (!user || !user.userId || !user.role) {
    return false;
  }

  const sessionData = {
    userId: user.userId,
    role: user.role,
    loginTime: Date.now(),
    token: generateSimpleToken(user.userId)
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(sessionData)
  );

  return true;
}

// ================= GET SESSION (HARD VALIDATION) =================
function getSession() {

  let raw = localStorage.getItem(SESSION_KEY);

  if (!raw) return null;

  try {

    let session = JSON.parse(raw);

    if (!session.userId || !session.role) {
      clearSession();
      return null;
    }

    // EXPIRY CHECK
    if (
      Date.now() - session.loginTime > SESSION_EXPIRY
    ) {
      clearSession();
      return null;
    }

    // TOKEN CHECK (basic tamper protection)
    if (
      session.token !== generateSimpleToken(session.userId)
    ) {
      clearSession();
      return null;
    }

    return session;

  } catch (e) {

    console.error("Session parse error:", e);

    clearSession();

    return null;
  }
}

// ================= USER =================
function getCurrentUser() {

  let session = getSession();

  if (!session) return null;

  if (typeof getUserById !== "function") {
    return null;
  }

  let user = getUserById(session.userId);

  if (!user || user.role !== session.role) {
    clearSession();
    return null;
  }

  return user;
}

// ================= PROTECTION =================
function protectUserPage() {

  let user = getCurrentUser();

  if (!user) {

    window.location.replace("user_login.html");

    return null;
  }

  return user;
}

// ================= LOGOUT =================
function logoutSession() {

  clearSession();

  window.location.replace("user_login.html");
}

// ================= SIMPLE TOKEN =================
function generateSimpleToken(userId) {

  return btoa(
    userId + "_SECURE_" + navigator.userAgent.length
  );
}
