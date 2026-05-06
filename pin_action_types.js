/*
========================================
PIN ACTION TYPES (SINGLE SOURCE OF TRUTH)
========================================
✔ Unified action taxonomy
✔ Used by UI / Request / Master / Control
✔ Prevents mismatched permission logic
========================================
*/

const PIN_ACTION = {
  // User layer
  REQUEST: "REQUEST_PIN",

  // Request decision layer
  APPROVE: "APPROVE_REQUEST",
  REJECT: "REJECT_REQUEST",

  // Execution layer
  ASSIGN: "ASSIGN_PIN",
  USE: "USE_PIN",

  // Admin utilities
  TRANSFER: "TRANSFER_PIN",
  DELETE: "DELETE_PIN",
  OVERRIDE: "OVERRIDE_PIN"
};

// ================= NORMALIZER =================
function normalizePinAction(action) {
  return Object.values(PIN_ACTION).includes(action)
    ? action
    : null;
}

// ================= REVERSE LOOKUP =================
function getPinActionKey(action) {
  return Object.keys(PIN_ACTION).find(
    k => PIN_ACTION[k] === action
  ) || null;
}
