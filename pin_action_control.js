/*
========================================
PIN ACTION CONTROL V1.1 (NORMALIZED - FIXED)
========================================
✔ Central action permission control
✔ Unified action dictionary (pin_action_types.js)
✔ Role-safe + status-safe validation
✔ No logic change (only normalization)
✔ INVALID ACTIONS REMOVED (VIEW, HOLD)
========================================
*/

// ================= ACTIONS =================
const PIN_ACTIONS = Object.values(PIN_ACTION);

// ================= HELPERS =================
function getSafeRole() {
  if (typeof getCurrentUser !== "function") return null;
  const user = getCurrentUser();
  return user?.role || null;
}

function isValidPinAction(action) {
  return PIN_ACTIONS.includes(action);
}

function normalizePinStatus(status) {
  return String(status || "").toLowerCase();
}

// ================= ROLE ACCESS =================
function canRoleAccessPinAction(role, action) {
  role = String(role || "").toLowerCase();

  if (!isValidPinAction(action)) return false;

  const access = {
    user: [PIN_ACTION.REQUEST],

    admin: [
      PIN_ACTION.REQUEST,
      PIN_ACTION.APPROVE,
      PIN_ACTION.REJECT,
      PIN_ACTION.ASSIGN
    ],

    system_admin: [
      PIN_ACTION.REQUEST,
      PIN_ACTION.APPROVE,
      PIN_ACTION.REJECT,
      PIN_ACTION.ASSIGN,
      PIN_ACTION.TRANSFER
    ],

    super_admin: [
      PIN_ACTION.REQUEST,
      PIN_ACTION.APPROVE,
      PIN_ACTION.REJECT,
      PIN_ACTION.ASSIGN,
      PIN_ACTION.TRANSFER,
      PIN_ACTION.DELETE,
      PIN_ACTION.OVERRIDE
    ]
  };

  return (access[role] || []).includes(action);
}

// ================= STATUS ACCESS =================
function canActionRunByStatus(action, status) {
  status = normalizePinStatus(status);

  const rules = {
    [PIN_ACTION.REQUEST]: ["pending"],

    [PIN_ACTION.APPROVE]: ["pending"],
    [PIN_ACTION.REJECT]: ["pending"],

    [PIN_ACTION.ASSIGN]: ["active", "pending"],
    [PIN_ACTION.TRANSFER]: ["assigned"],

    [PIN_ACTION.DELETE]: ["active"],
    [PIN_ACTION.OVERRIDE]: ["pending", "active", "assigned", "used"]
  };

  return (rules[action] || []).includes(status);
}

// ================= CONFIRM RULE =================
function requiresPinActionConfirm(action) {
  return [
    PIN_ACTION.REJECT,
    PIN_ACTION.TRANSFER,
    PIN_ACTION.DELETE,
    PIN_ACTION.OVERRIDE
  ].includes(action);
}

// ================= DELETE SAFETY =================
function canDeletePin(pin, role) {
  if (!pin || typeof pin !== "object") return false;
  if (String(role || "").toLowerCase() !== "super_admin") return false;

  return (
    normalizePinStatus(pin.status) === "active" &&
    !pin.ownerId &&
    !pin.assignedTo &&
    !pin.usedBy
  );
}

// ================= OVERRIDE SAFETY =================
function canOverridePin(role) {
  return String(role || "").toLowerCase() === "super_admin";
}

// ================= MAIN GUARD =================
function canExecutePinAction(action, pin = {}, role = null) {
  const safeRole = role || getSafeRole();
  if (!safeRole) return false;

  if (!canRoleAccessPinAction(safeRole, action)) return false;
  if (!canActionRunByStatus(action, pin.status || "pending")) return false;

  if (action === PIN_ACTION.DELETE) {
    return canDeletePin(pin, safeRole);
  }

  if (action === PIN_ACTION.OVERRIDE) {
    return canOverridePin(safeRole);
  }

  return true;
}

// ================= AUDIT =================
function buildPinActionAudit(action, pin, performedBy, note = "") {
  return {
    action,
    pinId: pin?.pinId || "-",
    status: pin?.status || "-",
    performedBy: performedBy || "SYSTEM",
    note: note || "",
    time: new Date().toISOString()
  };
}
