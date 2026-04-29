/*
========================================
💳 PAYMENT REQUEST SYSTEM V6 (FINAL SAFE PATCH)
========================================
✔ Core boot aligned
✔ Session auth guarded
✔ Request-only queue layer
✔ No wallet mutation
✔ No withdrawal mutation
✔ Pending duplicate blocked
✔ safeGet / safeSet aligned
✔ Corruption-safe storage
✔ UI-only financial intake
✔ Production locked
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

const PAYMENT_KEY = "payments";

// =====================
// BOOT
// =====================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

// =====================
// INIT
// =====================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

// =====================
// AUTH
// =====================
function authPage() {
  let stored =
    typeof safeGet === "function"
      ? safeGet("loggedInUser", null)
      : JSON.parse(localStorage.getItem("loggedInUser") || "null");

  session = stored;

  if (!session || !session.userId) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  currentUser = session;
}

// =====================
// EVENTS
// =====================
function bindEvents() {
  let submitBtn = document.getElementById("submitBtn");

  if (submitBtn) {
    submitBtn.addEventListener("click", submitPayment);
  }
}

// =====================
// LOAD
// =====================
function loadPage() {
  let userDisplay = document.getElementById("userDisplay");

  if (userDisplay && currentUser) {
    userDisplay.innerText = "User ID: " + currentUser.userId;
  }
}

// =====================
// HELPERS
// =====================
function generateId() {
  return "PAY_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
}

function getPayments() {
  let data =
    typeof safeGet === "function"
      ? safeGet(PAYMENT_KEY, [])
      : JSON.parse(localStorage.getItem(PAYMENT_KEY) || "[]");

  return Array.isArray(data) ? data : [];
}

function savePayments(data) {
  if (!Array.isArray(data)) data = [];

  if (typeof safeSet === "function") {
    safeSet(PAYMENT_KEY, data);
  } else {
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(data));
  }
}

function hasPendingPayment(userId, type) {
  let payments = getPayments();

  return payments.find(function (payment) {
    return (
      payment.userId === userId &&
      payment.type === type &&
      (
        payment.status === "processing" ||
        payment.verificationStatus === "pending"
      )
    );
  });
}

// =====================
// SUBMIT
// =====================
function submitPayment() {
  if (lock) return;

  let amount = Number(document.getElementById("amount").value.trim());
  let type = document.getElementById("type").value;
  let userId = currentUser && currentUser.userId;

  if (!userId) {
    showMsg("❌ Invalid session");
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    showMsg("❌ Enter valid amount");
    return;
  }

  if (!type) {
    showMsg("❌ Select payment type");
    return;
  }

  if (hasPendingPayment(userId, type)) {
    showMsg("⚠️ Payment already in process. Please wait.");
    return;
  }

  lock = true;

  try {
    let payments = getPayments();

    let newPayment = {
      paymentId: generateId(),
      userId: userId,
      amount: parseFloat(amount.toFixed(2)),
      type: type,

      status: "processing",
      verificationStatus: "pending",
      serviceStatus: "pending",

      flow: "payment_to_finance",
      createdAt: new Date().toISOString()
    };

    payments.push(newPayment);
    savePayments(payments);

    showMsg("✅ Payment submitted. Waiting for verification.");

    document.getElementById("amount").value = "";

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("Payment request error: " + err.message, userId || "SYSTEM", "PAYMENT");
    }

    showMsg("❌ Payment submit failed");
  } finally {
    lock = false;
  }
}

// =====================
// UI
// =====================
function showMsg(text) {
  let msg = document.getElementById("msg");

  if (msg) {
    msg.innerText = text;
  }
}
