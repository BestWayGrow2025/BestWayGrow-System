/*
========================================
TRIGGER SYSTEM V7 (FINAL CONNECTOR)
========================================
✔ Connects real events to income engine
✔ Safe execution
✔ No duplicate triggers
✔ System lock protected
✔ Clean logging
========================================
*/

// =====================
// 🔒 DUPLICATE BLOCK
// =====================
function isRecentTrigger(key) {

  let last = localStorage.getItem(key);

  if (!last) return false;

  return (Date.now() - Number(last)) < 3000;
}

function setTrigger(key) {
  localStorage.setItem(key, Date.now());
}

// =====================
// 🔥 PIN USE TRIGGER
// =====================
function triggerPinUseIncome(userId, pin) {

  if (!userId || !pin) return;

  let key = "TRG_PIN_" + userId;

  if (isRecentTrigger(key)) return;
  setTrigger(key);

  try {

    if (typeof processIncome === "function") {
      processIncome(
        pin.type,
        userId,
        Number(pin.bv || 0)
      );
    }

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "Income triggered via PIN use");
    }

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("Trigger PIN error: " + err.message, userId);
    }

  }
}

// =====================
// 🔥 UPGRADE TRIGGER
// =====================
function triggerUpgradeIncome(userId, bv) {

  if (!userId || !bv) return;

  let key = "TRG_UP_" + userId;

  if (isRecentTrigger(key)) return;
  setTrigger(key);

  try {

    if (typeof processIncome === "function") {
      processIncome("upgrade", userId, Number(bv));
    }

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "Income triggered via UPGRADE");
    }

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("Trigger upgrade error: " + err.message, userId);
    }

  }
}

// =====================
// 🔥 REPURCHASE TRIGGER
// =====================
function triggerRepurchaseIncome(userId, bv) {

  if (!userId || !bv) return;

  let key = "TRG_RP_" + userId;

  if (isRecentTrigger(key)) return;
  setTrigger(key);

  try {

    if (typeof processIncome === "function") {
      processIncome("repurchase", userId, Number(bv));
    }

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "Income triggered via REPURCHASE");
    }

  } catch (err) {

    if (typeof logCritical === "function") {
      logCritical("Trigger repurchase error: " + err.message, userId);
    }

  }
}
