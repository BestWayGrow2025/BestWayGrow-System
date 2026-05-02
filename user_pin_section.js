/*
========================================
PIN SECTION SYSTEM (V1)
========================================
✔ Pin activation system
✔ Wallet deduction
✔ Safe session check
✔ Activity logging
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  const user = getCurrentUser();
  if (!user) {
    document.getElementById("mainContent").innerHTML =
      "<div class='info-box'>Login Required</div>";
    return null;
  }
  return user;
}

// ================= LOAD PIN UI =================
function loadPinSection() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <div class="section-title">PIN SECTION</div>

    <div class="info-box">
      <p><b>Available PIN:</b> 1 PIN = ₹100</p>
      <p><b>Status:</b> Ready to Activate</p>
    </div>

    <div class="info-box">
      <label>Enter PIN Code</label>
      <input id="pinInput" placeholder="Enter PIN">
      <button class="action-btn" onclick="activatePin()">Activate PIN</button>
    </div>
  `;
}

// ================= ACTIVATE PIN =================
function activatePin() {
  const user = getSafeUser();
  if (!user) return;

  const pin = document.getElementById("pinInput").value.trim();

  if (!pin) {
    alert("Enter PIN");
    return;
  }

  // Example rule
  const PIN_COST = 100;

  let users = typeof getUsers === "function" ? getUsers() : [];
  let index = users.findIndex(u => u.userId === user.userId);

  if (index === -1) return;

  if ((users[index].wallet?.balance || 0) < PIN_COST) {
    alert("Insufficient Wallet Balance");
    return;
  }

  // Deduct wallet
  users[index].wallet.balance -= PIN_COST;
  users[index].wallet.totalDebit =
    (users[index].wallet.totalDebit || 0) + PIN_COST;

  // Save activated pin
  if (!users[index].activatedPins) {
    users[index].activatedPins = [];
  }

  users[index].activatedPins.push({
    pin,
    date: new Date().toISOString()
  });

  // Save users
  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  // Activity log
  if (typeof logActivity === "function") {
    logActivity(user.userId, "USER", "PIN ACTIVATED", "PIN_SECTION");
  }

  alert("PIN Activated Successfully");

  loadPinSection();
}

// ================= EXPORT =================
window.loadPinSection = loadPinSection;
window.activatePin = activatePin;
