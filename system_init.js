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
  session = null;
  currentUser = null;
}

function bindEvents() {
  let initBtn = document.getElementById("initBtn");

  if (initBtn) {
    initBtn.addEventListener("click", initSystem);
  }
}

function loadPage() {
  // no preload needed
}

function initSystem() {
  if (lock) return;
  lock = true;

  let systemSettings = {
    adminAccess: true,
    franchiseeAccess: true,
    registrationOpen: true,
    upgradesOpen: true,
    repurchaseOpen: true,
    finance: true,
    franchiseeDept: true,
    kyc: true
  };

  let officeUsers = [
    {
      userId: "BWG000000",
      name: "SUPER ADMIN",
      password: "123",
      role: "super_admin"
    }
  ];

  localStorage.setItem("systemSettings", JSON.stringify(systemSettings));
  localStorage.setItem("officeUsers", JSON.stringify(officeUsers));

  localStorage.setItem("admins", "[]");
  localStorage.setItem("franchisees", "[]");
  localStorage.setItem("users", "[]");
  localStorage.setItem("payments", "[]");

  document.getElementById("msg").innerText =
    "✅ System Initialized Successfully";

  lock = false;
}
