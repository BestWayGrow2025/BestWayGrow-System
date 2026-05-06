/*
========================================
USER DASHBOARD FINAL V8.2 (FLOW CONNECTED)
========================================
✔ Tree correct
✔ Wallet correct
✔ Session safe
✔ PIN FLOW CONNECTED (CRITICAL FIX)
✔ Uses executePinFlow
✔ No duplicate logic
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!user) {
    const main = document.getElementById("mainContent");
    if (main) main.innerHTML = "<div class='info-box'>Login Required</div>";
    return null;
  }

  return user;
}

// ================= USERS =================
function getAllUsers() {
  return typeof getUsers === "function" ? getUsers() : [];
}

// ================= TREE =================
function countTree(userId, users) {
  let user = users.find(u => u.userId === userId);
  if (!user) return { left: 0, right: 0, total: 0 };

  function traverse(id) {
    if (!id) return 0;
    let node = users.find(u => u.userId === id);
    if (!node) return 0;

    return 1 + traverse(node.leftChild) + traverse(node.rightChild);
  }

  let left = traverse(user.leftChild);
  let right = traverse(user.rightChild);

  return { left, right, total: left + right };
}

// ================= HOME =================
function loadHome() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const users = getAllUsers();
  const tree = countTree(user.userId, users);

  const refLink =
    typeof generateReferralLink === "function"
      ? generateReferralLink(user.userId)
      : "";

  main.innerHTML = `
    <div class="section-title">Dashboard Overview</div>

    <div class="info-box">
      <p><b>User ID:</b> ${user.userId}</p>
      <p><b>Name:</b> ${user.fullName || user.username || "-"}</p>
      <p><b>Sponsor:</b> ${user.sponsorId || "-"}</p>
    </div>

    <div class="info-box">
      <p><b>Wallet:</b> ₹${Number(user.walletBalance || 0)}</p>
      <p><b>Income:</b> ₹${Number(user.incomeBalance || 0)}</p>
    </div>

    <div class="info-box">
      <p><b>Total Team:</b> ${tree.total}</p>
      <p><b>Left:</b> ${tree.left}</p>
      <p><b>Right:</b> ${tree.right}</p>
    </div>

    <div class="section-title">Referral</div>
    <input id="referralLinkBox" value="${refLink}" readonly>
    <button onclick="copyReferralLink()">Copy</button>
  `;
}

// ================= PIN SECTION (🔥 REAL FIX) =================
function loadPinSection() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <h3>PIN Request</h3>

    <input id="pinAmount" placeholder="Amount">
    <input id="pinPaymentId" placeholder="Payment Ref">

    <button onclick="requestPin()">Request PIN</button>
  `;
}

// ================= REQUEST PIN =================
function requestPin() {
  const user = getSafeUser();
  if (!user) return;

  const amount = Number(document.getElementById("pinAmount").value);
  const paymentId = document.getElementById("pinPaymentId").value;

  try {
    if (typeof executePinFlow !== "function") {
      throw new Error("Flow engine missing");
    }

    executePinFlow("REQUEST_PIN", {
      type: "upgrade",
      amount,
      paymentId
    });

    alert("PIN Request Submitted");

  } catch (err) {
    alert(err.message);
  }
}

// ================= DIRECT TEAM =================
function loadDirectTeam() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  const users = getAllUsers();

  const list = users.filter(u => u.introducerId === user.userId);

  let html = `<h3>Direct Team</h3><table><tr><th>ID</th><th>Name</th></tr>`;

  list.forEach(u => {
    html += `<tr><td>${u.userId}</td><td>${u.username}</td></tr>`;
  });

  html += `</table>`;
  main.innerHTML = html;
}

// ================= COPY =================
function copyReferralLink() {
  const box = document.getElementById("referralLinkBox");
  if (!box) return;

  navigator.clipboard.writeText(box.value)
    .then(() => alert("Copied"));
}

// ================= LOGOUT =================
function logout() {
  if (typeof clearSession === "function") clearSession();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  const user = getSafeUser();
  if (!user) return;

  const welcome = document.getElementById("welcome");
  if (welcome) {
    welcome.innerText = `Welcome ${user.username} (${user.userId})`;
  }

  loadHome();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.onclick = logout;
});

// ================= EXPORT =================
window.loadHome = loadHome;
window.loadPinSection = loadPinSection;
window.loadDirectTeam = loadDirectTeam;
window.logout = logout;
