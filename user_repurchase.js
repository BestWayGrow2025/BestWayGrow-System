let currentUser = null;

document.addEventListener("DOMContentLoaded", function () {
  authPage();
  loadRepurchasePage();
});

function authPage() {
  currentUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!currentUser || !currentUser.userId) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }
}

function loadRepurchasePage() {
  if (!currentUser) return;

  const infoBox = document.getElementById("info");
  const statusBox = document.getElementById("repurchaseStatus");

  if (infoBox) {
    infoBox.innerText = "User: " + (currentUser.username || "User") + " (" + (currentUser.userId || "N/A") + ")";
  }

  if (statusBox) {
    statusBox.innerText =
      currentUser.upgradeStatus === "completed"
        ? "Eligible for repurchase"
        : "Upgrade required before repurchase";
  }

  try {
    const selected = JSON.parse(localStorage.getItem("selectedPin"));

    if (selected && selected.type === "repurchase") {
      const pinInput = document.getElementById("pinInput");
      if (pinInput) {
        pinInput.value = selected.pinId || "";
      }
    }
  } catch (err) {
    console.warn("Auto pin fill skipped");
  }
}

function submitRepurchase() {
  if (!currentUser || !currentUser.userId) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  if (currentUser.status !== "active" || currentUser.upgradeStatus !== "completed") {
    alert("Repurchase not allowed");
    return;
  }

  const users = typeof getUsers === "function" ? getUsers() : [];
  const user = users.find(item => item.userId === currentUser.userId);

  if (!user) {
    alert("User not found");
    return;
  }

  const pinInput = document.getElementById("pinInput");
  const pinId = pinInput ? pinInput.value.trim() : "";

  if (!validatePinInput(pinId)) return;

  try {
    const pin = usePin(pinId, user.userId, "repurchase");

    if (!pin) {
      alert("Invalid or unusable PIN");
      return;
    }

    if (pin.type !== "repurchase") {
      throw new Error("Wrong PIN type");
    }

    if (typeof triggerRepurchaseIncome === "function") {
      triggerRepurchaseIncome(user.userId, Number(pin.bv || 0));
    }

    const updatedUser =
      typeof getUserById === "function" ? getUserById(user.userId) : null;

    if (!updatedUser || updatedUser.repurchaseStatus !== "completed") {
      throw new Error("Repurchase save failed");
    }

    localStorage.removeItem("selectedPin");

    alert("Repurchase Successful");
    window.location.href = "user_dashboard.html";
  } catch (err) {
    console.error("Repurchase Error:", err);
    alert(err.message || "Repurchase failed");
  }
}

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
