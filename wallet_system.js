var TXN_LIMIT = 5000;
var WALLET_LOCK_KEY = "WALLET_LOCKS";

// ===================================
// TRANSACTION STORAGE
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
// WALLET LOCK (CROSS TAB SAFE)
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

  wallet.balance = Math.max(0, Number((wallet.balance || 0).toFixed(2)));
  wallet.incomeBalance = Math.max(0, Number((wallet.incomeBalance || 0).toFixed(2)));
  wallet.holdIncome = Math.max(0, Number((wallet.holdIncome || 0).toFixed(2)));
  wallet.totalCredit = Math.max(0, Number((wallet.totalCredit || 0).toFixed(2)));
  wallet.totalDebit = Math.max(0, Number((wallet.totalDebit || 0).toFixed(2)));

  return wallet;
}

function initWallet(user) {
  if (!user) return false;

  let changed = false;

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

  user.wallet = normalizeWallet(user.wallet);
  return changed;
}

// ===================================
// TXN HELPERS
// ===================================
function generateTxnRef(prefix = "TXN") {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function isDuplicateTxnRef(ref) {
  if (!ref) return false;
  return getTransactions().some(t => (t.ref || "") === ref);
}

function logTransaction(userId, amount, type, reason, ref) {
  let txns = getTransactions();

  txns.push({
    txnId: generateTxnRef("TXNLOG"),
    ref: ref,
    userId,
    amount: Number(amount),
    type,
    reason,
    time: new Date().toISOString()
  });

  saveTransactions(txns);

  return getTransactions().some(t => t.ref === ref && t.userId === userId);
}

// ===================================
// CORE COMMIT
// ===================================
function commitWalletUpdate(userId, mutateFn, type, reason, amount, ref) {
  let users = getUsers() || [];
  let user = users.find(u => u.userId === userId);

  if (!user) return false;
  if (user.status && user.status !== "active") return false;

  initWallet(user);

  let snapshot = JSON.parse(JSON.stringify(user.wallet));

  try {
    mutateFn(user.wallet);
    user.wallet = normalizeWallet(user.wallet);

    saveUsers(users);

    let verifyUsers = getUsers() || [];
    let savedUser = verifyUsers.find(u => u.userId === userId);

    if (!savedUser) throw new Error("Wallet save failed");

    initWallet(savedUser);

    if (savedUser.wallet.balance !== user.wallet.balance) {
      throw new Error("Wallet verify mismatch");
    }

    if (!logTransaction(userId, amount, type, reason, ref)) {
      throw new Error("Txn log failed");
    }

    return true;

  } catch (e) {
    user.wallet = snapshot;
    saveUsers(users);

    if (typeof logCritical === "function") {
      logCritical("Wallet commit failed: " + e.message, userId, "WALLET");
    }

    return false;
  }
}

// ===================================
// CREDIT
// ===================================
function creditWallet(userId, amount, reason = "SYSTEM", ref = null) {
  if (!userId) return false;

  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();
    if (s && s.lockMode) return false;
  }

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) return false;

  ref = ref || generateTxnRef("CREDIT");
  if (isDuplicateTxnRef(ref)) return false;
  if (isUserLocked(userId)) return false;

  setUserLock(userId, true);

  let ok = commitWalletUpdate(
    userId,
    function (wallet) {
      wallet.balance += amount;
      wallet.incomeBalance += amount;
      wallet.totalCredit += amount;
    },
    "CREDIT",
    reason,
    amount,
    ref
  );

  setUserLock(userId, false);
  return ok;
}

// ===================================
// DEBIT
// ===================================
function debitWallet(userId, amount, reason = "SYSTEM", ref = null) {
  if (!userId) return false;

  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();
    if (s && s.lockMode) return false;
  }

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) return false;

  ref = ref || generateTxnRef("DEBIT");
  if (isDuplicateTxnRef(ref)) return false;
  if (isUserLocked(userId)) return false;

  setUserLock(userId, true);

  let ok = commitWalletUpdate(
    userId,
    function (wallet) {
      if (wallet.balance < amount) throw new Error("Insufficient balance");

      wallet.balance -= amount;
      wallet.totalDebit += amount;

      let incomeUsed = Math.min(wallet.incomeBalance, amount);
      wallet.incomeBalance -= incomeUsed;
    },
    "DEBIT",
    reason,
    amount,
    ref
  );

  setUserLock(userId, false);
  return ok;
}

// ===================================
// TRANSFER (ATOMIC)
// ===================================
function transferWallet(fromId, toId, amount, reason = "TRANSFER") {
  if (!fromId || !toId || fromId === toId) return false;

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) return false;

  if (isUserLocked(fromId) || isUserLocked(toId)) return false;

  let ref = generateTxnRef("TRANSFER");

  setUserLock(fromId, true);
  setUserLock(toId, true);

  try {
    let debitOk = debitWallet(fromId, amount, reason, ref);
    if (!debitOk) throw new Error("Debit failed");

    let creditOk = creditWallet(toId, amount, reason, ref);
    if (!creditOk) throw new Error("Credit failed");

    return true;

  } catch (e) {
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
  return getTransactions().filter(t => t.userId === userId);
}

function getWalletBalance(userId) {
  let user = getUserById(userId);
  if (!user) return 0;

  initWallet(user);
  return Number(user.wallet.balance || 0);
}
