/*
========================================
SESSION MANAGER V2 (STABLE FIXED)
TEST SAFE FINAL
========================================
✔ No redirect loops
✔ Safe session handling
✔ No aggressive logout
✔ Dashboard stable support
✔ Test mode safe
========================================
*/

const SESSION_KEY = "APP_SESSION";

// ================= SAFE PARSE =================
function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ================= STORAGE HELPERS =================
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function setSession(user) {
  if (!user || !user.userId) return false;

  let sessionData = {
    userId: user.userId,
    role: user.role || "user",
    loginTime: Date.now()
  };

  safeSet(SESSION_KEY, sessionData);
  return true;
}

function getSession() {
  let session = safeGet(SESSION_KEY, null);

  if (!session || !session.userId) {
    return null;
  }

  return session;
}

// ================= GLOBAL LOCK =================
let SESSION_CHECK_LOCK = false;

// ================= CURRENT USER =================
function getCurrentUser() {
  if (SESSION_CHECK_LOCK) return null;
  SESSION_CHECK_LOCK = true;

  let session = getSession();

  if (!session) {
    SESSION_CHECK_LOCK = false;
    return null;
  }

  if (typeof getUserById !== "function") {
    SESSION_CHECK_LOCK = false;
    return null;
  }

  let user = getUserById(session.userId);

  SESSION_CHECK_LOCK = false;

  return user || null;
}

// ================= PAGE PROTECTION =================
function protectUserPage() {
  let user = getCurrentUser();

  // TEST MODE SAFE:
  // keep redirect logic
  // prevent self-loop if already on login page
  if (!user) {
    console.warn("Login required");

    let currentPage = (window.location.pathname || "").toLowerCase();

    if (!currentPage.includes("user_login.html")) {
      window.location.href = "user_login.html";
    }

    return null;
  }

  return user;
}

// ================= LOGOUT =================
function logoutSession() {
  clearSession();

  let currentPage = (window.location.pathname || "").toLowerCase();

  if (!currentPage.includes("user_login.html")) {
    window.location.href = "user_login.html";
  }
}
