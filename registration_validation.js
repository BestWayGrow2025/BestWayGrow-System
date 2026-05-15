/*
========================================
REGISTRATION VALIDATION v1.0 (PRODUCTION)
========================================
✔ Centralized registration validation
✔ Required field validation
✔ Email format validation
✔ Mobile format validation
✔ Duplicate mobile check
✔ Duplicate email check
✔ Position validation (L/R)
✔ Introducer validation
✔ Reusable across all registration modules
========================================
*/

"use strict";

// ================= EMAIL VALIDATION =================
function isValidEmail(email) {
  email = String(email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ================= MOBILE VALIDATION =================
function isValidMobile(mobile) {
  mobile = String(mobile || "").trim();
  return /^[6-9]\d{9}$/.test(mobile);
}

// ================= POSITION VALIDATION =================
function isValidPosition(position) {
  return position === "L" || position === "R";
}

// ================= DUPLICATE MOBILE =================
function isDuplicateMobile(mobile) {
  const users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  return users.some(function (u) {
    return String(u.mobile || "").trim() === String(mobile || "").trim();
  });
}

// ================= DUPLICATE EMAIL =================
function isDuplicateEmail(email) {
  const users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  const target = String(email || "").trim().toLowerCase();

  return users.some(function (u) {
    return String(u.email || "").trim().toLowerCase() === target;
  });
}

// ================= INTRODUCER VALIDATION =================
function isValidIntroducer(introducerId) {
  if (typeof getUserById !== "function") {
    return false;
  }

  return !!getUserById(introducerId);
}

// ================= MAIN VALIDATION =================
function validateRegistration(data) {
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      message: "Invalid registration data"
    };
  }

  const username = String(data.username || "").trim();
  const email = String(data.email || "").trim();
  const mobile = String(data.mobile || "").trim();
  const password = String(data.password || "").trim();
  const introducerId = String(data.introducerId || "").trim();
  const position = String(data.position || "").trim();

  // Required fields
  if (
    !username ||
    !email ||
    !mobile ||
    !password ||
    !introducerId ||
    !position
  ) {
    return {
      valid: false,
      message: "Fill all fields"
    };
  }

  // Name length
  if (username.length < 2) {
    return {
      valid: false,
      message: "Invalid name"
    };
  }

  // Email
  if (!isValidEmail(email)) {
    return {
      valid: false,
      message: "Invalid email"
    };
  }

  // Mobile
  if (!isValidMobile(mobile)) {
    return {
      valid: false,
      message: "Invalid mobile"
    };
  }

  // Password
  if (password.length < 4) {
    return {
      valid: false,
      message: "Password too short"
    };
  }

  // Position
  if (!isValidPosition(position)) {
    return {
      valid: false,
      message: "Invalid position"
    };
  }

  // Introducer
  if (!isValidIntroducer(introducerId)) {
    return {
      valid: false,
      message: "Invalid referral link"
    };
  }

  // Duplicate mobile
  if (isDuplicateMobile(mobile)) {
    return {
      valid: false,
      message: "Mobile already exists"
    };
  }

  // Duplicate email
  if (isDuplicateEmail(email)) {
    return {
      valid: false,
      message: "Email already exists"
    };
  }

  return {
    valid: true,
    message: "Validation passed"
  };
}

// ================= EXPORT =================
window.isValidEmail = isValidEmail;
window.isValidMobile = isValidMobile;
window.isValidPosition = isValidPosition;
window.isDuplicateMobile = isDuplicateMobile;
window.isDuplicateEmail = isDuplicateEmail;
window.isValidIntroducer = isValidIntroducer;
window.validateRegistration = validateRegistration;
