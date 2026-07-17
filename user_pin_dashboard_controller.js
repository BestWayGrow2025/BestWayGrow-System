"use strict";

/*
========================================
USER PIN DASHBOARD CONTROLLER V1.0
========================================
✔ UI controller only
✔ Session protected
✔ Reads user PIN data safely
✔ No direct HTML business logic
✔ No duplicate PIN creation logic
========================================
*/


let pinDashboardUser = null;


/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", function () {

  initPinDashboard();

});


/* ================= INIT ================= */

function initPinDashboard() {

  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }


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
      function(){

        window.location.href =
          "user_pin_activation.html";

      }
    );

  }

}



/* ================= PIN READ ================= */

function getUserPinsSafe() {


  if (typeof getPins === "function") {

    return getPins();

  }


  try {

    return JSON.parse(
      localStorage.getItem("pins") || "[]"
    );

  }

  catch(err){

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


  const userPins =
    pins.filter(function(p){

      return (
        p.ownerId === pinDashboardUser.userId ||
        p.usedBy === pinDashboardUser.userId
      );

    });



  table.innerHTML = "";



  if (!userPins.length) {


    table.innerHTML =
      "<tr><td colspan='3'>No PINs Found</td></tr>";

    return;

  }



  userPins.forEach(function(pin){


    const status =
      pin.used ? "USED" : "AVAILABLE";


    const row =
      document.createElement("tr");


    row.innerHTML = `

      <td>${pin.pin || "-"}</td>

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


