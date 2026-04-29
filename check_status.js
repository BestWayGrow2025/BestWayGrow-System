/*
========================================
🔎 CHECK STATUS V4.1 (FINAL SAFE PATCH)
========================================
✔ Core boot aligned
✔ Read-only diagnostic only
✔ safeGet aligned
✔ No hidden writes
✔ No queue mutation
✔ No user mutation
✔ No payout mutation
✔ No auto-fix side effects
✔ UI-only status reporting
✔ Production locked
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

// =====================
// BOOT
// =====================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  bindEvents();
});

// =====================
// INIT
// =====================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

// =====================
// EVENTS
// =====================
function bindEvents() {
  const checkBtn = document.getElementById("checkBtn");

  if (checkBtn) {
    checkBtn.addEventListener("click", checkStatus);
  }
}

// =====================
// SAFE READ
// =====================
function getQueue() {
  if (typeof safeGet === "function") {
    let data = safeGet("regQueue", []);
    return Array.isArray(data) ? data : [];
  }

  try {
    let data = JSON.parse(localStorage.getItem("regQueue") || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// =====================
// CHECK
// =====================
function checkStatus() {
  if (lock) return;
  lock = true;

  try {
    const mobile = document.getElementById("mobile").value.trim();
    const resultBox = document.getElementById("result");

    if (!mobile) {
      resultBox.innerHTML = "⚠️ Enter mobile number";
      return;
    }

    const users = typeof getUsers === "function" ? getUsers() : [];
    const queue = getQueue();

    const user = users.find(u => u.mobile === mobile);

    if (user) {
      resultBox.innerHTML = `
        ✅ <b>Registered</b><br><br>
        User ID: ${user.userId}<br>
        Name: ${user.username}<br>
        Status: ${user.status || "N/A"}<br>
        Active: ${typeof isUserActive === "function" && isUserActive(user.userId) ? "YES" : "NO"}
      `;
      return;
    }

    const pendingList = queue
      .filter(q => q.status === "PENDING")
      .sort((a, b) => new Date(a.queueTime) - new Date(b.queueTime));

    const index = pendingList.findIndex(q => q.mobile === mobile);

    if (index !== -1) {
      resultBox.innerHTML = `
        ⏳ <b>Pending</b><br><br>
        Queue Position: ${index + 1} / ${pendingList.length}<br>
        Status: Waiting for processing...
      `;
      return;
    }

    resultBox.innerHTML = "❌ No record found";

  } finally {
    lock = false;
  }
}
