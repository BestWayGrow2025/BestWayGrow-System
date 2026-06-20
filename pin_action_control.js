"use strict";
/*
PIN ACTION CONTROL V1.2
✔ Central action permission control ✔ Unified action dictionary ✔ Role-safe validation ✔ Status-safe validation ✔ Supports PIN Master START/STOP actions ✔ Production SAFE
*/
// ================= ACTIONS ================= function getPinActions() { return Object.values(window.PIN_ACTION || {}); }
// ================= HELPERS ================= function getSafeRole() { if (typeof getCurrentUser !== "function") return null;
const user = getCurrentUser();
return user?.role || null; }
function isValidPinAction(action) { return getPinActions().includes(action); }
function normalizePinStatus(status) { return String(status || "").toLowerCase(); }
// ================= ROLE ACCESS ================= function canRoleAccessPinAction(role, action) {
role = String(role || "").toLowerCase();
if (!isValidPinAction(action)) { return false; }
const access = {
user: [
  window.PIN_ACTION?.REQUEST
],

admin: [
  window.PIN_ACTION?.REQUEST,
  window.PIN_ACTION?.APPROVE,
  window.PIN_ACTION?.REJECT,
  window.PIN_ACTION?.ASSIGN
],

system_admin: [
  window.PIN_ACTION?.REQUEST,
  window.PIN_ACTION?.APPROVE,
  window.PIN_ACTION?.REJECT,
  window.PIN_ACTION?.ASSIGN,
  window.PIN_ACTION?.TRANSFER
],

super_admin: [

  window.PIN_ACTION?.REQUEST,
  window.PIN_ACTION?.APPROVE,
  window.PIN_ACTION?.REJECT,
  window.PIN_ACTION?.ASSIGN,
  window.PIN_ACTION?.TRANSFER,
  window.PIN_ACTION?.DELETE,
  window.PIN_ACTION?.OVERRIDE,

  window.PIN_ACTION?.START_UPGRADE,
  window.PIN_ACTION?.STOP_UPGRADE,

  window.PIN_ACTION?.START_REPURCHASE,
  window.PIN_ACTION?.STOP_REPURCHASE

]

};
return (access[role] || []).includes(action); }
// ================= STATUS ACCESS ================= function canActionRunByStatus(action, status) {
status = normalizePinStatus(status);
const rules = {
[window.PIN_ACTION?.REQUEST]: [
  "pending"
],

[window.PIN_ACTION?.APPROVE]: [
  "pending"
],

[window.PIN_ACTION?.REJECT]: [
  "pending"
],

[window.PIN_ACTION?.ASSIGN]: [
  "active",
  "pending"
],

[window.PIN_ACTION?.TRANSFER]: [
  "assigned"
],

[window.PIN_ACTION?.DELETE]: [
  "active"
],

[window.PIN_ACTION?.OVERRIDE]: [
  "pending",
  "active",
  "assigned",
  "used"
],

[window.PIN_ACTION?.START_UPGRADE]: [
  "pending"
],

[window.PIN_ACTION?.STOP_UPGRADE]: [
  "pending"
],

[window.PIN_ACTION?.START_REPURCHASE]: [
  "pending"
],

[window.PIN_ACTION?.STOP_REPURCHASE]: [
  "pending"
]

};
return (rules[action] || []).includes(status); }
// ================= CONFIRM RULE ================= function requiresPinActionConfirm(action) {
return [
window.PIN_ACTION?.REJECT,
window.PIN_ACTION?.TRANSFER,
window.PIN_ACTION?.DELETE,
window.PIN_ACTION?.OVERRIDE

].includes(action);
}
// ================= DELETE SAFETY ================= function canDeletePin(pin, role) {
if (!pin || typeof pin !== "object") { return false; }
if ( String(role || "").toLowerCase() !== "super_admin" ) { return false; }
return (
normalizePinStatus(pin.status) === "active" &&
!pin.ownerId &&
!pin.assignedTo &&
!pin.usedBy

);
}
// ================= OVERRIDE SAFETY ================= function canOverridePin(role) {
return ( String(role || "").toLowerCase() === "super_admin" );
}
// ================= MAIN GUARD ================= function canExecutePinAction( action, pin = {}, role = null ) {
const safeRole = role || getSafeRole();
if (!safeRole) { return false; }
if ( !canRoleAccessPinAction( safeRole, action ) ) { return false; }
if ( !canActionRunByStatus( action, pin.status || "pending" ) ) { return false; }
if ( action === window.PIN_ACTION?.DELETE ) { return canDeletePin( pin, safeRole ); }
if ( action === window.PIN_ACTION?.OVERRIDE ) { return canOverridePin( safeRole ); }
return true;
}
// ================= AUDIT ================= function buildPinActionAudit( action, pin, performedBy, note = "" ) {
return {
action,

pinId:
  pin?.pinId || "-",

status:
  pin?.status || "-",

performedBy:
  performedBy || "SYSTEM",

note:
  note || "",

time:
  new Date().toISOString()

};
}
// ================= EXPORT ================= window.canExecutePinAction = canExecutePinAction;
window.canRoleAccessPinAction = canRoleAccessPinAction;
window.canActionRunByStatus = canActionRunByStatus;
window.requiresPinActionConfirm = requiresPinActionConfirm;
window.canDeletePin = canDeletePin;
window.canOverridePin = canOverridePin;
window.isValidPinAction = isValidPinAction;
window.buildPinActionAudit = buildPinActionAudit;
