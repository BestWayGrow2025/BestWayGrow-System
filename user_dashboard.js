// ========================================
// USER DASHBOARD FINAL LOCK (HARDENED)
// ========================================
// ✔ Single logout path
// ✔ Safe user access
// ✔ No silent save wipe
// ✔ Safe password decode
// ✔ Unified session usage
// ✔ DOM guards added
// ✔ Activity logging restored
// ✔ Strict save enforcement
// ✔ Production safe
// ========================================

// ================= SAFE USER =================
function getSafeUser() {
  let user = getCurrentUser();

  if (!user) {
    window.location.href = "user_login.html";
    return null;
  }

  return user;
}

// ================= SAFE HELPERS =================
function getMainContent() {
  return document.getElementById("mainContent");
}

function getUserIndex(userId) {
  let users = typeof getUsers === "function" ? getUsers() : [];
  let index = users.findIndex(u => u.userId === userId);
  return { users, index };
}

function safeDecodePassword(value) {
  try {
    return atob(value || "");
  } catch {
    return "";
  }
}

function saveUserMutation(users) {
  if (!Array.isArray(users) || typeof saveUsers !== "function") {
    return false;
  }

  let result = saveUsers(users);

  if (result !== true) {
    console.error("User save failed");
    return false;
  }

  return true;
}

function logUserAction(userId, action) {
  try {
    if (typeof logActivity === "function") {
      logActivity(userId, "USER", action, "USER_DASHBOARD");
    }
  } catch (err) {
    console.error("Activity log error:", err);
  }
}

// ================= LOGOUT =================
function logout() {
  try {
    let session = typeof getSession === "function" ? getSession() : null;
    if (session?.userId) {
      logUserAction(session.userId, "Logout");
    }
  } catch (err) {
    console.error("Logout log error:", err);
  }

  logoutSession();
}

// ================= LOAD HOME =================
function loadHome() {
  let user = getSafeUser();
  if (!user) return;

  let main = getMainContent();
  if (!main) return;

  let refLink = typeof generateRefLink === "function"
    ? generateRefLink(user.userId)
    : "";

  let directUsers = [];

  try {
    if (typeof getDirectUsers === "function") {
      directUsers = getDirectUsers(user.userId) || [];
    }
  } catch (err) {
    console.error("Direct users error:", err);
  }

  let leftCount = directUsers.filter(u => (u.position || "") === "L").length;
  let rightCount = directUsers.filter(u => (u.position || "") === "R").length;

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
      <p><b>Wallet Balance:</b> ₹${Number(user.walletBalance || user.wallet?.balance || 0)}</p>
      <p><b>Total Credit:</b> ₹${Number(user.totalCredit || user.wallet?.totalCredit || 0)}</p>
      <p><b>Total Debit:</b> ₹${Number(user.totalDebit || user.wallet?.totalDebit || 0)}</p>
      <p><b>Total Income:</b> ₹${Number(user.totalIncome || 0)}</p>
    </div>

    <div class="info-box">
      <p><b>Total Direct Team:</b> ${directUsers.length}</p>
      <p><b>Left Team:</b> ${leftCount}</p>
      <p><b>Right Team:</b> ${rightCount}</p>
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

  let main = getMainContent();
  if (!main) return;

  let directUsers = [];

  try {
    if (typeof getDirectUsers === "function") {
      directUsers = getDirectUsers(user.userId) || [];
    }
  } catch (err) {
    console.error("Direct team error:", err);
  }

  let html = `
    <div class="section-title">Direct Team List</div>
    <table>
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th>Position</th>
        <th>Status</th>
      </tr>
  `;

  if (!directUsers.length) {
    html += `<tr><td colspan="4">No Direct Team Found</td></tr>`;
  }

  directUsers.forEach(member => {
    html += `
      <tr>
        <td>${member.userId || "N/A"}</td>
        <td>${member.fullName || member.username || "N/A"}</td>
        <td>${member.position || "N/A"}</td>
        <td>${member.status || "active"}</td>
      </tr>
    `;
  });

  html += `</table>`;
  main.innerHTML = html;
}

// ================= UPGRADE CHECK =================
function canUpgrade(user) {
  if (!user) return false;
  return user.status === "active" && user.upgradeStatus !== "completed";
}

// ================= REPURCHASE CHECK =================
function canRepurchase(user) {
  if (!user) return false;
  return user.status === "active" && user.upgradeStatus === "completed";
}

// ================= NAVIGATION =================
function loadUpgrade() {
  let user = getSafeUser();
  if (!user) return;

  if (!canUpgrade(user)) {
    alert("Upgrade Not Allowed");
    return;
  }

  location.href = "user_upgrade.html";
}

function loadRepurchase() {
  let user = getSafeUser();
  if (!user) return;

  if (!canRepurchase(user)) {
    alert("Repurchase Not Allowed");
    return;
  }

  location.href = "user_repurchase.html";
}

