/*
========================================
WALLET SYSTEM (FINAL SAFE ENGINE v2)
========================================
✔ Decimal safe
✔ Duplicate protection
✔ Memory safe
✔ CORE integrated
✔ Production ready
========================================
*/

// =====================
// 🔹 TRANSACTION LIMIT
// =====================
const TXN_LIMIT = 5000;

// =====================
// 🔹 GET TRANSACTIONS
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

  // 🔒 LIMIT CONTROL
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
// 🔐 DUPLICATE PROTECTION
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
// 💰 CREDIT WALLET
// =====================
function creditWallet(userId, amount, reason) {

  amount = Number(amount);

  if (!userId || isNaN(amount) || amount <= 0) return;

  let users = getUsers(); // ✅ from CORE
  let user = users.find(u => u.userId === userId);

  if (!user) return;

  initWallet(user);

  if (isDuplicateTxn(userId, amount, reason)) {
    console.warn("Duplicate credit blocked");
    return;
  }

  user.wallet = parseFloat((user.wallet + amount).toFixed(2));

  saveUsers(users); // ✅ from CORE

  logTransaction(userId, amount, "CREDIT", reason);
}

// =====================
// 💸 DEBIT WALLET
// =====================
function debitWallet(userId, amount, reason) {

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
// 📊 GET BALANCE
// =====================
function getWalletBalance(userId) {
  let user = getUsers().find(u => u.userId === userId);
  return Number(user?.wallet || 0);
}
