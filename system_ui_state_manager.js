"use strict";
/*
SYSTEM UI STATE MANAGER v1.0 ENTERPRISE GUARANTEE LAYER
✔ Single source of truth ✔ Tracks current page ✔ Tracks current role ✔ Tracks current module ✔ Router compatible ✔ Dashboard compatible ✔ Enterprise state management
*/
(function () {
if (window.SYSTEM_UI_STATE_MANAGER) return;
window.SYSTEM_UI_STATE_MANAGER = true;
const STATE = { role: null, page: null, module: null, lastUpdated: null };
// ================= ROLE ================= function getCurrentRole() {
return (
  window.PIN_ROLE_ACCESS?.getCurrentRole?.() ||
  "USER"
);

}
// ================= UPDATE ================= function update(data = {}) {
if (data.role !== undefined) {
  STATE.role = data.role;
}

if (data.page !== undefined) {
  STATE.page = data.page;
}

if (data.module !== undefined) {
  STATE.module = data.module;
}

STATE.lastUpdated = Date.now();

emit();

}
// ================= EMIT ================= function emit() {
if (typeof window.broadcastPinEvent === "function") {

  window.broadcastPinEvent(
    "UI_STATE_UPDATED",
    getState()
  );
}

}
// ================= INIT ================= function initialize() {
STATE.role = getCurrentRole();
STATE.lastUpdated = Date.now();

}
// ================= GETTERS ================= function getState() {
return {
  role: STATE.role,
  page: STATE.page,
  module: STATE.module,
  lastUpdated: STATE.lastUpdated
};

}
function getCurrentPage() { return STATE.page; }
function getCurrentModule() { return STATE.module; }
// ================= RESET ================= function reset() {
STATE.role = getCurrentRole();
STATE.page = null;
STATE.module = null;
STATE.lastUpdated = Date.now();

emit();

}
// ================= EXPORT ================= window.SYSTEM_UI_STATE = { update, getState, getCurrentPage, getCurrentModule, reset };
initialize();
console.log( "[SYSTEM UI STATE MANAGER] READY ✔" );
})();

