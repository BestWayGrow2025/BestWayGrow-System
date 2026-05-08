"use strict";

var TXN_LIMIT = 5000;
var WALLET_LOCK_KEY = "WALLET_LOCKS";

// ===================================
// SYSTEM SAFETY CHECK
// ===================================
function isCoreReady() {
  return window.__CORE_STATE__ && window.__CORE_STATE__.initialized;
}

// ===================================
// TRANSACTIONS
// ===================================
function getTransactions() {
  let txns = safeGet("transactions", []);
  return Array.isArray(txns) ? txns : [];
}

function saveTransactions(txns) {
  if (!Array.isArray(txns)) txns = [];
  if (txns.length > TXN_LIMIT) txns = txns.slice(-TXN_LIMIT);
  safeSet("transactions", txns);
}

// ===================================
// WALLET LOCK SYSTEM
// ===================================
function getWalletLocks() {
  let data = safeGet(WALLET_LOCK_KEY, {});
  return data && typeof data === "object" ? data : {};
}

function saveWalletLocks(data) {
  safeSet(WALLET_LOCK_KEY, data || {});
}

function isUserLocked(userId) {
  let locks = getWalletLocks();
  let lock = locks[userId];

  if (!lock) return false;

  if (Date.now() - lock.time > 5000) {
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

  saveWalletLocks(locks);
}

// ===================================
// WALLET NORMALIZATION
// ===================================
function normalizeWallet(wallet) {
  if (!wallet || typeof wallet !== "object") wallet = {};

  const n = v => Number((Number(v || 0)).toFixed(2));

  wallet.balance = Math.max(0, n(wallet.balance));
  wallet.incomeBalance = Math.max(0, n(wallet.incomeBalance));
  wallet.holdIncome = Math.max(0, n(wallet.holdIncome));
  wallet.totalCredit = Math.max(0, n(wallet.totalCredit));
  wallet.totalDebit = Math.max(0, n(wallet.totalDebit));

  return wallet;
}

// ===================================
// INIT WALLET
// ===================================
function initWallet(user) {
  if (!user) return false;

  let changed = false;

  if (!user.wallet || typeof user.wallet !== "object") {
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
      balance: user.wallet,
      incomeBalance: 0,
      holdIncome: 0,
      totalCredit: user.wallet,
      totalDebit: 0
    };
    changed = true;
  }

  user.wallet = normalizeWallet(user.wallet);
  return changed;
}

// ===================================
// TXN HELPERS
// ===================================
function generateTxnRef(prefix = "TXN") {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function isDuplicateTxnRef(ref, userId) {
  if (!ref || !userId) return false;

  return getTransactions().some(
    t => t.ref === ref && t.userId === userId
  );
}

// ===================================
// LOG TXN
// ===================================
function logTransaction(userId, amount, type, reason, ref) {
  let txns = getTransactions();

  txns.push({
    txnId: generateTxnRef("TXNLOG"),
    ref,
    userId,
    amount: Number(amount),
    type,
    reason,
    time: new Date().toISOString()
  });

  saveTransactions(txns);
  return true;
}

// ===================================
// CORE WALLET COMMIT
// ===================================
function commitWalletUpdate(userId, mutateFn, type, reason, amount, ref) {

  if (!isCoreReady()) return false;

  let users = getUsers();
  let user = users.find(u => u.userId === userId);

  if (!user) return false;
  if (user.status && user.status !== "active") return false;

  initWallet(user);

  let backup = JSON.parse(JSON.stringify(user.wallet));

  try {

    mutateFn(user.wallet);
    user.wallet = normalizeWallet(user.wallet);

    saveUsers(users);

    let verify = getUsers().find(u => u.userId === userId);
    if (!verify) throw new Error("SAVE FAILED");

    initWallet(verify);

    if (verify.wallet.balance !== user.wallet.balance) {
      throw new Error("VERIFY FAILED");
    }

    logTransaction(userId, amount, type, reason, ref);

    return true;

  } catch (e) {

    user.wallet = backup;
    saveUsers(users);

    if (typeof logCritical === "function") {
      logCritical("Wallet error: " + e.message, userId);
    }

    return false;
  }
}

// ===================================
// CREDIT
// ===================================
function creditWallet(userId, amount, reason = "SYSTEM", ref = null) {

  if (!userId || !isCoreReady()) return false;

  const session = typeof getSession === "function" ? getSession() : null;
  if (!session) return false;

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) return false;

  ref = ref || generateTxnRef("CREDIT");
  if (isDuplicateTxnRef(ref, userId)) return false;
  if (isUserLocked(userId)) return false;

  setUserLock(userId, true);

  try {
    return commitWalletUpdate(
      userId,
      w => {
        w.balance += amount;
        w.incomeBalance += amount;
        w.totalCredit += amount;
      },
      "CREDIT",
      reason,
      amount,
      ref
    );
  } finally {
    setUserLock(userId, false);
  }
}

// ===================================
// DEBIT
// ===================================
function debitWallet(userId, amount, reason = "SYSTEM", ref = null) {

  if (!userId || !isCoreReady()) return false;

  const session = typeof getSession === "function" ? getSession() : null;
  if (!session) return false;

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) return false;

  ref = ref || generateTxnRef("DEBIT");
  if (isDuplicateTxnRef(ref, userId)) return false;
  if (isUserLocked(userId)) return false;

  setUserLock(userId, true);

  try {
    return commitWalletUpdate(
      userId,
      w => {
        if (w.balance < amount) throw new Error("INSUFFICIENT");

        w.balance -= amount;
        w.totalDebit += amount;

        let used = Math.min(w.incomeBalance, amount);
        w.incomeBalance -= used;
      },
      "DEBIT",
      reason,
      amount,
      ref
    );
  } finally {
    setUserLock(userId, false);
  }
}

// ===================================
// TRANSFER (FINAL SAFE)
// ===================================
function transferWallet(fromId, toId, amount, reason = "TRANSFER") {

  if (!fromId || !toId || fromId === toId) return false;

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) return false;

  let ref = generateTxnRef("TRANSFER");

  let debitDone = false;

  try {

    debitDone = debitWallet(fromId, amount, reason, ref);
    if (!debitDone) return false;

    let creditDone = creditWallet(toId, amount, reason, ref);

    if (!creditDone) {

      // rollback
      creditWallet(fromId, amount, "ROLLBACK", ref);

      return false;
    }

    return true;

  } catch (e) {

    if (debitDone) {
      creditWallet(fromId, amount, "ROLLBACK", ref);
    }

    return false;
  }
}

// ===================================
// HELPERS
// ===================================
function getUserTransactions(userId) {
  return getTransactions().filter(t => t.userId === userId);
}

function getWalletBalance(userId) {
  let user = getUserById(userId);
  if (!user) return 0;

  initWallet(user);
  return Number(user.wallet.balance || 0);
}
