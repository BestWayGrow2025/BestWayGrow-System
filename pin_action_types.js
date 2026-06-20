"use strict";
/*
PIN ACTION TYPES SINGLE SOURCE OF TRUTH
✔ Unified action taxonomy ✔ Used by UI / Request / Master / Control ✔ Prevents mismatched permission logic ✔ Includes PIN Master controls
*/
(function () {
if (window.PIN_ACTION_TYPES) return;
window.PIN_ACTION_TYPES = true;
})();
// ================= ACTION REGISTRY =================
const PIN_ACTION = Object.freeze({
// User Layer REQUEST: "REQUEST_PIN",
// Request Decision Layer APPROVE: "APPROVE_REQUEST", REJECT: "REJECT_REQUEST",
// Execution Layer ASSIGN: "ASSIGN_PIN", USE: "USE_PIN",
// Admin Layer TRANSFER: "TRANSFER_PIN", DELETE: "DELETE_PIN", OVERRIDE: "OVERRIDE_PIN",
// PIN Master Controls START_UPGRADE: "START_UPGRADE", STOP_UPGRADE: "STOP_UPGRADE",
START_REPURCHASE: "START_REPURCHASE", STOP_REPURCHASE: "STOP_REPURCHASE"
});
// ================= NORMALIZER =================
function normalizePinAction(action) {
return Object.values(PIN_ACTION).includes(action) ? action : null;
}
// ================= REVERSE LOOKUP =================
function getPinActionKey(action) {
return ( Object.keys(PIN_ACTION).find( key => PIN_ACTION[key] === action ) || null );
}
// ================= EXPORTS =================
Object.defineProperty( window, "PIN_ACTION", { value: PIN_ACTION, writable: false, configurable: false } );
window.normalizePinAction = normalizePinAction;
window.getPinActionKey = getPinActionKey;
console.log( "[PIN ACTION TYPES] READY ✔" );
