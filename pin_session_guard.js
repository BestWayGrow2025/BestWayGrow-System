"use strict";

/*
========================================
PIN SESSION GUARD V1.0
========================================
✔ Session validation layer
✔ Current user resolver
✔ Role resolver
✔ UserId resolver
✔ NO routing logic
✔ NO UI logic
✔ NO execution logic
✔ Single responsibility only
✔ Production LOCKED
========================================
*/

// ================= CURRENT USER =================
function getPinSessionUser() {

  try {

    if (typeof getCurrentUser !== "function") {
      return null;
    }

    const user = getCurrentUser();

    if (!user || typeof user !== "object") {
      return null;
    }

    return user;

  } catch (_) {

    return null;
  }
}

// ================= SESSION VALID =================
function isPinSessionValid() {

  const user = getPinSessionUser();

  return !!(
    user &&
    user.userId
  );
}

// ================= USER ID =================
function getPinSessionUserId() {

  const user = getPinSessionUser();

  if (!user) {
    return null;
  }

  return String(user.userId || "");
}

// ================= USER ROLE =================
function getPinSessionRole() {

  const user = getPinSessionUser();

  if (!user) {
    return "user";
  }

  return String(user.role || "user");
}

// ================= EXPORT =================
window.getPinSessionUser = getPinSessionUser;

window.isPinSessionValid = isPinSessionValid;

window.getPinSessionUserId = getPinSessionUserId;

window.getPinSessionRole = getPinSessionRole;

