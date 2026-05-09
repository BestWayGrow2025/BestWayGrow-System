/*
========================================
USER REPURCHASE V2.0 (UPGRADE ENGINE INTEGRATED)
========================================
✔ Unified authentication via getCurrentUser()
✔ Auto PIN prefill preserved
✔ Repurchase eligibility checks preserved
✔ All repurchase execution delegated to upgrade_engine.js
✔ No direct usePin() logic
✔ No direct triggerRepurchaseIncome() logic
✔ Production-safe UI layer only
========================================
*/

"use strict";

let currentUser = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  authPage();
  loadRepurchasePage();
});

// ================= AUTH =================
function authPage() {
  currentUser =
    typeof getCurrentUser === "function"
      ? getCurrentUser()
      : null;

  if (!currentUser || !currentUser.userId) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }
}

// ================= PAGE LOAD =================
function loadRepurchasePage() {
  if (!currentUser) return;

  const infoBox =
    document.getElementById("info");

  const statusBox =
    document.getElementById("repurchaseStatus");

  if (infoBox) {
    infoBox.innerText =
      "User: " +
      (currentUser.username || "User") +
      " (" +
      (currentUser.userId || "N/A") +
      ")";
  }

  if (statusBox) {
    statusBox.innerText =
      currentUser.upgradeStatus === "completed"
        ? "Eligible for repurchase"
        : "Upgrade required before repurchase";
  }

  // ================= AUTO PIN FILL =================
  try {
    const selected = JSON.parse(
      localStorage.getItem("selectedPin")
    );

    if (
      selected &&
      selected.type === "repurchase"
    ) {
      const pinInput =
        document.getElementById("pinInput");

      if (pinInput) {
        pinInput.value =
          selected.pinId || "";
      }
    }
  } catch (err) {
    console.warn(
      "Auto pin fill skipped"
    );
  }
}

// ================= SUBMIT =================
function submitRepurchase() {
  if (
    !currentUser ||
    !currentUser.userId
  ) {
    alert("Login required");
    window.location.href =
      "user_login.html";
    return;
  }

  if (
    currentUser.status !== "active" ||
    currentUser.upgradeStatus !==
      "completed"
  ) {
    alert("Repurchase not allowed");
    return;
  }

  const pinInput =
    document.getElementById("pinInput");

  const pinId = pinInput
    ? pinInput.value.trim()
    : "";

  if (!validatePinInput(pinId)) {
    return;
  }

  try {
    // ================= ENGINE CHECK =================
    if (
      typeof executeUpgrade !==
      "function"
    ) {
      throw new Error(
        "Upgrade engine missing"
      );
    }

    // ================= CENTRALIZED EXECUTION =================
    const result =
      executeUpgrade(
        "REPURCHASE",
        {
          pinId: pinId,
          purpose: "repurchase"
        }
      );

    if (!result) {
      throw new Error(
        "Repurchase failed"
      );
    }

    // ================= CLEANUP =================
    localStorage.removeItem(
      "selectedPin"
    );

    alert(
      "Repurchase Successful"
    );

    window.location.href =
      "user_dashboard.html";

  } catch (err) {
    console.error(
      "Repurchase Error:",
      err
    );

    alert(
      err.message ||
        "Repurchase failed"
    );
  }
}

// ================= VALIDATION =================
function validatePinInput(pinId) {
  if (!pinId) {
    alert("Enter PIN");
    return false;
  }

  if (pinId.length < 5) {
    alert("Invalid PIN format");
    return false;
  }

  return true;
}

// ================= GLOBAL EXPORT =================
window.submitRepurchase =
  submitRepurchase;
