let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  bindEvents();
  loadStatus();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }

  try {
    if (typeof getSession === "function") {
      session = getSession();
    }
  } catch (e) {
    console.error(e);
  }

  if (!session || session.role !== "super_admin") {
    alert("Access denied");
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  currentUser = session;
}

function bindEvents() {
  document.getElementById("lockBtn").addEventListener("click", function () {
    safeClick(function () { toggle("lockMode"); });
  });

  document.getElementById("queueBtn").addEventListener("click", function () {
    safeClick(function () { toggle("queueStop"); });
  });

  document.getElementById("withdrawBtn").addEventListener("click", function () {
    safeClick(function () { toggle("withdrawStop"); });
  });

  document.getElementById("adminBtn").addEventListener("click", function () {
    safeClick(function () { toggle("adminAccess"); });
  });

  document.getElementById("registrationBtn").addEventListener("click", function () {
    safeClick(function () { toggle("registrationOpen"); });
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    safeClick(resetSystem);
  });

  document.getElementById("clearLogsBtn").addEventListener("click", function () {
    safeClick(clearLogs);
  });
}

function safeClick(fn) {
  if (lock) return;

  lock = true;

  try {
    fn();
  } catch (e) {
    console.error(e);
    alert("System Error");
  } finally {
    setTimeout(function () {
      lock = false;
    }, 300);
  }
}

function loadStatus() {
  let s = getSystemSettings() || {};

  document.getElementById("status").innerHTML = `
    Lock Mode: ${s.lockMode ? "🔴 ON" : "🟢 OFF"} <br>
    Queue Stop: ${s.queueStop ? "🔴 ON" : "🟢 OFF"} <br>
    Withdraw Stop: ${s.withdrawStop ? "🔴 ON" : "🟢 OFF"} <br>
    Admin Access: ${s.adminAccess ? "🟢 ON" : "🔴 OFF"} <br>
    Registration: ${s.registrationOpen ? "🟢 OPEN" : "🔴 CLOSED"}
  `;
}

function toggle(key) {
  let s = getSystemSettings() || {};

  s[key] = !s[key];
  saveSystemSettings(s);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Toggled " + key);
  }

  loadStatus();
}

function resetSystem() {
  if (!confirm("⚠️ FULL RESET?")) return;

  localStorage.clear();

  alert("🔥 System Reset Complete");
  location.reload();
}

function clearLogs() {
  if (!confirm("Clear all logs?")) return;

  localStorage.removeItem("activityLogs");
  localStorage.removeItem("incomeLogs");

  alert("Logs cleared");

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Cleared All Logs");
  }
}
