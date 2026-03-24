<script>

// =====================
// 🔐 COPY PROTECTION
// =====================
document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("keydown", function(e) {

  // Disable Ctrl+C / Ctrl+U / Ctrl+S
  if (
    (e.ctrlKey && e.key === 'c') ||
    (e.ctrlKey && e.key === 'u') ||
    (e.ctrlKey && e.key === 's')
  ) {
    e.preventDefault();
  }

});

// =====================
// 💾 EXPORT BACKUP
// =====================
function exportData() {

  let data = {
    users: localStorage.getItem("users"),
    pins: localStorage.getItem("pins"),
    transactions: localStorage.getItem("transactions"),
    pinTransactions: localStorage.getItem("pinTransactions"),
    holdIncome: localStorage.getItem("holdIncome"),
    ctorPool: localStorage.getItem("ctorPool"),
    systemSettings: localStorage.getItem("systemSettings"),
    admins: localStorage.getItem("admins"),
    pinRequests: localStorage.getItem("pinRequests")
  };

  let blob = new Blob([JSON.stringify(data)], { type: "application/json" });

  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "backup.json";
  a.click();
}

// =====================
// 📥 IMPORT BACKUP
// =====================
function importData(file) {

  let reader = new FileReader();

  reader.onload = function(e) {

    let data = JSON.parse(e.target.result);

    for (let key in data) {
      localStorage.setItem(key, data[key]);
    }

    alert("Backup restored successfully");
    location.reload();
  };

  reader.readAsText(file);
}

// =====================
// 🚫 SYSTEM LOCK MODE
// =====================
function isSystemLocked() {
  let settings = JSON.parse(localStorage.getItem("systemSettings") || "{}");
  return settings.lockMode === true;
}

function checkSystemLock() {
  if (isSystemLocked()) {
    alert("System temporarily locked by admin");
    document.body.innerHTML = "<h2>System Locked</h2>";
  }
}

// =====================
// 🔄 AUTO CHECK ON LOAD
// =====================
checkSystemLock();

</script>
