<script>

// =====================
// 🔹 GET USERS
// =====================
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "[]");
  } catch {
    localStorage.setItem("users", "[]");
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}


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
  localStorage.setItem("transactions", JSON.stringify(txns));
}


// =====================
// 🔹 INIT WALLET
// =====================
function initWallet(user) {
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
    t.amount === amount &&
    t.reason === reason &&
    (new Date() - new Date(t.time)) < 5000
  );
}


// =====================
// 💰 CREDIT WALLET (FINAL SAFE)
// =====================
function creditWallet(userId, amount, reason) {

  if (!userId || amount <= 0) return;

  let users = getUsers();
  let user = users.find(u => u.userId === userId);

  if (!user) return;

  initWallet(user);

  if (isDuplicateTxn(userId, amount, reason)) {
    console.warn("Duplicate credit blocked");
    return;
  }

  // ✅ FIXED DECIMAL
  user.wallet = parseFloat((user.wallet + amount).toFixed(2));

  saveUsers(users);

  logTransaction(userId, amount, "CREDIT", reason);
}


// =====================
// 💸 DEBIT WALLET (FINAL SAFE)
// =====================
function debitWallet(userId, amount, reason) {

  if (!userId || amount <= 0) return false;

  let users = getUsers();
  let user = users.find(u => u.userId === userId);

  if (!user) return false;

  initWallet(user);

  if (user.wallet < amount) {
    alert("Insufficient balance");
    return false;
  }

  // ✅ FIXED DECIMAL
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
    txnId: "TXN" + Date.now(),
    userId: userId,
    amount: amount,
    type: type,
    reason: reason,
    time: new Date().toISOString()
  });

  saveTransactions(txns);
}


// =====================
// 📊 GET BALANCE
// =====================
function getWalletBalance(userId) {
  let user = getUsers().find(u => u.userId === userId);
  return user?.wallet || 0;
}

</script>
