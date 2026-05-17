"use strict";

/*
========================================
PAYMENT GATEWAY BRIDGE V1.0
========================================
✔ Bank deposit integration
✔ Wallet to PIN Bank transfer
✔ Payment gateway callback support
✔ UTR / transaction reference tracking
✔ Manual admin verification support
✔ Direct credit to PIN Bank only
✔ Full audit logging
========================================
*/

console.log("[PAYMENT GATEWAY BRIDGE] LOADED");

/* ================= HELPERS ================= */

function generatePaymentId(prefix = "PAY") {
  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.floor(Math.random() * 100000)
  );
}

function getPaymentRecords() {
  let records = safeGet("PAYMENT_RECORDS", []);
  return Array.isArray(records) ? records : [];
}

function savePaymentRecords(records) {
  safeSet("PAYMENT_RECORDS", Array.isArray(records) ? records : []);
}

/* ================= CREATE DEPOSIT REQUEST ================= */

function createDepositRequest({
  userId,
  amount,
  source = "bank",     // bank | wallet | gateway
  reference = null,    // UTR / txn id
  note = ""
}) {

  if (!userId) {
    return { status: "fail", reason: "missing_user" };
  }

  amount = Number(amount || 0);

  if (amount <= 0) {
    return { status: "fail", reason: "invalid_amount" };
  }

  let record = {
    paymentId: generatePaymentId(),

    userId,
    amount,

    source,
    reference,
    note,

    status: "pending",   // pending | verified | rejected

    createdAt: Date.now(),
    verifiedAt: null,
    verifiedBy: null
  };

  let records = getPaymentRecords();
  records.push(record);
  savePaymentRecords(records);

  // Audit log (if available)
  if (typeof logPinBankEntry === "function") {
    logPinBankEntry({
      userId,
      type: "DEPOSIT_REQUEST",
      amount,
      note: source.toUpperCase() + " DEPOSIT REQUEST",
      refId: record.paymentId
    });
  }

  return {
    status: "success",
    payment: record
  };
}

/* ================= VERIFY DEPOSIT ================= */

function verifyDeposit(paymentId, verifiedBy = "SYSTEM") {

  let records = getPaymentRecords();

  let payment = records.find(
    x => x.paymentId === paymentId
  );

  if (!payment) {
    return {
      status: "fail",
      reason: "payment_not_found"
    };
  }

  if (payment.status !== "pending") {
    return {
      status: "fail",
      reason: "already_processed"
    };
  }

  // Credit PIN Bank
  if (typeof creditPinBank !== "function") {
    return {
      status: "fail",
      reason: "pin_bank_missing"
    };
  }

  const credited = creditPinBank(
    payment.userId,
    payment.amount,
    "PAYMENT VERIFIED",
    payment.paymentId
  );

  if (!credited) {
    return {
      status: "fail",
      reason: "credit_failed"
    };
  }

  payment.status = "verified";
  payment.verifiedAt = Date.now();
  payment.verifiedBy = verifiedBy;

  savePaymentRecords(records);

  return {
    status: "success",
    payment
  };
}

/* ================= REJECT DEPOSIT ================= */

function rejectDeposit(
  paymentId,
  verifiedBy = "SYSTEM",
  reason = "Rejected"
) {

  let records = getPaymentRecords();

  let payment = records.find(
    x => x.paymentId === paymentId
  );

  if (!payment) {
    return {
      status: "fail",
      reason: "payment_not_found"
    };
  }

  if (payment.status !== "pending") {
    return {
      status: "fail",
      reason: "already_processed"
    };
  }

  payment.status = "rejected";
  payment.verifiedAt = Date.now();
  payment.verifiedBy = verifiedBy;
  payment.rejectionReason = reason;

  savePaymentRecords(records);

  return {
    status: "success",
    payment
  };
}

/* ================= WALLET TO PIN BANK ================= */

function transferWalletToPinBank(userId, amount) {

  if (typeof transferIncomeToPinBank !== "function") {
    return {
      status: "fail",
      reason: "wallet_bridge_missing"
    };
  }

  const ok = transferIncomeToPinBank(
    userId,
    amount
  );

  return {
    status: ok ? "success" : "fail"
  };
}

/* ================= GATEWAY CALLBACK ================= */

function processGatewayCallback({
  userId,
  amount,
  transactionId,
  gateway = "manual"
}) {

  // Create payment request
  const created = createDepositRequest({
    userId,
    amount,
    source: gateway,
    reference: transactionId,
    note: "Gateway callback"
  });

  if (created.status !== "success") {
    return created;
  }

  // Optional auto-verification (can be changed)
  return verifyDeposit(
    created.payment.paymentId,
    gateway.toUpperCase()
  );
}

/* ================= REPORTS ================= */

function getUserPayments(userId) {
  return getPaymentRecords()
    .filter(x => x.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function getPendingPayments() {
  return getPaymentRecords()
    .filter(x => x.status === "pending")
    .sort((a, b) => b.createdAt - a.createdAt);
}

/* ================= EXPORT ================= */

window.createDepositRequest = createDepositRequest;
window.verifyDeposit = verifyDeposit;
window.rejectDeposit = rejectDeposit;
window.transferWalletToPinBank = transferWalletToPinBank;
window.processGatewayCallback = processGatewayCallback;
window.getUserPayments = getUserPayments;
window.getPendingPayments = getPendingPayments;
