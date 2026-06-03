"use strict";

/*
========================================
PIN ROLE ACCESS (LIGHTWEIGHT LAYER)
========================================
✔ Pure permission checker only
✔ No routing logic
✔ No controller duplication
✔ Used by pin_role_access_controller.js
========================================
*/

(function () {

  if (window.__PIN_ROLE_ACCESS__) return;

  window.__PIN_ROLE_ACCESS__ = true;

  // ================= ROLE MAP =================
  const ROLE_MATRIX = {

    SUPER_ADMIN: {
      allowed: ["*"] // full access
    },

    SYSTEM_ADMIN: {
      allowed: [
        "home",
        "users",
        "system",
        "pinmaster",
        "productmaster",
        "rankmaster",
        "incomecontrol",
        "audit",
        "health",
        "backup",
        "escrow",
        "controlroom",
        "businessintelligence",
        "strategicai",
        "auditblockchain",
        "realtime",
        "payments",
        "orchestrator",
        "healthmonitor",
        "eventmonitor",
        "reports",
        "tree"
      ]
    },

    ADMIN: {
      allowed: [
        "home",
        "users",
        "pinmaster",
        "incomecontrol",
        "audit",
        "health",
        "reports",
        "tree"
      ]
    },

    USER: {
      allowed: [
        "home",
        "profile",
        "transactions",
        "reports",
        "tree"
      ]
    }
  };

  // ================= CURRENT ROLE =================
  function getRole() {

    return (
      window.__USER_ROLE__ ||
      localStorage.getItem("userRole") ||
      "USER"
    );
  }

  // ================= ACCESS CHECK =================
  function requireAccess(page) {

    const role = getRole();

    const rules = ROLE_MATRIX[role];

    if (!rules) {
      console.warn("[PIN ROLE] Unknown role:", role);
      return false;
    }

    // SUPER ADMIN bypass
    if (rules.allowed.includes("*")) {
      return true;
    }

    const allowed = rules.allowed.includes(page);

    if (!allowed) {
      console.warn("[PIN ROLE] ACCESS DENIED:", role, page);
    }

    return allowed;
  }

  // ================= EXPORT =================
  window.PIN_ROLE_ACCESS = {
    requireAccess,
    getRole,
    ROLE_MATRIX
  };

  console.log("[PIN ROLE ACCESS] READY ✔");

})();
