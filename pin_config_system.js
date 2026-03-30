// =====================
// 🔹 GET PIN SETTINGS
// =====================
function getPinSettings() {
  return JSON.parse(localStorage.getItem("pinSettings") || "{}");
}

// =====================
// 🔹 SAVE PIN SETTINGS
// =====================
function savePinSettings(data) {
  localStorage.setItem("pinSettings", JSON.stringify(data));
}

// =====================
// 🔹 ENABLE PIN
// =====================
function enablePin(type, config) {

  let settings = getPinSettings();

  settings[type] = {
    active: true,
    bv: config.bv,
    amount: config.amount,
    gst: config.gst,
    startDate: config.startDate
  };

  savePinSettings(settings);
}

// =====================
// 🔹 DISABLE PIN
// =====================
function disablePin(type) {

  let settings = getPinSettings();

  if (settings[type]) {
    settings[type].active = false;
  }

  savePinSettings(settings);
}

// =====================
// 🔹 CHECK PIN ACTIVE
// =====================
function isPinActive(type) {

  let settings = getPinSettings();

  if (!settings[type]) return false;

  let start = new Date(settings[type].startDate || 0);
  let now = new Date();

  return settings[type].active === true && now >= start;
}
