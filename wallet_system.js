/*
========================================
WALLET SYSTEM V7 (FINAL LOCKED)
========================================
✔ Core integrated
✔ System lock protected
✔ Duplicate safe
✔ Transaction limit control
✔ Safe logging
✔ Decimal safe
✔ Production locked
========================================
*/

// =====================
// 🔹 CONFIG
// =====================
const TXN_LIMIT = 5000;

// =====================
// 🔹 STORAGE
// =====================
function getTransactions() {
  try {
    return JSON.parse(localStorage.getItem("transactions") || "[]");
  } catch {
    localStorage.setItem("transactions", "[]");
    return [];
  }
}

function saveTransactions(txns) {

  if (!Array.isArray(txns)) txns = [];

  if (txns.length > TXN_LIMIT) {
    txns = txns.slice(-TXN_LIMIT);
  }

  localStorage.setItem("transactions", JSON.stringify(txns));
}

// =====================
// 🔹 INIT WALLET
// =====================
function initWallet(user) {
  if (!user) return;

  if (user.wallet === undefined || isNaN(user.wallet)) {
    user.wallet = 0;
  }
}

// =====================
// 🔐 DUPLICATE CHECK
// =====================
function isDuplicateTxn(userId, amount, reason) {

  let txns = getTransactions();

  return txns.some(t =>
    t.userId === userId &&
    Number(t.amount) === Number(amount) &&
    t.reason === reason &&
    (new Date() - new Date(t.time)) < 5000
  );
}

// =====================
// 📊 USER TXNS
// =====================
function getUserTransactions(userId) {
  return getTransactions().filter(t => t.userId === userId);
}

// =====================
// 💰 CREDIT
// =====================
function creditWallet(userId, amount, reason = "SYSTEM") {

  try {

    let settings = getSystemSettings();
    if (settings.lockMode) {
      console.warn("System Locked");
      return;
    }

    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) return;

    let users = getUsers();
    let user = users.find(u => u.userId === userId);

    if (!user) return;

    initWallet(user);

    if (isDuplicateTxn(userId, amount, reason)) {
      console.warn("Duplicate credit blocked");
      return;
    }

    user.wallet = parseFloat((user.wallet + amount).toFixed(2));

    saveUsers(users);

    logTransaction(userId, amount, "CREDIT", reason);

    // optional activity log
    if (typeof addLog === "function") {
      addLog("CREDIT " + amount + " (" + reason + ")", userId);
    }

  } catch (err) {

    if (typeof addCriticalIncomeLog === "function") {
      addCriticalIncomeLog("Wallet credit error: " + err.message);
    }

  }
}

// =====================
// 💸 DEBIT
// =====================
function debitWallet(userId, amount, reason = "SYSTEM") {

  try {

    let settings = getSystemSettings();
    if (settings.lockMode) {
      alert("System Locked");
      return false;
    }

    amount = Number(amount);

    if (!userId || isNaN(amount) || amount <= 0) return false;

    let users = getUsers();
    let user = users.find(u => u.userId === userId);

    if (!user) return false;

    initWallet(user);

    if (user.wallet < amount) {
      alert("Insufficient balance");
      return false;
    }

    user.wallet = parseFloat((user.wallet - amount).toFixed(2));

    saveUsers(users);

    logTransaction(userId, amount, "DEBIT", reason);

    if (typeof addLog === "function") {
      addLog("DEBIT " + amount + " (" + reason + ")", userId);
    }

    return true;

  } catch (err) {

    if (typeof addCriticalIncomeLog === "function") {
      addCriticalIncomeLog("Wallet debit error: " + err.message);
    }

    return false;
  }
}

// =====================
// 🧾 LOG
// =====================
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

// =====================
// 📊 BALANCE
// =====================
function getWalletBalance(userId) {
  let user = getUsers().find(u => u.userId === userId);
  return Number(user?.wallet || 0);
}


