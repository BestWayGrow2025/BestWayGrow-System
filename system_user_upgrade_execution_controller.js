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
document.addEventListener("DOMContentLoaded", function () {
  const user = getCurrentUser();

  if (!user) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  const infoBox = document.getElementById("info");

  if (infoBox) {
    infoBox.innerText =
      "User: " +
      (user.username || "User") +
      " (" +
      user.userId +
      ")";
  }

  // ================= AUTO PIN PREFILL =================
  try {
    const selected = JSON.parse(localStorage.getItem("selectedPin"));

    if (selected?.type === "upgrade") {
      document.getElementById("pinInput").value =
        selected.pinId || "";
    }
  } catch (e) {
    console.warn("[UPGRADE] PIN PREFILL SKIPPED");
  }
});

// ================= VALIDATION =================
function isAlreadyUpgraded(user) {
  return user.status === "active";
}

// ================= MAIN UPGRADE FLOW (SINGLE PATH) =================
function upgradeNow() {
  const user = getCurrentUser();

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
