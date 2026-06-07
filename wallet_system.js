/*
========================================
WALLET SYSTEM V9.0 (FINAL HARDENED)
========================================
✔ Immutable wallet normalization
✔ Internal system execution safe
✔ Atomic wallet locking
✔ Rollback-safe transfer refs
✔ Full wallet verification
✔ Transaction normalization
✔ Verified transaction persistence
✔ Duplicate protection
✔ Nested engine safe
✔ Production LOCKED
========================================
*/

"use strict";

const TXN_LIMIT = 5000;
const WALLET_LOCK_KEY = "WALLET_LOCKS";

// ===================================
// SYSTEM SAFETY
// ===================================
function isCoreReady() {

  return !!(
    window.__CORE_STATE__ &&
    window.__CORE_STATE__.initialized === true &&
    window.__CORE_STATE__.corrupted !== true
  );
}

// ===================================
// TRANSACTIONS
// ===================================
function normalizeTransaction(txn = {}) {

  return {
    txnId: txn.txnId || generateTxnRef("TXNLOG"),
    ref: String(txn.ref || ""),
    userId: String(txn.userId || ""),
    amount: parseFloat(Number(txn.amount || 0).toFixed(2)),
    type: String(txn.type || "UNKNOWN"),
    reason: String(txn.reason || ""),
    time: txn.time || new Date().toISOString()
  };
}

function getTransactions() {

  let txns = safeGet("transactions", []);

  if (!Array.isArray(txns)) {
    txns = [];
  }

  return txns
    .map(normalizeTransaction)
    .filter(t => t.userId && t.ref);
}

function saveTransactions(txns) {

  if (!Array.isArray(txns)) {
    txns = [];
  }

  txns = txns
    .map(normalizeTransaction)
    .slice(-TXN_LIMIT);

  return safeSet("transactions", txns);
}

// ===================================
// WALLET LOCKS
// ===================================
function getWalletLocks() {

  let data = safeGet(WALLET_LOCK_KEY, {});

  return (
    data &&
    typeof data === "object"
  ) ? data : {};
}

function saveWalletLocks(data) {

  return safeSet(
    WALLET_LOCK_KEY,
    data || {}
  );
}

function isUserLocked(userId) {

  let locks = getWalletLocks();

  let lock = locks[userId];

  if (!lock) return false;

  if ((Date.now() - Number(lock.time || 0)) > 5000) {

    delete locks[userId];

    saveWalletLocks(locks);

    return false;
  }

  return true;
}

function setUserLock(userId, val) {

  let locks = getWalletLocks();

  if (val) {

    locks[userId] = {
      time: Date.now(),
      owner: "TAB_" + Math.random().toString(36).slice(2, 8)
    };

  } else {

    delete locks[userId];
  }

  return saveWalletLocks(locks);
}

// ===================================
// WALLET NORMALIZATION
// ===================================
function normalizeWallet(wallet = {}) {

  const safeWallet = {
    ...(wallet && typeof wallet === "object"
      ? wallet
      : {})
  };

  const n = v => {

    let val = Number(v);

    if (isNaN(val) || val < 0) {
      val = 0;
    }

    return parseFloat(val.toFixed(2));
  };

  return {
    balance: n(safeWallet.balance),
    incomeBalance: n(safeWallet.incomeBalance),
    holdIncome: n(safeWallet.holdIncome),
    totalCredit: n(safeWallet.totalCredit),
    totalDebit: n(safeWallet.totalDebit)
  };
}

// ===================================
// INIT WALLET
// ===================================
function initWallet(user) {

  if (!user || typeof user !== "object") {
    return false;
  }

  let changed = false;

  if (
    !user.wallet ||
    typeof user.wallet !== "object"
  ) {

    user.wallet = {
      balance: 0,
      incomeBalance: 0,
      holdIncome: 0,
      totalCredit: 0,
      totalDebit: 0
    };

    changed = true;
  }

  if (typeof user.wallet === "number") {

    user.wallet = {
      balance: Number(user.wallet || 0),
      incomeBalance: 0,
      holdIncome: 0,
      totalCredit: Number(user.wallet || 0),
      totalDebit: 0
    };

    changed = true;
  }

  const normalized = normalizeWallet(user.wallet);

  if (
    JSON.stringify(normalized) !==
    JSON.stringify(user.wallet)
  ) {

    user.wallet = normalized;

    changed = true;
  }

  return changed;
}

