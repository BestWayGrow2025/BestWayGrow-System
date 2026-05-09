/*
========================================
USER UPGRADE V2.0 (UPGRADE ENGINE INTEGRATED)
========================================
✔ Unified authentication via getCurrentUser()
✔ Auto PIN prefill preserved
✔ Existing upgrade eligibility check preserved
✔ All upgrade execution delegated to upgrade_engine.js
✔ No direct PIN usage logic
✔ No direct activation logic
✔ No direct income trigger logic
✔ Production-safe UI layer only
========================================
*/

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  const user =
    typeof getCurrentUser === "function"
      ? getCurrentUser()
      : null;

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
      (user.userId || "N/A") +
      ")";
  }

  // ================= AUTO PIN FILL =================
  try {
    const selected = JSON.parse(
      localStorage.getItem("selectedPin")
    );

    if (selected && selected.type === "upgrade") {
      const pinInput =
        document.getElementById("pinInput");

      if (pinInput) {
        pinInput.value = selected.pinId || "";
      }
    }
  } catch (err) {
    console.warn("Auto pin fill skipped");
  }
});

// ================= CHECK =================
function isAlreadyUpgraded(user) {
  if (!user) return false;

  return (
    user.status === "active" ||
    user.upgradeStatus === "completed"
  );
}

// ================= UPGRADE =================
function upgradeNow() {
  const user =
    typeof getCurrentUser === "function"
      ? getCurrentUser()
      : null;

  if (!user) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  const pinInput =
    document.getElementById("pinInput");

  const statusBox =
    document.getElementById("upgradeStatus");

  const pinId = pinInput
    ? pinInput.value.trim()
    : "";

  if (!pinId) {
    alert("Enter PIN");
    return;
  }

  if (isAlreadyUpgraded(user)) {
    alert("Your ID is already active");
    return;
  }

  try {
    // ================= ENGINE CHECK =================
    if (typeof executeUpgrade !== "function") {
      throw new Error("Upgrade engine missing");
    }

    // ================= CENTRALIZED EXECUTION =================
    const result = executeUpgrade(
      "USER_UPGRADE",
      {
        pinId: pinId,
        purpose: "upgrade"
      }
    );

    if (!result) {
      throw new Error("Upgrade failed");
    }

    // ================= CLEANUP =================
    localStorage.removeItem("selectedPin");

    if (statusBox) {
      statusBox.innerText =
        "Upgrade Successful";
    }

    alert("Upgrade Successful");

    window.location.href =
      "user_dashboard.html";

  } catch (err) {
    console.error(
      "Upgrade Error:",
      err
    );

    if (statusBox) {
      statusBox.innerText =
        err.message || "Upgrade failed";
    }

    alert(
      err.message || "Upgrade failed"
    );
  }
}

// ================= GLOBAL EXPORT =================
window.upgradeNow = upgradeNow;
