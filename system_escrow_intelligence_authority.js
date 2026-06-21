"use strict";

/*
========================================
ESCROW INTELLIGENCE ENGINE V1.0
========================================
✔ PIN + Product unified system brain
✔ AI decision layer (rule-based now, AI-ready later)
✔ Escrow routing logic
✔ Purchase validation engine
✔ Risk + approval prediction layer
✔ SUPER ADMIN controlled execution
========================================
*/

console.log("[ESCROW AI ENGINE] LOADED");

/* ================= CORE CHECK ================= */

function isSystemReady() {
  return typeof getUserById === "function" &&
         typeof loadEscrows === "function" &&
         typeof getPinBank === "function";
}

/* ================= ESCROW DECISION ENGINE ================= */

function analyzeEscrowRequest(data) {

  /*
    INPUT:
    {
      userId,
      type: "PIN" | "PRODUCT",
      amount,
      productId,
      pinType: "upgrade | repurchase"
    }
  */

  if (!isSystemReady()) {
    return {
      status: "blocked",
      reason: "system_not_ready"
    };
  }

  let user = getUserById(data.userId);
  if (!user) {
    return { status: "reject", reason: "user_not_found" };
  }

  let bank = getPinBank(user);

  let score = 0;
  let flags = [];

  // 💰 BALANCE CHECK
  if (bank.balance >= data.amount) {
    score += 40;
  } else {
    flags.push("insufficient_funds");
  }

  // 👤 USER STATUS CHECK
  if (user.status === "active") {
    score += 20;
  } else {
    flags.push("inactive_user");
  }

  // 📦 PRODUCT VALIDATION
  if (data.type === "PRODUCT" && data.productId) {
    score += 20;
  }

  // 📌 PIN TYPE VALIDATION
  if (data.type === "PIN") {

    if (data.pinType === "upgrade") {
      score += 10;
    }

    if (data.pinType === "repurchase") {
      score += 10;
    }
  }

  // ⚠️ FINAL DECISION LOGIC
  let decision = "pending";

  if (score >= 80) {
    decision = "auto_approve";
  } else if (score >= 50) {
    decision = "manual_review";
  } else {
    decision = "reject";
  }

  return {
    decision,
    score,
    flags
  };
}

/* ================= ESCROW ROUTER ================= */

function processEscrow(data) {

  let analysis = analyzeEscrowRequest(data);

  if (analysis.decision === "reject") {
    console.warn("[ESCROW] REJECTED", analysis);
    return null;
  }

  if (analysis.decision === "auto_approve") {

    console.log("[ESCROW] AUTO APPROVED");

    return createEscrow({
      userId: data.userId,
      type: data.type,
      productId: data.productId,
      pinId: data.pinId,
      amount: data.amount,
      bv: data.bv || 0,
      createdBy: "AI_ENGINE"
    });
  }

  if (analysis.decision === "manual_review") {

    console.log("[ESCROW] SENT TO REVIEW QUEUE");

    return createEscrow({
      userId: data.userId,
      type: data.type,
      productId: data.productId,
      pinId: data.pinId,
      amount: data.amount,
      bv: data.bv || 0,
      createdBy: "AI_REVIEW_QUEUE"
    });
  }

  return null;
}

/* ================= EXPORT ================= */

window.analyzeEscrowRequest = analyzeEscrowRequest;
window.processEscrow = processEscrow;
