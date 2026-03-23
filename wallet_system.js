<script>

// =====================
// GET USERS
// =====================
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// =====================
// GET TRANSACTIONS
// =====================
function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions") || "[]");
}

function saveTransactions(txns) {
  localStorage.setItem("transactions", JSON.stringify(txns));
}

// =====================
// INIT WALLET
// =====================
function initWallet(user) {
  if (user.wallet === undefined) {
    user.wallet = 0;
  }
}

// =====================
// CREDIT WALLET
// =====================
function creditWallet(userId, amount, reason) {
  let users = getUsers();
  let user = users.find(u => u.userId === userId);

  if (!user) return;

  initWallet(user);

  user.wallet += amount;

  saveUsers(users);

  logTransaction(userId, amount, "CREDIT", reason);
}

// =====================
// DEBIT WALLET
// =====================
function debitWallet(userId, amount, reason) {
  let users = getUsers();
  let user = users.find(u => u.userId === userId);

  if (!user) return;

  initWallet(user);

  user.wallet -= amount;

  saveUsers(users);

  logTransaction(userId, amount, "DEBIT", reason);
}

// =====================
// LOG TRANSACTION
// =====================
function logTransaction(userId, amount, type, reason) {
  let txns = getTransactions();

  txns.push({
    userId: userId,
    amount: amount,
    type: type,
    reason: reason,
    time: new Date().toISOString()
  });

  saveTransactions(txns);
}

</script>
