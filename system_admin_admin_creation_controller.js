"use strict";

console.log("[SYSTEM ADMIN CREATE ADMIN] INIT");

(function () {
  let session = null;
  let currentUser = null;
  let lock = false;

  const allowedDepartments = [
    "finance",
    "franchisee",
    "kyc"
  ];

  const allowedAdminTypes = [
    "admin_a",
    "admin_b"
  ];

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    try {
      if (typeof initCoreSystem !== "function") {
        throw new Error("Core initialization authority unavailable");
      }

      initCoreSystem();
      checkAuth();
      bindEvents();

      console.log("[SYSTEM ADMIN CREATE ADMIN] READY");
    } catch (error) {
      console.error("[SYSTEM ADMIN CREATE ADMIN] INIT FAILED", error);
      showMsg("Unable to initialize this page. Check the system logs.");
    }
  }

  function checkAuth() {
    if (typeof getSession !== "function") {
      throw new Error("Session authority unavailable");
    }

    session = getSession();

    if (
      !session ||
      session.role !== "system_admin" ||
      !session.userId
    ) {
      redirectLogin();
      throw new Error("Unauthorized session");
    }

    if (typeof getUserById !== "function") {
      throw new Error("User lookup authority unavailable");
    }

    currentUser = getUserById(session.userId);

    if (
      !currentUser ||
      currentUser.role !== "system_admin" ||
      (currentUser.status || "active") !== "active"
    ) {
      redirectLogin();
      throw new Error("Invalid or inactive System Admin");
    }
  }

  function redirectLogin() {
    if (typeof destroySession === "function") {
      destroySession();
    }

    window.location.href = "system_admin_auth.html";
  }

  function bindEvents() {
    const form = document.getElementById("createAdminForm");
    const adminType = document.getElementById("adminType");

    if (!form || !adminType) {
      throw new Error("Required creation form elements are missing");
    }

    form.addEventListener("submit", safeCreateAdmin);
    adminType.addEventListener("change", toggleDepartments);

    toggleDepartments();
  }

  function toggleDepartments() {
    const adminType = document.getElementById("adminType");
    const deptBox = document.getElementById("deptBox");

    if (!adminType || !deptBox) return;

    deptBox.style.display =
      adminType.value === "admin_b" ? "block" : "none";

    if (adminType.value !== "admin_b") {
      deptBox.querySelectorAll('input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });
    }
  }

  function safeCreateAdmin(event) {
    if (event) event.preventDefault();
    if (lock) return;

    lock = true;

    const button = document.getElementById("createBtn");
    if (button) button.disabled = true;

    try {
      createAdmin();
    } catch (error) {
      console.error("[CREATE ADMIN ERROR]", error);
      showMsg("Admin creation failed. Check the system logs.");
    } finally {
      lock = false;
      if (button) button.disabled = false;
    }
  }

  function getUsersFromAuthority() {
    if (typeof getUsers !== "function") {
      throw new Error("User retrieval authority unavailable");
    }

    const users = getUsers();

    if (!Array.isArray(users)) {
      throw new Error("User retrieval did not return a valid list");
    }

    return users;
  }

  function generateUniqueAdminId(users) {
    if (!window.crypto || typeof window.crypto.getRandomValues !== "function") {
      throw new Error("Secure random ID generation unavailable");
    }

    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let attempt = 0; attempt < 50; attempt++) {
      const bytes = new Uint8Array(8);
      window.crypto.getRandomValues(bytes);

      let suffix = "";

      for (const byte of bytes) {
        suffix += alphabet[byte % alphabet.length];
      }

      const candidate = "ADM-" + suffix;

      const exists = users.some((user) =>
        String(user.userId || "").toLowerCase() ===
        candidate.toLowerCase()
      );

      if (!exists) return candidate;
    }

    throw new Error("Could not generate a unique Admin ID");
  }

  function generateInitialPassword() {
    if (typeof window.generateSecurePassword !== "function") {
      throw new Error("Existing secure password generator unavailable");
    }

    return window.generateSecurePassword();
  }

  function createAdmin() {
    if (
      !currentUser ||
      currentUser.role !== "system_admin"
    ) {
      throw new Error("System Admin authorization is missing");
    }

    const name = document.getElementById("name").value.trim();
    const adminType = document.getElementById("adminType").value;

    if (!name) {
      showMsg("Enter the Admin name.");
      return;
    }

    if (!allowedAdminTypes.includes(adminType)) {
      showMsg("Select Admin A or Admin B.");
      return;
    }

    const users = getUsersFromAuthority();

    let departments = [];
    let permissions = [];

    if (adminType === "admin_a") {
      permissions = ["full_access"];
      departments = ["finance", "franchisee", "kyc"];
    }

    if (adminType === "admin_b") {
      departments = Array.from(
        document.querySelectorAll(
          '#deptBox input[name="departments"]:checked'
        )
      ).map((checkbox) => checkbox.value);

      departments = [...new Set(departments)];

      if (
        departments.length === 0 ||
        departments.some(
          (department) => !allowedDepartments.includes(department)
        )
      ) {
        showMsg("Select at least one valid department for Admin B.");
        return;
      }

      permissions = ["department_access"];
    }

    const adminId = generateUniqueAdminId(users);
    const initialPassword = generateInitialPassword();

    if (
      typeof initialPassword !== "string" ||
      initialPassword.length < 1
    ) {
      throw new Error("Password generator returned an invalid result");
    }

    /*
     * Preserve the existing stored-password representation.
     * Do not change this until the login verifier contract is verified.
     */
    const storedPassword = btoa(initialPassword);

    const newAdmin = {
      userId: adminId,
      username: name,
      password: storedPassword,

      role: "admin",
      adminType: adminType,

      tree: "office",
      hiddenAccount: true,

      permissions: permissions,
      departments: departments,

      status: "active",

      createdBy: currentUser.userId,
      createdByRole: "system_admin",
      createdAt: Date.now()
    };

    /*
     * User persistence must go through the existing authority.
     * No direct localStorage fallback is used.
     */
    if (typeof saveUsers !== "function") {
      throw new Error("User storage authority unavailable");
    }

    users.push(newAdmin);
    saveUsers(users);

    /*
     * Verify persistence by reading through the same authority.
     * Do not interpret saveUsers()'s return value as a success flag.
     */
    const savedUsers = getUsersFromAuthority();

    const savedAdmin = savedUsers.find((user) =>
      String(user.userId || "").toLowerCase() ===
      adminId.toLowerCase()
    );

    if (!savedAdmin) {
      throw new Error("Created Admin was not found after saving");
    }

    showCredentials(adminId, initialPassword);
    showMsg("Admin account created. Verify login before production use.");

    clearForm();
  }

  function showCredentials(adminId, password) {
    document.getElementById("generatedAdminId").textContent = adminId;
    document.getElementById("generatedPassword").textContent = password;
    document.getElementById("credentials").style.display = "block";
  }

  function clearForm() {
    const form = document.getElementById("createAdminForm");
    if (form) form.reset();

    toggleDepartments();
  }

  function showMsg(message) {
    const element = document.getElementById("msg");
    if (element) element.textContent = message;
  }

  window.SystemAdminCreateAdmin = {
    createAdmin,
    showMsg
  };

  window.__SYSTEM_ADMIN_CREATE_ADMIN__ = true;
})();

