/*
========================================
LOGIN HISTORY SYSTEM (V1)
========================================
✔ Login tracking
✔ History display
✔ Security audit ready
✔ Admin expandable
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  const user = getCurrentUser();

  if (!user) {
    document.getElementById("mainContent").innerHTML =
      "<div class='info-box'>Login Required</div>";
    return null;
  }

  return user;
}

// ================= LOAD LOGIN HISTORY =================
function loadLoginHistory() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const history = user.loginHistory || [];

  let html = `
    <div class="section-title">Login History</div>

    <table border="1" width="100%">
      <tr>
        <th>Date</th>
        <th>Device</th>
        <th>IP</th>
        <th>Status</th>
      </tr>
  `;

  if (history.length === 0) {
    html += `<tr><td colspan="4">No Login Records Found</td></tr>`;
  }

  history.forEach(l => {
    html += `
      <tr>
        <td>${l.date || "-"}</td>
        <td>${l.device || "Unknown"}</td>
        <td>${l.ip || "-"}</td>
        <td>${l.status || "SUCCESS"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

// ================= ADD LOGIN RECORD =================
function addLoginHistory(userId, device = "Web") {
  let users = typeof getUsers === "function" ? getUsers() : [];
  let index = users.findIndex(u => u.userId === userId);

  if (index === -1) return;

  if (!users[index].loginHistory) {
    users[index].loginHistory = [];
  }

  users[index].loginHistory.unshift({
    date: new Date().toISOString(),
    device,
    ip: "N/A",
    status: "SUCCESS"
  });

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }
}

// ================= EXPORT =================
window.loadLoginHistory = loadLoginHistory;
window.addLoginHistory = addLoginHistory;

