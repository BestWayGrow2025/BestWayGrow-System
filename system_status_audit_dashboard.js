/*
========================================
🔎 CHECK STATUS V4.1 (PATCH FIX ONLY)
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

// =====================
// BOOT
// =====================
document.addEventListener("DOMContentLoaded", function () {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }

  bindEvents();
});

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
// SAFE QUEUE FETCH (PATCHED ONLY)
// =====================
function getQueue() {
  try {
    if (typeof getRegQueue === "function") {
      const q = getRegQueue();
      return Array.isArray(q) ? q : [];
    }

    const raw = localStorage.getItem("REG_QUEUE_DATA");
    const parsed = JSON.parse(raw || "[]");

    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// =====================
// CHECK STATUS
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

    // ================= REGISTERED =================
    const user = users.find(u => u.mobile === mobile);

    if (user) {
      resultBox.innerHTML = `
        ✅ <b>Registered</b><br><br>
        User ID: ${user.userId || "N/A"}<br>
        Name: ${user.username || "N/A"}<br>
        Status: ${user.status || "active"}<br>
      `;
      return;
    }

    // ================= PENDING =================
    const pendingList = queue
      .filter(q => q && q.status === "PENDING")
      .sort((a, b) => (a.requestTime || 0) - (b.requestTime || 0));

    const index = pendingList.findIndex(q => q.mobile === mobile);

    if (index !== -1) {
      resultBox.innerHTML = `
        ⏳ <b>Pending</b><br><br>
        Queue Position: ${index + 1} / ${pendingList.length || 1}<br>
        Status: Waiting for processing...
      `;
      return;
    }

    // ================= NOT FOUND =================
    resultBox.innerHTML = "❌ No record found";

  } finally {
    lock = false;
  }
}
