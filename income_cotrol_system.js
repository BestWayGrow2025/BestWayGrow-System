<script>

// =====================
// 🔹 GET SETTINGS
// =====================
function getIncomeSettings() {
  return JSON.parse(localStorage.getItem("incomeSettings") || "{}");
}

function saveIncomeSettings(data) {
  localStorage.setItem("incomeSettings", JSON.stringify(data));
}

// =====================
// 🔹 INIT DEFAULT
// =====================
function initIncomeControl() {

  let settings = getIncomeSettings();

  if (!settings.initialized) {

    settings = {
      ugli: true,
      rli: true,
      binary: false, // future ready
      initialized: true
    };

    saveIncomeSettings(settings);
  }
}

// =====================
// 🔹 CHECK SYSTEM
// =====================
function isUGLIEnabled() {
  return getIncomeSettings().ugli === true;
}

function isRLIEnabled() {
  return getIncomeSettings().rli === true;
}

function isBinaryEnabled() {
  return getIncomeSettings().binary === true;
}

// =====================
// 🔘 ADMIN CONTROL
// =====================
function toggleUGLI() {
  let s = getIncomeSettings();
  s.ugli = !s.ugli;
  saveIncomeSettings(s);
}

function toggleRLI() {
  let s = getIncomeSettings();
  s.rli = !s.rli;
  saveIncomeSettings(s);
}

function toggleBinary() {
  let s = getIncomeSettings();
  s.binary = !s.binary;
  saveIncomeSettings(s);
}

// =====================
// 🚀 INIT
// =====================
initIncomeControl();

</script>
