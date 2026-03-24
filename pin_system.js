<script>

// =====================
// SYSTEM SETTINGS
// =====================
function getSystemSettings() {
  return JSON.parse(localStorage.getItem("systemSettings") || "{}");
}

function setSystemSettings(data) {
  localStorage.setItem("systemSettings", JSON.stringify(data));
}

// =====================
// PIN DATABASE
// =====================
function getPins() {
  return JSON.parse(localStorage.getItem("pins") || "[]");
}

function savePins(pins) {
  localStorage.setItem("pins", JSON.stringify(pins));
}

// =====================
// PIN TRANSACTIONS
// =====================
function getPinTransactions() {
  return JSON.parse(localStorage.getItem("pinTransactions") || "[]");
}

function savePinTransactions(txns) {
  localStorage.setItem("pinTransactions", JSON.stringify(txns));
}

// =====================
// CREATE PIN TYPE
// =====================
function createPinType(name, amount, bv) {
  let pins = getPins();

  let pin = {
    pinId: "PIN" + Math.floor(Math.random() * 1000000),
    name: name,
    amount: amount,
    bv: bv,
    status: "ACTIVE",
    upgradeEnabled: true,
    repurchaseEnabled: true,
    createdAt: new Date().toISOString(),
    stock: 0,
    used: 0
  };

  pins.push(pin);
  savePins(pins);

  return pin;
}

// =====================
// ADD PIN STOCK
// =====================
function addPinStock(pinId, quantity) {
  let pins = getPins();
  let pin = pins.find(p => p.pinId === pinId);
  if (!pin) return;

  pin.stock += quantity;
  savePins(pins);
}

// =====================
// USE PIN (MAIN ENGINE)
// =====================
function usePin(pinId, userId, type) {

  // BASIC VALIDATION
  if (!pinId || !userId || !type) {
    return alert("Invalid request");
  }

  let pins = getPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) return alert("Invalid pin");

  let system = getSystemSettings();

  // =====================
  // 🔒 SYSTEM LOCK CHECK
  // =====================
  if (system.lockMode) {
    return alert("System is temporarily locked");
  }

  // =====================
  // SYSTEM CHECK
  // =====================
  if (type === "upgrade" && !system.upgradesOpen) {
    return alert("Upgrade is OFF by system");
  }

  if (type === "repurchase" && !system.repurchaseOpen) {
    return alert("Repurchase is OFF by system");
  }

  // =====================
  // PIN PERMISSION CHECK
  // =====================
  if (type === "upgrade" && !pin.upgradeEnabled) {
    return alert("Upgrade not allowed for this pin");
  }

  if (type === "repurchase" && !pin.repurchaseEnabled) {
    return alert("Repurchase not allowed for this pin");
  }

  // =====================
  // STOCK CHECK
  // =====================
  if (pin.stock <= 0) {
    return alert("No stock available");
  }

  // =====================
  // USE PIN
  // =====================
  pin.stock -= 1;
  pin.used += 1;
  savePins(pins);

  // =====================
  // LOG TRANSACTION
  // =====================
  let txns = getPinTransactions();

  txns.push({
    pinId: pinId,
    userId: userId,
    type: type,
    amount: pin.amount,
    bv: pin.bv,
    time: new Date().toISOString()
  });

  savePinTransactions(txns);

  // =====================
  // 🔥 COMMISSION TRIGGER
  // =====================
  if (type === "upgrade") {
    if (typeof payUGLIIncome === "function") {
      payUGLIIncome(userId, pin.bv);
    }
  }

  // =====================
  // 🔥 CTOR POOL TRIGGER
  // =====================
  if (typeof addToCTORPool === "function") {
    addToCTORPool(pin.bv);
  }

  alert("Pin used successfully for " + type);
}

</script>
