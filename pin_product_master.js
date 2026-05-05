/*
========================================
PIN PRODUCT MASTER V1.0 (FOUNDATION LAYER)
========================================
✔ Super Admin controlled PIN product master
✔ Central PIN product config source
✔ Upgrade / Repurchase product separation
✔ GST / BV / Amount controlled here
✔ Active / Inactive safe toggle
✔ Delete lock protection
✔ Single source for all PIN pricing
✔ Used by User / Admin / Super Admin panels
========================================
*/

const PIN_PRODUCT_KEY = "PIN_PRODUCT_MASTER";

// ================= LOAD / SAVE =================
function getPinProducts() {
  let products = safeGet(PIN_PRODUCT_KEY, []);
  return Array.isArray(products) ? products : [];
}

function savePinProducts(products) {
  if (!Array.isArray(products)) return false;
  safeSet(PIN_PRODUCT_KEY, products);
  return true;
}

// ================= ID =================
function generatePinProductId() {
  return "PINPROD_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ================= DEFAULT SEED =================
function seedPinProducts() {
  let products = getPinProducts();
  if (products.length) return;

  products.push({
    productId: generatePinProductId(),
    pinCode: "UP1000",
    pinName: "Upgrade Basic",
    pinType: "upgrade",
    category: "A",
    amount: 1000,
    bv: 700,
    gstPercent: 18,
    status: "active",
    allowTransfer: true,
    allowUserRequest: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  products.push({
    productId: generatePinProductId(),
    pinCode: "RP1000",
    pinName: "Repurchase Basic",
    pinType: "repurchase",
    category: "R",
    amount: 1000,
    bv: 700,
    gstPercent: 18,
    status: "active",
    allowTransfer: false,
    allowUserRequest: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  savePinProducts(products);
}

// ================= CREATE =================
function createPinProduct({
  pinCode,
  pinName,
  pinType,
  category,
  amount,
  bv,
  gstPercent = 0,
  allowTransfer = false,
  allowUserRequest = true
} = {}) {
  if (typeof isSystemSafe === "function" && !isSystemSafe()) return null;

  if (!pinCode || !pinName || !pinType || !category) return null;
  if (!["upgrade", "repurchase"].includes(pinType)) return null;

  amount = Number(amount);
  bv = Number(bv);
  gstPercent = Number(gstPercent);

  if (isNaN(amount) || amount <= 0) return null;
  if (isNaN(bv) || bv <= 0) return null;
  if (isNaN(gstPercent) || gstPercent < 0) return null;

  let products = getPinProducts();

  let exists = products.find(p =>
    p.pinCode === pinCode ||
    p.pinName.toLowerCase() === pinName.toLowerCase()
  );

  if (exists) return null;

  let item = {
    productId: generatePinProductId(),
    pinCode: pinCode.trim().toUpperCase(),
    pinName: pinName.trim(),
    pinType,
    category: category.trim().toUpperCase(),
    amount,
    bv,
    gstPercent,
    status: "active",
    allowTransfer: !!allowTransfer,
    allowUserRequest: !!allowUserRequest,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  products.push(item);
  savePinProducts(products);
  return item;
}

// ================= UPDATE =================
function updatePinProduct(productId, updates = {}) {
  if (!productId) return false;

  let products = getPinProducts();
  let item = products.find(p => p.productId === productId);

  if (!item) return false;

  if (updates.pinName !== undefined) item.pinName = updates.pinName;
  if (updates.category !== undefined) item.category = updates.category;
  if (updates.amount !== undefined) item.amount = Number(updates.amount) || item.amount;
  if (updates.bv !== undefined) item.bv = Number(updates.bv) || item.bv;
  if (updates.gstPercent !== undefined) item.gstPercent = Number(updates.gstPercent) || 0;

  if (updates.allowTransfer !== undefined) item.allowTransfer = !!updates.allowTransfer;
  if (updates.allowUserRequest !== undefined) item.allowUserRequest = !!updates.allowUserRequest;

  item.updatedAt = Date.now();

  savePinProducts(products);
  return true;
}

// ================= TOGGLE =================
function togglePinProduct(productId) {
  let products = getPinProducts();
  let item = products.find(p => p.productId === productId);

  if (!item) return false;

  item.status = item.status === "active" ? "inactive" : "active";
  item.updatedAt = Date.now();

  savePinProducts(products);
  return true;
}

// ================= DELETE =================
function deletePinProduct(productId) {
  let products = getPinProducts();
  let item = products.find(p => p.productId === productId);

  if (!item) return false;

  let used = false;

  if (typeof loadPins === "function") {
    let pins = loadPins();
    used = pins.some(p => p.productId === productId);
  }

  if (used) return false;

  products = products.filter(p => p.productId !== productId);
  savePinProducts(products);
  return true;
}

// ================= ACTIVE =================
function getActivePinProducts(pinType = null) {
  let products = getPinProducts().filter(p => p.status === "active");

  if (pinType) {
    products = products.filter(p => p.pinType === pinType);
  }

  return products;
}

function getPinProductById(productId) {
  return getPinProducts().find(p => p.productId === productId) || null;
}

function getPinProductByCode(pinCode) {
  return getPinProducts().find(p => p.pinCode === pinCode) || null;
}

// ================= USER ACTIVE FETCH =================
function getUserRequestablePins() {
  return getPinProducts().filter(p =>
    p.status === "active" &&
    p.allowUserRequest === true
  );
}

// ================= INIT =================
seedPinProducts();
