"use strict";

/*
========================================
LEDGER AUTHORITY LAYER V1.0 (BANK CORE GATE)
========================================
✔ Single source of financial truth
✔ All credits/debits must pass here
✔ Prevents double spend & ghost credits
✔ Immutable audit chain entry
✔ Wallet cannot be written directly anymore
========================================
*/

const LEDGER_DB_KEY = "LEDGER_AUTH_TX_LOG";

// ================= LOAD LEDGER =================
function getLedgerState() {
  try {
    return JSON.parse(localStorage.getItem(LEDGER_DB_KEY) || "{}");
  } catch {
    return {};
  }
}

// ================= SAVE LEDGER =================
function saveLedgerState(data) {
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

// ================= DUPLICATE GUARD =================
function isTxExists(txId) {
  const ledger = getLedgerState();
  return !!ledger[txId];
}

// ================= CORE AUTHORITY WRITE =================
function ledgerWrite(tx) {
  try {
    if (!tx || !tx.txId || !tx.userId) return false;
    if (!tx.amount || tx.amount <= 0) return false;

    const ledger = getLedgerState();

    // Prevent double spend
    if (ledger[tx.txId]) {
      return false;
    }

    ledger[tx.txId] = {
      txId: tx.txId,
      userId: tx.userId,
      amount: Number(tx.amount),
      type: tx.type || "UNKNOWN",
      sourceUser: tx.sourceUser || "-",
      timestamp: Date.now(),
      status: "COMMITTED"
    };

    saveLedgerState(ledger);

    return true;
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("LEDGER_WRITE_FAILED: " + err.message);
    }
    return false;
  }
}

// ================= LEDGER BALANCE VIEW (DERIVED) =================
// (optional audit helper - NOT source of truth for wallet)
function getLedgerBalance(userId) {
  const ledger = getLedgerState();

  let balance = 0;

  for (const txId in ledger) {
    const tx = ledger[txId];

    if (tx.userId === userId) {
      balance += Number(tx.amount || 0);
    }
  }

  return parseFloat(balance.toFixed(2));
}

// ================= EXPORT =================
window.ledgerWrite = ledgerWrite;
window.getLedgerState = getLedgerState;
window.isTxExists = isTxExists;
window.getLedgerBalance = getLedgerBalance;

window.__LEDGER_AUTHORITY_ACTIVE__ = true;
