// ===============================
// 📘 INCOME LOG SYSTEM
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

  let logs = getIncomeLogs();

  logs.push({
    logId: "LOG" + Date.now(),
    userId: data.userId,
    type: data.type, // upgrade / repurchase / binary
    amount: data.amount,
    sourceUser: data.sourceUser || null,
    note: data.note || "",
    time: new Date().toISOString()
  });

  saveIncomeLogs(logs);
}

// ================= GET USER LOGS =================
function getUserIncomeLogs(userId) {
  return getIncomeLogs().filter(l => l.userId === userId);
}

// ================= CLEAR LOGS (ADMIN) =================
function clearIncomeLogs() {
  localStorage.removeItem("incomeLogs");
}
