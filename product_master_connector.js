"use strict";

/*
========================================
PRODUCT MASTER CONNECTOR (ESCROW LINK LAYER)
========================================
✔ Connects Product Master → PIN Bank
✔ Escrow-based product creation
✔ No direct product issuance
✔ Approval flow enforced
✔ Super Admin controlled release
✔ Stock-safe architecture
✔ Fully traceable system
========================================
*/

/* ================= ESCROW CREATE FOR PRODUCT ================= */

function createProductEscrow(userId, productData) {
  if (!userId || !productData) return null;

  if (typeof createEscrow !== "function") {
    throw new Error("PIN Bank Escrow not loaded");
  }

  const paymentId =
    "PROD_" +
    productData.productName +
    "_" +
    Date.now();

  return createEscrow(
    paymentId,
    userId,
    productData.amount,
    "product"
  );
}

/* ================= PRODUCT PURCHASE REQUEST ================= */

function requestProductPurchase(userId, productData) {
  if (!userId || !productData) return false;

  // Step 1: Validate PIN Bank balance
  if (typeof canPurchaseFromPinBank === "function") {
    const canPay = canPurchaseFromPinBank(
      userId,
      productData.amount
    );

    if (!canPay) {
      return {
        success: false,
        message: "Insufficient PIN Bank balance"
      };
    }
  }

  // Step 2: Create escrow entry
  const escrow = createProductEscrow(
    userId,
    productData
  );

  if (!escrow) {
    return {
      success: false,
      message: "Escrow creation failed"
    };
  }

  // Step 3: Log request
  console.log(
    "[PRODUCT REQUEST CREATED]",
    escrow
  );

  return {
    success: true,
    escrowId: escrow.escrowId,
    paymentId: escrow.paymentId,
    status: "PENDING_APPROVAL"
  };
}

/* ================= SYSTEM APPROVAL ================= */

function approveProductEscrow(escrowId) {
  if (typeof systemApproveEscrow !== "function") {
    return false;
  }

  return systemApproveEscrow(escrowId);
}

/* ================= SUPER ADMIN FINAL APPROVAL ================= */

function superApproveProductEscrow(escrowId) {
  if (typeof superApproveEscrow !== "function") {
    return false;
  }

  return superApproveEscrow(escrowId);
}

/* ================= FINAL PRODUCT RELEASE ================= */

function releaseProduct(escrowId, productFactory) {
  if (!escrowId) return false;

  if (typeof releaseFromEscrow !== "function") {
    return false;
  }

  const released = releaseFromEscrow(escrowId);

  if (!released) return false;

  // Optional product creation hook
  if (typeof productFactory === "function") {
    productFactory();
  }

  console.log(
    "[PRODUCT RELEASED]",
    escrowId
  );

  return true;
}

/* ================= FETCH USER PRODUCT STATUS ================= */

function getUserProductRequests(userId) {
  if (typeof safeGet !== "function") return [];

  const ledger =
    safeGet("PIN_BANK_LEDGER", []) || [];

  return ledger.filter(
    x =>
      x.userId === userId &&
      x.type === "product"
  );
}

/* ================= EXPORTS ================= */

window.createProductEscrow =
  createProductEscrow;

window.requestProductPurchase =
  requestProductPurchase;

window.approveProductEscrow =
  approveProductEscrow;

window.superApproveProductEscrow =
  superApproveProductEscrow;

window.releaseProduct =
  releaseProduct;

window.getUserProductRequests =
  getUserProductRequests;
