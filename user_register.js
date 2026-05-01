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
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

function authPage() {
  const params = new URLSearchParams(window.location.search);
  introducerId = params.get("ref") || "BWG000000";
}

function bindEvents() {
  let btn = document.getElementById("registerBtn");
  if (btn) {
    btn.addEventListener("click", function () {
      registerUser();
    });
  }
}

function loadPage() {
  let intro = typeof getUserById === "function" ? getUserById(introducerId) : null;

  if (!intro) {
    document.getElementById("introLabel").innerText = "Invalid Referral Link";
    document.getElementById("formArea").style.display = "none";
    return;
  }

  document.getElementById("introLabel").innerText = "Introducer: " + introducerId;
}

function encodePass(p) {
  try { return btoa(p); } catch { return p; }
}

function generateShareLink(id, pos) {
  const base = window.location.origin || "";
  return `${base}/user_register.html?ref=${id}&pos=${pos}`;
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

  if (!username || !email || !mobile || !password) {
    msg.innerText = "Fill all fields";
    lock = false;
    return;
  }

  if (!position) {
    msg.innerText = "Select position";
    lock = false;
    return;
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    msg.innerText = "Invalid mobile";
    lock = false;
    return;
  }

  let users = typeof getUsers === "function" ? getUsers() : [];

  if (users.find(u => u.mobile === mobile)) {
    msg.innerText = "Mobile already exists";
    lock = false;
    return;
  }

  if (typeof addToRegistrationQueue !== "function") {
    msg.innerText = "Queue system not loaded";
    lock = false;
    return;
  }

  let tempId = "BWG" + Date.now();
  let shareLink = generateShareLink(tempId, position.value);

  let added = addToRegistrationQueue({
    username,
    email,
    mobile,
    password: encodePass(password),
    introducerId,
    position: position.value,
    status: "PENDING"
  });

  if (!added) {
    msg.innerText = "Registration failed (duplicate or error)";
    lock = false;
    return;
  }

  msg.innerHTML = `
    ✅ Registration Submitted<br><br>

    <b>Temporary ID:</b> ${tempId}<br><br>

    <b>Share Link:</b><br>
    <input value="${shareLink}" readonly style="width:100%"><br><br>

    <button onclick="navigator.clipboard.writeText('${shareLink}')">
      Copy Link
    </button><br><br>

    Status: Processing Queue...
  `;

  lock = false;
}
