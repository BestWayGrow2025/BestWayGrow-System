"use strict";

/*
========================================
PIN ERROR HANDLER V1.0
========================================
✔ Central PIN error layer
✔ Safe error normalization
✔ Error logging wrapper
✔ Silent-safe fallback
✔ NO routing logic
✔ NO UI logic
✔ NO business logic
✔ Single responsibility only
✔ Production LOCKED
========================================
*/

// ================= NORMALIZE =================
function normalizePinError(error) {

  try {

    if (!error) {
      return {
        message: "Unknown error"
      };
    }

    if (typeof error === "string") {
      return {
        message: error
      };
    }

    return {
      message: String(
        error.message || "Unknown error"
      )
    };

  } catch (_) {

    return {
      message: "Error normalization failed"
    };
  }
}

// ================= LOG =================
function logPinError(source, error) {

  try {

    const normalized = normalizePinError(error);

    console.error(
      "[PIN ERROR]",
      source,
      normalized.message
    );

    // OPTIONAL CRITICAL LOGGER
    if (typeof logCritical === "function") {

      try {

        logCritical(
          normalized.message,
          "SYSTEM",
          source
        );

      } catch (_) {}
    }

    return normalized;

  } catch (_) {

    return {
      message: "Pin error logger failed"
    };
  }
}

// ================= SAFE EXECUTOR =================
function executePinSafe(source, callback) {

  try {

    return callback();

  } catch (error) {

    logPinError(source, error);

    return false;
  }
}

// ================= EXPORT =================
window.normalizePinError = normalizePinError;

window.logPinError = logPinError;

window.executePinSafe = executePinSafe;
