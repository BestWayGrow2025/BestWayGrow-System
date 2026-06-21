"use strict";

/*
========================================
ESCROW AI FRAUD ENGINE V1.0
========================================
✔ Fraud detection scoring
✔ Auto approve / reject logic
✔ Risk engine
✔ PIN Bank safety protection
========================================
*/

console.log("[ESCROW AI FRAUD ENGINE] LOADED");

function analyzeFraudRisk(data) {

  let score = 0;
  let flags = [];

  let user = typeof getUserById === "function"
    ? getUserById(data.userId)
    : null;

  if (!user) {
    return { decision: "reject", reason: "invalid_user" };
  }

  // 💰 Balance check
  let bank = typeof getPinBank === "function"
    ? getPinBank(user)
    : { balance: 0 };

  if (bank.balance >= data.amount) {
    score += 40;
  } else {
    flags.push("low_balance");
  }

  // 👤 user status
  if (user.status === "active") {
    score += 20;
  } else {
    flags.push("inactive");
  }

  // 📦 product validation
  if (data.productId) {
    score += 20;
  }

  // 📌 repeat usage risk
  if ((user.usedPinCount || 0) > 10) {
    flags.push("high_usage");
    score -= 10;
  }

  // ⚠ decision
  let decision = "manual_review";

  if (score >= 80) decision = "auto_approve";
  if (score < 50) decision = "reject";

  return {
    decision,
    score,
    flags
  };
}

window.analyzeFraudRisk = analyzeFraudRisk;
