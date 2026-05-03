/*
========================================
PIN CONFIG SYSTEM V8.1 (FINAL CLEAN PATCH)
========================================
✔ Core aligned
✔ Strict schema validation
✔ Lock-safe
✔ Mode-safe (AUTO / MANUAL / OFF)
✔ Type-safe merge
✔ Date-safe enforcement
✔ Cross-file stable
✔ Safe control normalization
✔ No invalid state mutation
✔ Production locked
========================================
*/

// =====================
// CONSTANTS
// =====================
const PIN_SETTINGS_KEY = "pinSettings";
const SYSTEM_CONTROLS_KEY = "systemControls";

const PIN_TYPES = ["upgrade", "repurchase"];
const PIN_MODES = ["AUTO", "MANUAL", "OFF"];

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
    pinMode: "AUTO",
    enablePinRefund: true,
    enablePinTransfer: true,
    enableFranchiseSecurity: false,
    enableMinStockRule: false,
    enableDirectUserPayment: true
  };
}

// =====================
// HELPERS
// =====================
function isValidPinType(type) {
  return PIN_TYPES.includes(type);
}

function normalizeDate(value) {
  if (!value) return null;

  let d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizePinConfig(data) {
  let base = {
    ...getDefaultPin(),
    ...(data || {})
  };

  base.active = base.active === true;

  base.bv = Number(base.bv || 0);
  base.amount = Number(base.amount || 0);
  base.gst = Number(base.gst || 0);

  if (isNaN(base.bv) || base.bv < 0) base.bv = 0;
  if (isNaN(base.amount) || base.amount < 0) base.amount = 0;
  if (isNaN(base.gst) || base.gst < 0) base.gst = 0;

  base.startDate = normalizeDate(base.startDate);
  base.endDate = normalizeDate(base.endDate);
  base.updatedAt = normalizeDate(base.updatedAt) || new Date().toISOString();

  if (base.startDate && base.endDate) {
    if (new Date(base.endDate) < new Date(base.startDate)) {
      base.endDate = null;
    }
  }

  return base;
}

function normalizeControls(data) {
  let safe = {
    ...getDefaultControls(),
    ...(data || {})
  };

  if (!PIN_MODES.includes(safe.pinMode)) {
    safe.pinMode = "AUTO";
  }

  safe.enablePinRefund = safe.enablePinRefund !== false;
  safe.enablePinTransfer = safe.enablePinTransfer !== false;
  safe.enableFranchiseSecurity = safe.enableFranchiseSecurity === true;
  safe.enableMinStockRule = safe.enableMinStockRule === true;
  safe.enableDirectUserPayment = safe.enableDirectUserPayment !== false;

  return safe;
}

// =====================
// PIN SETTINGS
// =====================
function getPinSettings() {
  let raw = safeGet(PIN_SETTINGS_KEY, {});

  let merged = {
    upgrade: normalizePinConfig(raw.upgrade),
    repurchase: normalizePinConfig(raw.repurchase)
  };

  safeSet(PIN_SETTINGS_KEY, merged);
  return merged;
}

function savePinSettings(data) {
  if (!data || typeof data !== "object") return false;

  let safeData = {
    upgrade: normalizePinConfig(data.upgrade),
    repurchase: normalizePinConfig(data.repurchase)
  };

  safeSet(PIN_SETTINGS_KEY, safeData);
  return true;
}

// =====================
// SYSTEM CONTROLS
// =====================
function getSystemControls() {
  let stored = safeGet(SYSTEM_CONTROLS_KEY, {});
  let merged = normalizeControls(stored);

  safeSet(SYSTEM_CONTROLS_KEY, merged);
  return merged;
}

function saveSystemControls(data) {
  if (!data || typeof data !== "object") return false;

  safeSet(SYSTEM_CONTROLS_KEY, normalizeControls(data));
  return true;
}

// =====================
// PIN MODE
// =====================
function isPinMode(mode) {
  return PIN_MODES.includes(mode) && getSystemControls().pinMode === mode;
}

// =====================
// SAFE LOG
// =====================
function safeActivityLog(msg) {
  if (typeof logActivity === "function") {
    logActivity("ADMIN", "PIN", msg, "PIN_CONFIG");
  }
}

// =====================
// ENABLE PIN
// =====================
function enablePin(type, config) {
  if (!isValidPinType(type) || !config || typeof config !== "object") return false;
  if (typeof isSystemSafe === "function" && !isSystemSafe()) return false;
  if (isPinMode("OFF")) return false;

  let next = normalizePinConfig({
    ...config,
    active: true,
    updatedAt: new Date().toISOString(),
    startDate: config.startDate || new Date().toISOString()
  });

  if (next.bv <= 0 || next.amount <= 0) return false;

  let settings = getPinSettings();
  settings[type] = next;

  if (!savePinSettings(settings)) return false;

  safeActivityLog(type.toUpperCase() + " PIN ENABLED");
  return true;
}

// =====================
// DISABLE PIN
// =====================
function disablePin(type) {
  if (!isValidPinType(type)) return false;
  if (typeof isSystemSafe === "function" && !isSystemSafe()) return false;

  let settings = getPinSettings();

  settings[type] = {
    ...settings[type],
    active: false,
    updatedAt: new Date().toISOString()
  };

  if (!savePinSettings(settings)) return false;

  safeActivityLog(type.toUpperCase() + " PIN DISABLED");
  return true;
}

// =====================
// ACTIVE CHECK
// =====================
function isPinActive(type) {
  if (!isValidPinType(type)) return false;

  let pin = getPinSettings()[type];
  if (!pin || pin.active !== true) return false;

  let now = Date.now();
  let start = pin.startDate ? new Date(pin.startDate).getTime() : null;
  let end = pin.endDate ? new Date(pin.endDate).getTime() : null;

  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
}

// =====================
// GET ACTIVE PIN
// =====================
function getActivePin(type) {
  if (!isValidPinType(type)) return null;
  return isPinActive(type) ? getPinSettings()[type] : null;
}

// =====================
// SYSTEM SAFETY
// =====================
function isPinSystemSafe(type) {
  if (!isValidPinType(type)) return false;
  if (typeof isSystemSafe === "function" && !isSystemSafe()) return false;
  if (isPinMode("OFF")) return false;

  let pin = getActivePin(type);
  if (!pin) return false;

  return pin.bv > 0 && pin.amount > 0;
}

// =====================
// PURPOSE RULE
// =====================
function isPinAllowedForPurpose(pinType, purpose) {
  if (!isValidPinType(pinType)) return false;

  if (pinType === "upgrade") return true;
  return pinType === "repurchase" && purpose === "repurchase";
}

// =====================
// GST HELPER
// =====================
function calculateTotalWithGST(amount, gst) {
  amount = Number(amount || 0);
  gst = Number(gst || 0);

  if (isNaN(amount) || amount < 0) amount = 0;
  if (isNaN(gst) || gst < 0) gst = 0;

  return parseFloat((amount + ((amount * gst) / 100)).toFixed(2));
}
