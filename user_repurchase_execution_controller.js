"use strict";

/*
========================================
USER REPURCHASE V2.0 (SINGLE PATH FINAL)
========================================
✔ BOOT-compatible execution
✔ Single initialization flow
✔ Engine-based execution only
✔ No DOMContentLoaded direct flow
✔ Clean authentication layer
✔ Production stable UI module
========================================
*/

// ================= INIT =================

let session = null;
let currentUser = null;

document.addEventListener("DOMContentLoaded", function () {
  authPage();
  loadPage();
});

function forceLogout() {

  if (typeof logoutSession === "function") {
    logoutSession();
    return;
  }

  window.location.replace("user_login.html");
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

// ================= LOAD PAGE =================

function loadPage() {

  const user = currentUser;

  const infoBox = document.getElementById("info");
  const statusBox = document.getElementById("repurchaseStatus");

  if (!user) return;

  if (infoBox) {
    infoBox.innerText =
      "User: " +
      (user.username || "User") +
      " (" +
      user.userId +
      ")";
  }

  if (statusBox) {
    statusBox.innerText =
      user.upgradeStatus === "completed"
        ? "Eligible for repurchase"
        : "Upgrade required before repurchase";
  }

  // ================= AUTO PIN PREFILL =================

  try {

    const selected = JSON.parse(localStorage.getItem("selectedPin"));

    if (selected?.type === "repurchase") {
      document.getElementById("pinInput").value =
        selected.pinId || "";
    }

  } catch (e) {
    console.warn("[REPURCHASE] PIN PREFILL SKIPPED");
  }
}
/* ================= PIN VALIDATION ================= */

function validatePin(pinId) {

  if (!pinId) {
    alert("Enter PIN");
    return false;
  }

  if (pinId.length < 5) {
    alert("Invalid PIN");
    return false;
  }

  return true;
}
/* ================= SUBMIT REPURCHASE ================= */

function submitRepurchase() {

  const user = currentUser;

  if (!user) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  if (user.status !== "active" || user.upgradeStatus !== "completed") {
    alert("Repurchase not allowed");
    return;
  }

  const pinId =
    document.getElementById("pinInput")?.value?.trim();

  if (!validatePin(pinId)) return;

  if (typeof executeUpgrade !== "function") {
    alert("Engine missing");
    return;
  }

  const result = executeUpgrade("REPURCHASE", {
    pinId: pinId,
    purpose: "repurchase"
  });

  if (!result) {
    alert("Repurchase failed");
    return;
  }

  localStorage.removeItem("selectedPin");

  alert("Repurchase Successful");

  window.location.href = "user_dashboard.html";
}

/* ================= EXPORT ================= */

window.submitRepurchase = submitRepurchase;
