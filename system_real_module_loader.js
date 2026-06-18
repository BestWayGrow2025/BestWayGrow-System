"use strict";

/*
========================================
SYSTEM REAL MODULE LOADER V2.2 FINAL
========================================
✔ Loads REAL dashboard modules
✔ Connector-compatible
✔ One-way execution flow
✔ No routing logic
✔ No business logic
✔ No dashboard recursion
✔ Asset loader only
✔ SAFE renderModule bridge support
✔ Income Control connector added
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
          document.querySelector(
            'script[data-system-module="' +
            scriptFile +
            '"]'
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



    if(
      config.initFunction &&
      typeof window[config.initFunction]
      === "function"
    ){

      window[config.initFunction]();

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


function loadCreateSystemAdminRealModule(){

 return loadRealModule({

  html:
  "super_admin_create_system_admin.html",

  js:
  "super_admin_create_system_admin.js"

 });

}



function loadSystemAdminPanelModule(){

 return loadRealModule({

  html:
  "system_admin_dashboard.html",

  js:
  "system_admin_dashboard.js"

 });

}



function loadPinMasterRealModule(){

 return loadRealModule({

  html:
  "admin_pin_panel.html",

  js:
  "admin_pin_panel.js"

 });

}



function loadReportsRealModule(){

 return loadRealModule({

  html:
  "admin_reports.html",

  js:
  "admin_reports.js"

 });

}



function loadUsersRealModule(){

 return loadRealModule({

  html:
  "registration_approval.html",

  js:
  "registration_approval.js"

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
