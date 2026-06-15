"use strict";

/*
========================================
USER PIN SECTION V4 (FINAL SINGLE PATH RULE)
========================================
✔ Product-driven PIN system
✔ Reads from pin_product_master.js
✔ Uses createPinRequest only (no direct mutation)
✔ Safe fallback handling
✔ Role-safe execution guard
✔ No duplicate logic paths
✔ UI-only layer (STRICT)
✔ Production safe final version
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  const user = typeof getCurrentUser === "function"
    ? getCurrentUser()
    : null;

  if (!user) {
    const main = document.getElementById("mainContent");
    if (main) {
      main.innerHTML = "<div class='info-box'>Login Required</div>";
    }
    return null;
  }

  return user;
}

// ================= LOAD PIN SECTION =================
function loadPinSection() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const products =
    typeof getUserRequestablePins === "function"
      ? getUserRequestablePins()
      : [];

  const controls =
    typeof getSystemControls === "function"
      ? getSystemControls()
      : { pinMode: "AUTO", enablePinTransfer: true };

  const options = products.length
    ? products.map(p => `
        <option value="${p.productId}">
          ${p.pinCode} | ${p.pinName} | ₹${p.amount} | BV ${p.bv} | GST ${p.gstPercent}%
        </option>
      `).join("")
    : `<option value="">No Active PIN Available</option>`;

  main.innerHTML = `
    <div class="section-title">PIN SECTION</div>

    <div class="info-box">
      <p><b>PIN Mode:</b> ${controls.pinMode}</p>
      <p><b>PIN Transfer:</b> ${controls.enablePinTransfer ? "ON" : "OFF"}</p>
    </div>

    <div class="info-box">
      <label>Select PIN Product</label>
      <select id="pinProductSelect" onchange="previewPinProduct()">
        ${options}
      </select>
    </div>

    <div class="info-box" id="pinPreviewBox">
      Select PIN Product
    </div>

    <div class="info-box">
      <label>Quantity</label>
      <input id="pinQty" type="number" min="1" value="1">

      <label>Payment Reference</label>
      <input id="pinPaymentId" placeholder="Enter Payment Reference">

      <button onclick="submitPinRequest()">Request PIN</button>
    </div>
  `;

  previewPinProduct();
}

// ================= PREVIEW PIN =================
function previewPinProduct() {
  const box = document.getElementById("pinPreviewBox");
  const productId = document.getElementById("pinProductSelect")?.value;

  if (!box) return;

  if (!productId || typeof getPinProductById !== "function") {
    box.innerHTML = "No Active PIN Available";
    return;
  }

  const p = getPinProductById(productId);

  if (!p) {
    box.innerHTML = "No Active PIN Available";
    return;
  }

  box.innerHTML = `
    <p><b>PIN Code:</b> ${p.pinCode}</p>
    <p><b>Name:</b> ${p.pinName}</p>
    <p><b>Type:</b> ${p.pinType}</p>
    <p><b>Category:</b> ${p.category}</p>
    <p><b>Amount:</b> ₹${p.amount}</p>
    <p><b>BV:</b> ${p.bv}</p>
    <p><b>GST:</b> ${p.gstPercent}%</p>
  `;
}

// ================= SUBMIT PIN REQUEST =================
function submitPinRequest() {
  const user = getSafeUser();
  if (!user) return;

  if (typeof createPinRequest !== "function") {
    alert("PIN system unavailable");
    return;
  }

  const productId = document.getElementById("pinProductSelect")?.value;
  const qty = parseInt(document.getElementById("pinQty")?.value || "1");
  const paymentId = document.getElementById("pinPaymentId")?.value.trim();

  if (!productId) {
    alert("Select PIN Product");
    return;
  }

  if (!paymentId) {
    alert("Enter Payment Reference");
    return;
  }

  const product =
    typeof getPinProductById === "function"
      ? getPinProductById(productId)
      : null;

  if (!product || product.status !== "active") {
    alert("PIN not available");
    return;
  }

  const safeQty = qty < 1 || isNaN(qty) ? 1 : qty;
  const amount = Number(product.amount || 0) * safeQty;

  // ================= SECURITY GATE =================
  if (typeof canExecutePinAction === "function") {
    const role = user?.role || "user";

    const allowed = canExecutePinAction(
      "APPROVE",
      { status: "pending" },
      role
    );

    if (!allowed) {
      alert("Not authorized");
      return;
    }
  }

  try {
    const req = createPinRequest({
      userId: user.userId,
      type: product.pinType,
      amount,
      paymentId,
      quantity: safeQty
    });

    if (!req) {
      alert("Request failed");
      return;
    }

    if (typeof logActivity === "function") {
      logActivity(
        user.userId,
        "USER",
        "PIN REQUEST CREATED",
        "USER_PIN_SECTION"
      );
    }

    alert("PIN Request Submitted Successfully");
    loadPinSection();

  } catch (err) {
    alert(err.message || "Request failed");
  }
}

// ================= EXPORT =================
window.loadPinSection = loadPinSection;
window.previewPinProduct = previewPinProduct;
window.submitPinRequest = submitPinRequest;
