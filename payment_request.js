let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

function authPage() {
  session = JSON.parse(localStorage.getItem("loggedInUser") || "null");

  if (!session || !session.userId) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  currentUser = session;
}

function bindEvents() {
  let submitBtn = document.getElementById("submitBtn");

  if (submitBtn) {
    submitBtn.addEventListener("click", submitPayment);
  }
}

function loadPage() {
  let userDisplay = document.getElementById("userDisplay");

  if (userDisplay && currentUser) {
    userDisplay.innerText = "User ID: " + currentUser.userId;
  }
}

function generateId() {
  return "PAY" + Date.now();
}

function getPayments() {
  return JSON.parse(localStorage.getItem("payments") || "[]");
}

function savePayments(data) {
  localStorage.setItem("payments", JSON.stringify(data));
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

function submitPayment() {
  if (lock) return;

  let amount = document.getElementById("amount").value.trim();
  let type = document.getElementById("type").value;
  let userId = currentUser.userId;

  if (!amount) {
    showMsg("❌ Enter amount");
    return;
  }

  if (hasPendingPayment(userId, type)) {
    showMsg("⚠️ Payment already in process. Please wait.");
    return;
  }

  lock = true;

  let payments = getPayments();

  let newPayment = {
    paymentId: generateId(),
    userId: userId,
    amount: Number(amount),
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

  lock = false;
}

function showMsg(text) {
  let msg = document.getElementById("msg");

  if (msg) {
    msg.innerText = text;
  }
}
