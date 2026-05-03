/*
========================================
PIN BANK SYSTEM V1 (FINAL SAFE CORE)
========================================
✔ Dedicated PIN purchase balance
✔ Separate from withdraw wallet
✔ User-controlled funding source
✔ Safe credit / debit flow
✔ Last 10 transfer view
✔ Date-range history support
✔ No direct PIN issue logic
✔ PIN-only balance control
========================================
*/

const PIN_BANK_LOG_KEY = "PIN_BANK_LOG";
const PIN_BANK_LOG_LIMIT = 5000;

// ================= SAFE HELPERS =================
function getPinBank(user) {
  if (!user || typeof user !== "object") return {
    balance: 0,
    totalCredit: 0,
    totalDebit: 0
  };

  if (!user.pinBank || typeof user.pinBank !== "object") {
    user.pinBank = {
      balance: 0,
      totalCredit: 0,
      totalDebit: 0
    };
  }

  user.pinBank.balance = Number(user.pinBank.balance || 0);
  user.pinBank.totalCredit = Number(user.pinBank.totalCredit || 0);
  user.pinBank.totalDebit = Number(user.pinBank.totalDebit || 0);

  return user.pinBank;
}

// ================= LOG =================
function getPinBankLogs() {
  let logs = safeGet(PIN_BANK_LOG_KEY, []);
  return Array.isArray(logs) ? logs : [];
}

function savePinBankLogs(logs) {
  if (!Array.isArray(logs)) logs = [];

  if (logs.length > PIN_BANK_LOG_LIMIT) {
    logs = logs.slice(-PIN_BANK_LOG_LIMIT);
  }

  safeSet(PIN_BANK_LOG_KEY, logs);
}

function logPinBankEntry(entry = {}) {
  let logs = getPinBankLogs();

  logs.push({
    id: "PB_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
    userId: entry.userId || null,
    type: entry.type || "UNKNOWN",
    amount: Number(entry.amount || 0),
    note: entry.note || "",
    refId: entry.refId || null,
    time: Date.now()
  });

  savePinBankLogs(logs);
}

// ================= SAVE USER =================
function savePinBankUser(user) {
  if (!user || !user.userId) return false;

  let users = typeof getUsers === "function" ? getUsers() : [];
  let idx = users.findIndex(u => u.userId === user.userId);

  if (idx === -1) return false;

  users[idx] = user;

  return typeof saveUsers === "function"
    ? saveUsers(users)
    : false;
}

// ================= CREDIT =================
function creditPinBank(userId, amount, note = "PIN BANK CREDIT", refId = null) {
  if (!userId || typeof getUserById !== "function") return false;

  let user = getUserById(userId);
  if (!user) return false;

  amount = Number(amount || 0);
  if (isNaN(amount) || amount <= 0) return false;

  let bank = getPinBank(user);

  bank.balance += amount;
  bank.totalCredit += amount;

  user.pinBank = bank;

  if (!savePinBankUser(user)) return false;

  logPinBankEntry({
    userId,
    type: "CREDIT",
    amount,
    note,
    refId
  });

  return true;
}

// ================= DEBIT =================
function debitPinBank(userId, amount, note = "PIN BANK DEBIT", refId = null) {
  if (!userId || typeof getUserById !== "function") return false;

  let user = getUserById(userId);
  if (!user) return false;

  amount = Number(amount || 0);
  if (isNaN(amount) || amount <= 0) return false;

  let bank = getPinBank(user);

  if (bank.balance < amount) return false;

  bank.balance -= amount;
  bank.totalDebit += amount;

  user.pinBank = bank;

  if (!savePinBankUser(user)) return false;

  logPinBankEntry({
    userId,
    type: "DEBIT",
    amount,
    note,
    refId
  });

  return true;
}

// ================= USER TRANSFER =================
function transferIncomeToPinBank(userId, amount) {
  if (!userId || typeof getUserById !== "function") return false;

  let user = getUserById(userId);
  if (!user) return false;

  amount = Number(amount || 0);
  if (isNaN(amount) || amount <= 0) return false;

  let wallet = user.wallet || {};
  wallet.balance = Number(wallet.balance || 0);
  wallet.totalDebit = Number(wallet.totalDebit || 0);

  if (wallet.balance < amount) return false;

  wallet.balance -= amount;
  wallet.totalDebit += amount;

  user.wallet = wallet;

  if (!creditPinBank(userId, amount, "TRANSFER FROM WALLET")) return false;

  if (!savePinBankUser(user)) return false;

  return true;
}

// ================= PURCHASE CHECK =================
function canPurchaseFromPinBank(userId, amount) {
  if (!userId || typeof getUserById !== "function") return false;

  let user = getUserById(userId);
  if (!user) return false;

  let bank = getPinBank(user);
  amount = Number(amount || 0);

  return bank.balance >= amount;
}

// ================= CONSUME FOR PIN =================
function consumePinBank(userId, amount, refId = null) {
  return debitPinBank(userId, amount, "PIN PURCHASE", refId);
}

// ================= USER VIEW =================
function getUserPinBankHistory(userId, from = null, to = null) {
  let logs = getPinBankLogs().filter(x => x.userId === userId);

  if (from) {
    let start = new Date(from).getTime();
    if (!isNaN(start)) logs = logs.filter(x => x.time >= start);
  }

  if (to) {
    let end = new Date(to).getTime();
    if (!isNaN(end)) logs = logs.filter(x => x.time <= end);
  }

  return logs.sort((a, b) => b.time - a.time);
}

function getUserPinBankLast10(userId) {
  return getUserPinBankHistory(userId).slice(0, 10);
}
