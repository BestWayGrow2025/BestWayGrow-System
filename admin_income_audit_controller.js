 "use strict";

/*
========================================
ADMIN INCOME AUDIT CONTROLLER V2.0
========================================
✔ Unified session authority
✔ Admin role validation
✔ Income audit viewer
✔ No direct localStorage session usage
✔ No core_system dependency
✔ Production safe read-only
========================================
*/

let currentAdminUser = null;
let incomeAuditLock = false;


// ================= BOOT =================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initIncomeAuditPage();

  }
);


// ================= INIT =================

function initIncomeAuditPage() {

  try {

    authAdmin();

    bindIncomeAuditEvents();

    loadIncomeAuditPage();

  }

  catch(err){

    console.error(
      "[ADMIN INCOME AUDIT ERROR]",
      err
    );

  }

}


function redirectLogin() {

  if (typeof destroySession === "function") {
    destroySession();
  }

  window.location.replace("admin_auth.html");

}


// ================= AUTH =================

function authAdmin() {

  if (typeof getSession !== "function") {
    return redirectLogin();
  }

  const session = getSession();

  if (!session || !session.userId) {
    return redirectLogin();
  }

  if (typeof getCurrentUser !== "function") {
    return redirectLogin();
  }

  currentAdminUser = getCurrentUser();

  if (!currentAdminUser) {
    return redirectLogin();
  }

  if (typeof hasRole !== "function" || !hasRole("admin")) {
    return redirectLogin();
  }

  const status =
    currentAdminUser.accountStatus ||
    currentAdminUser.status ||
    "active";

  if (status !== "active") {
    return redirectLogin();
  }

}


// ================= EVENTS =================

function bindIncomeAuditEvents(){

  const filter =
    document.getElementById(
      "filterType"
    );


  const refresh =
    document.getElementById(
      "refreshBtn"
    );


  if(filter){

    filter.addEventListener(
      "change",
      loadIncomeAuditPage
    );

  }


  if(refresh){

    refresh.addEventListener(
      "click",
      loadIncomeAuditPage
    );

  }

}



// ================= PAGE LOAD =================

function loadIncomeAuditPage(){

  if(incomeAuditLock)
    return;


  incomeAuditLock = true;


  try{

    loadIncomeLogs();

  }

  finally{

    incomeAuditLock = false;

  }

}



// ================= LOGS =================

function loadIncomeLogs(){

  const table =
    document.getElementById(
      "incomeTable"
    );


  if(!table)
    return;



  let logs =
    typeof getIncomeLogs === "function"
      ? getIncomeLogs()
      : [];



  if(!Array.isArray(logs))
    logs = [];



  const type =
    document.getElementById(
      "filterType"
    )?.value || "";



  const userId =
    document.getElementById(
      "filterUser"
    )?.value
    ?.trim() || "";



  if(type){

    logs =
      logs.filter(
        log =>
          log.type === type
      );

  }


  if(userId){

    logs =
      logs.filter(
        log =>
          log.userId === userId
      );

  }



  table.innerHTML = "";



  let total = 0;



  if(!logs.length){

    table.innerHTML =
      `
      <tr>
        <td colspan="6">
          No Data
        </td>
      </tr>
      `;

  }



  logs
  .slice()
  .reverse()
  .forEach(
    function(log){

      const amount =
        Number(
          log.amount || 0
        );


      total += amount;


      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML =
      `

      <td>
      ${
        log.time
        ?
        new Date(log.time)
        .toLocaleString()
        :
        "-"
      }
      </td>

      <td>
      ${log.userId || "-"}
      </td>

      <td>
      ${log.type || "-"}
      </td>

      <td>
      ₹${amount.toFixed(2)}
      </td>

      <td>
      ${log.sourceUser || "-"}
      </td>

      <td>
      ${log.note || "-"}
      </td>

      `;


      table.appendChild(row);


    }
  );



  const totalBox =
    document.getElementById(
      "totalPayout"
    );


  const recordBox =
    document.getElementById(
      "totalRecords"
    );


  if(totalBox)
    totalBox.innerText =
      total.toFixed(2);


  if(recordBox)
    recordBox.innerText =
      logs.length;

}



// ================= EXPORT =================

window.loadIncomeAuditPage =
  loadIncomeAuditPage;


window.loadIncomeLogs =
  loadIncomeLogs;


window.__ADMIN_INCOME_AUDIT__ =
{
  loaded:true,
  time:Date.now()
};
