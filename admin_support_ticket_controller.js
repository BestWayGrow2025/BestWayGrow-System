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

  main.innerHTML = `
    <div class="info-box">
      <h3>Support Ticket Management</h3>

      <p>Support ticket management module is ready.</p>

      <p>Features to be added:</p>

      <ul>
        <li>View all user tickets</li>
        <li>Search by User ID</li>
        <li>Filter by status</li>
        <li>Reply to ticket</li>
        <li>Update ticket status</li>
      </ul>
    </div>
  `;

}

window.loadPage = loadPage;
