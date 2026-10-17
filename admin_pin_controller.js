"use strict";

// ================= GLOBAL STATE =================
let session = null;
let currentUser = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initCoreSystem();
  checkAuth();
  loadAllPins();
});

// ================= AUTH =================
function checkAuth() {

  session = getSession();

  if (!session || session.role !== "admin") {
    redirectLogin();
    throw new Error("UNAUTHORIZED");
  }

  if (typeof getUserById !== "function") {
    redirectLogin();
    throw new Error("USER_SYSTEM_MISSING");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "admin") {
    redirectLogin();
    throw new Error("INVALID_USER");
  }

  if ((currentUser.status || "active") !== "active") {
    redirectLogin();
    throw new Error("INACTIVE");
  }
}

// ================= REDIRECT =================
function redirectLogin() {

  if (typeof destroySession === "function") {
    destroySession();
  }

  window.location.href = "admin_auth.html";
}
// ================= CREATE PIN =================
function handleCreatePin() {
  let type = document.getElementById("pinType").value;
  let amount = Number(document.getElementById("amount").value);
  let bv = Number(document.getElementById("bv").value);
  let gst = Number(document.getElementById("gst").value);

  if (!bv || bv <= 0) {
    alert("BV is required (income depends on BV)");
    return;
  }

  try {
    let newPin = createPin({
      type,
      amount,
      bv,
      gst,
      createdBy: currentUser.userId
    });

    document.getElementById("createMsg").innerText =
      "✅ PIN Created: " + newPin.pinId;

    loadAllPins();
  } catch (err) {
    alert(err.message);
  }
}


 // ================= ASSIGN PIN =================
function handleAssignPin() {
  const pinId = document.getElementById("assignPinId").value.trim();
  const userId = document.getElementById("assignUserId").value.trim();
  const msg = document.getElementById("assignMsg");

  if (!pinId || !userId) {
    msg.innerText = "Enter PIN ID and User ID.";
    return;
  }

  try {
    if (typeof getUserById !== "function") {
      msg.innerText = "User lookup is unavailable.";
      return;
    }

    const recipient = getUserById(userId);

    if (!recipient || recipient.role !== "user") {
      msg.innerText = "Invalid User ID. Enter an existing user.";
      return;
    }

    const result = assignPin(pinId, userId);

    if (result !== true) {
      msg.innerText = "PIN assignment failed. Check PIN status and try again.";
      return;
    }

    msg.innerText = "✅ PIN Assigned Successfully";
    loadAllPins();
  } catch (err) {
    msg.innerText = "PIN assignment failed: " + (err.message || "Unknown error");
  }
}

// ================= DELETE PIN =================
function handleDeletePin() {
  let pinId = document.getElementById("deletePinId").value.trim();

  if (!pinId) {
    alert("Enter PIN ID");
    return;
  }

  try {
    deletePin(pinId, currentUser.userId);

    document.getElementById("deleteMsg").innerText = "🗑️ PIN Deleted";

    loadAllPins();
  } catch (err) {
    alert(err.message);
  }
}


// ================= LOAD ALL PINS =================
function loadAllPins() {
  let pins = [];

  try {
    pins = loadPins();
  } catch {
    pins = [];
  }

  let table = document.getElementById("pinTable");
  table.innerHTML = "";

  if (!pins.length) {
    table.innerHTML = "<tr><td colspan='6'>No PINs</td></tr>";
    return;
  }

  pins.forEach(pin => {
    let row = document.createElement("tr");

    let statusColor =
      pin.status === "active" ? "green" :
      pin.status === "assigned" ? "blue" :
      "red";

    row.innerHTML = `
      <td>${pin.pinId}</td>
      <td>${pin.type}</td>
      <td>₹${pin.amount}</td>
      <td>${pin.bv}</td>
      <td style="color:${statusColor}">${pin.status}</td>
      <td>${pin.ownerId || "-"}</td>
    `;

    table.appendChild(row);
  });
}
