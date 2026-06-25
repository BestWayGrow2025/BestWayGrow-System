"use strict";

const ESCROW_BANK_ID = "PIN_ESCROW_MAIN";

let escrowBank = {
  bankId: ESCROW_BANK_ID,
  balance: 0,
  locked: 0,
  transactions: []
};

function creditEscrow(amount, meta) {
  escrowBank.balance += Number(amount);

  escrowBank.transactions.push({
    id: "TXN_" + Date.now(),
    type: "CREDIT",
    amount,
    meta,
    time: new Date().toISOString()
  });

  return true;
}

function debitEscrow(amount, meta) {
  if (escrowBank.balance < amount) return false;

  escrowBank.balance -= Number(amount);

  escrowBank.transactions.push({
    id: "TXN_" + Date.now(),
    type: "DEBIT",
    amount,
    meta,
    time: new Date().toISOString()
  });

  return true;
}

function getEscrowBalance() {
  return escrowBank.balance;
}

function getEscrowLedger() {
  return escrowBank.transactions;
}

window.creditEscrow = creditEscrow;
window.debitEscrow = debitEscrow;
window.getEscrowBalance = getEscrowBalance;
window.getEscrowLedger = getEscrowLedger;
