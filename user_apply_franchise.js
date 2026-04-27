let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

function authPage() {
  if (typeof protectPage !== "function") {
    window.location.href = "user_login.html";
    return;
  }

  session = protectPage({ role: "user" });

  if (!session) {
    window.location.href = "user_login.html";
    return;
  }

  currentUser = session;
}

function bindEvents() {
  let applyBtn = document.getElementById("applyBtn");

  if (applyBtn) {
    applyBtn.addEventListener("click", applyFranchise);
  }
}

function loadPage() {
  let nameInput = document.getElementById("name");

  if (nameInput && currentUser) {
    nameInput.value = currentUser.username || "";
  }
}

function applyFranchise() {
  if (lock) return;

  let name = document.getElementById("name").value.trim();
  let city = document.getElementById("city").value.trim();
  let amount = Number(document.getElementById("amount").value);

  if (!name || !city || !amount) {
    alert("Fill all fields");
    return;
  }

  let data = JSON.parse(localStorage.getItem("franchiseRequests") || "[]");

  let already = data.find(item =>
    item.userId === currentUser.userId &&
    item.status === "PENDING"
  );

  if (already) {
    alert("Already applied (Pending)");
    return;
  }

  lock = true;

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

  alert("✅ Request Submitted");

  document.getElementById("city").value = "";
  document.getElementById("amount").value = "";

  lock = false;
}
