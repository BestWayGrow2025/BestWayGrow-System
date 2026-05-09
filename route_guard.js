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

"use strict";

// ================= ROUTE PROTECTION =================
function requireAuth(allowedRoles = []) {

  try {

    // Reset global auth failure flag
    window.__AUTH_FAILED__ = false;

    // Get validated session from session_manager.js
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

    // ================= ROLE VALIDATION =================
    if (
      Array.isArray(allowedRoles) &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session.role)
    ) {

      window.__AUTH_FAILED__ = true;

      alert("Access Denied");

      // Redirect to role-specific login page
      if (session.role === "admin") {
        window.location.replace("admin_login.html");
      } else if (session.role === "system_admin") {
        window.location.replace("system_admin_login.html");
      } else if (session.role === "super_admin") {
        window.location.replace("super_admin_login.html");
      } else {
        window.location.replace("user_login.html");
      }

      return false;
    }

    // ================= OPTIONAL STATUS CHECK =================
    // session_manager.js already validates active status.
    // This remains as a non-breaking defensive check.
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

  } catch (e) {

    console.error("Route guard error:", e);

    window.__AUTH_FAILED__ = true;

    window.location.replace("user_login.html");

    return false;
  }
}

// ================= GLOBAL EXECUTION BLOCK =================
function isAuthBlocked() {
  return window.__AUTH_FAILED__ === true;
}

// ================= SAFE EXPORT =================
window.requireAuth = requireAuth;
window.isAuthBlocked = isAuthBlocked;
