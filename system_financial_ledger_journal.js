"use strict";

/*
========================================
LEDGER ENGINE V1.0 (BANK CORE)
========================================
✔ Single source of truth
✔ Prevent duplicate transactions
✔ Audit-ready storage
========================================
*/

const LEDGER_DB_KEY = "LEDGER_TX_LOG";

// ================= GET =================
function getLedger() {
  try {
    return JSON.parse(localStorage.getItem(LEDGER_DB_KEY) || "{}");
  } catch {
    return {};
  }
}

// ================= SAVE =================
function saveLedger(data) {
  try {
    localStorage.setItem(
      LEDGER_DB_KEY,
      JSON.stringify(data && typeof data === "object" ? data : {})
    );
  } catch (e) {
    if (typeof logCritical === "function") {
      logCritical("LEDGER_SAVE_FAILED: " + e.message);
    }
  }
}

// ================= RECORD TX =================
function recordTransaction(tx) {
  try {
    if (!tx || !tx.txId) return false;

    const ledger = getLedger();

    // duplicate prevention
    if (ledger[tx.txId]) return false;

    ledger[tx.txId] = {
      ...tx,
      timestamp: Date.now()
    };

    saveLedger(ledger);
    return true;

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("LEDGER_ERROR: " + err.message);
    }
    return false;
  }
}

// ================= EXPORT =================
window.recordTransaction = recordTransaction;
window.getLedger = getLedger;
window.__LEDGER_ENGINE_ACTIVE__ = true;
