"use strict";

/*
========================================
WALLET ENGINE BRIDGE v1.0 (FINAL SAFE)
========================================
✔ Bridges Income Engine → Wallet System
✔ Prevents duplicate credit calls
✔ Normalizes transactions
✔ Safe fallback layer
✔ Compatible with INCOME ENGINE V9
✔ Compatible with wallet_system.js
========================================
*/

const WALLET_ENGINE_TX = "WALLET_ENGINE_TX_LOG";

// ================= TX GUARD =================
function getWalletEngineTx() {
  try {
    return JSON.parse(localStorage.getItem(WALLET_ENGINE_TX)) || {};
  } catch {
    return {};
  }
}

function saveWalletEngineTx(data) {
  localStorage.setItem(WALLET_ENGINE_TX, JSON.stringify(data || {}));
}

function isTxProcessed(ref) {
  const log = getWalletEngineTx();
  return !!log[ref];
}

function markTx(ref) {
  const log = getWalletEngineTx();
  log[ref] = Date.now();
  saveWalletEngineTx(log);
}

// ================= WALLET ROUTER =================
function creditToWalletEngine({
  userId,
  amount,
  type,
  note,
  ref,
  meta = {}
}) {
  try {

    if (!userId || !amount || amount <= 0) {
      return false;
    }

    if (!ref) {
      ref = "WALLET_" + Date.now();
    }

    // prevent duplicate credit
    if (isTxProcessed(ref)) {
      return false;
    }

    let success = false;

    // ================= PRIMARY WALLET SYSTEM =================
    if (typeof creditWallet === "function") {
      success = creditWallet(
        userId,
        amount,
        note || "WALLET CREDIT",
        ref,
        true
      );
    }

    // ================= FALLBACK SYSTEM =================
    else if (typeof walletCredit === "function") {
      success = walletCredit(userId, amount, note, ref);
    }

    else {
      console.error("No wallet system found");
      return false;
    }

    if (!success) {
      return false;
    }

    // mark tx only after success
    markTx(ref);

    // optional logging
    if (typeof addWalletLog === "function") {
      addWalletLog({
        userId,
        amount,
        type: type || "income",
        note,
        ref,
        meta,
        time: Date.now()
      });
    }

    return true;

  } catch (err) {
    console.error("wallet_engine error:", err.message);
    return false;
  }
}

// ================= SAFE INCOME HOOK =================
// Optional direct hook for INCOME ENGINE fallback
function routeIncomeToWallet(data) {
  return creditToWalletEngine(data);
}

// ================= EXPORT =================
window.creditToWalletEngine = creditToWalletEngine;
window.routeIncomeToWallet = routeIncomeToWallet;

console.log("[WALLET ENGINE] Bridge active");
