/*
========================================
PIN ACTION CONTROL V1.0 (SAFE CONTROL LAYER)
========================================
✔ Central action permission control
✔ Role-safe action visibility
✔ Status-safe action validation
✔ Confirm-required dangerous actions
✔ Soft delete protection
✔ Super admin override isolation
✔ Audit-ready action guards
✔ No direct mutation here
✔ Control layer only
========================================
*/

// ================= ACTIONS =================
const PIN_ACTIONS = [
  "VIEW",
  "APPROVE",
  "REJECT",
  "ASSIGN",
  "TRANSFER",
  "HOLD",
  "DELETE",
  "OVERRIDE"
];

// ================= HELPERS =================
function getSafeRole() {
  if (typeof getCurrentUser !== "function") return null;
  const user = getCurrentUser();
  return user?.role || null;
}

function isValidPinAction(action) {
  return PIN_ACTIONS.includes(String(action || "").toUpperCase());
}

function normalizePinStatus(status) {
  return String(status || "").toLowerCase();
}

// ================= ROLE ACCESS =================
function canRoleAccessPinAction(role, action) {
  role = String(role || "").toLowerCase();
  action = String(action || "").toUpperCase();

  if (!isValidPinAction(action)) return false;

  const access = {
    user: ["VIEW"],
    admin: ["VIEW", "APPROVE", "REJECT", "ASSIGN", "HOLD"],
    system_admin: ["VIEW", "APPROVE", "REJECT", "ASSIGN", "TRANSFER", "HOLD"],
    super_admin: ["VIEW", "APPROVE", "REJECT", "ASSIGN", "TRANSFER", "HOLD", "DELETE", "OVERRIDE"]
  };

  return (access[role] || []).includes(action);
}

// ================= STATUS ACCESS =================
function canActionRunByStatus(action, status) {
  action = String(action || "").toUpperCase();
  status = normalizePinStatus(status);

  const rules = {
    VIEW: ["active", "assigned", "used", "hold", "deleted"],
    APPROVE: ["pending"],
    REJECT: ["pending"],
    ASSIGN: ["active", "pending"],
    TRANSFER: ["assigned"],
    HOLD: ["pending", "active", "assigned"],
    DELETE: ["active", "hold"],
    OVERRIDE: ["pending", "active", "assigned", "used", "hold"]
  };

  return (rules[action] || []).includes(status);
}

// ================= CONFIRM RULE =================
function requiresPinActionConfirm(action) {
  action = String(action || "").toUpperCase();
  return ["REJECT", "TRANSFER", "HOLD", "DELETE", "OVERRIDE"].includes(action);
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

  if (String(action).toUpperCase() === "DELETE") {
    return canDeletePin(pin, safeRole);
  }

  if (String(action).toUpperCase() === "OVERRIDE") {
    return canOverridePin(safeRole);
  }

  return true;
}

// ================= AUDIT PAYLOAD =================
function buildPinActionAudit(action, pin, performedBy, note = "") {
  return {
    action: String(action || "").toUpperCase(),
    pinId: pin?.pinId || "-",
    status: pin?.status || "-",
    performedBy: performedBy || "SYSTEM",
    note: note || "",
    time: new Date().toISOString()
  };
}
