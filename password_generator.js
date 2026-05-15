"use strict";

/*
========================================
PASSWORD GENERATOR v1.0 (PRODUCTION SAFE)
========================================
✔ Single source secure password generator
✔ No dependency conflicts
✔ Compatible with registration_queue.js
✔ Ready for future PIN / Admin creation flows
========================================
*/

function generateSecurePassword(length = 10, useSymbols = false) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "@#$%&*!?";

  let chars = upper + lower + numbers;

  if (useSymbols) {
    chars += symbols;
  }

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
}

/* ================= EXPORT ================= */
window.generateSecurePassword = generateSecurePassword;

console.log("[PASSWORD GENERATOR] ACTIVE");
