"use strict";

/*
========================================
USER WITHDRAW SYSTEM (FINAL V1 - SINGLE PATH RULE)
========================================
✔ Core system safe initialization
✔ Session-based authentication
✔ Secure user resolution
✔ Withdraw guard integration
✔ UI-only responsibility (NO BUSINESS LOGIC)
✔ Lock-safe submission control
✔ Production hardened flow
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

function forceLogout() {

  if (typeof logoutSession === "function") {
    logoutSession();
    return;
  }

  window.location.replace("user_login.html");
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

// ================= CORE INIT =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

// ================= AUTH =================
function authPage() {

  if (typeof getSession !== "function") {
    return forceLogout();
  }

  session = getSession();

  if (!session) {
    return forceLogout();
  }

  if (typeof getCurrentUser !== "function") {
    return forceLogout();
  }

  currentUser = getCurrentUser();

  if (!currentUser) {
    return forceLogout();
  }

  if (typeof hasRole !== "function" || !hasRole("user")) {
    return forceLogout();
  }

  const status =
    currentUser.accountStatus ||
    currentUser.status ||
    "active";

  if (status !== "active") {
    return forceLogout();
  }
}
// ================= EVENTS =================
function bindEvents() {
  const submitBtn = document.getElementById("submitBtn");

  if (submitBtn) {
    submitBtn.addEventListener("click", submitWithdraw);
  }
}

// ================= LOAD UI =================
function loadPage() {
  const userIdEl = document.getElementById("userId");

  if (userIdEl && currentUser) {
   userIdEl.innerText = currentUser.userId;
  }
}

// ================= WITHDRAW SUBMIT =================
function submitWithdraw() {
  const msgBox = document.getElementById("msg");
  const amountInput = document.getElementById("amount");
  const submitBtn = document.getElementById("submitBtn");

  if (!msgBox || !amountInput || lock) return;

  msgBox.innerText = "";

  const amount = Number(amountInput.value.trim());

  if (!amount || amount <= 0) {
    msgBox.innerText = "❌ Invalid amount";
    return;
  }

  if (
    typeof isWithdrawSystemSafe === "function" &&
    !isWithdrawSystemSafe()
  ) {
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
   requestWithdraw(currentUser.userId, amount);

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
