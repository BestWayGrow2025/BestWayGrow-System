"use strict";

/*
========================================
SYSTEM PAGE ROUTER CONNECTOR V3.1
ENTERPRISE GUARANTEE LAYER (ASYNC FIXED FINAL)
========================================
✔ Role Security
✔ UI Reset
✔ Navigation Audit
✔ UI State Manager
✔ Async Module Verification
✔ Fallback Recovery
✔ Safe Global Routing
✔ No DOM dependency on .menu
✔ Production Stable
========================================
*/

(function () {

  // ================= GUARD =================

  if (window.SYSTEM_PAGE_ROUTER) {
    console.log("[PAGE ROUTER] Already Loaded");
    return;
  }

  window.SYSTEM_PAGE_ROUTER = true;

  console.log("[PAGE ROUTER] Initializing");


  // ================= UI RESET =================

  function clearMainContent() {

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



  // ================= ROLE CHECK =================

  function checkAccess(page) {

    if (
      !window.PIN_ROLE_ACCESS?.requireAccess
    ) {

      console.warn(
        "[PAGE ROUTER] ROLE SYSTEM NOT LOADED"
      );

      return true;

    }

    return window.PIN_ROLE_ACCESS.requireAccess(page);

  }



  // ================= MODULE VERIFY =================

  async function verifyLoadedModule(page) {

  try {

    if (
      !window.SYSTEM_MODULE_VERIFIER ||
      typeof window.SYSTEM_MODULE_VERIFIER.verify !== "function"
    ) {

      console.warn(
        "[PAGE ROUTER] MODULE VERIFIER NOT READY"
      );

      return true;

    }


    const result =
      await window.SYSTEM_MODULE_VERIFIER.verify(page);


    if (!result) {

      console.warn(
        "[PAGE ROUTER] EMPTY VERIFICATION RESULT",
        page
      );

      return false;

    }


    if (result.success) {

      window.SYSTEM_NAVIGATION_AUDIT
        ?.navigationLoaded(page);

    } else {

      window.SYSTEM_NAVIGATION_AUDIT
        ?.navigationFailed(page);


      window.SYSTEM_FALLBACK_RECOVERY
        ?.show(
          page,
          result.reason ||
          "MODULE_VERIFICATION_FAILED"
        );

    }


    return result.success;


  } catch (err) {

    console.error(
      "[MODULE VERIFY ERROR]",
      err
    );


    window.SYSTEM_NAVIGATION_AUDIT
      ?.navigationFailed(page);


    return false;

  }

}


  // ================= OPEN PAGE =================

  async function openSystemPage(page) {


    try {


      if (!page) {
        return false;
      }


      window.SYSTEM_NAVIGATION_AUDIT
        ?.navigationRequested(page);



      if (!checkAccess(page)) {


        window.SYSTEM_NAVIGATION_AUDIT
          ?.navigationFailed(page);


        return false;

      }



      if (
        window.__CURRENT_PAGE__ === page
      ) {

        return false;

      }



      window.__CURRENT_PAGE__ = page;



      window.SYSTEM_UI_STATE
        ?.update({

          page,

          module: page

        });



      clearMainContent();



      // ===== REAL MODULE LOADER =====

      if (
        typeof window.connectCoreModule === "function"
      ) {


        await window.connectCoreModule(page);


        return await verifyLoadedModule(page);


      }



      if (
        typeof window.loadSystemModule === "function"
      ) {


        await window.loadSystemModule(page);


        return await verifyLoadedModule(page);


      }



      const main =
        document.getElementById(
          "mainContent"
        );



      if (main) {


        main.innerHTML = `

          <div style="padding:20px">

            <h3>
              ⚠ Module Loader Missing
            </h3>

            <p>
              Page:
              <b>${page}</b>
            </p>

          </div>

        `;

      }


      return false;



    }
    catch(err) {


      console.error(
        "[PAGE ROUTER ERROR]",
        err
      );


      window.SYSTEM_FALLBACK_RECOVERY
        ?.show(
          page,
          err?.message ||
          "ROUTER_EXCEPTION"
        );


      return false;

    }


  }




  // ================= CLICK BIND =================


  function bindNavigation() {


    if (document.__routerBound__) {
      return;
    }


    document.__routerBound__ = true;



    document.addEventListener(
      "click",
      function(e) {


        const btn =
          e.target.closest(
            "[data-page]"
          );


        if (!btn) {
          return;
        }


        e.preventDefault();

        e.stopPropagation();



        const page =
          btn.getAttribute(
            "data-page"
          );


        if (!page) {
          return;
        }


        openSystemPage(page);


      }
    );

  }



  // ================= INIT =================


  function initSystemPageRouter() {

    bindNavigation();

  }



  // ================= EXPORT =================


  window.openSystemPage =
    openSystemPage;


  window.initSystemPageRouter =
    initSystemPageRouter;



})();
