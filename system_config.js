/*
========================================
SYSTEM CONFIG (BV CONTROL)
========================================
✔ Central config for BV & amount
✔ Admin controlled
✔ Used by commission engine
✔ No business logic here
========================================
*/

const SYSTEM_CONFIG_KEY = "SYSTEM_CONFIG_DATA";

// ================= LOAD =================
function loadSystemConfig() {
  try {
    let config = JSON.parse(localStorage.getItem(SYSTEM_CONFIG_KEY));

    if (!config) {
      config = getDefaultConfig();
      saveSystemConfig(config);
    }

    return config;

  } catch {
    let config = getDefaultConfig();
    saveSystemConfig(config);
    return config;
  }
}

// ================= SAVE =================
function saveSystemConfig(config) {
  localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(config));
}

// ================= DEFAULT =================
function getDefaultConfig() {
  return {
    upgrade: {
      bv: 2100,
      amount: 3000
    },
    repurchase: {
      bv: 2100
    }
  };
}
