"use strict";

/*
========================================
WALLET SYNC ENGINE V1.0 (BANK RECONCILIATION)
========================================
✔ Wallet rebuilt from ledger only
✔ No manual credit trust allowed
✔ Fixes drift & duplication risk
========================================
*/

function rebuildWalletFromLedger(userId) {
  try {
    if (!userId) return false;

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

    return true;

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("WALLET_SYNC_FAILED: " + err.message);
    }
    return false;
  }
}

// ================= EXPORT =================
window.rebuildWalletFromLedger = rebuildWalletFromLedger;
window.__WALLET_SYNC_ACTIVE__ = true;
