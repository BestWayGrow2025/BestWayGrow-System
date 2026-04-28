// ================= SAFE STATE =================
let session = null;
let currentUser = null;
let lock = false;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

// ================= CORE INIT =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

// ================= AUTH =================
function authPage() {
  try {
    if (typeof protectPage === "function") {
      session = protectPage({ role: "user" });
    } else {
      session = JSON.parse(localStorage.getItem("loggedInUser"));
    }
  } catch (err) {
    session = null;
  }

  if (!session || !session.userId) {
    window.location.href = "user_login.html";
    return;
  }

  currentUser = session;
}

// ================= EVENTS =================
function bindEvents() {
  let applyBtn = document.getElementById("applyBtn");

  if (applyBtn) {
    applyBtn.addEventListener("click", applyFranchise);
  }
}

// ================= LOAD PAGE =================
function loadPage() {
  let nameInput = document.getElementById("name");

  if (nameInput && currentUser) {
    nameInput.value = currentUser.fullName || currentUser.username || "";
  }
}

// ================= APPLY =================
function applyFranchise() {
  if (lock) return;

  let nameEl = document.getElementById("name");
  let cityEl = document.getElementById("city");
  let amountEl = document.getElementById("amount");

  if (!nameEl || !cityEl || !amountEl) {
    alert("Form error");
    return;
  }

  let name = nameEl.value.trim();
  let city = cityEl.value.trim();
  let amount = Number(amountEl.value);

  if (!name || name.length < 3) {
    alert("Valid name required");
    return;
  }

  if (!city || city.length < 2) {
    alert("Valid city required");
    return;
  }

  if (!amount || amount <= 0) {
    alert("Valid amount required");
    return;
  }

  let data = [];

  try {
    data = JSON.parse(localStorage.getItem("franchiseRequests") || "[]");
    if (!Array.isArray(data)) data = [];
  } catch (err) {
    data = [];
  }

  let already = data.find(item =>
    item.userId === currentUser.userId &&
    item.status === "PENDING"
  );

  if (already) {
    alert("Already applied (Pending)");
    return;
  }

  lock = true;

  try {
    let request = {
      requestId: "FR-" + Date.now(),
      userId: currentUser.userId,
      name: name,
      city: city,
      amount: amount,
      status: "PENDING",
      time: new Date().toLocaleString()
    };

    data.push(request);
    localStorage.setItem("franchiseRequests", JSON.stringify(data));

    alert("Request Submitted");

    cityEl.value = "";
    amountEl.value = "";

  } catch (err) {
    console.error("Franchise request error:", err);
    alert("Request failed");
  } finally {
    lock = false;
  }
}
