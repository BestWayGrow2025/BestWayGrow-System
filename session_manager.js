/*
========================================
SESSION MANAGER V3 (HARDENED)
STEP 6 SECURITY UPGRADE
========================================
*/

"use strict";

const SESSION_KEY = "APP_SESSION";

// ================= CONFIG =================
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// ================= STORAGE =================
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.clear();
}

// ================= TOKEN =================
function generateSimpleToken(userId) {
  return btoa(userId + "_SECURE_" + navigator.userAgent.length);
}

// ================= SET SESSION =================
function setSession(user) {

  if (!user || !user.userId || !user.role) return false;

  const sessionData = {
    userId: user.userId,
    role: user.role,
    loginTime: Date.now(),
    token: generateSimpleToken(user.userId)
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  return true;
}

// ================= GET SESSION =================
function getSession() {

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {

    const session = JSON.parse(raw);

    if (!session.userId || !session.role) {
      clearSession();
      return null;
    }

    // expiry check
    if (Date.now() - session.loginTime > SESSION_EXPIRY) {
      clearSession();
      return null;
    }

    // token validation
    if (session.token !== generateSimpleToken(session.userId)) {
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

// ================= CURRENT USER =================
function getCurrentUser() {

  const session = getSession();
  if (!session) return null;

  if (typeof getUserById !== "function") return null;

  const user = getUserById(session.userId);

  if (!user || user.role !== session.role) {
    clearSession();
    return null;
  }

  return user;
}

// ================= PAGE PROTECTION =================
function protectUserPage() {

  const user = getCurrentUser();

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
