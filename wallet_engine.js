"use strict";

/*
========================================
WALLET ENGINE V1.0 (STATE ONLY)
========================================
✔ Balance storage only
✔ No business logic
✔ No ledger knowledge
========================================
*/

const WALLET_DB_KEY = "WALLET_STATE";

// ================= GET =================
function getWallets() {
  try {
    return JSON.parse(localStorage.getItem(WALLET_DB_KEY) || "{}");
  } catch {
    return {};
  }
}

// ================= SAVE =================
function saveWallets(data) {
  try {
    localStorage.setItem(
      WALLET_DB_KEY,
      JSON.stringify(data && typeof data === "object" ? data : {})
    );
  } catch (e) {
    if (typeof logCritical === "function") {
      logCritical("WALLET_SAVE_FAILED: " + e.message);
    }
  }
}

// ================= CREDIT =================
function creditWallet(userId, amount) {
  const wallets = getWallets();

  if (!wallets[userId]) {
    wallets[userId] = { balance: 0 };
  }

  wallets[userId].balance += Number(amount);

  saveWallets(wallets);
  return true;
}

// ================= DEBIT =================
function debitWallet(userId, amount) {
  const wallets = getWallets();

  if (!wallets[userId]) return false;
  if (wallets[userId].balance < amount) return false;

  wallets[userId].balance -= Number(amount);

  saveWallets(wallets);
  return true;
}

// ================= EXPORT =================
window.creditWallet = creditWallet;
window.debitWallet = debitWallet;
window.__WALLET_ENGINE_ACTIVE__ = true;
