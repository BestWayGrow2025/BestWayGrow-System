"use strict";

/*
========================================
USER PIN ACTIVATION CONTROLLER V1.0
========================================

✔ UI controller only
✔ Session protected
✔ Uses PIN authority layer
✔ No direct storage mutation
✔ Production architecture compliant

========================================
*/


let activationUser = null;


/* ================= INIT ================= */

function initPinActivation() {

  activationUser = getSafeUser();

  if (!activationUser) {
    return;
  }

}


/* ================= AUTH ================= */

function getSafeUser() {

  if (typeof getCurrentUser !== "function") {

    showMsg("Session unavailable");
    return null;
  }


  const user = getCurrentUser();


  if (!user) {

    showMsg("Login Required");
    return null;
  }


  if (user.role !== "user") {

    showMsg("Unauthorized");
    return null;
  }


  return user;

}


/* ================= ACTIVATE ================= */

function activatePin() {


  if (!activationUser) {

    activationUser = getSafeUser();

    if (!activationUser) {
      return;
    }
  }


  const input =
    document.getElementById("pinInput");


  const pin =
    input ? input.value.trim() : "";


  if (!pin) {

    showMsg("⚠️ Enter PIN");
    return;

  }



  if (typeof activateUserPin !== "function") {

    showMsg("PIN activation service unavailable");
    return;

  }



  try {


    const result =
      activateUserPin(
        activationUser.userId,
        pin
      );



    if (!result) {

      showMsg("❌ Invalid PIN");
      return;

    }



    if (typeof logActivity === "function") {

      logActivity(
        activationUser.userId,
        "USER",
        "PIN ACTIVATED",
        "USER_PIN_ACTIVATION"
      );

    }



    showMsg(
      "✅ PIN Activated Successfully"
    );



    setTimeout(function(){

      window.location.href =
        "user_dashboard.html";

    },1000);



  } catch(err) {


    showMsg(
      err.message ||
      "Activation Failed"
    );


  }

}


/* ================= MESSAGE ================= */

function showMsg(message) {

  const box =
    document.getElementById("msg");


  if (box) {

    box.innerText = message;

  }

}


/* ================= EXPORT ================= */

window.initPinActivation =
  initPinActivation;


window.activatePin =
  activatePin;
