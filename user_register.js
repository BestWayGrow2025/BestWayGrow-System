/*
========================================
USER REGISTER v10.2 (FINAL FIXED)
========================================
✔ Queue-based registration only
✔ Safe validation
✔ No direct user creation
✔ Introducer + position safe
✔ Duplicate prevention
✔ Clear UI response
✔ Compatible with core_system + queue engine
========================================
*/

let lock = false;
let introducerId = "BWG000000";

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

// ================= INIT CORE =================
function initPage() {
  if (typeof initCoreSystem !== "function") {
    throw new Error("core_system.js missing");
  }

  initCoreSystem();
}

// ================= GET REF =================
function authPage() {
  const params = new URLSearchParams(window.location.search);
  introducerId = params.get("ref") || "BWG000000";
}

// ================= EVENTS =================
function bindEvents() {
  const btn = document.getElementById("registerBtn");
  if (btn) {
    btn.addEventListener("click", registerUser);
  }
}

// ================= LOAD =================
function loadPage() {
  const introUser = typeof getUserById === "function"
    ? getUserById(introducerId)
    : null;

  const label = document.getElementById("introLabel");

  if (!introUser && label) {
    label.innerText = "Invalid Referral Link";
    document.getElementById("formArea").style.display = "none";
    return;
  }

  if (label) {
    label.innerText = "Introducer: " + introducerId;
  }
}

// ================= PASSWORD =================
function encodePass(password) {
  try {
    return btoa(password);
  } catch {
    return password;
  }
}

// ================= SHARE LINK =================
function generateShareLink(tempId, position) {
  const base = window.location.origin || "";
  return `${base}/user_register.html?ref=${introducerId}&pos=${position}`;
}

// ================= REGISTER =================
function registerUser() {
  if (lock) return;
  lock = true;

  const msg = document.getElementById("msg");

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();
  const position = document.querySelector('input[name="position"]:checked');

  if (!msg) {
    lock = false;
    return;
  }

  msg.innerHTML = "";

  // ================= VALIDATION =================
  if (!username || !email || !mobile || !password) {
    msg.innerHTML = "⚠️ Fill all fields";
    lock = false;
    return;
  }

  if (!position) {
    msg.innerHTML = "⚠️ Select position";
    lock = false;
    return;
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    msg.innerHTML = "⚠️ Invalid mobile";
    lock = false;
    return;
  }

  const users = typeof getUsers === "function" ? getUsers() : [];

  if (users.find(u => u.mobile === mobile)) {
    msg.innerHTML = "⚠️ Mobile already exists";
    lock = false;
    return;
  }

  if (users.find(u => u.email === email)) {
    msg.innerHTML = "⚠️ Email already exists";
    lock = false;
    return;
  }

  if (typeof addToRegistrationQueue !== "function") {
    msg.innerHTML = "⚠️ Queue system not available";
    lock = false;
    return;
  }

  // ================= TEMP ID (UI ONLY) =================
  const tempUserId = "PENDING-" + Date.now();
  const shareLink = generateShareLink(tempUserId, position.value);

  // ================= QUEUE PUSH =================
  const added = addToRegistrationQueue({
    username: username,
    email: email,
    password: encodePass(password),
    mobile: mobile,
    introducerId: introducerId,
    position: position.value
  });

  if (!added) {
    msg.innerHTML = "⚠️ Duplicate or failed request";
    lock = false;
    return;
  }

  // ================= SUCCESS UI =================
  msg.innerHTML = `
    <div>
      ✅ Registration Request Submitted<br><br>

      <b>Your Temporary ID:</b> ${tempUserId}<br><br>

      <b>Share Link:</b><br>
      <input type="text" value="${shareLink}" readonly style="width:100%"><br><br>

      <button onclick="navigator.clipboard.writeText('${shareLink}')">
        Copy Link
      </button><br><br>

      Your request is in processing queue.<br><br>

      Please check status shortly.<br><br>

      <a href="check_status.html">
        <button>Check Status</button>
      </a>
    </div>
  `;

  resetForm();
  lock = false;
}

// ================= RESET FORM =================
function resetForm() {
  document.getElementById("username").value = "";
  document.getElementById("email").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("password").value = "";

  document.querySelectorAll('input[name="position"]').forEach(r => {
    r.checked = false;
  });
}
