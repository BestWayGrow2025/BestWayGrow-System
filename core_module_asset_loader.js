"use strict";

/*
========================================
CORE MODULE ASSET LOADER v2.2 FINAL
========================================
✔ Dynamic HTML Module Loader
✔ Dynamic JavaScript Module Loader
✔ Enterprise Asset Loader
✔ Connector Compatible
✔ One-Way Execution Flow
✔ No Routing Logic
✔ No Business Logic
✔ No Dashboard Recursion
✔ SAFE renderModule Bridge Support
✔ Income Control Connector Support
✔ Duplicate Script Protection
✔ Production Stable
========================================
*/

// ================= INIT GUARD =================

(function () {

  if (window.__SYSTEM_REAL_MODULE_LOADER__) return;

  window.__SYSTEM_REAL_MODULE_LOADER__ = true;

  console.log("[REAL MODULE LOADER] READY");

})();



// ================= MAIN CONTENT =================

function getSystemMainContent() {

  return document.getElementById(
    "mainContent"
  );

}



// ================= SAFE HTML LOAD =================

async function loadHtmlIntoMain(htmlFile) {

  try {


    const main =
      getSystemMainContent();



    if (!main) {

      throw new Error(
        "mainContent not found"
      );

    }



    const response =
      await fetch(htmlFile);



    if (!response.ok) {

      throw new Error(
        "Failed to load: " + htmlFile
      );

    }



    const html =
      await response.text();



    if (
      typeof window.renderModule ===
      "function"
    ) {

      window.renderModule(
        "module",
        html
      );

    }

    else {

      main.innerHTML = html;

    }



    return true;



  } catch(err) {


    console.error(
      "[REAL MODULE HTML LOAD ERROR]",
      err
    );


    return false;

  }

}



// ================= SAFE SCRIPT LOAD =================

function loadScriptOnce(scriptFile) {

  return new Promise(
    (resolve,reject)=>{


      try {


        const existing =
          Array.from(
            document.scripts
          ).some(
            s =>
              s.src &&
              s.src.includes(scriptFile)
          );


        if(existing){

          resolve(true);

          return;

        }



        const script =
          document.createElement(
            "script"
          );


        script.src =
          scriptFile;


        script.async =
          false;


        script.dataset.systemModule =
          scriptFile;


        script.onload =
          ()=>resolve(true);


        script.onerror =
          ()=>reject(
            new Error(
              "Failed script load: " +
              scriptFile
            )
          );


        document.body.appendChild(
          script
        );


      } catch(err){

        reject(err);

      }


    }
  );

}


// ================= GENERIC MODULE LOADER =================

async function loadRealModule(config={}) {

  try {

    if(!config.html){

      throw new Error(
        "Missing html file"
      );

    }

    await loadHtmlIntoMain(
      config.html
    );

    if(config.js){

      await loadScriptOnce(
        config.js
      );

    }

    const initFn =
      config.init ||
      config.initFunction;

    if(
      initFn &&
      typeof window[initFn] === "function"
    ){

      console.log(
        "[MODULE INIT]",
        initFn
      );

      window[initFn]();

    }

    console.log(
      "[REAL MODULE LOADER] SUCCESS:",
      config.html
    );

    return true;

  } catch(err){

    console.error(
      "[REAL MODULE LOADER ERROR]",
      err
    );

    return false;

  }

}


// ========================================
// HOME MODULE
// ========================================

function loadHomeDashboardModule(){


  const html = `

  <div class="dashboard-home">

  <h2>
  🏠 SUPER ADMIN CONTROL CENTER
  </h2>


  <p>
  Enterprise control layer active.
  </p>


  <div>

  <h3>
  System Status
  </h3>


  <ul>

  <li>✔ Dashboard Active</li>
  <li>✔ Routing Active</li>
  <li>✔ Module Loader Active</li>
  <li>✔ Enterprise Core Active</li>

  </ul>


  </div>


  </div>

  `;



  if(
    typeof window.renderModule
    === "function"
  ){

    window.renderModule(
      "home",
      html
    );

  }

  else {


    const main =
      getSystemMainContent();


    if(main)
      main.innerHTML = html;


  }



  return true;

}



// ================= MODULE WRAPPERS =================


function loadCreateSystemAdminRealModule() {

  return loadRealModule({

    html: "super_admin_system_admin_creation_dashboard.html",

    js: "super_admin_system_admin_creation_controller.js",

    init: "startSuperAdminCreateSystemAdmin"

  });

}


function loadSystemAdminPanelModule() {

  return loadRealModule({

    html: "super_admin_system_control_dashboard.html",

    js: "super_admin_system_control_authority.js",

    init: "initPage"

  });

}


function loadPinMasterRealModule(){

  return loadRealModule({

    html:
    "system_admin_pin_request_panel.html",

    js:
    "system_admin_pin_request_dashboard.js"

  });

}



function loadReportsRealModule(){

  return loadRealModule({

    html:
    "admin_reporting_dashboard.html",

    js:
    "admin_reporting_dashboard.js"

  });

}


function loadUsersRealModule(){

 return loadRealModule({

 html:
"platform_registration_approval_dashboard.html",

js:
"platform_registration_approval_dashboard.js"

 });

}



// ================= INCOME CONTROL =================


function loadIncomeControlRealModule(){


  try{


    if(
      typeof window.initIncomeControl
      === "function"
    ){


      const result =
        window.initIncomeControl();



      console.log(
        "[INCOME CONTROL] ACTIVE",
        result
      );



      return true;


    }



    console.error(
      "[INCOME CONTROL] INIT FUNCTION NOT FOUND"
    );



    return false;



  }catch(e){


    console.error(
      "[INCOME CONTROL ERROR]",
      e
    );



    return false;


  }


}




// ================= EXPORTS =================


window.loadRealModule =
loadRealModule;


window.loadHomeDashboardModule =
loadHomeDashboardModule;


window.loadCreateSystemAdminRealModule =
loadCreateSystemAdminRealModule;


window.loadSystemAdminPanelModule =
loadSystemAdminPanelModule;


window.loadPinMasterRealModule =
loadPinMasterRealModule;


window.loadReportsRealModule =
loadReportsRealModule;


window.loadUsersRealModule =
loadUsersRealModule;


window.loadIncomeControlRealModule =
loadIncomeControlRealModule;
