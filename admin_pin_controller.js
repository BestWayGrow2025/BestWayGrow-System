// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initCoreSystem();
  loadAllPins();
});


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
      createdBy: "ADMIN"
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
  let pinId = document.getElementById("assignPinId").value.trim();
  let userId = document.getElementById("assignUserId").value.trim();

  if (!pinId || !userId) {
    alert("Enter PIN ID and User ID");
    return;
  }

  try {
    assignPin(pinId, userId, "user", "ADMIN");

    document.getElementById("assignMsg").innerText = "✅ PIN Assigned";

    loadAllPins();
  } catch (err) {
    alert(err.message);
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
    deletePin(pinId, "ADMIN");

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
