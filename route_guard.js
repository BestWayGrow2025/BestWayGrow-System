"use strict";

/*
========================================
ROUTE GUARD SYSTEM V3.0 (UNIFIED FINAL)
SINGLE ACCESS CONTROL AUTHORITY
========================================
✔ Single authentication guard
✔ Uses session_manager.js only
✔ Role-based access validation
✔ Role-specific login redirects
✔ Global auth failure flag
✔ Safe execution blocking
✔ No duplicate auth layers
✔ Production LOCKED
========================================
*/

// ================= ROUTE PROTECTION =================
function requireAuth(allowedRoles = []) {

  try {

    // reset auth state
    window.__AUTH_FAILED__ = false;

    // get session
    const session =
      typeof getSession === "function"
        ? getSession()
        : null;

    // ================= NO SESSION =================
    if (!session || !session.userId) {

      window.__AUTH_FAILED__ = true;
      window.location.replace("user_login.html");
      return false;
    }

    // ================= ROLE CHECK =================
    if (
      Array.isArray(allowedRoles) &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session.role)
    ) {

      window.__AUTH_FAILED__ = true;

      alert("Access Denied");

      // role-based redirect
      switch (session.role) {

        case "admin":
          window.location.replace("admin_login.html");
          break;

        case "system_admin":
          window.location.replace("system_admin_login.html");
          break;

        case "super_admin":
          window.location.replace("super_admin_login.html");
          break;

        default:
          window.location.replace("user_login.html");
      }

      return false;
    }

    // ================= STATUS CHECK =================
    if (
      typeof session.status !== "undefined" &&
      session.status !== "active"
    ) {

      window.__AUTH_FAILED__ = true;
      window.location.replace("user_login.html");
      return false;
    }

    // ================= AUTH PASSED =================
    return true;

  } catch (err) {

    console.error("Route guard error:", err);

    window.__AUTH_FAILED__ = true;
    window.location.replace("user_login.html");

    return false;
  }
}

// ================= AUTH STATE CHECK =================
function isAuthBlocked() {
  return window.__AUTH_FAILED__ === true;
}

// ================= EXPORT =================
window.requireAuth = requireAuth;
window.isAuthBlocked = isAuthBlocked;
