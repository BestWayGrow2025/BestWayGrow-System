"use strict";

/*
========================================
SAFE STORAGE V1.0 FINAL
========================================
✔ safeGet
✔ safeSet
✔ safeRemove
✔ JSON protection
✔ localStorage safe wrapper
✔ Enterprise stable
========================================
*/

console.log("[SAFE STORAGE] LOADED");

/* ================= SAFE SET ================= */

function safeSet(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch (err) {

    console.error(
      "[SAFE STORAGE SET ERROR]",
      err
    );

    return false;
  }
}

/* ================= SAFE GET ================= */

function safeGet(key, fallback = null) {

  try {

    const raw =
      localStorage.getItem(key);

    if (
      raw === null ||
      raw === undefined
    ) {

      return fallback;
    }

    return JSON.parse(raw);

  } catch (err) {

    console.error(
      "[SAFE STORAGE GET ERROR]",
      err
    );

    return fallback;
  }
}

/* ================= SAFE REMOVE ================= */

function safeRemove(key) {

  try {

    localStorage.removeItem(key);

    return true;

  } catch (err) {

    console.error(
      "[SAFE STORAGE REMOVE ERROR]",
      err
    );

    return false;
  }
}

/* ================= EXPORTS ================= */

window.safeSet = safeSet;
window.safeGet = safeGet;
window.safeRemove = safeRemove;

console.log("[SAFE STORAGE] READY");


