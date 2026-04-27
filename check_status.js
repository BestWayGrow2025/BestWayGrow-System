let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  bindEvents();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

function bindEvents() {
  const checkBtn = document.getElementById("checkBtn");
  if (checkBtn) {
    checkBtn.addEventListener("click", checkStatus);
  }
}

function getQueue() {
  return JSON.parse(localStorage.getItem("regQueue") || "[]");
}

function checkStatus() {
  if (lock) return;
  lock = true;

  const mobile = document.getElementById("mobile").value.trim();
  const resultBox = document.getElementById("result");

  if (!mobile) {
    resultBox.innerHTML = "⚠️ Enter mobile number";
    lock = false;
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
    lock = false;
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
    lock = false;
    return;
  }

  resultBox.innerHTML = `❌ No record found`;
  lock = false;
}
