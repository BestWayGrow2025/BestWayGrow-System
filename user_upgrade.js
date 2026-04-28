// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  let user = getCurrentUser();

  if (!user) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  let infoBox = document.getElementById("info");
  if (infoBox) {
    infoBox.innerText = "User: " + (user.username || "User") + " (" + (user.userId || "N/A") + ")";
  }

  // AUTO PIN FILL
  try {
    let selected = JSON.parse(localStorage.getItem("selectedPin"));

    if (selected && selected.type === "upgrade") {
      let pinInput = document.getElementById("pinInput");
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

  return user.status === "active" || user.upgradeStatus === "completed";
}

// ================= UPGRADE =================
function upgradeNow() {
  let user = getCurrentUser();

  if (!user) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  let pinInput = document.getElementById("pinInput");
  let statusBox = document.getElementById("upgradeStatus");

  let pinId = pinInput ? pinInput.value.trim() : "";

  if (!pinId) {
    alert("Enter PIN");
    return;
  }

  if (isAlreadyUpgraded(user)) {
    alert("Your ID is already active");
    return;
  }

  try {
    // ================= USE PIN =================
    let pin = typeof usePin === "function"
      ? usePin(pinId, user.userId, "upgrade")
      : null;

    if (!pin) {
      alert("Invalid PIN");
      return;
    }

    // ================= ACTIVATE USER =================
    if (typeof activateUser !== "function") {
      throw new Error("Activation system missing");
    }

    activateUser(user.userId);

    // ================= VERIFY SAVE =================
    let updatedUser = typeof getUserById === "function"
      ? getUserById(user.userId)
      : null;

    if (!updatedUser || updatedUser.status !== "active") {
      throw new Error("Upgrade state verification failed");
    }

    // ================= TRIGGER INCOME =================
    if (typeof triggerUpgradeIncome === "function") {
      try {
        triggerUpgradeIncome(user.userId, Number(pin.bv || 0));
      } catch (err) {
        console.warn("Upgrade trigger failed:", err.message);
      }
    }

    // ================= CLEANUP =================
    localStorage.removeItem("selectedPin");

    if (statusBox) {
      statusBox.innerText = "Upgrade Successful";
    }

    alert("Upgrade Successful");
    window.location.href = "user_dashboard.html";

  } catch (err) {
    console.error("Upgrade Error:", err);

    if (statusBox) {
      statusBox.innerText = err.message || "Upgrade failed";
    }

    alert(err.message || "Upgrade failed");
  }
}
