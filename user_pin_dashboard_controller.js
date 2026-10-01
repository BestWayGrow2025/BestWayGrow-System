"use strict";

/*
========================================
USER PIN DASHBOARD CONTROLLER V1.1
========================================
✔ UI controller only
✔ Session protected
✔ Reads PIN data from central PIN authority
✔ Uses assignedTo / usedBy user relationship
✔ No direct PIN business mutation
========================================
*/


let pinDashboardUser = null;


/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", function () {

  initPinDashboard();

});


/* ================= INIT ================= */

function initPinDashboard() {

  if (!authPinDashboard()) {
    return;
  }

  bindPinDashboardEvents();

  loadUserPins();

}


/* ================= AUTH ================= */

function authPinDashboard() {

  if (typeof getSession !== "function") {
    return false;
  }


  const session = getSession();


  if (!session || !session.userId) {

    window.location.href = "user_auth.html";
    return false;

  }


  if (typeof getUserById !== "function") {
    return false;
  }


  pinDashboardUser =
    getUserById(session.userId);


  if (!pinDashboardUser) {

    window.location.href = "user_auth.html";
    return false;

  }


  if (pinDashboardUser.role !== "user") {

    window.location.href = "user_auth.html";
    return false;

  }


  return true;

}


/* ================= EVENTS ================= */

function bindPinDashboardEvents() {

  const btn =
    document.getElementById("activatePinBtn");


  if (btn) {

    btn.addEventListener(
      "click",
      function () {

        window.location.href =
          "user_pin_activation.html";

      }
    );

  }

}


/* ================= CENTRAL PIN READ ================= */

function getUserPinsSafe() {

  if (typeof getAllPins !== "function") {

    console.error(
      "[USER PIN DASHBOARD] Central PIN read function not available"
    );

    return [];

  }


  try {

    const pins = getAllPins();

    return Array.isArray(pins) ? pins : [];

  }

  catch (err) {

    console.error(
      "[USER PIN DASHBOARD] PIN read failed",
      err
    );

    return [];

  }

}


/* ================= LOAD ================= */

function loadUserPins() {

  const table =
    document.getElementById("pinTable");


  if (!table || !pinDashboardUser) {
    return;
  }


  const pins =
    getUserPinsSafe();


  /*
  ========================================
  MY PIN RULE
  ========================================
  assignedTo → PIN assigned to current user
  usedBy     → PIN previously used by current user
  ========================================
  */

  const userPins =
    pins.filter(function (pin) {

      return (
        pin.assignedTo === pinDashboardUser.userId ||
        pin.usedBy === pinDashboardUser.userId
      );

    });


  table.innerHTML = "";


  if (!userPins.length) {

    table.innerHTML =
      "<tr><td colspan='3'>No PINs Found</td></tr>";

    return;

  }


  userPins.forEach(function (pin) {

    const status =
      String(pin.status || "unknown").toUpperCase();


    const row =
      document.createElement("tr");


    row.innerHTML = `

      <td>${pin.pinId || "-"}</td>

      <td>
        ₹${Number(pin.amount || 0).toFixed(2)}
      </td>

      <td>
        ${status}
      </td>

    `;


    table.appendChild(row);

  });

}


/* ================= EXPORT ================= */

window.loadUserPins =
  loadUserPins;
