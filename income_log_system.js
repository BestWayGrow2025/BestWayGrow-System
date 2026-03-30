<script>

// ===============================
// 📘 INCOME LOG SYSTEM (UPGRADED)
// ===============================

// ================= GET LOGS =================
function getIncomeLogs() {
  return JSON.parse(localStorage.getItem("incomeLogs") || "[]");
}

// ================= SAVE LOG =================
function saveIncomeLogs(logs) {
  localStorage.setItem("incomeLogs", JSON.stringify(logs));
}

// ================= ADD LOG =================
function addIncomeLog(data) {

  if (!data || !data.userId || !data.amount) return; // ✅ safety

  let logs = getIncomeLogs();

  // ✅ LIMIT CONTROL (MAX 5000 logs)
  if (logs.length > 5000) {
    logs = logs.slice(logs.length - 5000);
  }

  logs.push({
    logId: "LOG" + Date.now(),
    userId: data.userId,
    type: data.type || "unknown",
    amount: Number(data.amount) || 0,
    sourceUser: data.sourceUser || null,
    note: data.note || "",
    time: new Date().toISOString()
  });

  saveIncomeLogs(logs);
}

// ================= GET USER LOGS =================
function getUserIncomeLogs(userId) {
  if (!userId) return [];
  return getIncomeLogs().filter(l => l.userId === userId);
}

// ================= FILTER LOGS =================
function filterIncomeLogs({ userId, type }) {

  let logs = getIncomeLogs();

  if (userId) {
    logs = logs.filter(l => l.userId === userId);
  }

  if (type) {
    logs = logs.filter(l => l.type === type);
  }

  return logs;
}

// ================= CLEAR LOGS (ADMIN) =================
function clearIncomeLogs() {
  localStorage.removeItem("incomeLogs");
}

// ================= CRITICAL LOG =================
function addCriticalIncomeLog(message) {

  let logs = getIncomeLogs();

  logs.push({
    logId: "CRITICAL" + Date.now(),
    userId: "SYSTEM",
    type: "critical",
    amount: 0,
    sourceUser: null,
    note: message,
    time: new Date().toISOString()
  });

  saveIncomeLogs(logs);
}

</script>
