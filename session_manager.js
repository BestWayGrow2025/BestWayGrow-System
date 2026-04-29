const SESSION_KEY = "APP_SESSION";

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function setSession(user) {
  if (!user || !user.userId || !user.role) return false;

  let sessionData = {
    userId: user.userId,
    role: user.role,
    loginTime: Date.now()
  };

  safeSet(SESSION_KEY, sessionData);
  return true;
}

function getSession() {
  let session = safeGet(SESSION_KEY, null);

  if (!session || !session.userId || !session.role) {
    clearSession();
    return null;
  }

  return session;
}

function getCurrentUser() {
  let session = getSession();
  if (!session) return null;

  if (typeof getUserById !== "function") return null;

  let user = getUserById(session.userId);

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

function protectUserPage() {
  let user = getCurrentUser();

  if (!user) {
    alert("Login Required");
    window.location.href = "user_login.html";
    return null;
  }

  return user;
}

function logoutSession() {
  clearSession();
  window.location.href = "user_login.html";
}
