/*
========================================
SUPPORT TICKET SYSTEM (V1)
========================================
✔ Create support ticket
✔ View ticket list
✔ Status tracking
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

// ================= LOAD SUPPORT PAGE =================
function loadSupportTickets() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const tickets = user.supportTickets || [];

  let html = `
    <div class="section-title">Support Tickets</div>

    <div class="info-box">
      <h4>Create New Ticket</h4>

      <input id="ticketTitle" placeholder="Subject">
      <textarea id="ticketMessage" placeholder="Describe your issue"></textarea>

      <button class="action-btn" onclick="createTicket()">Submit Ticket</button>
    </div>

    <div class="info-box">
      <h4>Your Tickets</h4>
  `;

  if (tickets.length === 0) {
    html += `<p>No tickets found</p>`;
  } else {
    tickets.forEach(t => {
      html += `
        <div style="margin-bottom:10px;">
          <b>${t.title}</b><br>
          ${t.message}<br>
          <small>Status: ${t.status || "OPEN"}</small>
          <hr>
        </div>
      `;
    });
  }

  html += `</div>`;

  main.innerHTML = html;
}

// ================= CREATE TICKET =================
function createTicket() {
  const user = getSafeUser();
  if (!user) return;

  const title = document.getElementById("ticketTitle").value.trim();
  const message = document.getElementById("ticketMessage").value.trim();

  if (!title || !message) {
    alert("Fill all fields");
    return;
  }

  let users = typeof getUsers === "function" ? getUsers() : [];
  let index = users.findIndex(u => u.userId === user.userId);

  if (index === -1) return;

  if (!users[index].supportTickets) {
    users[index].supportTickets = [];
  }

  users[index].supportTickets.unshift({
    title,
    message,
    status: "OPEN",
    date: new Date().toISOString()
  });

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  alert("Ticket Created Successfully");

  loadSupportTickets();
}

// ================= EXPORT =================
window.loadSupportTickets = loadSupportTickets;
window.createTicket = createTicket;
