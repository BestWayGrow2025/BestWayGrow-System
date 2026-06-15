"use strict";

/*
========================================
USER DASHBOARD FINAL V9.0 (SINGLE PATH SAFE)
========================================
✔ Boot compatible
✔ Session safe
✔ No fallback chaos in logic flow
✔ Clean module execution
✔ Production stable UI layer
========================================
*/

let currentUser = null;

/* ================= MODULE START ================= */

if (typeof BOOT !== "undefined" && BOOT.register && BOOT.start) {

  BOOT.register("user_dashboard", function () {

    initPage();

    if (!authPage()) {
      window.location.href = "user_login.html";
      return;
    }

    bindEvents();
    loadHome();
  });

}

/* ================= INIT ================= */

function initPage() {

  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    console.error("CORE SYSTEM NOT FOUND");
  }
}

/* ================= AUTH ================= */

function authPage() {

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || session.role !== "user") {
    return false;
  }

  currentUser =
    typeof getCurrentUser === "function"
      ? getCurrentUser()
      : (
          typeof getUserById === "function"
            ? getUserById(session.userId)
            : null
        );

  if (!currentUser) return false;

  const status =
    currentUser.status ||
    currentUser.accountStatus ||
    "active";

  if (status !== "active") {
    logout();
    return false;
  }

  const welcome =
    document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome " +
      (currentUser.username || currentUser.userId) +
      " (" +
      currentUser.userId +
      ")";
  }

  return true;
}

/* ================= EVENTS ================= */

function bindEvents() {

  const logoutBtn =
    document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }
}

/* ================= SAFE USER ================= */

function getSafeUser() {
  return currentUser;
}

/* ================= USERS ================= */

function getAllUsers() {
  return typeof getUsers === "function"
    ? getUsers()
    : [];
}

/* ================= TREE ================= */

function countTree(userId, users) {

  const user =
    users.find(u => u.userId === userId);

  if (!user) {
    return { left: 0, right: 0, total: 0 };
  }

  function walk(id) {

    if (!id) return 0;

    const node =
      users.find(u => u.userId === id);

    if (!node) return 0;

    return (
      1 +
      walk(node.leftChild) +
      walk(node.rightChild)
    );
  }

  const left = walk(user.leftChild);
  const right = walk(user.rightChild);

  return {
    left,
    right,
    total: left + right
  };
}

/* ================= HOME ================= */

function loadHome() {

  const user = getSafeUser();
  const main = document.getElementById("mainContent");

  if (!user || !main) return;

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
      <p><b>Wallet:</b> ₹${Number(user.wallet?.balance || 0)}</p>
      <p><b>Income:</b> ₹${Number(user.wallet?.incomeBalance || 0)}</p>
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

/* ================= PIN ================= */

function loadPinSection() {

  const user = getSafeUser();
  const main = document.getElementById("mainContent");

  if (!user || !main) return;

  main.innerHTML = `
    <h3>PIN Request</h3>

    <input id="pinAmount" placeholder="Amount">
    <input id="pinPaymentId" placeholder="Payment Ref">

    <button onclick="requestPin()">Request PIN</button>
  `;
}

/* ================= REQUEST PIN ================= */

function requestPin() {

  const user = getSafeUser();
  if (!user) return;

  const amount =
    Number(document.getElementById("pinAmount")?.value);

  const paymentId =
    document.getElementById("pinPaymentId")?.value?.trim();

  try {

    if (typeof executePinFlow !== "function") {
      throw new Error("PIN FLOW MISSING");
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

/* ================= DIRECT TEAM ================= */

function loadDirectTeam() {

  const user = getSafeUser();
  const main = document.getElementById("mainContent");

  if (!user || !main) return;

  const users = getAllUsers();

  const list =
    users.filter(u => u.introducerId === user.userId);

  let html = `
    <h3>Direct Team</h3>
    <table>
      <tr>
        <th>ID</th>
        <th>Name</th>
      </tr>
  `;

  list.forEach(u => {
    html += `
      <tr>
        <td>${u.userId}</td>
        <td>${u.username || "-"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

/* ================= COPY REF ================= */

function copyReferralLink() {

  const box =
    document.getElementById("referralLinkBox");

  if (!box) return;

  navigator.clipboard.writeText(box.value)
    .then(() => alert("Copied"));
}

/* ================= LOGOUT ================= */

function logout() {

  if (typeof logoutSession === "function") {
    logoutSession();
    return;
  }

  if (typeof destroySession === "function") {
    destroySession();
  }

  window.location.replace("user_login.html");
}

/* ================= EXPORTS ================= */

window.loadHome = loadHome;
window.loadPinSection = loadPinSection;
window.loadDirectTeam = loadDirectTeam;
window.copyReferralLink = copyReferralLink;
window.requestPin = requestPin;
window.logout = logout;

/* ================= START ================= */

if (typeof BOOT !== "undefined" && BOOT.start) {
  BOOT.start("user_dashboard");
}
