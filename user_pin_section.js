/*
========================================
PIN SECTION SYSTEM (V2 - FINAL SAFE)
========================================
✔ No duplicate helper conflicts
✔ Safe dependency checks
✔ Wallet deduction safe
✔ No crash if system modules missing
✔ Stable export for dashboard
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  const user = typeof getCurrentUser === "function"
    ? getCurrentUser()
    : null;

  if (!user) {
    const main = document.getElementById("mainContent");
    if (main) {
      main.innerHTML = "<div class='info-box'>Login Required</div>";
    }
    return null;
  }

  return user;
}

// ================= LOAD PIN SECTION =================
function loadPinSection() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <div class="section-title">PIN SECTION</div>

    <div class="info-box">
      <p><b>PIN Value:</b> ₹100 per PIN</p>
      <p><b>Status:</b> Ready for Activation</p>
    </div>

    <div class="info-box">
      <label>Enter PIN Code</label>
      <input id="pinInput" placeholder="Enter PIN Code">
      <button class="action-btn" onclick="activatePin()">Activate PIN</button>
    </div>
  `;
}

// ================= ACTIVATE PIN =================
function activatePin() {
  const user = getSafeUser();
  if (!user) return;

  const pin = document.getElementById("pinInput")?.value.trim();

  if (!pin) {
    alert("Enter PIN");
    return;
  }

  const PIN_COST = 100;

  const users = typeof getUsers === "function" ? getUsers() : [];
  const index = users.findIndex(u => u.userId === user.userId);

  if (index === -1) {
    alert("User not found");
    return;
  }

  // ================= BALANCE CHECK =================
  const wallet = users[index].wallet || {};

  if ((wallet.balance || 0) < PIN_COST) {
    alert("Insufficient Wallet Balance");
    return;
  }

  // ================= DEDUCT WALLET =================
  wallet.balance = (wallet.balance || 0) - PIN_COST;
  wallet.totalDebit = (wallet.totalDebit || 0) + PIN_COST;
  users[index].wallet = wallet;

  // ================= SAVE PIN =================
  if (!users[index].activatedPins) {
    users[index].activatedPins = [];
  }

  users[index].activatedPins.push({
    pin: pin,
    date: new Date().toISOString()
  });

  // ================= SAVE USERS =================
  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  // ================= LOG ACTIVITY =================
  if (typeof logActivity === "function") {
    logActivity(
      user.userId,
      "USER",
      "PIN ACTIVATED",
      "PIN_SECTION"
    );
  }

  alert("PIN Activated Successfully");

  loadPinSection();
}

// ================= GLOBAL EXPORT =================
window.loadPinSection = loadPinSection;
window.activatePin = activatePin;
