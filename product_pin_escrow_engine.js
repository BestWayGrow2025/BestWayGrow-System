"use strict";

/*
========================================
PRODUCT + PIN + ESCROW CORE ENGINE V1.0
========================================
✔ Unified product system
✔ PIN generation control
✔ Stock tracking
✔ Escrow-based purchase only
✔ NO direct creation allowed
✔ Fully Super Admin controlled
✔ AI ready structure
========================================
*/

console.log("[PRODUCT-PIN-ESCROW ENGINE] LOADED");

/* ================= PRODUCT MASTER ================= */

function getProductCatalog() {
  return safeGet("PRODUCT_MASTER", []);
}

function saveProductCatalog(data) {
  safeSet("PRODUCT_MASTER", Array.isArray(data) ? data : []);
}

/* ================= PRODUCT STRUCTURE ================= */

function createProduct({
  name,
  category,
  price,
  bv,
  type = "upgrade" // upgrade | repurchase
}) {

  let products = getProductCatalog();

  const product = {
    productId: "PRD_" + Date.now() + "_" + Math.floor(Math.random() * 9999),

    name,
    category,

    price: Number(price || 0),
    bv: Number(bv || 0),

    type,

    active: true,
    createdAt: Date.now()
  };

  products.push(product);
  saveProductCatalog(products);

  return product;
}

/* ================= PIN GENERATOR ================= */

function generateSystemPin(productId, type = "upgrade") {

  if (!productId) return null;

  return {
    pinId: "PIN_" + Date.now() + "_" + Math.floor(Math.random() * 999999),

    productId,
    type, // upgrade OR repurchase ONLY

    status: "available",

    assignedTo: null,
    usedBy: null,

    createdAt: Date.now()
  };
}

/* ================= PIN STOCK SYSTEM ================= */

function createPinStock(productId, count = 1, type = "upgrade") {

  let pins = safeGet("PIN_STOCK", []);
  if (!Array.isArray(pins)) pins = [];

  for (let i = 0; i < count; i++) {
    pins.push(generateSystemPin(productId, type));
  }

  safeSet("PIN_STOCK", pins);

  return true;
}

/* ================= ESCROW PURCHASE FLOW ================= */

function requestPurchase({
  userId,
  productId,
  type,
  quantity = 1
}) {

  let product = getProductCatalog()
    .find(p => p.productId === productId);

  if (!product) {
    return { status: "fail", reason: "product_not_found" };
  }

  let amount = product.price * quantity;

  // STEP 1 → AI Escrow Decision
  let analysis = typeof analyzeEscrowRequest === "function"
    ? analyzeEscrowRequest({
        userId,
        type: "PRODUCT",
        amount,
        productId
      })
    : { decision: "manual_review" };

  // STEP 2 → Create Escrow
  let escrow = typeof processEscrow === "function"
    ? processEscrow({
        userId,
        type: "PRODUCT",
        productId,
        amount,
        bv: product.bv
      })
    : null;

  return {
    analysis,
    escrow
  };
}

/* ================= PIN ALLOCATION ================= */

function allocatePinToUser(userId, productId, type) {

  let pins = safeGet("PIN_STOCK", []);
  if (!Array.isArray(pins)) return false;

  let pin = pins.find(p =>
    p.productId === productId &&
    p.type === type &&
    p.status === "available"
  );

  if (!pin) return false;

  pin.status = "assigned";
  pin.assignedTo = userId;
  pin.assignedAt = Date.now();

  safeSet("PIN_STOCK", pins);

  return pin;
}

/* ================= STOCK CHECK ================= */

function getProductStock(productId) {

  let pins = safeGet("PIN_STOCK", []);
  if (!Array.isArray(pins)) return 0;

  return pins.filter(p =>
    p.productId === productId &&
    p.status === "available"
  ).length;
}

/* ================= FINAL EXPORT ================= */

window.createProduct = createProduct;
window.createPinStock = createPinStock;
window.requestPurchase = requestPurchase;
window.allocatePinToUser = allocatePinToUser;
window.getProductStock = getProductStock;
window.generateSystemPin = generateSystemPin;
