let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadCreateView();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

function authPage() {
  session = typeof getSession === "function"
    ? getSession("system_admin")
    : JSON.parse(localStorage.getItem("loggedInSystemAdmin") || "null");

  if (!session || session.role !== "system_admin") {
    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  currentUser = typeof getUserById === "function"
    ? getUserById(session.userId)
    : null;

  if (!currentUser || currentUser.role !== "system_admin") {
    if (typeof clearSession === "function") clearSession("system_admin");
    else localStorage.removeItem("loggedInSystemAdmin");

    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  if ((currentUser.status || "active") !== "active") {
    alert("Account inactive");

    if (typeof clearSession === "function") clearSession("system_admin");
    else localStorage.removeItem("loggedInSystemAdmin");

    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  document.getElementById("welcome").innerText =
    "Welcome " + (currentUser.username || "") + " (" + currentUser.userId + ")";
}

function bindEvents() {
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("createTabBtn").addEventListener("click", loadCreateView);
  document.getElementById("allTabBtn").addEventListener("click", loadAllPins);
  document.getElementById("availableTabBtn").addEventListener("click", loadAvailablePins);
  document.getElementById("usedTabBtn").addEventListener("click", loadUsedPins);
}

function getPins() {
  return JSON.parse(localStorage.getItem("pins") || "[]");
}

function savePins(pins) {
  localStorage.setItem("pins", JSON.stringify(pins));
}

function loadCreateView() {
  document.getElementById("contentArea").innerHTML = `
    <div class="card">
      <h3>Create PIN</h3>
      <input id="amount" placeholder="Amount (e.g. 500)"><br>
      <input id="qty" placeholder="Quantity"><br>
      <button id="generateBtn">Generate</button>
      <p id="msg"></p>
    </div>
  `;

  document.getElementById("generateBtn").addEventListener("click", createPins);
}

function loadAllPins() {
  renderPins(getPins());
}

function loadAvailablePins() {
  renderPins(getPins().filter(pin => !pin.used));
}

function loadUsedPins() {
  renderPins(getPins().filter(pin => pin.used));
}

function createPins() {
  if (lock) return;
  lock = true;

  let amount = document.getElementById("amount").value.trim();
  let qty = parseInt(document.getElementById("qty").value.trim());

  if (!amount || !qty || qty < 1) {
    showMsg("Enter valid amount & qty");
    lock = false;
    return;
  }

  let pins = getPins();

  for (let i = 0; i < qty; i++) {
    pins.push({
      pin: "PIN" + Math.floor(Math.random() * 1000000000),
      amount: amount,
      used: false,
      createdAt: Date.now(),
      createdBy: currentUser.userId
    });
  }

  savePins(pins);
  showMsg("PIN Created");

  lock = false;
}

function renderPins(pins) {
  if (!pins.length) {
    document.getElementById("contentArea").innerHTML = `
      <div class="card">
        <h3>PIN List</h3>
        <p>No PIN found</p>
      </div>
    `;
    return;
  }

  let rows = pins.map(pin => `
    <tr>
      <td>${pin.pin}</td>
      <td>${pin.amount}</td>
      <td>${pin.used ? "USED" : "AVAILABLE"}</td>
    </tr>
  `).join("");

  document.getElementById("contentArea").innerHTML = `
    <div class="card">
      <h3>PIN List</h3>
      <table>
        <tr>
          <th>PIN</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
        ${rows}
      </table>
    </div>
  `;
}

function showMsg(text) {
  let msg = document.getElementById("msg");
  if (msg) msg.innerText = text;
}

function logout() {
  if (typeof clearSession === "function") clearSession("system_admin");
  else localStorage.removeItem("loggedInSystemAdmin");

  window.location.href = "system_admin_login.html";
}
