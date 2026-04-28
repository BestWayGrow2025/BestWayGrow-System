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
  try {
    session = JSON.parse(localStorage.getItem("loggedInUser"));
  } catch (err) {
    session = null;
  }

  if (!session || !session.userId) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  let user = null;

  try {
    user = typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;
  } catch (err) {
    user = null;
  }

  if (!user) {
    alert("User not found");
    localStorage.removeItem("loggedInUser");
    window.location.href = "user_login.html";
    return;
  }

  currentUser = user.userId;
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
  let submitBtn = document.getElementById("submitBtn");

  if (!msgBox || !amountInput || lock) return;

  msgBox.innerText = "";

  let amount = Number(amountInput.value.trim());

  if (!amount || amount <= 0) {
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
  if (submitBtn) submitBtn.disabled = true;

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

    if (submitBtn) submitBtn.disabled = false;
  }
}
