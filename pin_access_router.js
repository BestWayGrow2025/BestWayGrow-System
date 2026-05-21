"use strict";

/*
========================================
PIN ACCESS ROUTER V2.1 (UI CONNECTED FINAL)
========================================
✔ Role-based PIN routing
✔ UI panel integration
✔ Safe fallback execution
✔ Modal-safe architecture
✔ Super admin override safe path
✔ Engine bypass protection
✔ Normalized action safety
✔ Production locked gateway
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

// ================= ROLE =================
function getRole() {

  const user = getActiveSessionUser();

  return user?.role || null;
}

// ================= NORMALIZER =================
function normalizeAction(actionType) {

  const map = {
    request_pin: "REQUEST_PIN",
    admin_stock_request: "ADMIN_STOCK_REQUEST",
    system_pin_request: "SYSTEM_PIN_REQUEST",
    approve_request: "APPROVE_REQUEST",
    reject_request: "REJECT_REQUEST",
    assign_pin: "ASSIGN_PIN",
    override_pin: "OVERRIDE_PIN"
  };

  const key = String(actionType || "").trim();

  return map[key] || key.toUpperCase();
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

// ================= PERMISSION =================
function canExecute(actionType) {

  const role = getRole();

  if (!role) return false;

  return getAllowedActions(role).includes(actionType);
}

// ================= BLOCKED ACTIONS =================
function isBlockedAction(actionType) {

  return [
    "DIRECT_ENGINE_CALL",
    "RAW_EXECUTE",
    "FORCE_ASSIGN",
    "SYSTEM_OVERRIDE"
  ].includes(actionType);
}

// ================= SAFE UI OPEN =================
function safeOpenPanel(fnName, payload, fallbackAction) {

  try {

    if (
      typeof window[fnName] === "function" &&
      !payload.__directExecute
    ) {

      return window[fnName](payload);
    }

    return executePinFlow(fallbackAction, payload);

  } catch (err) {

    console.error("[PIN UI FALLBACK]", err);

    return executePinFlow(fallbackAction, payload);
  }
}

// ================= MAIN ROUTER =================
function routePinRequest(actionType, payload = {}) {

  let user = null;

  try {

    const activeUser = getActiveSessionUser();

    if (!activeUser) {
      throw new Error("No active session");
    }

    user = activeUser;

    // ================= NORMALIZE =================
    actionType = normalizeAction(actionType);

    // ================= BLOCK =================
    if (isBlockedAction(actionType)) {
      throw new Error("Blocked action");
    }

    // ================= PERMISSION =================
    if (!canExecute(actionType)) {

      throw new Error(
        "Permission denied for role: " + user.role
      );
    }

    // ================= ROUTING =================
    switch (actionType) {

      // ================= REQUEST PIN =================
      case "REQUEST_PIN":

        return safeOpenPanel(
          "openPinRequestPanel",
          {
            ...payload,
            userId: user.userId
          },
          "REQUEST_PIN"
        );

      // ================= APPROVE =================
      case "APPROVE_REQUEST":

        return safeOpenPanel(
          "openApprovePanel",
          payload,
          "PROCESS_REQUEST"
        );

      // ================= REJECT =================
      case "REJECT_REQUEST":

        return executePinFlow(
          "REJECT_REQUEST",
          payload
        );

      // ================= ASSIGN =================
      case "ASSIGN_PIN":

        return safeOpenPanel(
          "openAssignPinPanel",
          {
            ...payload,
            assignedBy: user.userId
          },
          "ASSIGN_PIN"
        );

      // ================= ADMIN STOCK =================
      case "ADMIN_STOCK_REQUEST":

        return executePinFlow(
          "ADMIN_STOCK_REQUEST",
          {
            ...payload,
            adminId: user.userId
          }
        );

      // ================= SYSTEM REQUEST =================
      case "SYSTEM_PIN_REQUEST":

        return executePinFlow(
          "SYSTEM_PIN_REQUEST",
          {
            ...payload,
            systemAdminId: user.userId
          }
        );

      // ================= OVERRIDE =================
      case "OVERRIDE_PIN":

        if (user.role !== "super_admin") {
          throw new Error(
            "Only Super Admin allowed"
          );
        }

        return executePinFlow(
          "OVERRIDE_PIN",
          payload
        );

      default:
        throw new Error("Invalid action type");
    }

  } catch (err) {

    console.error(
      "PIN ROUTER ERROR:",
      err.message
    );

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

// ================= EXPORT =================
window.routePinRequest = routePinRequest;
window.canExecutePin = canExecute;
