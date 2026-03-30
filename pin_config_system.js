// =====================
// 🔹 DEFAULT STRUCTURE
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
// 🔹 GET PIN SETTINGS
// =====================
function getPinSettings() {

  let data = JSON.parse(localStorage.getItem("pinSettings") || "{}");

  if (!data.upgrade) data.upgrade = getDefaultPin();
  if (!data.repurchase) data.repurchase = getDefaultPin();

  return data;
}

// =====================
// 🔹 SAVE PIN SETTINGS
// =====================
function savePinSettings(data) {
  localStorage.setItem("pinSettings", JSON.stringify(data));
}

// =====================
// 🔹 SAFE ACTIVITY LOG
// =====================
function safeActivityLog(msg) {
  if (typeof logActivity === "function") {
    logActivity("ADMIN", "PIN", msg);
  }
}

// =====================
// 🔹 ENABLE PIN (SAFE)
// =====================
function enablePin(type, config) {

  if (!type || !config) return;

  if (isNaN(config.bv) || isNaN(config.amount)) {
    alert("Invalid BV or Amount");
    return;
  }

  let settings = getPinSettings();

  settings[type] = {
    active: true,
    bv: Number(config.bv),
    amount: Number(config.amount),
    gst: Number(config.gst || 0),
    startDate: config.startDate || new Date().toISOString(),
    endDate: config.endDate || null,
    updatedAt: new Date().toISOString()
  };

  savePinSettings(settings);

  safeActivityLog(`${type.toUpperCase()} PIN ENABLED (BV: ${config.bv}, ₹${config.amount})`);

  console.log("✅ PIN ENABLED:", type);
}

// =====================
// 🔹 DISABLE PIN
// =====================
function disablePin(type) {

  let settings = getPinSettings();

  if (!settings[type]) return;

  settings[type].active = false;
  settings[type].updatedAt = new Date().toISOString();

  savePinSettings(settings);

  safeActivityLog(`${type.toUpperCase()} PIN DISABLED`);

  console.log("⛔ PIN DISABLED:", type);
}

// =====================
// 🔹 CHECK PIN ACTIVE
// =====================
function isPinActive(type) {

  let settings = getPinSettings();
  let pin = settings[type];

  if (!pin || !pin.active) return false;

  let now = new Date();
  let start = new Date(pin.startDate || 0);
  let end = pin.endDate ? new Date(pin.endDate) : null;

  if (now < start) return false;
  if (end && now > end) return false;

  return true;
}

// =====================
// 🔹 GET ACTIVE PIN DATA
// =====================
function getActivePin(type) {

  let settings = getPinSettings();
  let pin = settings[type];

  if (!pin) return null;

  if (!isPinActive(type)) return null;

  return pin;
}

// =====================
// 🔒 PIN SYSTEM SAFETY (FINAL 🔥)
// =====================
function isPinSystemSafe(type) {

  let pin = getActivePin(type);

  if (!pin) return false;

  if (isNaN(pin.bv) || pin.bv <= 0) return false;
  if (isNaN(pin.amount) || pin.amount <= 0) return false;

  return true;
}
