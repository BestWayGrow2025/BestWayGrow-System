/*
========================================
PIN CONFIG SYSTEM (FINAL MASTER CONTROL v3)
========================================
✔ Safe defaults
✔ No overwrite bugs
✔ Full system sync
✔ Mode control (AUTO / MANUAL / OFF)
✔ Global OFF protection
✔ Production safe
========================================
*/

// =====================
// 🔹 DEFAULT PIN
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
// 🔹 DEFAULT CONTROLS
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
// 🔹 SAFE PIN SETTINGS
// =====================
function getPinSettings() {
  try {
    let data = JSON.parse(localStorage.getItem("pinSettings") || "{}");

    return {
      upgrade: { ...getDefaultPin(), ...(data.upgrade || {}) },
      repurchase: { ...getDefaultPin(), ...(data.repurchase || {}) }
    };

  } catch {
    let clean = {
      upgrade: getDefaultPin(),
      repurchase: getDefaultPin()
    };
    savePinSettings(clean);
    return clean;
  }
}

function savePinSettings(data) {
  localStorage.setItem("pinSettings", JSON.stringify(data || {}));
}

// =====================
// 🔹 SYSTEM CONTROLS SAFE 🔥
// =====================
function loadSystemControls() {
  try {
    let stored = JSON.parse(localStorage.getItem("systemControls") || "{}");

    let merged = {
      ...getDefaultControls(),
      ...stored
    };

    localStorage.setItem("systemControls", JSON.stringify(merged));
    return merged;

  } catch {
    let clean = getDefaultControls();
    localStorage.setItem("systemControls", JSON.stringify(clean));
    return clean;
  }
}

// =====================
// 🔹 GET PIN MODE
// =====================
function isPinMode(mode) {
  let ctrl = loadSystemControls();
  return ctrl.pinMode === mode;
}

// =====================
// 🔹 SAFE ACTIVITY LOG
// =====================
function safeActivityLog(msg) {
  if (typeof logActivity === "function") {
    logActivity("ADMIN", "PIN", msg);
  }
  console.log("PIN CONFIG:", msg);
}

// =====================
// 🔹 ENABLE PIN
// =====================
function enablePin(type, config) {

  if (!config) {
    alert("Config missing");
    return;
  }

  if (!["upgrade", "repurchase"].includes(type)) {
    alert("Invalid PIN type");
    return;
  }

  if (
    isNaN(config.bv) || isNaN(config.amount) ||
    config.bv <= 0 || config.amount <= 0
  ) {
    alert("Invalid BV or Amount");
    return;
  }

  let settings = getPinSettings();

  settings[type] = {
    active: true,
    bv: Number(config.bv),
    amount: Number(config.amount),
    gst: isNaN(config.gst) ? 0 : Number(config.gst),
    startDate: config.startDate || new Date().toISOString(),
    endDate: config.endDate || null,
    updatedAt: new Date().toISOString()
  };

  savePinSettings(settings);

  safeActivityLog(`${type.toUpperCase()} PIN ENABLED (BV: ${config.bv}, ₹${config.amount})`);
}

// =====================
// 🔹 DISABLE PIN
// =====================
function disablePin(type) {

  if (!["upgrade", "repurchase"].includes(type)) return;

  let settings = getPinSettings();

  if (!settings[type]) return;

  settings[type].active = false;
  settings[type].updatedAt = new Date().toISOString();

  savePinSettings(settings);

  safeActivityLog(`${type.toUpperCase()} PIN DISABLED`);
}

// =====================
// 🔹 CHECK ACTIVE
// =====================
function isPinActive(type) {

  let pin = getPinSettings()[type];

  if (!pin || !pin.active) return false;

  let now = new Date();
  let start = new Date(pin.startDate || 0);
  let end = pin.endDate ? new Date(pin.endDate) : null;

  if (now < start) return false;
  if (end && now > end) return false;

  return true;
}

// =====================
// 🔹 GET ACTIVE PIN (FIXED 🔥)
// =====================
function getActivePin(type) {

  let pin = getPinSettings()[type];

  if (!pin) return null;
  if (!isPinActive(type)) return null;

  return pin;
}

// =====================
// 🔒 SYSTEM SAFETY
// =====================
function isPinSystemSafe(type) {

  // 🔴 GLOBAL OFF MODE
  if (isPinMode("OFF")) return false;

  if (!["upgrade", "repurchase"].includes(type)) return false;

  let pin = getActivePin(type);
  if (!pin) return false;

  if (isNaN(pin.bv) || pin.bv <= 0) return false;
  if (isNaN(pin.amount) || pin.amount <= 0) return false;

  return true;
}

// =====================
// 🔥 USAGE RULE
// =====================
function isPinAllowedForPurpose(pinType, purpose) {
  if (pinType === "upgrade") return true;
  if (pinType === "repurchase" && purpose === "repurchase") return true;
  return false;
}

// =====================
// 🔥 GST HELPER
// =====================
function calculateTotalWithGST(amount, gst) {
  gst = Number(gst || 0);
  return amount + (amount * gst / 100);
}


