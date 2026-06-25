"use strict";

function processEscrowRequest(request) {
  if (!request || !request.amount) return false;

  // STEP 1: LOCK FUNDS
  const locked = debitEscrow(request.amount, {
    purpose: request.type,
    userId: request.userId
  });

  if (!locked) return false;

  // STEP 2: GENERATE OUTPUT
  if (request.type === "PIN") {
    return generatePin(request);
  }

  if (request.type === "PRODUCT") {
    return activateProduct(request);
  }

  return false;
}

function generatePin(req) {
  const pin = "PIN_" + Math.floor(Math.random() * 99999999);

  return {
    pin,
    status: "ISSUED",
    userId: req.userId
  };
}

function activateProduct(req) {
  return {
    productId: req.productId,
    status: "ACTIVE",
    userId: req.userId
  };
}

window.processEscrowRequest = processEscrowRequest;
