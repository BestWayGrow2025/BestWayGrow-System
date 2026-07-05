let session = null;
let currentUser = null;

document.addEventListener("DOMContentLoaded", function () {
  authPage();
  loadPage();
});

function authPage() {

  session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || !session.userId) {
    window.location.replace("super_admin_auth.html");
    throw new Error("AUTH FAILED");
  }

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;

  if (
    !currentUser ||
    (
      String(currentUser.role).toLowerCase() !== "super_admin" &&
      String(currentUser.role).toLowerCase() !== "system_admin" &&
      String(currentUser.role).toLowerCase() !== "admin"
    )
  ) {
    window.location.replace("super_admin_auth.html");
    throw new Error("AUTH FAILED");
  }

  if ((currentUser.status || "active") !== "active") {
    window.location.replace("super_admin_auth.html");
    throw new Error("AUTH FAILED");
  }

}

function loadPage() {

  const main =
    document.getElementById("mainContent");

  if (!main) return;

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  users =
    Array.isArray(users)
      ? users
      : [];

  let tickets = [];

  users.forEach(function (user) {

    const list =
      Array.isArray(user.supportTickets)
        ? user.supportTickets
        : [];

    list.forEach(function (ticket) {

      tickets.push({
        userId: user.userId,
        title: ticket.title || "-",
        message: ticket.message || "-",
        status: ticket.status || "OPEN",
        date: ticket.date || "-"
      });

    });

  });

  let html = `
    <div class="info-box">

      <h3>Support Ticket Management</h3>

      <table>

        <tr>
          <th>User</th>
          <th>Subject</th>
          <th>Message</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
  `;

  if (!tickets.length) {

    html += `
      <tr>
        <td colspan="5">
          No Support Tickets
        </td>
      </tr>
    `;

  } else {

    tickets
      .slice()
      .reverse()
      .forEach(function (ticket) {

        html += `
          <tr>
            <td>${ticket.userId}</td>
            <td>${ticket.title}</td>
            <td>${ticket.message}</td>
            <td>${ticket.status}</td>
            <td>${ticket.date ? new Date(ticket.date).toLocaleString() : "-"}</td>
          </tr>
        `;

      });

  }

  html += `
      </table>
    </div>
  `;

  main.innerHTML = html;

  if (typeof logActivity === "function") {
    logActivity(
      currentUser.userId,
      currentUser.role,
      "Viewed Support Ticket Dashboard",
      "ADMIN"
    );
  }

}

window.loadPage = loadPage;



