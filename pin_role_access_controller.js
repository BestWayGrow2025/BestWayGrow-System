"use strict";

/*
========================================
PIN ROLE ACCESS CONTROLLER v1.1 FIXED
========================================
✔ Normalized roles
✔ Safe session handling
✔ Router compatible
✔ No loop issues
========================================
*/

(function () {

  if (window.__PIN_ROLE_ACCESS_CONTROLLER__) return;

  window.__PIN_ROLE_ACCESS_CONTROLLER__ = true;

  // ================= ROLE MATRIX =================
  const ROLE_MATRIX = {

    SUPER_ADMIN: {
      level: 4,
      permissions: ["*"]
    },

    SYSTEM_ADMIN: {
      level: 3,
      permissions: [
        "users",
        "pinmaster",
        "productmaster",
        "reports",
        "system",
        "audit",
        "tree"
      ]
    },

    ADMIN: {
      level: 2,
      permissions: [
        "users",
        "pinmaster",
        "reports",
        "tree"
      ]
    },

    USER: {
      level: 1,
      permissions: [
        "profile",
        "pins",
        "transactions",
        "reports"
      ]
    }
  };

  // ================= ROLE NORMALIZATION FIX =================
  function getCurrentRole() {

    const user = window.getCurrentUser?.();

    if (!user?.role) return "USER";

    return String(user.role)
      .toUpperCase()
      .replace(/-/g, "_"); // 🔥 FIX: super_admin → SUPER_ADMIN
  }

  // ================= ACCESS CHECK =================
  function hasAccess(page) {

    const role = getCurrentRole();
    const roleData = ROLE_MATRIX[role];

    if (!roleData) return false;

    if (roleData.permissions.includes("*")) {
      return true;
    }

    return roleData.permissions.includes(page);
  }

  // ================= REQUIRE ACCESS =================
  function requireAccess(page) {

    if (!hasAccess(page)) {

      console.warn("[ROLE ACCESS DENIED]", {
        role: getCurrentRole(),
        page
      });

      if (page !== "access_denied" && window.openSystemPage) {
        window.openSystemPage("access_denied");
      }

      return false;
    }

    return true;
  }

  // ================= EXPORT =================
  window.PIN_ROLE_ACCESS_CONTROLLER = {
    getCurrentRole,
    hasAccess,
    requireAccess,
    ROLE_MATRIX
  };

  window.PIN_ROLE_ACCESS = {
    getCurrentRole,
    hasAccess,
    requireAccess,
    ROLE_MATRIX
  };

  console.log("[PIN ROLE ACCESS CONTROLLER] READY ✔ FIXED");

})();
