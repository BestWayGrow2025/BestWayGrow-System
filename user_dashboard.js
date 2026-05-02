/*
========================================
USER DASHBOARD FINAL FIXED (TREE ALIGNED)
========================================
✔ Real binary tree counting
✔ Left / Right / Total team correct
✔ No fake direct sponsor dependency
✔ No startup redirect loop
✔ Works with tree_system.js V13
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  let user = getCurrentUser();

  if (!user) {
    let main = document.getElementById("mainContent");
    if (main) {
      main.innerHTML = "<div class='info-box'>Login Required</div>";
    }
    return null;
  }

  return user;
}

// ================= GET USERS =================
function getAllUsers() {
  return typeof getUsers === "function" ? getUsers() : [];
}

// ================= TREE COUNT ENGINE =================
function countTree(userId, users) {
  let user = users.find(u => u.userId === userId);
  if (!user) return { left: 0, right: 0, total: 0 };

  function traverse(nodeId) {
    if (!nodeId) return 0;

    let node = users.find(u => u.userId === nodeId);
    if (!node) return 0;

    return 1 + traverse(node.leftChild) + traverse(node.rightChild);
  }

  let leftCount = traverse(user.leftChild);
  let rightCount = traverse(user.rightChild);

  return {
    left: leftCount,
    right: rightCount,
    total: leftCount + rightCount
  };
}

// ================= MAIN DASHBOARD =================
function loadHome() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) return;

  let users = getAllUsers();
  let tree = countTree(user.userId, users);

  let refLink = typeof generateReferralLink === "function"
    ? generateReferralLink(user.userId)
    : "";

  main.innerHTML = `
    <div class="section-title">Dashboard Overview</div>

    <div class="info-box">
      <p><b>User ID:</b> ${user.userId || "N/A"}</p>
      <p><b>Full Name:</b> ${user.fullName || user.username || "N/A"}</p>
      <p><b>Mobile:</b> ${user.mobile || "N/A"}</p>
      <p><b>Email:</b> ${user.email || "N/A"}</p>
      <p><b>Sponsor ID:</b> ${user.sponsorId || "N/A"}</p>
      <p><b>Join Date:</b> ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
      <p><b>City:</b> ${user.city || "N/A"}</p>
      <p><b>State:</b> ${user.state || "N/A"}</p>
      <p><b>Country:</b> ${user.country || "N/A"}</p>
    </div>

    <div class="info-box">
      <p><b>Wallet Balance:</b> ₹${Number(user.wallet?.balance || 0)}</p>
      <p><b>Total Credit:</b> ₹${Number(user.wallet?.totalCredit || 0)}</p>
      <p><b>Total Debit:</b> ₹${Number(user.wallet?.totalDebit || 0)}</p>
      <p><b>Total Income:</b> ₹${Number(user.wallet?.incomeBalance || 0)}</p>
    </div>

    <div class="info-box">
      <p><b>Total Team:</b> ${tree.total}</p>
      <p><b>Left Team:</b> ${tree.left}</p>
      <p><b>Right Team:</b> ${tree.right}</p>
    </div>

    <div class="section-title">Referral Link</div>
    <input id="referralLinkBox" class="ref-box" value="${refLink}" readonly>
    <button class="action-btn" onclick="copyReferralLink()">Copy Link</button>
  `;
}

// ================= DIRECT TEAM =================
function loadDirectTeam() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) return;

  let users = getAllUsers();
  let directUsers = users.filter(u => u.introducerId === user.userId);

  let html = `
    <div class="section-title">Direct Team List</div>
    <table border="1" width="100%">
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th>Mobile</th>
        <th>Position</th>
      </tr>
  `;

  if (directUsers.length === 0) {
    html += `<tr><td colspan="4">No Direct Team Found</td></tr>`;
  }

  directUsers.forEach(u => {
    html += `
      <tr>
        <td>${u.userId || "-"}</td>
        <td>${u.fullName || u.username || "-"}</td>
        <td>${u.mobile || "-"}</td>
        <td>${u.position || "-"}</td>
      </tr>
    `;
  });

  html += `</table>`;
  main.innerHTML = html;
}

// ================= COPY REF LINK =================
function copyReferralLink() {
  let box = document.getElementById("referralLinkBox");
  if (!box) return;

  navigator.clipboard.writeText(box.value)
    .then(() => alert("Referral Link Copied"))
    .catch(() => alert("Copy Failed"));
}

// ================= LOGOUT =================
function logout() {
  logoutSession();
}

// ================= INIT =================
let DASHBOARD_INIT = false;

document.addEventListener("DOMContentLoaded", function () {
  if (DASHBOARD_INIT) return;
  DASHBOARD_INIT = true;

  let user = getSafeUser();
  if (!user) return;

  let welcome = document.getElementById("welcome");
  if (welcome) {
    welcome.innerText = "Welcome " + (user.username || "User") + " (" + user.userId + ")";
  }

  loadHome();

  let logoutBtn = document.getElementById("logoutBtn");
  if
