// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }

  let session = null;

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

  let infoBox = document.getElementById("info");
  if (infoBox) {
    infoBox.innerText = "User: " + user.username + " (" + user.userId + ")";
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
  if (!user || !user.userId) return false;

  try {
    if (typeof isUserActive !== "function") {
      return false;
    }

    return isUserActive(user.userId);
  } catch (err) {
    console.error("Upgrade check failed:", err);
    return false;
  }
}

// ================= UPGRADE =================
function upgradeNow() {
  console.log("Upgrade button clicked");

  let session = null;

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

  let users = [];

  try {
    users = typeof getUsers === "function" ? getUsers() : [];
  } catch (err) {
    users = [];
  }

  let user = users.find(item => item.userId === session.userId);

  if (!user) {
    alert("User not found");
    return;
  }

  // ================= ALREADY ACTIVE BLOCK =================
  if (isAlreadyUpgraded(user)) {
    alert("Your ID is already active");
    return;
  }

  let pinInput = document.getElementById("pinInput");
  let pinId = pinInput ? pinInput.value.trim() : "";

  if (!pinId) {
    alert("Enter PIN");
    return;
  }

  try {
    // ================= USE PIN =================
    let pin = usePin(pinId, user.userId, "upgrade");

    if (!pin) {
      alert("Invalid PIN");
      return;
    }

    // ================= ACTIVATE USER =================
    if (typeof activateUser === "function") {
      activateUser(user.userId);
    } else {
      throw new Error("Activation system missing");
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

    alert("Upgrade Successful");
    window.location.href = "user_dashboard.html";

  } catch (err) {
    console.error("Upgrade Error:", err);
    alert(err.message || "Upgrade failed");
  }
}
