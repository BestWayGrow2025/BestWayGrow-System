<script>

// =====================
// GET REQUESTS
// =====================
function getPinRequests() {
  return JSON.parse(localStorage.getItem("pinRequests") || "[]");
}

function savePinRequests(data) {
  localStorage.setItem("pinRequests", JSON.stringify(data));
}

// =====================
// CREATE REQUEST
// =====================
function requestPin(franchiseId, pinId, quantity) {

  let requests = getPinRequests();

  requests.push({
    requestId: "REQ" + Math.floor(Math.random() * 1000000),
    franchiseId: franchiseId,
    pinId: pinId,
    quantity: quantity,
    status: "PENDING",
    time: new Date().toISOString()
  });

  savePinRequests(requests);

  alert("Pin request submitted");
}

// =====================
// APPROVE REQUEST
// =====================
function approvePinRequest(requestId) {

  let requests = getPinRequests();
  let pins = JSON.parse(localStorage.getItem("pins") || "[]");
  let users = JSON.parse(localStorage.getItem("users") || "[]");

  let req = requests.find(r => r.requestId === requestId);

  if (!req) {
    alert("Request not found");
    return;
  }

  if (req.status !== "PENDING") {
    alert("Already processed");
    return;
  }

  // =====================
  // ADD STOCK (optional system logic)
  // =====================
  if (typeof addPinStock === "function") {
    addPinStock(req.pinId, req.quantity);
  }

  // =====================
  // ASSIGN PIN
  // =====================
  let availablePin = pins.find(p => p.status === "AVAILABLE");

  if (!availablePin) {
    alert("No available PINs");
    return;
  }

  // Update PIN
  availablePin.status = "ASSIGNED";
  availablePin.assignedTo = req.franchiseId;

  // Update request
  req.status = "APPROVED";
  req.assignedPin = availablePin.pinCode;

  // Assign to user
  let user = users.find(u => u.userId === req.franchiseId);

  if (user) {
    if (!user.pins) user.pins = [];
    user.pins.push(availablePin.pinCode);
  }

  // Save everything
  localStorage.setItem("pins", JSON.stringify(pins));
  localStorage.setItem("users", JSON.stringify(users));
  savePinRequests(requests);

  alert("Request approved & PIN assigned: " + availablePin.pinCode);
}

// =====================
// REJECT REQUEST
// =====================
function rejectPinRequest(requestId) {

  let requests = getPinRequests();

  let req = requests.find(r => r.requestId === requestId);

  if (!req) {
    alert("Request not found");
    return;
  }

  if (req.status !== "PENDING") {
    alert("Already processed");
    return;
  }

  req.status = "REJECTED";

  savePinRequests(requests);

  alert("Request rejected");
}

</script>