// ================= WITHDRAW =================
function submitWithdrawRequest() {
  let user = getSafeUser();
  if (!user) return;

  let input = document.getElementById("withdrawAmount");
  if (!input) return;

  let amount = Number(input.value);
  let { users, index } = getUserIndex(user.userId);

  if (index === -1) return;

  if (!amount || amount <= 0 || amount > Number(users[index].walletBalance || 0)) {
    alert("Enter Valid Amount");
    return;
  }

  if (!users[index].withdrawRequests) users[index].withdrawRequests = [];
  if (!users[index].walletHistory) users[index].walletHistory = [];
  if (!users[index].notifications) users[index].notifications = [];

  users[index].withdrawRequests.push({
    amount,
    status: "pending",
    date: new Date().toLocaleString()
  });

  users[index].walletBalance = Number(users[index].walletBalance || 0) - amount;
  users[index].totalDebit = Number(users[index].totalDebit || 0) + amount;

  users[index].walletHistory.push({
    date: new Date().toLocaleString(),
    type: "Debit",
    amount,
    remark: "Withdraw Request"
  });

  users[index].notifications.push({
    title: "Withdraw Request Submitted",
    message: "₹" + amount + " withdraw request pending",
    date: new Date().toLocaleString()
  });

  if (!saveUserMutation(users)) {
    alert("Save Failed");
    return;
  }

  logUserAction(user.userId, "Withdraw Request ₹" + amount);
  alert("Withdraw Request Submitted");
}

// ================= SUPPORT =================
function submitSupportTicket() {
  let user = getSafeUser();
  if (!user) return;

  let subject = document.getElementById("supportSubject")?.value.trim();
  let message = document.getElementById("supportMessage")?.value.trim();

  if (!subject || !message) {
    alert("All Fields Required");
    return;
  }

  let { users, index } = getUserIndex(user.userId);
  if (index === -1) return;

  if (!users[index].supportTickets) users[index].supportTickets = [];

  users[index].supportTickets.push({
    subject,
    message,
    status: "pending",
    date: new Date().toLocaleString()
  });

  users[index].supportTicketCount = users[index].supportTickets.length;
  users[index].lastSupportDate = new Date().toLocaleString();

  if (!saveUserMutation(users)) {
    alert("Save Failed");
    return;
  }

  logUserAction(user.userId, "Support Ticket Submitted");
  alert("Support Ticket Submitted");

  if (typeof loadSupportTickets === "function") {
    loadSupportTickets();
  }
}

// ================= PROFILE SAVE =================
function saveProfile() {
  let user = getSafeUser();
  if (!user) return;

  let fullName = document.getElementById("editFullName")?.value.trim();
  let mobile = document.getElementById("editMobile")?.value.trim();
  let email = document.getElementById("editEmail")?.value.trim();

  if (!fullName || fullName.length < 3) {
    alert("Full Name Required");
    return;
  }

  if (!mobile || mobile.length < 10) {
    alert("Valid Mobile Required");
    return;
  }

  if (!email || !email.includes("@")) {
    alert("Valid Email Required");
    return;
  }

  let { users, index } = getUserIndex(user.userId);
  if (index === -1) return;

  users[index].fullName = fullName;
  users[index].mobile = mobile;
  users[index].email = email;

  if (!saveUserMutation(users)) {
    alert("Save Failed");
    return;
  }

  logUserAction(user.userId, "Profile Updated");
  alert("Profile Updated Successfully");
}

// ================= PASSWORD =================
function savePassword() {
  let user = getSafeUser();
  if (!user) return;

  let oldPassword = document.getElementById("oldPassword")?.value.trim();
  let newPassword = document.getElementById("newPassword")?.value.trim();
  let confirmPassword = document.getElementById("confirmPassword")?.value.trim();

  if (!oldPassword || !newPassword || !confirmPassword) {
    alert("All Fields Required");
    return;
  }

  if (safeDecodePassword(user.password) !== oldPassword) {
    alert("Old Password Incorrect");
    return;
  }

  if (newPassword.length < 6) {
    alert("Password Minimum 6 Characters");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Password Not Match");
    return;
  }

  let { users, index } = getUserIndex(user.userId);
  if (index === -1) return;

  users[index].password = btoa(newPassword);

  if (!saveUserMutation(users)) {
    alert("Save Failed");
    return;
  }

  logUserAction(user.userId, "Password Changed");
  alert("Password Changed Successfully");
}

// ================= COPY REFERRAL =================
function copyReferralLink() {
  let copyText = document.getElementById("referralLinkBox");
  if (!copyText) return;

  navigator.clipboard.writeText(copyText.value)
    .then(() => alert("Referral Link Copied"))
    .catch(() => alert("Copy Failed"));
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  let user = getSafeUser();
  if (!user) return;

  let welcome = document.getElementById("welcome");
  if (welcome) {
    welcome.innerText = "Welcome " + (user.username || "User") + " (" + (user.userId || "N/A") + ")";
  }

  loadHome();
});
