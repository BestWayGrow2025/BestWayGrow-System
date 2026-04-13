/*
PIN CONFIG SYSTEM V7 (TRUE FINAL LOCK)
✔ Core aligned ✔ Full validation ✔ LockMode protected ✔ Mode-safe operations ✔ Date safe ✔ Production ready
*/
// ===================== // DEFAULT PIN // ===================== function getDefaultPin() { return { active: false, bv: 0, amount: 0, gst: 0, startDate: null, endDate: null, updatedAt: null }; }
// ===================== // DEFAULT CONTROLS // ===================== function getDefaultControls() { return { pinMode: "AUTO", enablePinRefund: true, enableFranchiseSecurity: false, enableMinStockRule: false, enableDirectUserPayment: true }; }
// ===================== // SAFE PIN SETTINGS // ===================== function getPinSettings() { let data = safeGet("pinSettings", {});
let merged = { upgrade: { ...getDefaultPin(), ...(data.upgrade || {}) }, repurchase: { ...getDefaultPin(), ...(data.repurchase || {}) } };
safeSet("pinSettings", merged); return merged; }
function savePinSettings(data) { if (!data || typeof data !== "object") return;
let safeData = { upgrade: { ...getDefaultPin(), ...(data.upgrade || {}) }, repurchase: { ...getDefaultPin(), ...(data.repurchase || {}) } };
safeSet("pinSettings", safeData); }
// ===================== // SYSTEM CONTROLS // ===================== function loadSystemControls() { let stored = safeGet("systemControls", {});
let merged = { ...getDefaultControls(), ...(typeof stored === "object" ? stored : {}) };
safeSet("systemControls", merged); return merged; }
// ===================== // PIN MODE // ===================== function isPinMode(mode) { let ctrl = loadSystemControls(); return ctrl.pinMode === mode; }
// ===================== // ACTIVITY LOG // ===================== function safeActivityLog(msg) { if (typeof logActivity === "function") { logActivity("ADMIN", "PIN", msg); } console.log("PIN CONFIG:", msg); }
// ===================== // ENABLE PIN // ===================== function enablePin(type, config) {
if (!config) return; if (!["upgrade", "repurchase"].includes(type)) return;
// SYSTEM LOCK if (typeof getSystemSettings === "function") { let s = getSystemSettings(); if (s && s.lockMode) return; }
if (typeof isSystemSafe === "function") { if (!isSystemSafe()) return; }
// MODE OFF BLOCK if (isPinMode("OFF")) return;
if ( isNaN(config.bv) || isNaN(config.amount) || config.bv <= 0 || config.amount <= 0 ) return;
let settings = getPinSettings();
settings[type] = { active: true, bv: Number(config.bv), amount: Number(config.amount), gst: isNaN(config.gst) ? 0 : Number(config.gst), startDate: config.startDate || new Date().toISOString(), endDate: config.endDate || null, updatedAt: new Date().toISOString() };
savePinSettings(settings);
safeActivityLog(type.toUpperCase() + " PIN ENABLED"); }
// ===================== // DISABLE PIN // ===================== function disablePin(type) {
if (!["upgrade", "repurchase"].includes(type)) return;
if (typeof getSystemSettings === "function") { let s = getSystemSettings(); if (s && s.lockMode) return; }
if (typeof isSystemSafe === "function") { if (!isSystemSafe()) return; }
let settings = getPinSettings();
settings[type].active = false; settings[type].updatedAt = new Date().toISOString();
savePinSettings(settings);
safeActivityLog(type.toUpperCase() + " PIN DISABLED"); }
// ===================== // SAFE DATE // ===================== function safeDate(d) { let date = new Date(d); return isNaN(date.getTime()) ? null : date; }
// ===================== // CHECK ACTIVE // ===================== function isPinActive(type) {
let pin = getPinSettings()[type]; if (!pin || !pin.active) return false;
let now = new Date();
let start = safeDate(pin.startDate); let end = pin.endDate ? safeDate(pin.endDate) : null;
if (start && now < start) return false; if (end && now > end) return false;
return true; }
// ===================== // GET ACTIVE PIN // ===================== function getActivePin(type) {
let pin = getPinSettings()[type];
if (!pin) return null; if (!isPinActive(type)) return null;
return pin; }
// ===================== // SYSTEM SAFETY // ===================== function isPinSystemSafe(type) {
if (typeof getSystemSettings === "function") { let s = getSystemSettings(); if (s && s.lockMode) return false; }
if (typeof isSystemSafe === "function") { if (!isSystemSafe()) return false; }
if (isPinMode("OFF")) return false;
if (!["upgrade", "repurchase"].includes(type)) return false;
let pin = getActivePin(type); if (!pin) return false;
if (isNaN(pin.bv) || pin.bv <= 0) return false; if (isNaN(pin.amount) || pin.amount <= 0) return false;
return true; }
// ===================== // USAGE RULE // ===================== function isPinAllowedForPurpose(pinType, purpose) { if (pinType === "upgrade") return true; if (pinType === "repurchase" && purpose === "repurchase") return true; return false; }
// ===================== // GST HELPER // ===================== function calculateTotalWithGST(amount, gst) { gst = Number(gst || 0); return amount + (amount * gst / 100); }
