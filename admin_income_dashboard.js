 "use strict";

/*
========================================
ADMIN INCOME DASHBOARD CONTROLLER V2.0
========================================
✔ Unified session authority compatible
✔ No loggedInAdmin dependency
✔ No core_system.js dependency
✔ Safe DOM handling
✔ Income log rendering
✔ SYSTEM_EVENTS compatible
✔ Window exports added
========================================
*/

let session = null;
let currentUser = null;
let incomeLock = false;


// ================= INIT =================

document.addEventListener("DOMContentLoaded", function () {

  initPage();

});


// ================= INIT =================

function initPage() {

  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }

  authPage();

  bindEvents();

  loadAllIncome();

}


// ================= AUTH =================

function authPage() {

  session =
    typeof getSession === "function"
      ? getSession()
      : null;


  if (!session || !session.userId) {

    window.location.replace("admin_auth.html");

    return;

  }


  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;


  if (
    !currentUser ||
    String(currentUser.role).toLowerCase() !== "admin"
  ) {

    window.location.replace("admin_auth.html");

    return;

  }


  const status =
    currentUser.status ||
    "active";


  if (status !== "active") {

    window.location.replace("admin_auth.html");

    return;

  }

}


// ================= EVENTS =================

function bindEvents() {


  const filter =
    document.getElementById("filterType");


  const refresh =
    document.getElementById("refreshBtn");


  if (filter) {

    filter.addEventListener(
      "change",
      loadAllIncome
    );

  }


  if (refresh) {

    refresh.addEventListener(
      "click",
      loadAllIncome
    );

  }

}


// ================= LOAD INCOME =================

function loadAllIncome() {

  if (incomeLock) return;

  incomeLock = true;

  try {

    let logs = [];

    if (typeof getIncomeLogs === "function") {
      logs = getIncomeLogs() || [];
    }

    const filter =
      document.getElementById("filterType");

    const type =
      filter
        ? filter.value
        : "";

    if (type) {

      logs = logs.filter(function (log) {
        return log.type === type;
      });

    }

    renderIncomeTable(logs);

  } catch (error) {

    console.error(
      "[INCOME LOAD ERROR]",
      error
    );

  } finally {

    incomeLock = false;

  }

}

// ================= TABLE =================

function renderIncomeTable(logs) {


  const table =
    document.getElementById("incomeTable");


  if (!table) return;


  table.innerHTML = "";


  let total = 0;


  if (!logs.length) {


    table.innerHTML =
      "<tr><td colspan='6'>No Data</td></tr>";


    updateSummary(
      0,
      0
    );


    return;

  }



  logs
    .slice()
    .reverse()
    .forEach(function(log){


      const amount =
        Number(log.amount) || 0;


      total += amount;


      const row =
        document.createElement("tr");


      row.innerHTML = `

        <td>
        ${
          log.time
          ? new Date(log.time).toLocaleString()
          : "-"
        }
        </td>

        <td>${log.userId || "-"}</td>

        <td>${log.type || "-"}</td>

        <td>
        ₹${amount.toFixed(2)}
        </td>

        <td>
        ${log.sourceUser || "-"}
        </td>

        <td>
        ${log.note || ""}
        </td>

      `;


      table.appendChild(row);


    });



  updateSummary(
    total,
    logs.length
  );

}


// ================= SUMMARY =================

function updateSummary(
  total,
  count
) {


  const payout =
    document.getElementById("totalPayout");


  const records =
    document.getElementById("totalRecords");


  if (payout) {

    payout.innerText =
      Number(total || 0)
      .toFixed(2);

  }


  if(records){

    records.innerText =
      count || 0;

  }

}



// ================= EVENTS BRIDGE =================

(function(){

function refresh(){

  loadAllIncome();

}


function connect(){


 if(
   window.SYSTEM_EVENTS &&
   typeof window.SYSTEM_EVENTS.on === "function"
 ){

   window.SYSTEM_EVENTS.on(
     "INCOME_UPDATED",
     refresh
   );


   window.SYSTEM_EVENTS.on(
     "INCOME_LOG_CREATED",
     refresh
   );

 }

}


connect();


})();



// ================= EXPORTS =================

window.loadAllIncome =
  loadAllIncome;


window.renderIncomeTable =
  renderIncomeTable;


window.updateIncomeSummary =
  updateSummary;


window.__ADMIN_INCOME_DASHBOARD__ = {

 loaded:true,

 file:"admin_income_dashboard.js",

 time:Date.now()

};
