"use strict";

/*
========================================
USER UPGRADE V2.0 (SINGLE PATH FINAL)
========================================
✔ One execution flow only
✔ No fallback branches in upgrade logic
✔ Engine-driven upgrade only
✔ Session-based user validation
✔ Clean UI layer separation
✔ Production stable
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

function loadPage() {

  const infoBox = document.getElementById("info");

  if (infoBox) {
    infoBox.innerText =
      "User: " +
      (currentUser.username || "User") +
      " (" +
      currentUser.userId +
      ")";
  }

  try {

    const selected = JSON.parse(localStorage.getItem("selectedPin"));

    if (selected?.type === "upgrade") {
      document.getElementById("pinInput").value =
        selected.pinId || "";
    }

  } catch (e) {
    console.warn("[UPGRADE] PIN PREFILL SKIPPED");
  }
}

// ================= VALIDATION =================
function isAlreadyUpgraded(user) {
  return user.status === "active";
}

// ================= MAIN UPGRADE FLOW (SINGLE PATH) =================
function upgradeNow() {
  const user = currentUser;

  if (!user) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  const pinId = document.getElementById("pinInput")?.value?.trim();
  const statusBox = document.getElementById("upgradeStatus");

  if (!pinId) {
    alert("Enter PIN");
    return;
  }

  if (isAlreadyUpgraded(user)) {
    alert("Already upgraded");
    return;
  }

  // ================= SINGLE ENGINE ENTRY ONLY =================
  const result = executeUpgrade("USER_UPGRADE", {
    pinId: pinId,
    purpose: "upgrade"
  });

  if (!result) {
    const msg = "Upgrade failed";
    if (statusBox) statusBox.innerText = msg;
    alert(msg);
    return;
  }

  // ================= SUCCESS =================
  localStorage.removeItem("selectedPin");

  if (statusBox) {
    statusBox.innerText = "Upgrade Successful";
  }

  alert("Upgrade Successful");

  window.location.href = "user_dashboard.html";
}

// ================= EXPORT =================
window.upgradeNow = upgradeNow;
