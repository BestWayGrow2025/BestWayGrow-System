/*
========================================
SESSION MANAGER V2
STABLE FINAL FIXED
PRODUCTION SAFE
========================================
*/

const SESSION_KEY = "APP_SESSION";

// ================= STORAGE HELPERS =================
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function setSession(user) {

  if (!user || !user.userId) {
    return false;
  }

  let sessionData = {
    userId: user.userId,
    role: user.role || "user",
    loginTime: Date.now()
  };

  safeSet(SESSION_KEY, sessionData);

  return true;
}

function getSession() {

  let session =
    safeGet(SESSION_KEY, null);

  if (!session || !session.userId) {
    return null;
  }

  return session;
}

// ================= SESSION LOCK =================
let SESSION_CHECK_LOCK = false;

// ================= CURRENT USER =================
function getCurrentUser() {

  if (SESSION_CHECK_LOCK) {
    return null;
  }

  SESSION_CHECK_LOCK = true;

  try {

    let session = getSession();

    if (!session) {
      return null;
    }

    if (typeof getUserById !== "function") {
      return null;
    }

    return getUserById(session.userId);

  } catch (e) {

    console.error(
      "getCurrentUser error:",
      e.message
    );

    return null;

  } finally {

    SESSION_CHECK_LOCK = false;
  }
}

// ================= PAGE PROTECTION =================
function protectUserPage() {

  let user = getCurrentUser();

  if (!user) {

    let currentPage =
      (window.location.pathname || "")
      .toLowerCase();

    if (
      !currentPage.includes("user_login.html")
    ) {

      window.location.href =
        "user_login.html";
    }

    return null;
  }

  return user;
}

// ================= LOGOUT =================
function logoutSession() {

  clearSession();

  let currentPage =
    (window.location.pathname || "")
    .toLowerCase();

  if (
    !currentPage.includes("user_login.html")
  ) {

    window.location.href =
      "user_login.html";
  }
}
}
