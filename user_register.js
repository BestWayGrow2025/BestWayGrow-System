let session = null;
let currentUser = null;
let lock = false;
let introducerId = "BWG000000";

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    throw new Error("core_system.js missing");
  }
}

function authPage() {
  const params = new URLSearchParams(window.location.search);
  introducerId = params.get("ref") || "BWG000000";
}

function bindEvents() {
  const registerBtn = document.getElementById("registerBtn");

  if (registerBtn) {
    registerBtn.addEventListener("click", registerUser);
  }
}

function loadPage() {
  const introUser =
    typeof getUserById === "function" ? getUserById(introducerId) : null;

  if (!introUser) {
    document.getElementById("introLabel").innerText = "Invalid Referral Link";
    document.getElementById("formArea").style.display = "none";
    return;
  }

  document.getElementById("introLabel").innerText = "Introducer: " + introducerId;
}

function encodePass(password) {
  try {
    return btoa(password);
  } catch {
    return password;
  }
}

function registerUser() {
  if (lock) return;
  lock = true;

  const msg = document.getElementById("msg");
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();
  const position = document.querySelector('input[name="position"]:checked');

  msg.innerHTML = "";

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

  if (users.find(user => user.mobile === mobile)) {
    msg.innerHTML = "⚠️ Mobile already exists";
    lock = false;
    return;
  }

  if (users.find(user => user.email === email)) {
    msg.innerHTML = "⚠️ Email already exists";
    lock = false;
    return;
  }

  if (typeof addToRegistrationQueue !== "function") {
    msg.innerHTML = "⚠️ Registration queue unavailable";
    lock = false;
    return;
  }

  const added = addToRegistrationQueue({
    username: username,
    email: email,
    password: encodePass(password),
    mobile: mobile,
    introducerId: introducerId,
    position: position.value
  });

  if (!added) {
    msg.innerHTML = "⚠️ Registration failed or duplicate request";
    lock = false;
    return;
  }

  msg.innerHTML = `
    <div>
      ✅ Registration Request Submitted<br><br>
      Your request is in processing queue.<br><br>
      Please check status after approval.<br><br>
      <a href="check_status.html">
        <button>Check Status</button>
      </a>
    </div>
  `;

  resetForm();
  lock = false;
}

function resetForm() {
  document.getElementById("username").value = "";
  document.getElementById("email").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("password").value = "";

  document.querySelectorAll('input[name="position"]').forEach(function (radio) {
    radio.checked = false;
  });
}
