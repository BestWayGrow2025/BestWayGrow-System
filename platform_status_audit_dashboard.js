"use strict";

/*
========================================
PLATFORM STATUS AUDIT DASHBOARD V1.0
========================================
✔ Registration status checker
✔ Safe queue lookup
✔ Registered user lookup
✔ Pending queue tracking
✔ Production safe read-only dashboard
✔ Platform naming aligned
========================================
*/

let STATUS_LOCK = false;


// ================= BOOT =================

document.addEventListener("DOMContentLoaded", function () {

  bindStatusEvents();

});


// ================= EVENTS =================

function bindStatusEvents() {

  const btn = document.getElementById("checkBtn");

  if (btn) {
    btn.addEventListener(
      "click",
      checkRegistrationStatus
    );
  }

}


// ================= SAFE QUEUE =================

function getRegistrationQueueSafe() {

  try {

    if (
      typeof getRegQueue === "function"
    ) {

      const queue = getRegQueue();

      return Array.isArray(queue)
        ? queue
        : [];

    }


    const raw =
      localStorage.getItem(
        "REG_QUEUE_DATA"
      );


    const parsed =
      JSON.parse(raw || "[]");


    return Array.isArray(parsed)
      ? parsed
      : [];


  } catch (err) {

    console.error(
      "[STATUS DASHBOARD] Queue error",
      err
    );

    return [];

  }

}


// ================= CHECK =================

function checkRegistrationStatus() {

  if (STATUS_LOCK) return;

  STATUS_LOCK = true;


  try {

    const mobileInput =
      document.getElementById(
        "mobile"
      );


    const resultBox =
      document.getElementById(
        "result"
      );


    if (!mobileInput || !resultBox) {
      return;
    }


    const mobile =
      mobileInput.value.trim();


    if (!mobile) {

      resultBox.innerHTML =
        "⚠️ Enter mobile number";

      return;

    }



    const users =
      typeof getUsers === "function"
        ? getUsers() || []
        : [];



    const queue =
      getRegistrationQueueSafe();



    // REGISTERED USER

    const user =
      users.find(
        u => u.mobile === mobile
      );


    if (user) {

      resultBox.innerHTML = `

        ✅ <b>Registered</b><br><br>

        User ID:
        ${user.userId || "N/A"}<br>

        Name:
        ${user.username || "N/A"}<br>

        Status:
        ${user.status || "ACTIVE"}

      `;

      return;

    }



    // PENDING QUEUE

    const pending =
      queue
      .filter(
        q =>
          q &&
          q.status === "PENDING"
      )
      .sort(
        (a,b)=>
          (a.requestTime || 0)
          -
          (b.requestTime || 0)
      );


    const position =
      pending.findIndex(
        q =>
          q.mobile === mobile
      );


    if (position !== -1) {

      resultBox.innerHTML = `

        ⏳ <b>Pending</b><br><br>

        Queue Position:
        ${position + 1}
        /
        ${pending.length}<br>

        Status:
        Waiting for approval

      `;

      return;

    }



    // NOT FOUND

    resultBox.innerHTML =
      "❌ No record found";


  }

  finally {

    STATUS_LOCK = false;

  }

}


// ================= EXPORT =================

window.checkRegistrationStatus =
  checkRegistrationStatus;

window.getRegistrationQueueSafe =
  getRegistrationQueueSafe;
