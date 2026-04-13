/*
========================================
PIN CONFIG SYSTEM V7.4 (ABSOLUTE FINAL)
========================================
✔ Core aligned
✔ Full validation
✔ LockMode protected
✔ Mode-safe operations (AUTO / MANUAL / OFF)
✔ Date safe
✔ SystemControls standardized
✔ Return-safe functions
✔ Cross-file compatible
✔ Production ready
========================================
*/

// =====================
// DEFAULT PIN
// =====================
function getDefaultPin() {
  return {
    active: false,
    bv: 0,
    amount: 0,
    gst: 0,
    startDate: null,
    endDate: null,
    updatedAt: null
  };
}

// =====================
// DEFAULT CONTROLS
// =====================
function getDefaultControls() {
  return {
    pinMode: "AUTO", // AUTO / MANUAL / OFF
    enablePinRefund: true,
    enableFranchiseSecurity: false,
    enableMinStockRule: false,
    enableDirectUserPayment: true
  };
}

// =====================
// PIN SETTINGS
// =====================
function getPinSettings() {
  let data = safeGet("pinSettings", {});

  let merged = {
    upgrade: { ...getDefaultPin(), ...(data.upgrade || {}) },
    repurchase: { ...getDefaultPin(), ...(data.repurchase || {}) }
  };

  safeSet("pinSettings", merged);
  return merged;
}

function savePinSettings(data) {
  if (!data || typeof data !== "object") return false;

  let safeData = {
    upgrade: { ...getDefaultPin(), ...(data.upgrade || {}) },
    repurchase: { ...getDefaultPin(), ...(data.repurchase || {}) }
  };

  safeSet("pinSettings", safeData);
  return true;
}

// =====================
// SYSTEM CONTROLS
// =====================
function getSystemControls() {
  let stored = safeGet("systemControls", {});

  let merged = {
    ...getDefaultControls(),
    ...(typeof stored === "object" ? stored : {})
  };

  safeSet("systemControls", merged);
  return merged;
}

function saveSystemControls(data) {
  if (!data || typeof data !== "object") return false;

  let safeData = {
    ...getDefaultControls(),
    ...data
  };

  safeSet("systemControls", safeData);
  return true;
}

// =====================
// PIN MODE
// =====================
function isPinMode(mode) {
  return getSystemControls().pinMode === mode;
}

// =====================
// ACTIVITY LOG
// =====================
function safeActivityLog(msg) {
  if (typeof logActivity === "function") {
    logActivity("ADMIN", "PIN", msg);
  }
  console.log("PIN CONFIG:", msg);
}

// =====================
// ENABLE PIN
// =====================
function enablePin(type, config) {

  if (!config) return false;
  if (!["upgrade", "repurchase"].includes(type)) return false;

  // 🔒 SYSTEM LOCK
  if (typeof isSystemSafe === "function" && !isSystemSafe()) return false;

  // 🔒 MODE OFF BLOCK
  if (isPinMode("OFF")) return false;

  let bv = Number(config.bv);
  let amount = Number(config.amount);
  let gst = Number(config.gst || 0);

  if (isNaN(bv) || bv <= 0 || isNaN(amount) || amount <= 0) return false;

  let settings = getPinSettings();

  settings[type] = {
    active: true,
    bv: bv,
    amount: amount,
    gst: isNaN(gst) ? 0 : gst,
    startDate: config.startDate || new Date().toISOString(),
    endDate: config.endDate || null,
    updatedAt: new Date().toISOString()
  };

  savePinSettings(settings);

  safeActivityLog(type.toUpperCase() + " PIN ENABLED");

  return true;
}

// =====================
// DISABLE PIN
// =====================
function disablePin(type) {

  if (!["upgrade", "repurchase"].includes(type)) return false;

  if (typeof isSystemSafe === "function" && !isSystemSafe()) return false;

  let settings = getPinSettings();

  settings[type].active = false;
  settings[type].updatedAt = new Date().toISOString();

  savePinSettings(settings);

  safeActivityLog(type.toUpperCase() + " PIN DISABLED");

  return true;
}

// =====================
// SAFE DATE
// =====================
function safeDate(d) {
  if (!d) return null;
  let date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
}

// =====================
// CHECK ACTIVE
// =====================
function isPinActive(type) {

  let pin = getPinSettings()[type];
  if (!pin || !pin.active) return false;

  let now = new Date();

  let start = safeDate(pin.startDate);
  let end = pin.endDate ? safeDate(pin.endDate) : null;

  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
}

// =====================
// GET ACTIVE PIN
// =====================
function getActivePin(type) {

  let pin = getPinSettings()[type];
  if (!pin) return null;

  if (!isPinActive(type)) return null;

  return pin;
}

// =====================
// SYSTEM SAFETY
// =====================
function isPinSystemSafe(type) {

  if (typeof isSystemSafe === "function" && !isSystemSafe()) return false;

  if (isPinMode("OFF")) return false;

  if (!["upgrade", "repurchase"].includes(type)) return false;

  let pin = getActivePin(type);
  if (!pin) return false;

  if (isNaN(pin.bv) || pin.bv <= 0) return false;
  if (isNaN(pin.amount) || pin.amount <= 0) return false;

  return true;
}

// =====================
// USAGE RULE
// =====================
function isPinAllowedForPurpose(pinType, purpose) {
  if (pinType === "upgrade") return true;
  if (pinType === "repurchase" && purpose === "repurchase") return true;
  return false;
}

// =====================
// GST HELPER
// =====================
function calculateTotalWithGST(amount, gst) {
  gst = Number(gst || 0);
  return amount + (amount * gst / 100);
}
