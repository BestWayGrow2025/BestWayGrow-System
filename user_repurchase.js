// ================= BLOCK 1 START =================
// Function Name: loadRepurchasePage
function loadRepurchasePage() {
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

  try {
    let selected = JSON.parse(localStorage.getItem("selectedPin"));

    if (selected && selected.type === "repurchase") {
      let pinInput = document.getElementById("pinInput");
      if (pinInput) {
        pinInput.value = selected.pinId || "";
      }
    }
  } catch (err) {
    console.warn("Auto pin fill skipped");
  }
}
// ================= BLOCK 1 END =================

// ================= BLOCK 2 START =================
// Function Name: submitRepurchase
function submitRepurchase() {
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

  let pinInput = document.getElementById("pinInput");
  let pinId = pinInput ? pinInput.value.trim() : "";

  if (!validatePinInput(pinId)) return;

  try {
    let pin = usePin(pinId, user.userId, "repurchase");

    if (!pin) {
      alert("Invalid or unusable PIN");
      return;
    }

    if (pin.type !== "repurchase") {
      throw new Error("Wrong PIN type");
    }

    if (typeof triggerRepurchaseIncome === "function") {
      try {
        triggerRepurchaseIncome(user.userId, Number(pin.bv || 0));
      } catch (err) {
        console.warn("Repurchase trigger failed:", err.message);
      }
    }

    localStorage.removeItem("selectedPin");

    alert("Repurchase Successful");
    window.location.href = "user_dashboard.html";

  } catch (err) {
    console.error("Repurchase Error:", err);
    alert(err.message || "Repurchase failed");
  }
}
// ================= BLOCK 2 END =================

// ================= BLOCK 3 START =================
// Function Name: validatePinInput
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
// ================= BLOCK 3 END =================

// ================= BLOCK 4 START =================
// Function Name: INIT
document.addEventListener("DOMContentLoaded", function () {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }

  loadRepurchasePage();
});
// ================= BLOCK 4 END =================
