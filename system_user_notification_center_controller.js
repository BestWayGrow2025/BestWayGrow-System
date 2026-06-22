/*
========================================
NOTIFICATIONS SYSTEM (V1)
========================================
✔ User notification list
✔ Safe UI rendering
✔ Empty state handling
✔ Admin-ready structure
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

// ================= LOAD NOTIFICATIONS =================
function loadNotifications() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const notifications = user.notifications || [];

  let html = `
    <div class="section-title">Notifications</div>

    <div class="info-box">
  `;

  if (notifications.length === 0) {
    html += `<p>No notifications available</p>`;
  } else {
    notifications.forEach(n => {
      html += `
        <p>
          <b>${n.title || "Alert"}:</b> ${n.message || ""}
          <br>
          <small>${n.date || ""}</small>
        </p>
        <hr>
      `;
    });
  }

  html += `</div>`;

  main.innerHTML = html;
}

// ================= ADD NOTIFICATION (UTILITY) =================
function addNotification(userId, title, message) {
  let users = typeof getUsers === "function" ? getUsers() : [];
  let index = users.findIndex(u => u.userId === userId);

  if (index === -1) return;

  if (!users[index].notifications) {
    users[index].notifications = [];
  }

  users[index].notifications.unshift({
    title,
    message,
    date: new Date().toISOString()
  });

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }
}

// ================= EXPORT =================
window.loadNotifications = loadNotifications;
window.addNotification = addNotification;
