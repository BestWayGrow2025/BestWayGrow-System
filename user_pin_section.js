/*
========================================
USER PIN SECTION V3 (FINAL SAFE FLOW)
========================================
✔ UI only layer
✔ No direct wallet mutation
✔ No direct PIN activation
✔ Request-based flow
✔ Safe dependency checks
✔ Auto / Manual mode aware
✔ Stable export for dashboard
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

  const controls =
    typeof getSystemControls === "function"
      ? getSystemControls()
      : { pinMode: "AUTO", enablePinTransfer: true };

  const settings =
    typeof getPinSettings === "function"
      ? getPinSettings()
      : {};

  const upgrade = settings.upgrade || {};
  const repurchase = settings.repurchase || {};

  main.innerHTML = `
    <div class="section-title">PIN SECTION</div>

    <div class="info-box">
      <p><b>PIN Mode:</b> ${controls.pinMode || "AUTO"}</p>
      <p><b>PIN Transfer:</b> ${controls.enablePinTransfer ? "ON" : "OFF"}</p>
    </div>

    <div class="info-box">
      <p><b>Upgrade PIN:</b> ₹${upgrade.amount || 0} | BV ${upgrade.bv || 0}</p>
      <p><b>Repurchase PIN:</b> ₹${repurchase.amount || 0} | BV ${repurchase.bv || 0}</p>
    </div>

    <div class="info-box">
      <label>PIN Type</label>
      <select id="pinType">
        <option value="upgrade">Upgrade PIN</option>
        <option value="repurchase">Repurchase PIN</option>
      </select>

      <label>Quantity</label>
      <input id="pinQty" type="number" min="1" value="1" placeholder="Enter Quantity">

      <label>Payment Ref / Txn ID</label>
      <input id="pinPaymentId" placeholder="Enter Payment Reference">

      <button class="action-btn" onclick="submitPinRequest()">Request PIN</button>
    </div>
  `;
}

// ================= SUBMIT PIN REQUEST =================
function submitPinRequest() {
  const user = getSafeUser();
  if (!user) return;

  if (typeof createPinRequest !== "function") {
    alert("PIN request system unavailable");
    return;
  }

  const type = document.getElementById("pinType")?.value;
  const qty = parseInt(document.getElementById("pinQty")?.value || "1");
  const paymentId = document.getElementById("pinPaymentId")?.value.trim();

  if (!type || !["upgrade", "repurchase"].includes(type)) {
    alert("Invalid PIN type");
    return;
  }

  if (!paymentId) {
    alert("Enter Payment Reference");
    return;
  }

  const config =
    typeof getActivePin === "function"
      ? getActivePin(type)
      : null;

  if (!config) {
    alert("PIN currently unavailable");
    return;
  }

  const safeQty = isNaN(qty) || qty < 1 ? 1 : qty;
  const amount = Number(config.amount || 0) * safeQty;

  try {
    const req = createPinRequest({
      userId: user.userId,
      type,
      amount,
      paymentId,
      quantity: safeQty
    });

    if (!req) {
      alert("PIN request failed");
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
    alert(err.message || "PIN request failed");
  }
}

// ================= GLOBAL EXPORT =================
window.loadPinSection = loadPinSection;
window.submitPinRequest = submitPinRequest;
