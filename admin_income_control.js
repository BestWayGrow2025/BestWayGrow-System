"use strict";
let session = null; let currentUser = null; let lock = false;
// ================= INIT ================= initIncomeControlPage();
function initIncomeControlPage() {
try {
initPage();
authPage();
bindEvents();
loadPage();

} catch (err) {
console.error(
  "[INCOME CONTROL INIT ERROR]",
  err
);

} }
// ================= SYSTEM INIT ================= function initPage() {
if (typeof initCoreSystem === "function") {
initCoreSystem();

} else {
alert("core_system.js missing");
throw new Error("STOP");

}
if (typeof initIncomeControl === "function") {
initIncomeControl();

} else {
alert("income control system missing");
throw new Error("STOP");

} }
// ================= AUTH ================= function authPage() {
session = JSON.parse( localStorage.getItem( "loggedInAdmin" ) || "null" );
if (!session || !session.userId) {
window.location.href =
  "admin_login.html";

throw new Error("STOP");

}
if ( typeof getUserById !== "function" ) {
window.location.href =
  "admin_login.html";

throw new Error("STOP");

}
currentUser = getUserById(session.userId);
if ( !currentUser || currentUser.role !== "admin" ) {
localStorage.removeItem(
  "loggedInAdmin"
);

window.location.href =
  "admin_login.html";

throw new Error("STOP");

}
if ( (currentUser.status || "active") !== "active" ) {
localStorage.removeItem(
  "loggedInAdmin"
);

alert("Account inactive");

window.location.href =
  "admin_login.html";

throw new Error("STOP");

} }
// ================= EVENTS ================= function bindEvents() {
const ugliOnBtn = document.getElementById( "ugliOnBtn" );
if (ugliOnBtn) {
ugliOnBtn.addEventListener(
  "click",
  function () {
    setUGLI(true);
  }
);

}
const ugliOffBtn = document.getElementById( "ugliOffBtn" );
if (ugliOffBtn) {
ugliOffBtn.addEventListener(
  "click",
  function () {
    setUGLI(false);
  }
);

}
const rliOnBtn = document.getElementById( "rliOnBtn" );
if (rliOnBtn) {
rliOnBtn.addEventListener(
  "click",
  function () {
    setRLI(true);
  }
);

}
const rliOffBtn = document.getElementById( "rliOffBtn" );
if (rliOffBtn) {
rliOffBtn.addEventListener(
  "click",
  function () {
    setRLI(false);
  }
);

}
const binaryOnBtn = document.getElementById( "binaryOnBtn" );
if (binaryOnBtn) {
binaryOnBtn.addEventListener(
  "click",
  function () {
    setBinary(true);
  }
);

}
const binaryOffBtn = document.getElementById( "binaryOffBtn" );
if (binaryOffBtn) {
binaryOffBtn.addEventListener(
  "click",
  function () {
    setBinary(false);
  }
);

} }
// ================= LOAD PAGE ================= function loadPage() { refreshStatus(); }
// ================= SAFE STATUS ================= function safeStatus(fn) {
try {
return (
  typeof fn === "function"
    ? fn()
    : false
);

} catch {
return false;

} }
// ================= REFRESH ================= function refreshStatus() {
const ugliStatus = document.getElementById( "ugliStatus" );
if (ugliStatus) {
ugliStatus.innerText =
  safeStatus(isUGLIEnabled)
    ? "🟢 ACTIVE"
    : "🔴 OFF";

}
const rliStatus = document.getElementById( "rliStatus" );
if (rliStatus) {
rliStatus.innerText =
  safeStatus(isRLIEnabled)
    ? "🟢 ACTIVE"
    : "🔴 OFF";

}
const binaryStatus = document.getElementById( "binaryStatus" );
if (binaryStatus) {
binaryStatus.innerText =
  safeStatus(isBinaryEnabled)
    ? "🟢 ACTIVE"
    : "🔴 OFF";

} }
// ================= UGLI ================= function setUGLI(state) {
let settings = getIncomeSettings() || {};
settings.ugli = state;
saveIncomeSettings(settings);
refreshStatus();
alert( "UGLI " + ( state ? "ENABLED" : "DISABLED" ) ); }
// ================= RLI ================= function setRLI(state) {
let settings = getIncomeSettings() || {};
settings.rli = state;
saveIncomeSettings(settings);
refreshStatus();
alert( "RLI " + ( state ? "ENABLED" : "DISABLED" ) ); }
// ================= BINARY ================= function setBinary(state) {
let settings = getIncomeSettings() || {};
settings.binary = state;
saveIncomeSettings(settings);
refreshStatus();
alert( "Binary " + ( state ? "ENABLED" : "DISABLED" ) ); }
