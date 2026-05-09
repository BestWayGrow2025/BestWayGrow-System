/*
========================================
CORE FINANCIAL ENGINE V1.0 (CENTRALIZED BRAIN)
========================================
✔ Single entry point for all financial execution
✔ Merges trigger + income + wallet + control
✔ Duplicate-safe execution
✔ Session + system safety enforced
✔ Idempotent transaction handling
✔ CTOR + UGLI + RLI unified flow
✔ Wallet atomic commit integrated
✔ Production LOCKED CORE
========================================
*/

"use strict";

// ===============================
// CORE ENTRY
// ===============================
function executeFinancialCore({
  type,
  userId,
  pin,
  bv,
  source = "SYSTEM",
  ref = null
} = {}) {

  let execRef = null;

  try {

    // ================= SYSTEM SAFETY =================
    if (typeof isSystemSafe === "function" && !isSystemSafe()) {
      return false;
    }

    // ================= SESSION CHECK =================
    const session = typeof getSession === "function" ? getSession() : null;

    if (!session || !session.userId) {
      return false;
    }

    if (!userId) {
      userId = session.userId;
    }

    // ================= CONTROL GATE =================
    if (typeof isIncomeAllowed === "function") {
      if (!isIncomeAllowed(type)) {
        return false;
      }
    }

    if (typeof canRunTrigger === "function") {
      if (!canRunTrigger(type)) {
        return false;
      }
    }

    // ================= PIN VALIDATION =================
    if (pin && typeof usePin === "function") {

      const used = usePin(pin.pinId, userId, type);

      if (!used) {
        return false;
      }
    }

    // ================= BV NORMALIZATION =================
    bv = Number(bv || 0);

    if (isNaN(bv) || bv <= 0) {
      return false;
    }

    // ================= UNIQUE REF =================
    execRef = ref || `${type}_${userId}_${Date.now()}`;

    // ================= TRIGGER LAYER =================
    if (
      typeof isRecentTrigger === "function" &&
      typeof isTriggerLocked === "function"
    ) {

      if (
        isRecentTrigger(execRef) ||
        isTriggerLocked(execRef)
      ) {
        return false;
      }

      setTriggerLock(execRef, true);
      setTrigger(execRef);
    }

    // ================= INCOME EXECUTION =================
    let incomeSuccess = false;

    if (typeof processIncome === "function") {
      incomeSuccess = processIncome(type, userId, bv, source, execRef);
    }

    if (!incomeSuccess) {
      return false;
    }

    // ================= WALLET BONUS (OPTIONAL) =================
    if (typeof getSystemBonus === "function") {

      const bonus = getSystemBonus(type, bv);

      if (bonus > 0 && typeof creditWallet === "function") {
        creditWallet(
          userId,
          bonus,
          "SYSTEM_BONUS",
          "BONUS_" + execRef,
          true
        );
      }
    }

    // ================= LOGGING =================
    if (typeof logActivity === "function") {
      logActivity(
        userId,
        "SYSTEM",
        `FINANCIAL ${String(type).toUpperCase()} EXECUTED`,
        source
      );
    }

    return true;

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical(
        "CORE_ENGINE_ERROR: " + err.message,
        userId || "UNKNOWN",
        "CORE_FINANCIAL_ENGINE"
      );
    }

    return false;

  } finally {

    // ================= CLEAN LOCK =================
    if (execRef && typeof setTriggerLock === "function") {
      setTriggerLock(execRef, false);
    }
  }
}

// ===============================
// GLOBAL EXPORT
// ===============================
window.executeFinancialCore = executeFinancialCore;
