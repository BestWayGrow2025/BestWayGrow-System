// ================= LOGIN PAGE =================
function loadLoginPage() {
  return `
    <div class="card">
      <h2>USER LOGIN</h2>

      <input type="text" id="userId" placeholder="Enter User ID">
      <input type="password" id="password" placeholder="Enter Password">
      <input type="checkbox" onchange="togglePassword()"> Show Password

      <button id="loginBtn" onclick="submitLogin()">Login</button>

      <div id="msg"></div>
    </div>
  `;
}
