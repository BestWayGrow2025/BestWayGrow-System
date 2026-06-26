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


// ================= AUTH =================

function authAdmin(){

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;


  if(
    !session ||
    !session.userId
  ){

    window.location.replace(
      "admin_auth.html"
    );

    throw new Error(
      "AUTH FAILED"
    );

  }


  const user =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;


  if(
    !user ||
    String(user.role).toLowerCase() !== "admin"
  ){

    window.location.replace(
      "admin_auth.html"
    );

    throw new Error(
      "ADMIN ONLY"
    );

  }


  currentAdminUser = user;

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
