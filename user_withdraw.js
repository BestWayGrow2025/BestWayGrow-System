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
  session = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!session) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  currentUser = session.userId;
}

function bindEvents() {
  let submitBtn = document.getElementById("submitBtn");

  if (submitBtn) {
    submitBtn.addEventListener("click", submitWithdraw);
  }
}

function loadPage() {
  let userIdEl = document.getElementById("userId");

  if (userIdEl && currentUser) {
    userIdEl.innerText = currentUser;
  }
}

function submitWithdraw() {
  let msgBox = document.getElementById("msg");
  let amountInput = document.getElementById("amount");

  if (!msgBox || !amountInput || lock) return;

  let amount = parseFloat(amountInput.value);
  msgBox.innerText = "";

  if (isNaN(amount) || amount <= 0) {
    msgBox.innerText = "❌ Invalid amount";
    return;
  }

  if (typeof isWithdrawSystemSafe === "function" && !isWithdrawSystemSafe()) {
    msgBox.innerText = "⛔ Withdraw system disabled";
    return;
  }

  if (typeof requestWithdraw !== "function") {
    msgBox.innerText = "❌ Withdraw system error";
    return;
  }

  lock = true;

  try {
    requestWithdraw(currentUser, amount);

    msgBox.innerText = "✅ Withdraw request submitted";
    amountInput.value = "";

    setTimeout(() => {
      window.location.href = "user_dashboard.html";
    }, 1500);

  } catch (err) {
    console.error(err);
    msgBox.innerText = "❌ Error processing request";
    lock = false;
  }
}
