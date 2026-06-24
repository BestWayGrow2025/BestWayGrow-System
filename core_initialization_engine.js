let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  bindEvents();
  loadPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

function bindEvents() {
  const initBtn = document.getElementById("initBtn");

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

  const systemSettings = {
    lockMode: false,
    adminAccess: true,
    franchiseeAccess: true,
    registrationOpen: true,
    upgradesOpen: true,
    repurchaseOpen: true,
    withdrawOpen: true,
    finance: true,
    franchiseeDept: true,
    kyc: true
  };

  const officeUsers = [
    {
      userId: "SUPERADMIN",
      name: "SUPER ADMIN",
      password: "123",
      role: "super_admin"
    }
  ];

  safeSet("admins", []);
  safeSet("franchisees", []);
  saveUsers([]);
  safeSet("payments", []);
  saveSystemSettings(systemSettings);
  safeSet("officeUsers", officeUsers);

  document.getElementById("msg").innerText =
    "✅ System Initialized Successfully";

  lock = false;
}
