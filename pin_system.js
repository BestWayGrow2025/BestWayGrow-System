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
// USE PIN
// =====================
function usePin(pinId, userId, type) {
  let pins = getPins();
  let pin = pins.find(p => p.pinId === pinId);
  if (!pin) return alert("Invalid pin");

  let system = getSystemSettings();

  // Check system ON/OFF
  if (type === "upgrade" && !system.upgrade) {
    return alert("Upgrade is OFF by system");
  }

  if (type === "repurchase" && !system.repurchase) {
    return alert("Repurchase is OFF by system");
  }

  // Check pin permissions
  if (type === "upgrade" && !pin.upgradeEnabled) {
    return alert("Upgrade not allowed for this pin");
  }

  if (type === "repurchase" && !pin.repurchaseEnabled) {
    return alert("Repurchase not allowed for this pin");
  }

  if (pin.stock <= 0) {
    return alert("No stock available");
  }

  // Deduct stock
  pin.stock -= 1;
  pin.used += 1;

  savePins(pins);

  // Log transaction
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

  alert("Pin used successfully for " + type);
}
</script>
