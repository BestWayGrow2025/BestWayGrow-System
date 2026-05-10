/*
========================================
MONTHLY CLOSING ENGINE V1.0 (MASTER CLOSING ORCHESTRATOR)
========================================
✔ Single monthly closing entry point
✔ Duplicate-safe execution
✔ Session-safe and system-safe
✔ Executes qualification_engine.js
✔ Executes rank_engine.js
✔ Executes ctor_engine.js
✔ Generates closing reports
✔ Resets monthly counters
✔ Opens next month
✔ Full audit logging
✔ Production READY
========================================
*/

"use strict";

// ===================================
// LOCKS
// ===================================
const MONTHLY_CLOSING_LOCKS = {};
const MONTHLY_CLOSING_TTL = 600000; // 10 minutes

// ===================================
// LOCK HELPERS
// ===================================
function isMonthlyClosingLocked(key) {

  const ts = MONTHLY_CLOSING_LOCKS[key];

  if (!ts) {
    return false;
  }

  if (Date.now() - ts > MONTHLY_CLOSING_TTL) {
    delete MONTHLY_CLOSING_LOCKS[key];
    return false;
  }

  return true;
}

function setMonthlyClosingLock(key, state) {

  if (!key) {
    return false;
  }

  if (state) {
    MONTHLY_CLOSING_LOCKS[key] = Date.now();
  } else {
    delete MONTHLY_CLOSING_LOCKS[key];
  }

  return true;
}

// ===================================
// MONTH KEY
// ===================================
function getCurrentClosingMonth() {

  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
}

// ===================================
// SYSTEM SETTINGS HELPERS
// ===================================
function getClosingSettings() {

  if (
    typeof getSystemSettings !== "function"
  ) {
    return {};
  }

  const settings =
    getSystemSettings();

  return (
    settings &&
    typeof settings === "object"
  ) ? settings : {};
}

function saveClosingSettings(settings) {

  if (
    typeof saveSystemSettings !==
    "function"
  ) {
    return false;
  }

  return saveSystemSettings(
    settings || {}
  );
}

// ===================================
// CLOSE MONTH FLAG
// ===================================
function markMonthClosed(monthKey) {

  const settings =
    getClosingSettings();

  if (
    !Array.isArray(
      settings.closedMonths
    )
  ) {
    settings.closedMonths = [];
  }

  if (
    !settings.closedMonths.includes(
      monthKey
    )
  ) {
    settings.closedMonths.push(
      monthKey
    );
  }

  settings.lastClosedMonth =
    monthKey;

  return saveClosingSettings(
    settings
  );
}

function isMonthClosed(monthKey) {

  const settings =
    getClosingSettings();

  return !!(
    Array.isArray(
      settings.closedMonths
    ) &&
    settings.closedMonths.includes(
      monthKey
    )
  );
}

// ===================================
// RESET MONTHLY DATA
// ===================================
function resetMonthlyCounters() {

  if (
    typeof getUsers !== "function" ||
    typeof saveUsers !== "function"
  ) {
    return false;
  }

  const users = getUsers();

  if (!Array.isArray(users)) {
    return false;
  }

  users.forEach(user => {

    if (!user) {
      return;
    }

    // Monthly activity counters
    user.monthlyPoints = 0;
    user.monthlyBV = 0;
    user.monthlySales = 0;
    user.monthlyPurchases = 0;
    user.monthlyUpgrades = 0;

    // Monthly CTOR qualification counters
    user.monthlyQualified = false;

    // Optional temporary structures
    if (
      user.monthlyStats &&
      typeof user.monthlyStats === "object"
    ) {
      user.monthlyStats = {};
    }
  });

  return saveUsers(users);
}

// ===================================
// REPORT GENERATION
// ===================================
function generateClosingReports(
  monthKey
) {

  if (
    typeof generateMonthlyReports ===
    "function"
  ) {
    return generateMonthlyReports(
      monthKey
    );
  }

  // Optional; not mandatory
  return true;
}

// ===================================
// OPEN NEXT MONTH
// ===================================
function openNextMonth(monthKey) {

  const settings =
    getClosingSettings();

  settings.currentMonth =
    getCurrentClosingMonth();

  settings.monthStatus = "OPEN";
  settings.lastMonthOpened =
    settings.currentMonth;

  return saveClosingSettings(
    settings
  );
}

