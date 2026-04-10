/*
========================================
WALLET SYSTEM V7 (MASTER ENGINE)
========================================
✔ Core integrated (safeGet / safeSet)
✔ System lock protection
✔ Duplicate protection
✔ Transaction limit control
✔ User transaction filtering
✔ Activity logging integrated
✔ Decimal safe
✔ Production ready
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
  return safeGet("transactions", []);
}

function saveTransactions(txns) {

  if (!Array.isArray(txns)) txns = [];

  if (txns.length > TXN_LIMIT) {
    txns = txns.slice(-TXN_LIMIT);
  }

  safeSet("transactions", txns);
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
// 📊 USER TRANSACTIONS
// =====================
function getUserTransactions(userId) {
  return getTransactions().filter(t => t.userId === userId);
}

// =====================
// 💰 CREDIT
// =====================
function creditWallet(userId, amount, reason = "SYSTEM") {

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
  addLog("CREDIT " + amount + " (" + reason + ")", userId);
}

// =====================
// 💸 DEBIT
// =====================
function debitWallet(userId, amount, reason = "SYSTEM") {

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
  addLog("DEBIT " + amount + " (" + reason + ")", userId);

  return true;
}

// =====================
// 🧾 LOG TRANSACTION
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


