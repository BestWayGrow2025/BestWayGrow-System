"use strict";

/*
========================================
PIN ACCESS ROUTER V1.0 (FINAL CORE GATE)
========================================
✔ Role-based PIN request routing
✔ Super admin override protection
✔ Admin/System/User separation
✔ Blocks direct engine bypass
✔ Forces executePinFlow only path
✔ Production SAFE GATEWAY LAYER
========================================
*/

// ================= SAFE SESSION =================
function getActiveSessionUser() {
  if (typeof getSession !== "function") return null;

  const session = getSession();
  if (!session || !session.userId) return null;

  if (typeof getUserById === "function") {
    return getUserById(session.userId);
  }

  return session;
}

// ================= ROLE CHECK =================
function getRole() {
  const user = getActiveSessionUser();
  return user?.role || null;
}

// ================= ACCESS MATRIX =================
function getAllowedActions(role) {
  switch (role) {

    case "super_admin":
      return [
        "REQUEST_PIN",
        "APPROVE_REQUEST",
        "REJECT_REQUEST",
        "PROCESS_REQUEST",
        "ASSIGN_PIN",
        "OVERRIDE_PIN"
      ];

    case "system_admin":
      return [
        "REQUEST_PIN",
        "SYSTEM_PIN_REQUEST"
      ];

    case "admin":
      return [
        "REQUEST_PIN",
        "ADMIN_STOCK_REQUEST"
      ];

    case "user":
      return [
        "REQUEST_PIN"
      ];

    default:
      return [];
  }
}

// ================= PERMISSION CHECK =================
function canExecute(actionType) {
  const role = getRole();
  if (!role) return false;

  const allowed = getAllowedActions(role);

  return allowed.includes(actionType);
}

// ================= BLOCK DIRECT BYPASS =================
function isBlockedAction(actionType) {

  const blocked = [
    "DIRECT_ENGINE_CALL",
    "RAW_EXECUTE",
    "FORCE_ASSIGN",
    "SYSTEM_OVERRIDE"
  ];

  return blocked.includes(actionType);
}

// ================= MAIN ROUTER =================
function routePinRequest(actionType, payload = {}) {

  try {

    const user = getActiveSessionUser();

    if (!user) {
      throw new Error("No active session");
    }

    // Normalize
    actionType = String(actionType || "").trim().toUpperCase();

    // Block bypass attempts
    if (isBlockedAction(actionType)) {
      throw new Error("Bypass attempt blocked");
    }

    // Permission check
    if (!canExecute(actionType)) {
      throw new Error(
        "Permission denied for role: " + user.role
      );
    }

    // ================= ROUTING =================
    switch (actionType) {

      case "REQUEST_PIN":
        return executePinFlow("REQUEST_PIN", {
          ...payload,
          userId: user.userId
        });

      case "ADMIN_STOCK_REQUEST":
        return executePinFlow("ADMIN_STOCK_REQUEST", {
          ...payload,
          adminId: user.userId
        });

      case "SYSTEM_PIN_REQUEST":
        return executePinFlow("SYSTEM_PIN_REQUEST", {
          ...payload,
          systemAdminId: user.userId
        });

      case "APPROVE_REQUEST":
        return executePinFlow("PROCESS_REQUEST", payload);

      case "REJECT_REQUEST":
        return executePinFlow("REJECT_REQUEST", payload);

      case "ASSIGN_PIN":
        return executePinFlow("ASSIGN_PIN", {
          ...payload,
          assignedBy: user.userId
        });

      case "OVERRIDE_PIN":
        if (user.role !== "super_admin") {
          throw new Error("Only Super Admin can override");
        }

        return executePinFlow("OVERRIDE_PIN", payload);

      default:
        throw new Error("Invalid action type");
    }

  } catch (err) {

    console.error("PIN ROUTER ERROR:", err.message);

    if (typeof logCritical === "function") {
      try {
        logCritical(
          "PIN ROUTER ERROR: " + err.message,
          user?.userId || "UNKNOWN",
          "PIN_ROUTER"
        );
      } catch (_) {}
    }

    return false;
  }
}

// ================= SAFE GLOBAL EXPORT =================
window.routePinRequest = routePinRequest;
window.canExecutePin = canExecute;
