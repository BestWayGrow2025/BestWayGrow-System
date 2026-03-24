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
  let req = requests.find(r => r.requestId === requestId);

  if (!req) return alert("Request not found");

  if (req.status !== "PENDING") {
    return alert("Already processed");
  }

  // ADD STOCK
  addPinStock(req.pinId, req.quantity);

  req.status = "APPROVED";

  savePinRequests(requests);

  alert("Request approved & stock added");
}

// =====================
// REJECT REQUEST
// =====================
function rejectPinRequest(requestId) {

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) return alert("Request not found");

  req.status = "REJECTED";

  savePinRequests(requests);

  alert("Request rejected");
}

</script>
