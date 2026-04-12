/*
========================================
💰 WALLET SYSTEM V7 (ULTRA FINAL ENGINE)
========================================
✔ Core integrated (safeGet / safeSet)
✔ Wallet structure standardized
✔ Transaction logging (limited + safe)
✔ Duplicate protection
✔ Decimal safe
✔ System control aware
✔ Production locked
========================================
*/

const TXN_LIMIT = 5000;

// ===================================
// 🔹 TRANSACTION STORAGE (SAFE)
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
// 🔹 INIT WALLET STRUCTURE
// ===================================
function initWallet(user) {

  if (!user) return;

  if (!user.wallet || typeof user.wallet !== "object") {
    user.wallet = {
      balance: 0,
      totalCredit: 0,
      totalDebit: 0
    };
  }
}

// ===================================
// 🔐 DUPLICATE CHECK (SAFE)
// ===================================
function isDuplicateTxn(userId, amount, reason) {

  let txns = getTransactions();

  return txns.some(t =>
    t.userId === userId &&
    Number(t.amount) === Number(amount) &&
    t.reason === reason &&
    (Date.now() - new Date(t.time).getTime()) < 5000
  );
}

// ===================================
// 📊 USER TXNS
// ===================================
function getUserTransactions(userId) {
  return getTransactions().filter(t => t.userId === userId);
}

// ===================================
// 💰 CREDIT WALLET
// ===================================
function creditWallet(userId, amount, reason = "SYSTEM") {

  try {

    if (!isSystemSafe()) return false;

    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) return false;

    let users = getUsers();
    let user = users.find(u => u.userId === userId);

    if (!user) return false;

    initWallet(user);

    if (isDuplicateTxn(userId, amount, reason)) {
      console.warn("Duplicate credit blocked");
      return false;
    }

    amount = parseFloat(amount.toFixed(2));

    user.wallet.balance += amount;
    user.wallet.totalCredit += amount;

    saveUsers(users);

    logTransaction(userId, amount, "CREDIT", reason);

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", `CREDIT ₹${amount} (${reason})`);
    }

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("Wallet credit error: " + err.message);
    }

    return false;
  }
}

// ===================================
// 💸 DEBIT WALLET
// ===================================
function debitWallet(userId, amount, reason = "SYSTEM") {

  try {

    if (!isSystemSafe()) return false;

    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) return false;

    let users = getUsers();
    let user = users.find(u => u.userId === userId);

    if (!user) return false;

    initWallet(user);

    amount = parseFloat(amount.toFixed(2));

    if (user.wallet.balance < amount) {
      console.warn("Insufficient balance");
      return false;
    }

    user.wallet.balance -= amount;
    user.wallet.totalDebit += amount;

    saveUsers(users);

    logTransaction(userId, amount, "DEBIT", reason);

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", `DEBIT ₹${amount} (${reason})`);
    }

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("Wallet debit error: " + err.message);
    }

    return false;
  }
}

// ===================================
// 🔁 TRANSFER WALLET (SAFE)
// ===================================
function transferWallet(fromId, toId, amount, reason = "TRANSFER") {

  if (!isSystemSafe()) return false;

  if (!fromId || !toId || amount <= 0) return false;

  let debit = debitWallet(fromId, amount, reason + "_OUT");
  if (!debit) return false;

  let credit = creditWallet(toId, amount, reason + "_IN");

  if (!credit) {
    creditWallet(fromId, amount, "ROLLBACK");
    return false;
  }

  return true;
}

// ===================================
// 🧾 LOG TRANSACTION
// ===================================
function logTransaction(userId, amount, type, reason) {

  let txns = getTransactions();

  txns.push({
    txnId: "TXN_" + Date.now(),
    userId,
    amount: Number(amount),
    type,
    reason,
    time: new Date().toISOString()
  });

  saveTransactions(txns);
}

// ===================================
// 📊 BALANCE
// ===================================
function getWalletBalance(userId) {

  let user = getUserById(userId);

  if (!user) return 0;

  initWallet(user);

  return Number(user.wallet.balance || 0);
}


