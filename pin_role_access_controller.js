"use strict";

/*
========================================
PIN ROLE ACCESS CONTROLLER v1.1 FINAL FIX
========================================
✔ Centralized role system
✔ Safe loop protection added
✔ access_denied recursion fixed
✔ SAFE_PAGES integrated
✔ Stable export
========================================
*/

(function () {

  if (window.__PIN_ROLE_ACCESS_CONTROLLER__) return;
  window.__PIN_ROLE_ACCESS_CONTROLLER__ = true;

  // ================= SAFE PAGES =================
  const SAFE_PAGES = ["access_denied", "home"];

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

  // ================= CURRENT ROLE =================
  function getCurrentRole() {
    return window.getCurrentUser?.()?.role || "USER";
  }

  // ================= ACCESS CHECK =================
  function hasAccess(page) {

    const role = getCurrentRole();
    const roleData = ROLE_MATRIX[role];

    if (!roleData) return false;

    if (roleData.permissions.includes("*")) return true;

    return roleData.permissions.includes(page);
  }

  // ================= REQUIRE ACCESS =================
  function requireAccess(page) {

    // 🔥 CRITICAL FIX: prevent infinite loop
    if (SAFE_PAGES.includes(page)) {
      return true;
    }

    if (!hasAccess(page)) {

      console.warn("[ROLE ACCESS DENIED]", {
        role: getCurrentRole(),
        page
      });

      if (page !== "access_denied" && typeof window.openSystemPage === "function") {
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

  console.log("[PIN ROLE ACCESS CONTROLLER] READY ✔ FINAL FIXED");

})();