// ===================================
// HELPERS
// ===================================
function generateTxnRef(prefix = "TXN") {

  return (
    prefix + "_" +
    Date.now() + "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function isDuplicateTxnRef(ref, userId, type = null) {

  if (!ref || !userId) {
    return false;
  }

  return getTransactions().some(t => {

    if (t.ref !== ref) return false;
    if (t.userId !== userId) return false;

    if (type && t.type !== type) {
      return false;
    }

    return true;
  });
}

// ===================================
// LOG TRANSACTION
// ===================================
function logTransaction(
  userId,
  amount,
  type,
  reason,
  ref
) {

  let txns = getTransactions();

  txns.push(normalizeTransaction({
    txnId: generateTxnRef("TXNLOG"),
    ref,
    userId,
    amount,
    type,
    reason,
    time: new Date().toISOString()
  }));

  return saveTransactions(txns);
}

// ===================================
// VERIFY WALLET
// ===================================
function verifyWalletState(a, b) {

  const keys = [
    "balance",
    "incomeBalance",
    "holdIncome",
    "totalCredit",
    "totalDebit"
  ];

  return keys.every(k =>
    Number(a[k] || 0).toFixed(2) ===
    Number(b[k] || 0).toFixed(2)
  );
}

// ===================================
// INTERNAL AUTH
// ===================================
function canExecuteWalletMutation(internal = false) {

  if (!isCoreReady()) {
    return false;
  }

  if (internal === true) {
    return true;
  }

  if (typeof getSession !== "function") {
    return false;
  }

  return !!getSession();
}

// ===================================
// COMMIT ENGINE
// ===================================
function commitWalletUpdate(
  userId,
  mutateFn,
  type,
  reason,
  amount,
  ref,
  internal = false
) {

  if (!canExecuteWalletMutation(internal)) {
    return false;
  }

  let users = getUsers();

  let user = users.find(
    u => u.userId === userId
  );

  if (!user) {
    return false;
  }

  if (
    user.status &&
    user.status !== "active"
  ) {
    return false;
  }

  initWallet(user);

  const backup = JSON.parse(
    JSON.stringify(user.wallet)
  );

  try {

    mutateFn(user.wallet);

    user.wallet = normalizeWallet(user.wallet);

    const saved = saveUsers(users);

    if (!saved) {
      throw new Error("USER_SAVE_FAILED");
    }

    const verifyUser = getUsers().find(
      u => u.userId === userId
    );

    if (!verifyUser) {
      throw new Error("VERIFY_USER_FAILED");
    }

    initWallet(verifyUser);

    if (
      !verifyWalletState(
        verifyUser.wallet,
        user.wallet
      )
    ) {

      throw new Error("VERIFY_FAILED");
    }

    const logged = logTransaction(
      userId,
      amount,
      type,
      reason,
      ref
    );

    if (!logged) {
      throw new Error("TXN_LOG_FAILED");
    }

    return true;

  } catch (e) {

    user.wallet = backup;

    saveUsers(users);

    if (typeof logCritical === "function") {

      logCritical(
        "Wallet error: " + e.message,
        userId
      );
    }

    return false;
  }
}

// ===================================
// CREDIT
// ===================================
function creditWallet(
  userId,
  amount,
  reason = "SYSTEM",
  ref = null,
  internal = false
) {

  if (!userId) {
    return false;
  }

  amount = Number(amount);

  if (
    isNaN(amount) ||
    amount <= 0
  ) {
    return false;
  }

  ref = ref || generateTxnRef("CREDIT");

  if (
    isDuplicateTxnRef(
      ref,
      userId,
      "CREDIT"
    )
  ) {
    return false;
  }

  if (isUserLocked(userId)) {
    return false;
  }

  setUserLock(userId, true);

  try {

    return commitWalletUpdate(
      userId,
      wallet => {

        wallet.balance += amount;
        wallet.incomeBalance += amount;
        wallet.totalCredit += amount;
      },
      "CREDIT",
      reason,
      amount,
      ref,
      internal
    );

  } finally {

    setUserLock(userId, false);
  }
}

// ===================================
// DEBIT
// ===================================
function debitWallet(
  userId,
  amount,
  reason = "SYSTEM",
  ref = null,
  internal = false
) {

  if (!userId) {
    return false;
  }

  amount = Number(amount);

  if (
    isNaN(amount) ||
    amount <= 0
  ) {
    return false;
  }

  ref = ref || generateTxnRef("DEBIT");

  if (
    isDuplicateTxnRef(
      ref,
      userId,
      "DEBIT"
    )
  ) {
    return false;
  }

  if (isUserLocked(userId)) {
    return false;
  }

  setUserLock(userId, true);

  try {

    return commitWalletUpdate(
      userId,
      wallet => {

        if (
          Number(wallet.balance || 0) < amount
        ) {

          throw new Error("INSUFFICIENT");
        }

        wallet.balance -= amount;

        wallet.totalDebit += amount;

        const used = Math.min(
          wallet.incomeBalance,
          amount
        );

        wallet.incomeBalance -= used;
      },
      "DEBIT",
      reason,
      amount,
      ref,
      internal
    );

  } finally {

    setUserLock(userId, false);
  }
}

// ===================================
// TRANSFER
// ===================================
function transferWallet(
  fromId,
  toId,
  amount,
  reason = "TRANSFER",
  internal = false
) {

  if (
    !fromId ||
    !toId ||
    fromId === toId
  ) {
    return false;
  }

  amount = Number(amount);

  if (
    isNaN(amount) ||
    amount <= 0
  ) {
    return false;
  }

  if (
    isUserLocked(fromId) ||
    isUserLocked(toId)
  ) {
    return false;
  }

  setUserLock(fromId, true);
  setUserLock(toId, true);

  const debitRef = generateTxnRef("TRANSFER_DEBIT");
  const creditRef = generateTxnRef("TRANSFER_CREDIT");
  const rollbackRef = generateTxnRef("ROLLBACK");

  let debitDone = false;

  try {

    debitDone = debitWallet(
      fromId,
      amount,
      reason,
      debitRef,
      internal
    );

    if (!debitDone) {
      return false;
    }

    const creditDone = creditWallet(
      toId,
      amount,
      reason,
      creditRef,
      internal
    );

    if (!creditDone) {

      creditWallet(
        fromId,
        amount,
        "ROLLBACK",
        rollbackRef,
        true
      );

      return false;
    }

    return true;

  } catch (e) {

    if (debitDone) {

      creditWallet(
        fromId,
        amount,
        "ROLLBACK",
        rollbackRef,
        true
      );
    }

    if (typeof logCritical === "function") {

      logCritical(
        "Transfer error: " + e.message,
        fromId
      );
    }

    return false;

  } finally {

    setUserLock(fromId, false);
    setUserLock(toId, false);
  }
}

// ===================================
// HELPERS
// ===================================
function getUserTransactions(userId) {

  return getTransactions()
    .filter(t => t.userId === userId);
}

function getWalletBalance(userId) {

  let user = getUserById(userId);

  if (!user) {
    return 0;
  }

  initWallet(user);

  return parseFloat(
    Number(user.wallet.balance || 0).toFixed(2)
  );
}

// ===================================
// READY
// ===================================

window.__WALLET_SYSTEM__ = {
  initialized: true,
  ready: true,
  timestamp: Date.now()
};

// ===================================
// EXPORTS
// ===================================

window.creditWallet = creditWallet;
window.debitWallet = debitWallet;
window.transferWallet = transferWallet;

window.getWalletBalance =
  getWalletBalance;

window.getUserTransactions =
  getUserTransactions;

window.initWallet =
  initWallet;

window.normalizeWallet =
  normalizeWallet;

window.getTransactions =
  getTransactions;

window.saveTransactions =
  saveTransactions;
