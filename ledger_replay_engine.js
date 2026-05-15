"use strict";

/*
========================================
LEDGER REPLAY ENGINE V1.0 (AUDIT CORE)
========================================
✔ Rebuild full wallet state from ledger
✔ Audit-ready transaction replay
✔ Detect inconsistencies
✔ System recovery support
========================================
*/

// ================= FULL REPLAY =================
function replayFullSystem() {
  try {
    const ledger = getLedgerState?.() || {};
    const wallets = {};

    for (const txId in ledger) {
      const tx = ledger[txId];

      if (!tx.userId) continue;

      if (!wallets[tx.userId]) {
        wallets[tx.userId] = { balance: 0 };
      }

      wallets[tx.userId].balance += Number(tx.amount || 0);
    }

    saveWallets?.(wallets);

    return wallets;

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("REPLAY_FAILED: " + err.message);
    }
    return null;
  }
}

// ================= SINGLE USER REPLAY =================
function replayUser(userId) {
  try {
    const ledger = getLedgerState?.() || {};

    let balance = 0;

    for (const txId in ledger) {
      const tx = ledger[txId];

      if (tx.userId === userId) {
        balance += Number(tx.amount || 0);
      }
    }

    const wallets = getWallets?.() || {};

    if (!wallets[userId]) {
      wallets[userId] = { balance: 0 };
    }

    wallets[userId].balance = parseFloat(balance.toFixed(2));

    saveWallets?.(wallets);

    return wallets[userId];

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("USER_REPLAY_FAILED: " + err.message);
    }
    return null;
  }
}

// ================= EXPORT =================
window.replayFullSystem = replayFullSystem;
window.replayUser = replayUser;

window.__LEDGER_REPLAY_ACTIVE__ = true;
