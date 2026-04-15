/* WALLET SYSTEM V7.3 (FINAL LOCK)
✔ Core aligned
✔ LockMode protected
✔ Wallet migration safe
✔ Strong duplicate protection
✔ Clean rollback system
✔ User-level lock
✔ Anti-deadlock protection
✔ Debit protection added
✔ Status protection added
✔ Self-transfer blocked
✔ Production ready
*/

const TXN_LIMIT = 5000;

// ===================================
// TRANSACTION STORAGE
// ===================================
function getTransactions() {
  let txns = safeGet("transactions", []);
  return Array.isArray(txns) ? txns : [];
}

function saveTransactions(txns) {
  if (!Array.isArray(txns)) txns = [];

  if (txns.length > TXN_LIMIT) {
    txns = txns.slice(-TXN_LIMIT);
  }

  safeSet("transactions", txns);
}

// ===================================
// INIT WALLET (SAFE MIGRATION)
// ===================================
function initWallet(user) {
  if (!user) return false;

  let walletChanged = false;

  // OLD NUMBER FORMAT SUPPORT
  if (typeof user.wallet === "number") {
    user.wallet = {
      balance: user.wallet,
      totalCredit: user.wallet,
      totalDebit: 0
    };
    walletChanged = true;
  }

  // MISSING WALLET FIX
  if (!user.wallet || typeof user.wallet !== "object") {
    user.wallet = {
      balance: 0,
      totalCredit: 0,
      totalDebit: 0
    };
    walletChanged = true;
  }

  // NEGATIVE BALANCE FIX
  if (Number(user.wallet.balance) < 0) {
    user.wallet.balance = 0;
    walletChanged = true;
  }

  user.wallet.balance = Number(user.wallet.balance || 0);
  user.wallet.totalCredit = Number(user.wallet.totalCredit || 0);
  user.wallet.totalDebit = Number(user.wallet.totalDebit || 0);

  return walletChanged;
}

// ===================================
// USER LOCK
// ===================================
const WALLET_LOCK = {};

function isUserLocked(userId) {
  let lockTime = WALLET_LOCK[userId];

  // AUTO RECOVER AFTER 5s
  if (lockTime && (Date.now() - lockTime > 5000)) {
    WALLET_LOCK[userId] = false;
    return false;
  }

  return lockTime ? true : false;
}

function setUserLock(userId, val) {
  WALLET_LOCK[userId] = val ? Date.now() : false;
}

// ===================================
// DUPLICATE CHECK
// ===================================
function isDuplicateTxn(userId, amount, reason, type) {
  let txns = getTransactions();

  return txns.some(t =>
    t.userId === userId &&
    t.type === type &&
    Number(t.amount) === Number(amount) &&
    t.reason === reason &&
    (Date.now() - new Date(t.time).getTime()) < 3000
  );
}

// ===================================
// USER TXNS
// ===================================
function getUserTransactions(userId) {
  return getTransactions().filter(t => t.userId === userId);
}

// ===================================
// CREDIT WALLET
// ===================================
function creditWallet(userId, amount, reason = "SYSTEM") {

  try {

    // SYSTEM LOCK
    if (typeof getSystemSettings === "function") {
      let s = getSystemSettings();
      if (s && s.lockMode) return false;
    }

    if (typeof isSystemSafe === "function") {
      if (!isSystemSafe()) return false;
    }

    if (isUserLocked(userId)) return false;
    setUserLock(userId, true);

    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) {
      setUserLock(userId, false);
      return false;
    }

    let users = getUsers();
    let user = users.find(u => u.userId === userId);

    if (!user) {
      setUserLock(userId, false);
      return false;
    }

    // STATUS CHECK
    if (user.status && user.status !== "active") {
      setUserLock(userId, false);
      return false;
    }

    let changed = initWallet(user);

    if (changed) {
      saveUsers(users);
    }

    if (isDuplicateTxn(userId, amount, reason, "CREDIT")) {
      setUserLock(userId, false);
      return false;
    }

    amount = parseFloat(amount.toFixed(2));

    user.wallet.balance += amount;
    user.wallet.totalCredit += amount;

    saveUsers(users);

    logTransaction(userId, amount, "CREDIT", reason);

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "CREDIT ₹" + amount + " (" + reason + ")");
    }

    setUserLock(userId, false);
    return true;

  } catch (err) {

    setUserLock(userId, false);

    if (typeof logCritical === "function") {
      logCritical("Wallet credit error: " + err.message);
    }

    return false;
  }
}

// ===================================
// DEBIT WALLET
// ===================================
function debitWallet(userId, amount, reason = "SYSTEM") {

  try {

    if (typeof getSystemSettings === "function") {
      let s = getSystemSettings();
      if (s && s.lockMode) return false;
    }

    if (typeof isSystemSafe === "function") {
      if (!isSystemSafe()) return false;
    }

    if (isUserLocked(userId)) return false;
    setUserLock(userId, true);

    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) {
      setUserLock(userId, false);
      return false;
    }

    let users = getUsers();
    let user = users.find(u => u.userId === userId);

    if (!user) {
      setUserLock(userId, false);
      return false;
    }

    // STATUS CHECK
    if (user.status && user.status !== "active") {
      setUserLock(userId, false);
      return false;
    }

    let changed = initWallet(user);

    if (changed) {
      saveUsers(users);
    }

    if (isDuplicateTxn(userId, amount, reason, "DEBIT")) {
      setUserLock(userId, false);
      return false;
    }

    amount = parseFloat(amount.toFixed(2));

    if (user.wallet.balance < amount) {
      setUserLock(userId, false);
      return false;
    }

    user.wallet.balance -= amount;
    user.wallet.totalDebit += amount;

    saveUsers(users);

    logTransaction(userId, amount, "DEBIT", reason);

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "DEBIT ₹" + amount + " (" + reason + ")");
    }

    setUserLock(userId, false);
    return true;

  } catch (err) {

    setUserLock(userId, false);

    if (typeof logCritical === "function") {
      logCritical("Wallet debit error: " + err.message);
    }

    return false;
  }
}

// ===================================
// TRANSFER WALLET
// ===================================
function transferWallet(fromId, toId, amount, reason = "TRANSFER") {

  if (!fromId || !toId || amount <= 0) return false;

  // BLOCK SELF TRANSFER
  if (fromId === toId) return false;

  // STEP 1: debit sender
  if (!debitWallet(fromId, amount, reason + "_OUT")) return false;

  // STEP 2: credit receiver
  if (!creditWallet(toId, amount, reason + "_IN")) {

    // ROLLBACK TO SENDER
    creditWallet(fromId, amount, "ROLLBACK_FIX");

    return false;
  }

  return true;
}

// ===================================
// LOG TRANSACTION
// ===================================
function logTransaction(userId, amount, type, reason) {
  let txns = getTransactions();

  txns.push({
    txnId: "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
    userId,
    amount: Number(amount),
    type,
    reason,
    time: new Date().toISOString()
  });

  saveTransactions(txns);
}

// ===================================
// BALANCE
// ===================================
function getWalletBalance(userId) {
  let user = getUserById(userId);

  if (!user) return 0;

  initWallet(user);

  return Number(user.wallet.balance || 0);
}