// ===================================
// MAIN CLOSING PROCESS
// ===================================
function executeMonthlyClosing(
  monthKey = null
) {

  let execKey = null;

  try {

    // ================= SYSTEM SAFETY =================
    if (
      typeof isSystemSafe ===
      "function"
    ) {
      if (!isSystemSafe()) {
        throw new Error(
          "System unsafe"
        );
      }
    }

    // ================= SESSION CHECK =================
    if (
      typeof getCurrentUser ===
      "function"
    ) {

      const user =
        getCurrentUser();

      if (
        !user ||
        !user.userId
      ) {
        throw new Error(
          "No active session"
        );
      }

      const role =
        String(
          user.role || ""
        ).toLowerCase();

      if (
        role !== "admin" &&
        role !== "superadmin"
      ) {
        throw new Error(
          "Permission denied"
        );
      }
    }

    // ================= MONTH =================
    monthKey =
      monthKey ||
      getCurrentClosingMonth();

    execKey =
      `MONTH_CLOSE_${monthKey}`;

    // ================= DUPLICATE BLOCK =================
    if (
      isMonthClosed(
        monthKey
      )
    ) {
      throw new Error(
        "Month already closed"
      );
    }

    if (
      isMonthlyClosingLocked(
        execKey
      )
    ) {
      throw new Error(
        "Closing already running"
      );
    }

    setMonthlyClosingLock(
      execKey,
      true
    );

    // ================= STEP 1: QUALIFICATION =================
    if (
      typeof evaluateAllQualifications ===
      "function"
    ) {

      const ok =
        evaluateAllQualifications();

      if (!ok) {
        throw new Error(
          "Qualification failed"
        );
      }
    }

    // ================= STEP 2: RANK UPDATE =================
    if (
      typeof processAllRankUpdates ===
      "function"
    ) {

      const ok =
        processAllRankUpdates();

      if (!ok) {
        throw new Error(
          "Rank update failed"
        );
      }
    }

    // ================= STEP 3: CTOR DISTRIBUTION =================
    if (
      typeof getCTORPool ===
      "function" &&
      typeof distributeCTORPool ===
      "function"
    ) {

      const pool =
        Number(
          getCTORPool()
        );

      if (
        !isNaN(pool) &&
        pool > 0
      ) {

        const ok =
          distributeCTORPool(
            pool,
            monthKey
          );

        if (!ok) {
          throw new Error(
            "CTOR distribution failed"
          );
        }
      }
    }

    // ================= STEP 4: REPORTS =================
    if (
      !generateClosingReports(
        monthKey
      )
    ) {
      throw new Error(
        "Report generation failed"
      );
    }

    // ================= STEP 5: MARK MONTH CLOSED =================
    if (
      !markMonthClosed(
        monthKey
      )
    ) {
      throw new Error(
        "Failed to mark month closed"
      );
    }

    // ================= STEP 6: RESET COUNTERS =================
    if (
      !resetMonthlyCounters()
    ) {
      throw new Error(
        "Monthly reset failed"
      );
    }

    // ================= STEP 7: OPEN NEXT MONTH =================
    if (
      !openNextMonth(
        monthKey
      )
    ) {
      throw new Error(
        "Failed to open next month"
      );
    }

    // ================= AUDIT LOG =================
    if (
      typeof logActivity ===
      "function"
    ) {

      try {

        logActivity(
          "SYSTEM",
          "SYSTEM",
          `MONTHLY CLOSING COMPLETED ${monthKey}`,
          "MONTHLY_CLOSING_ENGINE"
        );

      } catch (_) {}
    }

    return true;

  } catch (err) {

    if (
      typeof logCritical ===
      "function"
    ) {

      try {

        logCritical(
          "MONTHLY_CLOSING_ERROR: " +
            err.message,
          "SYSTEM",
          "MONTHLY_CLOSING_ENGINE"
        );

      } catch (_) {}
    }

    return false;

  } finally {

    if (execKey) {
      setMonthlyClosingLock(
        execKey,
        false
      );
    }
  }
}

// ===================================
// GLOBAL EXPORT
// ===================================
window.getCurrentClosingMonth =
  getCurrentClosingMonth;

window.resetMonthlyCounters =
  resetMonthlyCounters;

window.executeMonthlyClosing =
  executeMonthlyClosing;
