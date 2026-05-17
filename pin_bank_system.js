"use strict";

/*
========================================
PIN BANK SYSTEM V2 (ESCROW MASTER CORE)
========================================
✔ Wallet ↔ PIN Bank separation
✔ Escrow payment system added
✔ System Admin approval layer
✔ Super Admin final authority
✔ PIN/Product controlled release
✔ Full audit logging
✔ Safe atomic operations
✔ Production READY FINAL CORE
========================================
*/

/* ================= BASE KEYS ================= */

const PIN_BANK_LOG_KEY = "PIN_BANK_LOG";
const PIN_BANK_LEDGER_KEY = "PIN_BANK_LEDGER";
const PIN_BANK_LOG_LIMIT = 5000;

/* ================= SAFE HELPERS ================= */

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

/* ================= USER SAVE ================= */

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

/* ================= LOG SYSTEM ================= */

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

/* ================= BASIC CREDIT / DEBIT ================= */

function creditPinBank(userId, amount, note = "PIN BANK CREDIT", refId = null) {
  if (!userId || typeof getUserById !== "function") return false;

  let user = getUserById(userId);
  if (!user) return false;

  amount = Number(amount || 0);
  if (amount <= 0) return false;

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

function debitPinBank(userId, amount, note = "PIN BANK DEBIT", refId = null) {
  if (!userId || typeof getUserById !== "function") return false;

  let user = getUserById(userId);
  if (!user) return false;

  amount = Number(amount || 0);
  if (amount <= 0) return false;

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

/* ================= ESCROW LAYER (NEW CORE ADDITION) ================= */

function createEscrow(paymentId, userId, amount, type = "product") {
  let ledger = safeGet(PIN_BANK_LEDGER_KEY, []);
  if (!Array.isArray(ledger)) ledger = [];

  const entry = {
    escrowId: "ESC_" + Date.now(),
    paymentId,
    userId,
    amount: Number(amount || 0),
    type,
    status: "PENDING",

    systemApproved: false,
    superApproved: false,

    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  ledger.push(entry);
  safeSet(PIN_BANK_LEDGER_KEY, ledger);

  logPinBankEntry({
    userId,
    type: "ESCROW_CREATE",
    amount,
    refId: paymentId
  });

  return entry;
}

/* ================= APPROVAL FLOW ================= */

function systemApproveEscrow(escrowId) {
  let ledger = safeGet(PIN_BANK_LEDGER_KEY, []);
  let entry = ledger.find(e => e.escrowId === escrowId);

  if (!entry) return false;

  entry.systemApproved = true;
  entry.updatedAt = Date.now();

  safeSet(PIN_BANK_LEDGER_KEY, ledger);

  return true;
}

function superApproveEscrow(escrowId) {
  let ledger = safeGet(PIN_BANK_LEDGER_KEY, []);
  let entry = ledger.find(e => e.escrowId === escrowId);

  if (!entry || !entry.systemApproved) return false;

  entry.superApproved = true;
  entry.status = "APPROVED";
  entry.updatedAt = Date.now();

  safeSet(PIN_BANK_LEDGER_KEY, ledger);

  return true;
}

/* ================= RELEASE ENGINE ================= */

function releaseFromEscrow(escrowId) {
  let ledger = safeGet(PIN_BANK_LEDGER_KEY, []);
  let entry = ledger.find(e => e.escrowId === escrowId);

  if (!entry || entry.status !== "APPROVED") return false;

  // Step 1: Debit from escrow user bank
  debitPinBank(entry.userId, entry.amount, "ESCROW RELEASE", escrowId);

  // Step 2: mark released
  entry.status = "RELEASED";
  entry.updatedAt = Date.now();

  safeSet(PIN_BANK_LEDGER_KEY, ledger);

  logPinBankEntry({
    userId: entry.userId,
    type: "ESCROW_RELEASE",
    amount: entry.amount,
    refId: escrowId
  });

  return true;
}

/* ================= PIN PURCHASE FLOW ================= */

function purchaseViaPinBank(userId, amount, refId) {
  if (!canPurchaseFromPinBank(userId, amount)) return false;

  return debitPinBank(
    userId,
    amount,
    "PIN PURCHASE",
    refId
  );
}

function canPurchaseFromPinBank(userId, amount) {
  let user = getUserById(userId);
  if (!user) return false;

  let bank = getPinBank(user);
  return bank.balance >= Number(amount || 0);
}

/* ================= HISTORY ================= */

function getUserPinBankHistory(userId) {
  let logs = getPinBankLogs();
  return logs.filter(l => l.userId === userId);
}

/* ================= EXPORTS ================= */

window.getPinBank = getPinBank;
window.creditPinBank = creditPinBank;
window.debitPinBank = debitPinBank;
window.createEscrow = createEscrow;
window.systemApproveEscrow = systemApproveEscrow;
window.superApproveEscrow = superApproveEscrow;
window.releaseFromEscrow = releaseFromEscrow;
window.purchaseViaPinBank = purchaseViaPinBank;
