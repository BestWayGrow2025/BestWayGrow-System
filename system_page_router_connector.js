"use strict";
/*
SYSTEM PAGE ROUTER CONNECTOR V3.0 ENTERPRISE GUARANTEE LAYER
✔ Role Security ✔ UI Reset ✔ Navigation Audit ✔ UI State Manager ✔ Module Verification ✔ Fallback Recovery ✔ Single Source Of Truth ✔ Enterprise Safe Routing
*/
(function () {
// ================= GUARD ================= if (window.SYSTEM_PAGE_ROUTER) { console.log("[PAGE ROUTER] Already Loaded"); return; }
window.SYSTEM_PAGE_ROUTER = true;
console.log("[PAGE ROUTER] Initializing");
// ================= UI RESET ================= function clearMainContent() {
const main =
  document.getElementById("mainContent");

if (!main) {
  console.warn(
    "[ROUTER] mainContent missing"
  );
  return;
}

main.innerHTML = "";
main.removeAttribute(
  "data-loaded-module"
);

}
// ================= ROLE CHECK ================= function checkAccess(page) {
if (
  !window.PIN_ROLE_ACCESS?.requireAccess
) {

  console.warn(
    "[PAGE ROUTER] ROLE SYSTEM NOT LOADED"
  );

  return true;
}

return window
  .PIN_ROLE_ACCESS
  .requireAccess(page);

}
// ================= MODULE VERIFY ================= function verifyModule(page) {
setTimeout(function () {

  const result =
    window
      .SYSTEM_MODULE_VERIFIER
      ?.verify(page);

  if (!result) {
    return;
  }

  if (result.success) {

    window
      .SYSTEM_NAVIGATION_AUDIT
      ?.navigationLoaded(page);

  } else {

    window
      .SYSTEM_NAVIGATION_AUDIT
      ?.navigationFailed(page);

    window
      .SYSTEM_FALLBACK_RECOVERY
      ?.show(
        page,
        result.reason ||
        "MODULE_VERIFICATION_FAILED"
      );
  }

}, 100);

}
// ================= INIT ================= function initSystemPageRouter() {
const menu =
  document.querySelector(".menu");

if (!menu) {

  console.warn(
    "[PAGE ROUTER] Menu Missing"
  );

  return;
}

if (menu.__PAGE_ROUTER_BOUND__) {
  return;
}

menu.__PAGE_ROUTER_BOUND__ = true;

menu.addEventListener(
  "click",
  handlePageNavigation
);

console.log(
  "[PAGE ROUTER] READY"
);

}
// ================= NAVIGATION ================= function handlePageNavigation(e) {
const btn =
  e.target.closest("[data-page]");

if (!btn) return;

e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation();

const page =
  btn.getAttribute("data-page");

if (!page) return;

openSystemPage(page);

}
// ================= OPEN PAGE ================= function openSystemPage(page) {
try {

  if (!page) {
    return false;
  }

  // ================= AUDIT =================
  window
    .SYSTEM_NAVIGATION_AUDIT
    ?.navigationRequested(page);

  // ================= ROLE SECURITY =================
  if (!checkAccess(page)) {

    window
      .SYSTEM_NAVIGATION_AUDIT
      ?.navigationFailed(page);

    return false;
  }

  // ================= PREVENT RELOAD =================
  if (
    window.__CURRENT_PAGE__ === page
  ) {

    console.log(
      "[PAGE ROUTER] Already on page:",
      page
    );

    return false;
  }

  window.__CURRENT_PAGE__ = page;

  // ================= UI STATE =================
  window
    .SYSTEM_UI_STATE
    ?.update({
      page: page,
      module: page
    });

  // ================= RESET =================
  clearMainContent();

  // ================= PRIMARY CONNECTOR =================
  if (
    typeof
    window.connectSystemModule ===
    "function"
  ) {

    window.connectSystemModule(
      page
    );

    verifyModule(page);

    console.log(
      "[PAGE ROUTER] MODULE CONNECTED:",
      page
    );

    return true;
  }

  // ================= FALLBACK LOADER =================
  if (
    typeof
    window.loadSystemModule ===
    "function"
  ) {

    window.loadSystemModule(
      page
    );

    verifyModule(page);

    console.log(
      "[PAGE ROUTER] MODULE LOADED:",
      page
    );

    return true;
  }

  // ================= LOADER FAILURE =================
  const main =
    document.getElementById(
      "mainContent"
    );

  if (!main) {

    window
      .SYSTEM_NAVIGATION_AUDIT
      ?.navigationFailed(page);

    return false;
  }

  main.innerHTML = `
    <div class="page-router-fallback">
      <h3>⚠ Module Loader Missing</h3>
      <p>
        Unable to load page:
        <b>${page}</b>
      </p>
    </div>
  `;

  window
    .SYSTEM_NAVIGATION_AUDIT
    ?.navigationFailed(page);

  window
    .SYSTEM_FALLBACK_RECOVERY
    ?.show(
      page,
      "MODULE_LOADER_MISSING"
    );

  return false;

} catch (err) {

  console.error(
    "[PAGE ROUTER ERROR]",
    err
  );

  window
    .SYSTEM_NAVIGATION_AUDIT
    ?.navigationFailed(page);

  window
    .SYSTEM_FALLBACK_RECOVERY
    ?.show(
      page,
      err?.message ||
      "ROUTER_EXCEPTION"
    );

  return false;
}

}
// ================= AUTO INIT ================= if ( document.readyState === "loading" ) {
document.addEventListener(
  "DOMContentLoaded",
  initSystemPageRouter
);

} else {
initSystemPageRouter();

}
// ================= EXPORT ================= window.openSystemPage = openSystemPage;
})();
